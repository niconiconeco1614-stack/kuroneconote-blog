import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-5 h-5" aria-hidden="true">
                  <ellipse cx="50" cy="65" rx="26" ry="21" fill="white" />
                  <circle cx="50" cy="38" r="21" fill="white" />
                  <polygon points="30,22 23,3 43,18" fill="white" />
                  <polygon points="70,22 77,3 57,18" fill="white" />
                  <ellipse cx="42" cy="36" rx="3.5" ry="4.5" fill="#374151" />
                  <ellipse cx="58" cy="36" rx="3.5" ry="4.5" fill="#374151" />
                  <ellipse cx="50" cy="43" rx="2.5" ry="1.8" fill="#ffb3c6" />
                </svg>
              </div>
              <h3 className="text-white font-bold">まくろなねこNOTE</h3>
            </div>
            <p className="text-sm leading-relaxed">
              総務・人事担当者のための業務効率化ツール紹介ブログ。現場で本当に使えるツールの選び方・活用法を発信しています。
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">カテゴリ</h3>
            <ul className="space-y-2 text-sm">
              {["タスク管理", "勤怠管理", "ワークフロー", "コミュニケーション", "給与・経費管理"].map((cat) => (
                <li key={cat}>
                  <Link href="/" className="hover:text-white transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">サイト情報</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "ホーム", href: "/" },
                { label: "このブログについて", href: "/" },
                { label: "プライバシーポリシー", href: "/" },
                { label: "お問い合わせ", href: "/" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          <p>© 2026 まくろなねこNOTE. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
