import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateWizard } from "@/components/wizard/CreateWizard";
import { getSessionUser } from "@/lib/session";
import { ENVELOPE_TEMPLATES } from "@/lib/envelope-templates";

export const metadata: Metadata = {
  title: "Create a letter — Letterbox",
};

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const initialTemplateId = ENVELOPE_TEMPLATES.some((t) => t.id === template) ? template : undefined;

  const user = await getSessionUser();
  if (!user) {
    const next = initialTemplateId ? `/create?template=${initialTemplateId}` : "/create";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return <CreateWizard accountEmail={user.email} initialTemplateId={initialTemplateId} />;
}
