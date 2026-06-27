export type ContactStatus = "未対応" | "確認中" | "承認済み" | "送信済み";

export const ALL_STATUSES: ContactStatus[] = ["未対応", "確認中", "承認済み", "送信済み"];

export type Contact = {
  id: string;
  name: string;
  email: string;
  category: string;
  content: string;
  aiReply: string;
  status: ContactStatus;
  receivedAt: string;
};

export type LoginState = { error?: string } | undefined;

export type SendResult = { ok: true } | { ok: false; error: string };
