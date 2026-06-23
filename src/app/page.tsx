import { posts } from "@/lib/posts";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          まくろなねこNOTE
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          総務・人事担当者のための業務効率化ツール情報メディア
        </p>
      </div>

      {/* ==========================================
          広告スペース - トップ記事上部 (AD SPACE - Top of page, above articles)
          ここにアフィリエイト/広告コードを貼り付けてください
          推奨サイズ: 728×90 (レクタングル/ビッグバナー)
          ========================================== */}
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center mb-10">
        <p className="text-xs text-gray-400 mb-2">広告</p>
        <div className="h-[90px] flex items-center justify-center text-gray-300 text-sm border border-gray-100 rounded-lg bg-gray-50">
          728 × 90
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Article grid */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-2 border-b-2 border-indigo-500">
            最新記事
          </h2>
          {posts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
              記事準備中です
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
