import { Client } from "@notionhq/client";
import Anthropic from "@anthropic-ai/sdk";

type ServiceStatus = { ok: boolean; message: string };

async function checkNotion(): Promise<ServiceStatus> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.CONTACT_NOTION_DATABASE_ID;

  if (!token) return { ok: false, message: "NOTION_TOKEN が未設定です" };
  if (!dbId) return { ok: false, message: "CONTACT_NOTION_DATABASE_ID が未設定です" };

  try {
    const notion = new Client({ auth: token });
    const db = await notion.databases.retrieve({ database_id: dbId });
    const title =
      "title" in db && Array.isArray(db.title)
        ? db.title.map((t: { plain_text: string }) => t.plain_text).join("")
        : "(タイトル取得不可)";
    return { ok: true, message: `接続成功 — DB名: ${title}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Notion API エラー: ${msg}` };
  }
}

async function checkAnthropic(): Promise<ServiceStatus> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, message: "ANTHROPIC_API_KEY が未設定です" };
  if (!key.startsWith("sk-ant-")) {
    return { ok: false, message: "ANTHROPIC_API_KEY の形式が正しくありません（sk-ant-... で始まる必要があります）" };
  }

  try {
    const anthropic = new Anthropic({ apiKey: key });
    await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true, message: "接続成功" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Anthropic API エラー: ${msg}` };
  }
}

async function checkResend(): Promise<ServiceStatus> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, message: "RESEND_API_KEY が未設定です" };
  if (!key.startsWith("re_")) {
    return { ok: false, message: "RESEND_API_KEY の形式が正しくありません（re_... で始まる必要があります）" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 405) {
      // 405 Method Not Allowed は認証が通った証拠（GETは未対応だがキーは有効）
      return { ok: true, message: "接続成功（APIキー認証OK）" };
    }
    if (res.status === 401) {
      return { ok: false, message: "Resend API キーが無効です（401 Unauthorized）" };
    }
    return { ok: true, message: `接続成功 (HTTP ${res.status})` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Resend API エラー: ${msg}` };
  }
}

export async function GET() {
  const [notion, anthropic, resend] = await Promise.all([
    checkNotion(),
    checkAnthropic(),
    checkResend(),
  ]);

  const allOk = notion.ok && anthropic.ok && resend.ok;

  return Response.json(
    {
      ok: allOk,
      envVars: {
        NOTION_TOKEN: !!process.env.NOTION_TOKEN,
        CONTACT_NOTION_DATABASE_ID: !!process.env.CONTACT_NOTION_DATABASE_ID,
        ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      },
      services: { notion, anthropic, resend },
    },
    { status: allOk ? 200 : 503 }
  );
}
