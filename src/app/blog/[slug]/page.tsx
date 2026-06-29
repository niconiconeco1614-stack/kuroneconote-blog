import { getAllPosts, getPostBySlug, deriveCategories, getRecentPosts } from "@/lib/posts";
import { getCategoryByName } from "@/lib/categories";
import Sidebar from "@/components/Sidebar";
import { notFound } from "next/navigation";
import Image from "next/image";
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
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
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
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline"
        >
          {linkMatch[1]}
        </a>
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

} else if (line.startsWith("[table]")) {
      flushList(`list-before-table-${i}`);
      const match = line.match(/^\[table\](.*)\[\/table\]$/);
      if (match) {
        const rows: string[][] = JSON.parse(match[1]);
        elements.push(
          <div key={i} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-50">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-900">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="border border-gray-200 px-4 py-2 text-gray-700">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

} else if (line.startsWith("[youtube](")) {
  flushList(`list-before-yt-${i}`);
  const match = line.match(/^\[youtube\]\((.*?)\)$/);
  if (match) {
    const url = match[1];
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    )?.[1];
    if (videoId) {
      elements.push(
        <div key={i} className="my-6 aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

} else if (line.startsWith("![")) {
  flushList(`list-before-img-${i}`);
  const match = line.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (match) {
    const [, alt, src] = match;
    elements.push(
      <div key={i} className="my-6 rounded-xl overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
        />
        {alt && (
          <p className="text-center text-xs text-gray-400 mt-2">{alt}</p>
        )}
      </div>
    );
  }
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
          href={`/category/${getCategoryByName(post.category)?.slug ?? encodeURIComponent(post.category)}`}
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
          {/* Cover image */}
          <div className="relative h-56 md:h-72 rounded-xl overflow-hidden mb-6">
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>

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
