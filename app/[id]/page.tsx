import { notFound } from "next/navigation";
import { ChecklistForm } from "@/components/ChecklistForm";
import { checklists, getChecklist } from "@/lib/checklists";

export function generateStaticParams() {
  return checklists.map((c) => ({ id: c.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const checklist = getChecklist(id);
  if (!checklist) notFound();
  return <ChecklistForm checklist={checklist} />;
}
