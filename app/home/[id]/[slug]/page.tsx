import { redirect } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import NotePageClient from "./NotePageClient";

export default async function NotePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  const noteId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null;

  if (!noteId) {
    redirect("/home");
  }

  return <NotePageClient noteId={noteId as Id<"notes">} />;
}
