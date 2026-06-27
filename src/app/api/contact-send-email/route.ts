import { Client } from "@notionhq/client";
import { Resend } from "resend";
import type { NextRequest } from "next/server";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

// Resend requires a verified sender domain. Set this to a verified address
// in your Resend account (e.g. noreply@yourdomain.com).
// The reply-to will be niconiconeco1614@gmail.com so replies land in Gmail.
const FROM_ADDRESS = "まくろなねこNOTE <noreply@kuroneconote.com>";
const REPLY_TO = "niconiconeco1614@gmail.com";

function extractRichText(
  prop: { type: "rich_text"; rich_text: Array<{ plain_text: string }> } | undefined
): string {
  return prop?.rich_text?.map((rt) => rt.plain_text).join("") ?? "";
}

export async function POST(request: NextRequest) {
  let pageId: string | undefined;
  try {
    const body = await request.json();
    // Support { pageId } directly or Notion automation webhook format { entity: { id } }
    pageId = body.pageId ?? body.entity?.id;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!pageId) {
    return Response.json({ error: "pageId is required" }, { status: 400 });
  }

  let page: PageObjectResponse;
  try {
    const result = await notion.pages.retrieve({ page_id: pageId });
    if (result.object !== "page" || !("properties" in result)) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }
    page = result as PageObjectResponse;
  } catch (err) {
    console.error("[contact-send-email] Failed to retrieve page:", err);
    return Response.json({ error: "Failed to retrieve page" }, { status: 500 });
  }

  const props = page.properties;

  const statusProp = props["ステータス"];
  const status =
    statusProp?.type === "select" ? statusProp.select?.name : undefined;

  if (status !== "承認済み") {
    return Response.json(
      { error: `Status is "${status ?? "unknown"}", expected "承認済み"` },
      { status: 400 }
    );
  }

  const nameProp = props["名前"];
  const recipientName =
    nameProp?.type === "title"
      ? nameProp.title.map((t) => t.plain_text).join("")
      : "";

  const emailProp = props["メールアドレス"];
  const recipientEmail =
    emailProp?.type === "rich_text"
      ? extractRichText(emailProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "";

  const categoryProp = props["問い合わせ種別"];
  const category =
    categoryProp?.type === "select" ? (categoryProp.select?.name ?? "") : "";

  const contentProp = props["内容"];
  const originalContent =
    contentProp?.type === "rich_text"
      ? extractRichText(contentProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "";

  const aiReplyProp = props["AI回答案"];
  const aiReply =
    aiReplyProp?.type === "rich_text"
      ? extractRichText(aiReplyProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "";

  if (!recipientEmail) {
    return Response.json({ error: "No email address on page" }, { status: 400 });
  }
  if (!aiReply) {
    return Response.json({ error: "No AI reply on page" }, { status: 400 });
  }

  const subject = `【まくろなねこNOTE】お問い合わせへのご回答（${category}）`;
  const text = `${recipientName} 様

この度は「まくろなねこNOTE」へのお問い合わせありがとうございます。

${aiReply}

---
【お問い合わせ内容】
${originalContent}
---

まくろなねこNOTE
${REPLY_TO}`;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipientEmail,
      replyTo: REPLY_TO,
      subject,
      text,
    });
  } catch (err) {
    console.error("[contact-send-email] Failed to send email:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        ステータス: { select: { name: "送信済み" } },
      },
    });
  } catch (err) {
    console.error("[contact-send-email] Failed to update page status:", err);
  }

  return Response.json({ success: true });
}
