import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { getCategoryByName } from "@/lib/categories";

export default function ArticleCard({ post }: { post: Post }) {
  const category = getCategoryByName(post.category);
  const colorClass = category?.color ?? "bg-gray-100 text-gray-700";

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-40 relative">
        <Image
          src={post.coverImage}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${colorClass}`}>
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{post.date}</span>
          <span className="text-xs text-gray-400">約{post.readingTime}分</span>
        </div>

        <h2 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="group-hover:text-indigo-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
        >
          続きを読む
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
