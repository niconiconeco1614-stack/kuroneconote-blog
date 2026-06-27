"use client";

import { useActionState } from "react";
import { login } from "./actions";
import type { LoginState } from "./types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
        <p className="text-sm text-gray-500 mt-1">まくろなねこNOTE</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {pending ? "確認中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
