import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "まくろなねこNOTEへのお問い合わせはこちらから。",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
        お問い合わせ
      </h1>
      <p className="text-gray-500 text-sm text-center mb-8">
        ご質問・ご感想・お仕事のご依頼などは、以下のフォームよりお気軽にご連絡ください。
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <ContactForm />
      </div>
    </div>
  );
}
