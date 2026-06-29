import { cache } from "react";
import type { PageObjectResponse, RichTextItemResponse } from "@notionhq/client";
import { getDataSourceId, notionClient } from "./notion";

export const DEFAULT_COVER_IMAGE = "/default-cover.jpg";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: number;
  content: string;
  coverImage: string;
};

function richTextToPlain(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("");
}

function richTextToMarkdown(richText: RichTextItemResponse[]): string {
  return richText
    .map((t) => {
      let text = t.plain_text;
      if (t.annotations.code) text = `\`${text}\``;
      if (t.annotations.bold) text = `**${text}**`;
      if (t.href) text = `[${text}](${t.href})`;
      return text;
    })
    .join("");
}

function estimateReadingTime(text: string): number {
  return Math.max(1, Math.ceil(text.length / 500));
}

function isPublished(page: PageObjectResponse): boolean {
  const prop = page.properties["公開"];
  return prop?.type === "checkbox" && prop.checkbox;
}

function getCoverImage(page: PageObjectResponse): string {
  if (page.cover?.type === "external") return page.cover.external.url;
  if (page.cover?.type === "file") return page.cover.file.url;
  return DEFAULT_COVER_IMAGE;
}

function pageToPost(page: PageObjectResponse, content = ""): Post {
  const props = page.properties;

  const titleProp = props["名前"];
  const title = titleProp?.type === "title" ? richTextToPlain(titleProp.title) : "";

  const excerptProp = props["概要"];
  const excerpt = excerptProp?.type === "rich_text" ? richTextToPlain(excerptProp.rich_text) : "";

  const dateProp = props["公開日"];
  const date = dateProp?.type === "date" ? dateProp.date?.start ?? "" : "";

  const categoryProp = props["カテゴリ"];
  const category = categoryProp?.type === "select" ? categoryProp.select?.name ?? "" : "";

  return {
    slug: page.id,
    title,
    excerpt,
    date,
    category,
    tags: [],
    readingTime: estimateReadingTime(content || excerpt),
    content,
    coverImage: getCoverImage(page),
  };
}

async function fetchPageContent(pageId: string): Promise<string> {
  const lines: string[] = [];
  let cursor: string | undefined;

  do {
    const res = await notionClient.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    for (const block of res.results) {
      if (!("type" in block)) continue;

      if (block.type === "heading_1") {
        lines.push(`## ${richTextToMarkdown(block.heading_1.rich_text)}`);
      } else if (block.type === "heading_2") {
        lines.push(`## ${richTextToMarkdown(block.heading_2.rich_text)}`);
      } else if (block.type === "heading_3") {
        lines.push(`### ${richTextToMarkdown(block.heading_3.rich_text)}`);
      } else if (block.type === "bulleted_list_item") {
        lines.push(`- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`);
      } else if (block.type === "numbered_list_item") {
        lines.push(`- ${richTextToMarkdown(block.numbered_list_item.rich_text)}`);
      } else if (block.type === "to_do") {
        lines.push(`- ${richTextToMarkdown(block.to_do.rich_text)}`);
      } else if (block.type === "quote") {
        lines.push(richTextToMarkdown(block.quote.rich_text));
      } else if (block.type === "paragraph") {
        lines.push(richTextToMarkdown(block.paragraph.rich_text));
      } else if (block.type === "image") {
  const url =
    block.image.type === "external"
      ? block.image.external.url
      : block.image.file.url;
  const caption =
    block.image.caption?.length > 0
      ? richTextToMarkdown(block.image.caption)
      : "";
  lines.push(`![${caption}](${url})`);
} else if (block.type === "video") {
  const url =
    block.video.type === "external"
      ? block.video.external.url
      : "";
  if (url) lines.push(`[youtube](${url})`);
} else if (block.type === "table") {
  const tableRows = await notionClient.blocks.children.list({
    block_id: block.id,
  });
  const rows: string[][] = [];
  for (const row of tableRows.results) {
    if (!("type" in row) || row.type !== "table_row") continue;
    const cells = row.table_row.cells.map((cell) =>
      richTextToMarkdown(cell)
    );
    rows.push(cells);
  }
  if (rows.length > 0) {
    lines.push(`[table]${JSON.stringify(rows)}[/table]`);
  }
} else {
  continue;
}
      lines.push("");
    }

    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);

  return lines.join("\n").trim();
}

export const getAllPosts = cache(async function getAllPosts(): Promise<Post[]> {
  const dataSourceId = await getDataSourceId();
  const posts: Post[] = [];
  let cursor: string | undefined;

  do {
    const res = await notionClient.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "公開", checkbox: { equals: true } },
      sorts: [{ property: "公開日", direction: "descending" }],
      start_cursor: cursor,
    });

    for (const page of res.results) {
      if ("properties" in page) {
        posts.push(pageToPost(page as PageObjectResponse));
      }
    }

    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);

  return posts;
});

export const getPostBySlug = cache(async function getPostBySlug(
  slug: string
): Promise<Post | undefined> {
  const page = await notionClient.pages.retrieve({ page_id: slug }).catch(() => null);
  if (!page || !("properties" in page)) return undefined;

  const fullPage = page as PageObjectResponse;
  if (!isPublished(fullPage)) return undefined;

  const content = await fetchPageContent(fullPage.id);
  return pageToPost(fullPage, content);
});

export function deriveCategories(posts: Post[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    if (!post.category) continue;
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}

export function getRecentPosts(posts: Post[], count = 5): Post[] {
  return [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
