import { Client } from "@notionhq/client";
import { Resend } from "resend";
import type { NextRequest } from "next/server";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY が未設定です");
  return new Resend(key);
}

const FROM_ADDRESS = "まくろなねこNOTE <onboarding@resend.dev>";
const REPLY_TO = "niconiconeco1614@gmail.com";

function extractRichText(
  prop: { type: "rich_text"; rich_text: Array<{ plain_text: string }> } | undefined
): string {
  return prop?.rich_text?.map((rt) => rt.plain_text).join("") ?? "";
}

function extractPageId(body: Record<string, unknown>): string | undefined {
  // { pageId: "..." } — 直接指定
  if (typeof body.pageId === "string") return body.pageId;
  // Notion automation webhook: { data: { id: "..." } }
  if (body.data && typeof (body.data as Record<string, unknown>).id === "string") {
    return (body.data as Record<string, unknown>).id as string;
  }
  // 旧形式 { entity: { id: "..." } }
  if (body.entity && typeof (body.entity as Record<string, unknown>).id === "string") {
    return (body.entity as Record<string, unknown>).id as string;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  // ── リクエスト解析 ────────────────────────────────────────────
  let pageId: string | undefined;
  try {
    const body = await request.json();
    pageId = extractPageId(body);
  } catch {
    return Response.json({ error: "リクエストボディが不正です" }, { status: 400 });
  }

  if (!pageId) {
    return Response.json(
      { error: "pageId が指定されていません。{ \"pageId\": \"...\" } 形式で送信してください" },
      { status: 400 }
    );
  }

  // ── Notion: ページ取得 ────────────────────────────────────────
  let page: PageObjectResponse;
  try {
    const result = await notion.pages.retrieve({ page_id: pageId });
    if (result.object !== "page" || !("properties" in result)) {
      return Response.json({ error: "指定されたページが見つかりません" }, { status: 404 });
    }
    page = result as PageObjectResponse;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contact/send] Notion page 取得失敗:", msg);
    return Response.json({ error: `Notionからページを取得できませんでした: ${msg}` }, { status: 500 });
  }

  const props = page.properties;

  // ── ステータス確認 ────────────────────────────────────────────
  const statusProp = props["ステータス"];
  const status = statusProp?.type === "select" ? statusProp.select?.name : undefined;

  if (status === "送信済み") {
    return Response.json({ error: "このお問い合わせはすでに送信済みです" }, { status: 409 });
  }
  if (status !== "承認済み") {
    return Response.json(
      { error: `ステータスが「承認済み」ではありません（現在: ${status ?? "不明"}）` },
      { status: 400 }
    );
  }

  // ── プロパティ抽出 ────────────────────────────────────────────
  const nameProp = props["名前"];
  const recipientName =
    nameProp?.type === "title" ? nameProp.title.map((t) => t.plain_text).join("") : "";

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
    return Response.json({ error: "メールアドレスが登録されていません" }, { status: 400 });
  }
  if (!aiReply) {
    return Response.json(
      { error: "AI回答案が空です。Notionで回答案を入力してから送信してください" },
      { status: 400 }
    );
  }

  // ── メール送信 ────────────────────────────────────────────────
  const subject = `【まくろなねこNOTE】お問い合わせへのご回答（${category}）`;
  const text = [
    `${recipientName} 様`,
    "",
    "この度は「まくろなねこNOTE」へのお問い合わせありがとうございます。",
    "",
    aiReply,
    "",
    "---",
    "【お問い合わせ内容】",
    originalContent,
    "---",
    "",
    "まくろなねこNOTE",
    REPLY_TO,
  ].join("\n");

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipientEmail,
      replyTo: REPLY_TO,
      subject,
      text,
    });
    console.log(`[contact/send] メール送信成功 → ${recipientEmail} (id: ${result.data?.id})`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[contact/send] メール送信失敗:", msg);
    return Response.json({ error: `メール送信に失敗しました: ${msg}` }, { status: 500 });
  }

  // ── Notion: ステータスを「送信済み」に更新 ────────────────────
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        ステータス: { select: { name: "送信済み" } },
      },
    });
    console.log(`[contact/send] Notionステータスを「送信済み」に更新: ${pageId}`);
  } catch (err) {
    console.error("[contact/send] Notionステータス更新失敗:", err);
    // メール送信は成功しているので処理は継続
  }

  return Response.json({
    ok: true,
    message: `${recipientEmail} へメールを送信しました`,
  });
}
