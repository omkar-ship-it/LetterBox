import type { Metadata } from "next";
import { CreateWizard } from "@/components/wizard/CreateWizard";

export const metadata: Metadata = {
  title: "Create a letter — Letterbox",
};

export default function CreatePage() {
  return <CreateWizard />;
}
