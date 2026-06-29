import { getAllPosts } from "@/lib/posts";

export default async function sitemap() {
  const posts = await getAllPosts();

  const postUrls = posts.map((post) => ({
    url: `https://kuroneconote.com/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://kuroneconote.com",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: "https://kuroneconote.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: "https://kuroneconote.com/privacy",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: "https://kuroneconote.com/contact",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...postUrls,
  ];
}