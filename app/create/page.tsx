import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateWizard } from "@/components/wizard/CreateWizard";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create a letter — Letterbox",
};

export default async function CreatePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/create");

  return <CreateWizard accountEmail={user.email} />;
}
