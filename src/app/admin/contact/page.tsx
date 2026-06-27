import type { Metadata } from "next";
import { checkAuth, getContacts } from "./actions";
// ContactStatus, Contact are from ./types — used only via ContactAdmin props
import { LoginForm } from "./LoginForm";
import { ContactAdmin } from "./ContactAdmin";

export const metadata: Metadata = {
  title: "お問い合わせ管理",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminContactPage({ searchParams }: Props) {
  const authenticated = await checkAuth();

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  const { status } = await searchParams;
  const contacts = await getContacts(status);

  return <ContactAdmin contacts={contacts} currentStatus={status ?? "すべて"} />;
}
