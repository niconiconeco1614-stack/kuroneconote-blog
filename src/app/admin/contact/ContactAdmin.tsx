"use client";

import { useState, useTransition } from "react";
import { logout, adminSendEmail, updateStatus } from "./actions";
import type { Contact, ContactStatus, SendResult } from "./types";
import { ALL_STATUSES } from "./types";

const STATUS_STYLE: Record<ContactStatus, string> = {
  未対応: "bg-red-100 text-red-700",
  確認中: "bg-yellow-100 text-yellow-700",
  承認済み: "bg-green-100 text-green-700",
  送信済み: "bg-gray-100 text-gray-500",
};

// ── フィルタータブ ────────────────────────────────────────────────────

function FilterTabs({ current, counts }: { current: string; counts: Record<string, number> }) {
  const tabs = [{ key: "すべて", label: "すべて" }, ...ALL_STATUSES.map((s) => ({ key: s, label: s }))];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(({ key, label }) => {
        const isActive = current === key;
        const count = counts[key] ?? 0;
        return (
          <a
            key={key}
            href={key === "すべて" ? "/admin/contact" : `/admin/contact?status=${encodeURIComponent(key)}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {label}
            {key !== "すべて" && (
              <span className={`ml-1.5 text-xs ${isActive ? "text-indigo-200" : "text-gray-400"}`}>
                {count}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}

// ── お問い合わせカード ────────────────────────────────────────────────

function ContactCard({ contact }: { contact: Contact }) {
  const [aiReply, setAiReply] = useState(contact.aiReply);
  const [result, setResult] = useState<SendResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSent = contact.status === "送信済み" || result?.ok === true;

  function handleSend() {
    if (!aiReply.trim()) return;
    startTransition(async () => {
      const res = await adminSendEmail(contact.id, aiReply);
      setResult(res);
    });
  }

  const formattedDate = contact.receivedAt
    ? new Date(contact.receivedAt).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className={`bg-white border rounded-xl p-5 space-y-4 transition-opacity ${isSent ? "opacity-60" : ""}`}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{contact.name || "（名前なし）"}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[contact.status]}`}>
              {contact.status}
            </span>
            {contact.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                {contact.category}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500 space-x-3">
            <span>{contact.email || "（メールなし）"}</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <StatusSelect contact={contact} />
      </div>

      {/* お問い合わせ内容 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">お問い合わせ内容</p>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap leading-relaxed">
          {contact.content || "（内容なし）"}
        </p>
      </div>

      {/* AI回答案 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">
          AI回答案
          <span className="ml-1 font-normal text-gray-400">（編集して送信してください）</span>
        </p>
        <textarea
          value={aiReply}
          onChange={(e) => {
            setAiReply(e.target.value);
            if (result) setResult(null);
          }}
          disabled={isSent || isPending}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 resize-y leading-relaxed"
          placeholder="AI回答案がまだ生成されていません"
        />
      </div>

      {/* フィードバックとボタン */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm">
          {result?.ok === true && (
            <span className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 font-medium">
              メールを送信しました
            </span>
          )}
          {result?.ok === false && (
            <span className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              エラー: {result.error}
            </span>
          )}
        </div>

        {isSent ? (
          <span className="text-sm text-gray-400 font-medium px-4 py-2">送信済み</span>
        ) : (
          <button
            onClick={handleSend}
            disabled={isPending || !aiReply.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shrink-0"
          >
            {isPending ? "送信中..." : "送信する"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── ステータス変更セレクト ────────────────────────────────────────────

function StatusSelect({ contact }: { contact: Contact }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={contact.status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as ContactStatus;
        startTransition(async () => {
          await updateStatus(contact.id, next);
        });
      }}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 shrink-0"
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────────

type Props = {
  contacts: Contact[];
  currentStatus: string;
};

export function ContactAdmin({ contacts, currentStatus }: Props) {
  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = contacts.filter((c) => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">お問い合わせ管理</span>
            <span className="text-xs text-gray-400">まくろなねこNOTE</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* フィルタータブ */}
        <FilterTabs current={currentStatus} counts={counts} />

        {/* お問い合わせ件数 */}
        <p className="text-sm text-gray-500">
          {contacts.length > 0 ? `${contacts.length} 件` : "該当するお問い合わせはありません"}
        </p>

        {/* お問い合わせ一覧 */}
        <div className="space-y-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      </main>
    </div>
  );
}
