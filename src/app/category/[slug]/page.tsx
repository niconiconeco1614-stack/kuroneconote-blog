import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, deriveCategories, getRecentPosts } from "@/lib/posts";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";

export const revalidate = 60;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) => post.category === category.name);
  const categories = deriveCategories(allPosts);
  const recentPosts = getRecentPosts(allPosts, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-8" aria-label="パンくずリスト">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          ホーム
        </Link>
        <span aria-hidden="true">›</span>
        <Link href="/category" className="hover:text-indigo-600 transition-colors">
          カテゴリ
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <span
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${category.color}`}
          aria-hidden="true"
        >
          {category.emoji}
        </span>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-500">{category.description}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {posts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
              このカテゴリの記事は準備中です
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        <Sidebar categories={categories} recentPosts={recentPosts} />
      </div>
    </div>
  );
}
