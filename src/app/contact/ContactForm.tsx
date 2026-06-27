"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle", message: "" };

const CATEGORIES = ["ツールの質問", "ブログへの感想", "仕事依頼", "その他"] as const;

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-6 text-center">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {state.errors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {state.errors?.email && (
          <p className="text-xs text-red-600 mt-1">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
          問い合わせ種別 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        >
          <option value="" disabled>選択してください</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {state.errors?.category && (
          <p className="text-xs text-red-600 mt-1">{state.errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
          内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {state.errors?.content && (
          <p className="text-xs text-red-600 mt-1">{state.errors.content}</p>
        )}
      </div>

      {state.status === "error" && !state.errors && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {pending ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
