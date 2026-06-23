import { Client } from "@notionhq/client";

export const notionClient = new Client({ auth: process.env.NOTION_TOKEN });

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

let cachedDataSourceId: string | undefined;

// Notion databases can hold multiple data sources since API version 2025-09-03;
// queries must target a data source id rather than the database id itself.
export async function getDataSourceId(): Promise<string> {
  if (cachedDataSourceId) return cachedDataSourceId;

  const database = await notionClient.databases.retrieve({
    database_id: NOTION_DATABASE_ID,
  });

  const dataSource = "data_sources" in database ? database.data_sources[0] : undefined;
  if (!dataSource) {
    throw new Error("Notion database has no data source");
  }

  cachedDataSourceId = dataSource.id;
  return cachedDataSourceId;
}
