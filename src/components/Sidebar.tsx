import Link from "next/link";
import { categories, getRecentPosts } from "@/lib/posts";

export default function Sidebar() {
  const recentPosts = getRecentPosts(5);

  return (
    <aside className="w-full md:w-72 flex-shrink-0 space-y-5">
      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        {/* ---- 黒猫マスコットアイコン ---- */}
        {/* 画像に差し替える場合は下の div を <Image> コンポーネントに置き換えてください */}
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-14 h-14" aria-hidden="true">
            <ellipse cx="50" cy="65" rx="26" ry="21" fill="white" />
            <circle cx="50" cy="38" r="21" fill="white" />
            <polygon points="30,22 23,3 43,18" fill="white" />
            <polygon points="70,22 77,3 57,18" fill="white" />
            <ellipse cx="42" cy="36" rx="3.5" ry="4.5" fill="#1a1a2e" />
            <ellipse cx="58" cy="36" rx="3.5" ry="4.5" fill="#1a1a2e" />
            <circle cx="43" cy="34" r="1.2" fill="white" />
            <circle cx="59" cy="34" r="1.2" fill="white" />
            <ellipse cx="50" cy="43" rx="2.5" ry="1.8" fill="#ffb3c6" />
            <line x1="32" y1="42" x2="46" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="47" x2="46" y2="47" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="68" y1="42" x2="54" y2="44" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="68" y1="47" x2="54" y2="47" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h3 className="font-bold text-gray-900 mb-1">まくろなねこ</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          総務・人事歴10年。業務効率化ツールの導入支援をしながら、現場で使えるツールの情報を発信中。
        </p>

        {/* YouTube リンクボタン */}
        {/* YouTube チャンネルURLに差し替えてください */}
        <a
          href="https://www.youtube.com/@your-channel"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTubeチャンネルを見る
        </a>
      </div>

      {/* ==========================================
          広告スペース - サイドバー (AD SPACE - Sidebar)
          ここにアフィリエイト/広告コードを貼り付けてください
          推奨サイズ: 300×250 (レクタングル)
          ========================================== */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-2">広告</p>
        <div className="h-[250px] flex items-center justify-center text-gray-300 text-sm border border-gray-200 rounded-lg bg-white">
          300 × 250
        </div>
      </div>

      {/* Category list */}
      {categories.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 text-sm">
            カテゴリ
          </h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link
                  href={`/category/${encodeURIComponent(cat.name)}`}
                  className="flex items-center justify-between text-sm text-gray-700 hover:text-indigo-600 transition-colors py-1.5 group"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full group-hover:bg-indigo-500 transition-colors" />
                    {cat.name}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 text-sm">
            新着記事
          </h3>
          <ul className="space-y-4">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <p className="text-sm text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
