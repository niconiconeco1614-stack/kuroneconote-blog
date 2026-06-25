"use server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const errors: ContactFormState["errors"] = {};
  if (!name) errors.name = "お名前を入力してください";
  if (!email) {
    errors.email = "メールアドレスを入力してください";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "メールアドレスの形式が正しくありません";
  }
  if (!message) errors.message = "メッセージを入力してください";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "入力内容をご確認ください", errors };
  }

  // ここにメール送信サービス（Resend, SendGrid等）との連携処理を実装してください
  console.log("[contact]", { name, email, message });

  return { status: "success", message: "お問い合わせを受け付けました。ご連絡ありがとうございます。" };
}
