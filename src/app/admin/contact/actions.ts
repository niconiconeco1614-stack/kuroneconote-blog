"use server";

import { Client } from "@notionhq/client";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Contact, ContactStatus, LoginState, SendResult } from "./types";
import { ALL_STATUSES } from "./types";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ── 認証 ─────────────────────────────────────────────────────────────

function makeToken(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function checkAuth(): Promise<boolean> {
  const adminPw = process.env.ADMIN_PASSWORD;
  if (!adminPw) return false;
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === makeToken(adminPw);
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const adminPw = process.env.ADMIN_PASSWORD;

  if (!adminPw) return { error: "ADMIN_PASSWORD が未設定です" };
  if (password !== adminPw) return { error: "パスワードが違います" };

  const cookieStore = await cookies();
  cookieStore.set("admin_session", makeToken(adminPw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin/contact");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/contact");
}

// ── Notion ────────────────────────────────────────────────────────────

let cachedDataSourceId: string | undefined;

async function getContactDataSourceId(): Promise<string> {
  if (cachedDataSourceId) return cachedDataSourceId;
  const dbId = process.env.CONTACT_NOTION_DATABASE_ID ?? "";
  const db = await notion.databases.retrieve({ database_id: dbId });
  const sources = (db as unknown as { data_sources?: Array<{ id: string }> }).data_sources;
  if (!sources?.length) throw new Error("Contact database has no data source");
  cachedDataSourceId = sources[0].id;
  return cachedDataSourceId;
}

function extractRichText(
  prop: { type: "rich_text"; rich_text: Array<{ plain_text: string }> } | undefined
): string {
  return prop?.rich_text?.map((rt) => rt.plain_text).join("") ?? "";
}

function pageToContact(page: PageObjectResponse): Contact {
  const p = page.properties;
  const nameProp = p["名前"];
  const emailProp = p["メールアドレス"];
  const categoryProp = p["問い合わせ種別"];
  const contentProp = p["内容"];
  const aiReplyProp = p["AI回答案"];
  const statusProp = p["ステータス"];
  const dateProp = p["受信日時"];

  return {
    id: page.id,
    name: nameProp?.type === "title" ? nameProp.title.map((t) => t.plain_text).join("") : "",
    email: emailProp?.type === "rich_text"
      ? extractRichText(emailProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "",
    category: categoryProp?.type === "select" ? (categoryProp.select?.name ?? "") : "",
    content: contentProp?.type === "rich_text"
      ? extractRichText(contentProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "",
    aiReply: aiReplyProp?.type === "rich_text"
      ? extractRichText(aiReplyProp as { type: "rich_text"; rich_text: Array<{ plain_text: string }> })
      : "",
    status: (statusProp?.type === "select" ? (statusProp.select?.name ?? "未対応") : "未対応") as ContactStatus,
    receivedAt: dateProp?.type === "date" ? (dateProp.date?.start ?? "") : "",
  };
}

function toRichTextChunks(text: string) {
  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({ text: { content: text.slice(i, i + 2000) } });
  }
  return chunks.length ? chunks : [{ text: { content: "" } }];
}

// ── データ取得 ────────────────────────────────────────────────────────

export async function getContacts(statusFilter?: string): Promise<Contact[]> {
  const dataSourceId = await getContactDataSourceId();
  const isValidStatus =
    statusFilter &&
    statusFilter !== "すべて" &&
    ALL_STATUSES.includes(statusFilter as ContactStatus);

  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "受信日時", direction: "descending" }],
    ...(isValidStatus
      ? { filter: { property: "ステータス", select: { equals: statusFilter } } }
      : {}),
    page_size: 50,
  });

  return res.results
    .filter((r): r is PageObjectResponse => "properties" in r && r.object === "page")
    .map(pageToContact);
}

// ── メール送信 ────────────────────────────────────────────────────────

export async function adminSendEmail(pageId: string, aiReply: string): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY が未設定です" };

  // 1. 編集後のAI回答案をNotionに保存
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: { AI回答案: { rich_text: toRichTextChunks(aiReply) } },
    });
  } catch (err) {
    return { ok: false, error: `Notion更新エラー: ${err instanceof Error ? err.message : String(err)}` };
  }

  // 2. 連絡先情報を取得
  let contact: Contact;
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!("properties" in page)) throw new Error("Page not found");
    contact = pageToContact(page as PageObjectResponse);
  } catch (err) {
    return { ok: false, error: `ページ取得エラー: ${err instanceof Error ? err.message : String(err)}` };
  }

  if (!contact.email) return { ok: false, error: "メールアドレスが登録されていません" };

  // 3. メール送信
  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "まくろなねこNOTE <onboarding@resend.dev>",
      to: contact.email,
      replyTo: "niconiconeco1614@gmail.com",
      subject: "まくろなねこNOTEよりご返信",
      text: [
        `${contact.name} 様`,
        "",
        "この度は「まくろなねこNOTE」へのお問い合わせありがとうございます。",
        "",
        aiReply,
        "",
        "まくろなねこNOTE",
        "niconiconeco1614@gmail.com",
      ].join("\n"),
    });
  } catch (err) {
    return { ok: false, error: `メール送信エラー: ${err instanceof Error ? err.message : String(err)}` };
  }

  // 4. ステータスを「送信済み」に更新
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: { ステータス: { select: { name: "送信済み" } } },
    });
  } catch (err) {
    console.error("[admin/contact] ステータス更新失敗:", err);
  }

  revalidatePath("/admin/contact");
  return { ok: true };
}

// ── ステータス更新 ────────────────────────────────────────────────────

export async function updateStatus(pageId: string, status: ContactStatus): Promise<{ ok: boolean }> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: { ステータス: { select: { name: status } } },
    });
    revalidatePath("/admin/contact");
    return { ok: true };
  } catch (err) {
    console.error("[admin/contact] ステータス更新失敗:", err);
    return { ok: false };
  }
}
