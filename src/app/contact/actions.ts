"use server";

import { Client } from "@notionhq/client";
import Anthropic from "@anthropic-ai/sdk";

export type ContactCategory = "ツールの質問" | "ブログへの感想" | "仕事依頼" | "その他";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: {
    name?: string;
    email?: string;
    category?: string;
    content?: string;
  };
};

const VALID_CATEGORIES: ContactCategory[] = ["ツールの質問", "ブログへの感想", "仕事依頼", "その他"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const notion = new Client({ auth: process.env.NOTION_TOKEN });

function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

function buildAiPrompt(category: string, name: string, content: string): string {
  const instructions: Record<string, string> = {
    "ツールの質問":
      "ツールに関する質問に丁寧に回答してください。また、関連する記事があれば「ブログの関連記事もぜひご確認ください」と一般的に案内してください。",
    "ブログへの感想":
      "ブログへの感想をいただいたことへの感謝の気持ちを込めたお礼メッセージを書いてください。",
    "仕事依頼":
      "仕事のご依頼をいただいたことへのお礼と、具体的なスケジュール・予算・要件などをお伺いする詳細確認の返信を書いてください。",
    "その他":
      "お問い合わせ内容に応じた適切な返信を書いてください。",
  };

  return `ブログ「まくろなねこNOTE」（総務・人事向け業務効率化ブログ）へのお問い合わせに対するメール返信案を作成してください。

【お問い合わせ情報】
お名前: ${name} 様
問い合わせ種別: ${category}
内容:
${content}

【回答方針】
${instructions[category] ?? instructions["その他"]}

【注意事項】
- 丁寧な敬語を使って日本語で書いてください
- 宛名（「${name} 様」）と署名は不要です（本文のみ出力してください）
- メールの返信本文として自然な文体にしてください
- 300文字以内で簡潔にまとめてください`;
}

function toRichText(text: string): { text: { content: string } }[] {
  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({ text: { content: text.slice(i, i + 2000) } });
  }
  return chunks.length > 0 ? chunks : [{ text: { content: "" } }];
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() as ContactCategory;
  const content = String(formData.get("content") ?? "").trim();

  const errors: ContactFormState["errors"] = {};
  if (!name) errors.name = "お名前を入力してください";
  if (!email) {
    errors.email = "メールアドレスを入力してください";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "メールアドレスの形式が正しくありません";
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.category = "問い合わせ種別を選択してください";
  }
  if (!content) errors.content = "内容を入力してください";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "入力内容をご確認ください", errors };
  }

  const dbId = process.env.CONTACT_NOTION_DATABASE_ID;
  if (!dbId) {
    console.error("[contact] CONTACT_NOTION_DATABASE_ID is not set");
    return {
      status: "error",
      message: "お問い合わせの送信に失敗しました。しばらく経ってから再度お試しください。",
    };
  }

  let pageId: string;
  try {
    const page = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        名前: { title: [{ text: { content: name } }] },
        メールアドレス: { rich_text: [{ text: { content: email } }] },
        問い合わせ種別: { select: { name: category } },
        内容: { rich_text: toRichText(content) },
        ステータス: { select: { name: "未対応" } },
        受信日時: { date: { start: new Date().toISOString() } },
      },
    });
    pageId = page.id;
  } catch (err) {
    console.error("[contact] Failed to create Notion page:", err);
    return {
      status: "error",
      message: "お問い合わせの送信に失敗しました。しばらく経ってから再度お試しください。",
    };
  }

  try {
    const anthropic = getAnthropic();
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildAiPrompt(category, name, content) }],
    });

    const aiReply = aiResponse.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    await notion.pages.update({
      page_id: pageId,
      properties: {
        AI回答案: { rich_text: toRichText(aiReply) },
      },
    });
  } catch (err) {
    console.error("[contact] Failed to generate AI reply:", err);
  }

  return {
    status: "success",
    message: "お問い合わせを受け付けました。ご連絡ありがとうございます。",
  };
}
