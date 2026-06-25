export type CategoryDef = {
  name: string;
  slug: string;
  emoji: string;
  color: string;
  description: string;
};

export const CATEGORIES: CategoryDef[] = [
  {
    name: "人事",
    slug: "hr",
    emoji: "🧑‍💼",
    color: "bg-indigo-100 text-indigo-700",
    description: "採用・評価・教育など人事業務に関する情報をお届けします。",
  },
  {
    name: "労務管理",
    slug: "labor",
    emoji: "📋",
    color: "bg-blue-100 text-blue-700",
    description: "勤怠・給与・休暇管理など労務に関する実務情報をお届けします。",
  },
  {
    name: "総務",
    slug: "general-affairs",
    emoji: "🏢",
    color: "bg-violet-100 text-violet-700",
    description: "庶務・契約・備品管理など総務業務に関する情報をお届けします。",
  },
  {
    name: "BCP",
    slug: "bcp",
    emoji: "🛡️",
    color: "bg-rose-100 text-rose-700",
    description: "事業継続計画・防災・リスク管理に関する情報をお届けします。",
  },
  {
    name: "コミュニケーション",
    slug: "communication",
    emoji: "💬",
    color: "bg-green-100 text-green-700",
    description: "社内コミュニケーション・情報共有に関する情報をお届けします。",
  },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.name === name);
}
