import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "まくろなねこNOTEのプライバシーポリシーです。",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        プライバシーポリシー
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed text-sm">
        <p>
          「まくろなねこNOTE」（以下、「当ブログ」といいます）は、お客様の個人情報を適切に保護することが重要な責務であると認識し、
          以下のプライバシーポリシーに基づき個人情報を取り扱います。
        </p>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">個人情報の収集について</h2>
          <p>
            当ブログでは、お問い合わせの際にお名前・メールアドレス等の個人情報をご登録いただく場合があります。
            これらの情報は、お問い合わせへの対応以外の目的で利用することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">アクセス解析ツールについて</h2>
          <p>
            当ブログでは、Googleが提供するアクセス解析ツール「Googleアナリティクス」を使用しています。
            Googleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。
            このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            この機能はCookieを無効にすることで収集を拒否することが可能ですので、お使いのブラウザの設定をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">広告の配信について</h2>
          <p>
            当ブログでは、第三者配信の広告サービス（Googleアドセンス、Amazonアソシエイト等のアフィリエイトプログラムを含む）を利用しています。
            このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するために、
            当ブログや他サイトへのアクセスに関する情報「Cookie」（氏名、住所、メールアドレス、電話番号は含まれません）を使用することがあります。
          </p>
          <p className="mt-2">
            また、当ブログはAmazon.co.jpを宣伝しリンクすることによって、サイトが紹介料を獲得できる手段を提供することを目的に設定された
            アフィリエイトプログラム「Amazonアソシエイト・プログラム」の参加者です。
          </p>
          <p className="mt-2">
            Googleアドセンスに関する詳細は
            <a
              href="https://policies.google.com/technologies/ads?hl=ja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Googleの広告に関するポリシー
            </a>
            をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">免責事項</h2>
          <p>
            当ブログに掲載されている情報については、できる限り正確な情報を掲載するよう努めておりますが、
            正確性や安全性を保証するものではありません。当ブログに掲載された内容によって生じた損害等の一切の責任を負いかねますので、
            あらかじめご了承ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">プライバシーポリシーの変更について</h2>
          <p>
            当ブログは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直し、
            その改善に努めます。修正された最新のプライバシーポリシーは常に本ページにて開示されます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、
            <a href="/contact" className="text-indigo-600 hover:underline">
              お問い合わせフォーム
            </a>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
