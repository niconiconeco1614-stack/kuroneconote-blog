import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "カテゴリ一覧",
  description: "まくろなねこNOTEのカテゴリ一覧。人事・労務管理・総務・BCP・コミュニケーションの記事を探せます。",
};

export default async function CategoryIndexPage() {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">カテゴリ一覧</h1>
        <p className="text-gray-500 text-sm md:text-base">
          気になるカテゴリから記事を探せます
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4 ${category.color}`}
              aria-hidden="true"
            >
              {category.emoji}
            </div>
            <h2 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {category.name}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{category.description}</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {counts.get(category.name) ?? 0}件の記事
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
