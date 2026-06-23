export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: number;
  content: string;
};

export const categories: { name: string; count: number }[] = [];

export const posts: Post[] = [];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRecentPosts(count = 5): Post[] {
  return [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
