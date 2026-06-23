import { getAllPosts, getPostBySlug, deriveCategories, getRecentPosts } from "@/lib/posts";
import Sidebar from "@/components/Sidebar";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key} className="list-disc pl-6 space-y-1.5 my-4 text-gray-700">
        {listBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      flushList(`list-before-h2-${i}`);
      elements.push(
        <h2 key={i} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-200">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList(`list-before-h3-${i}`);
      elements.push(
        <h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList(`list-empty-${i}`);
    } else {
      flushList(`list-before-p-${i}`);
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed my-3">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList("final");

  return <>{elements}</>;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
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
        <Link
          href={`/category/${encodeURIComponent(post.category)}`}
          className="hover:text-indigo-600 transition-colors"
        >
          {post.category}
        </Link>
        <span aria-hidden="true">›</span>
        <span className="text-gray-700 line-clamp-1">{post.title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Article header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">{post.date}</span>
              <span className="text-xs text-gray-400">約{post.readingTime}分で読めます</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-3">
              {post.title}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
          </div>

          {/* ==========================================
              広告スペース - 記事上部 (AD SPACE - Above article content)
              ここにアフィリエイト/広告コードを貼り付けてください
              推奨サイズ: 728×90 または 336×280
              ========================================== */}
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center mb-6">
            <p className="text-xs text-gray-400 mb-2">広告</p>
            <div className="h-[90px] flex items-center justify-center text-gray-300 text-sm border border-gray-100 rounded-lg bg-gray-50">
              728 × 90
            </div>
          </div>

          {/* Article content */}
          <article className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
            <MarkdownRenderer content={post.content} />
          </article>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* ==========================================
              広告スペース - 記事下部 (AD SPACE - Below article content)
              ここにアフィリエイト/広告コードを貼り付けてください
              推奨サイズ: 728×90 または 336×280
              ========================================== */}
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center mt-8">
            <p className="text-xs text-gray-400 mb-2">広告</p>
            <div className="h-[90px] flex items-center justify-center text-gray-300 text-sm border border-gray-100 rounded-lg bg-gray-50">
              728 × 90
            </div>
          </div>

          {/* Back to list */}
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              記事一覧に戻る
            </Link>
          </div>
        </div>

        {/* Right sidebar */}
        <Sidebar categories={categories} recentPosts={recentPosts} />
      </div>
    </div>
  );
}
