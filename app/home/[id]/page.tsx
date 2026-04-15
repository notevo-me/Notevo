import { redirect } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import WorkingSpacePageClient from "./WorkingSpacePageClient";

export default async function WorkingSpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    redirect("/");
  }

  return <WorkingSpacePageClient workingSpaceId={id as Id<"workingSpaces">} />;
}
