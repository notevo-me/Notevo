"use client";
import {
  Clock,
  FileText,
  Plus,
  Sparkles,
  Notebook,
  PenSquare,
  Folder,
  Star,
  ChevronLeft,
  ChevronRight,
  FolderClosed,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useQuery } from "@/cache/useQuery";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import MaxWContainer from "@/components/ui/MaxWContainer";
import WorkingSpaceSettings from "@/components/home-components/WorkingSpaceSettings";
import WorkingSpaceNotFound from "@/components/home-components/WorkingSpaceNotFound";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import SkeletonTextAnimation from "@/components/ui/SkeletonTextAnimation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  extractTextFromTiptap as parseTiptapContentExtractText,
  truncateText as parseTiptapContentTruncateText,
} from "@/lib/parse-tiptap-content";
import { cn } from "@/lib/utils";
import { usePaginatedQuery } from "convex/react";

export default function home() {
  const viewer = useQuery(api.users.viewer);
  const recentWorkspaces = useQuery(api.workingSpaces.getRecentWorkingSpaces);
  const { results, status, loadMore } = usePaginatedQuery(
    api.notes.getNoteByUserId,
    {},
    { initialNumItems: 5 },
  );
  const {
    results: favResults,
    status: favStatus,
    loadMore: loadMoreFavs,
  } = usePaginatedQuery(api.notes.getFavNotes, {}, { initialNumItems: 5 });

  const createWorkingSpace = useMutation(
    api.workingSpaces.createWorkingSpace,
  ).withOptimisticUpdate((local, args) => {
    const { name } = args;
    const now = Date.now();
    const uuid = crypto.randomUUID();
    const tempId = `${uuid}-${now}` as any as Id<"workingSpaces">;

    const currentWorkspaces = local.getQuery(
      api.workingSpaces.getRecentWorkingSpaces,
    );
    if (currentWorkspaces !== undefined) {
      local.setQuery(api.workingSpaces.getRecentWorkingSpaces, {}, [
        {
          _id: tempId,
          _creationTime: now,
          name: name || "Untitled",
          slug: "untitled",
          userId: "" as any as Id<"users">,
          createdAt: now,
          updatedAt: now,
        },
        ...currentWorkspaces,
      ]);
    }
  });

  const handleCreateWorkingSpace = async () => {
    await createWorkingSpace({ name: "Untitled" });
  };

  useEffect(() => {
    if (viewer?.name) {
      document.title = `${viewer.name} - Home`;

      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", `${viewer.name}'s Notevo home`);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.name = "description";
        newMeta.content = `${viewer.name}'s Notevo Home`;
        document.head.appendChild(newMeta);
      }
    }
  }, [viewer]);

  const pinnedNotes = favResults;

  return (
    <MaxWContainer className="relative my-5">
      {/* Enhanced Hero Section */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-muted from-20% via-transparent via-70% to-muted p-8 mb-8">
        <header className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">
            {viewer?.name ? (
              <>
                Hello,{" "}
                {`${
                  viewer.name.split(" ")[0].length > 10
                    ? `${viewer.name.split(" ")[0].substring(0, 10)}...`
                    : viewer.name.split(" ")[0]
                }${
                  viewer.name.split(" ")[1]
                    ? ` ${viewer.name.split(" ")[1].charAt(0)}.`
                    : "!"
                }`}
              </>
            ) : (
              <SkeletonTextAnimation className="w-full h-10" />
            )}
          </h1>
          <p className="text-white/90 text-md max-w-2xl mx-auto mb-6">
            Organize your thoughts, manage your workspaces, and boost your
            productivity with Notevo.
          </p>
        </header>
      </div>

      {/* Workspaces Slider */}
      <div className="mb-12">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-foreground text-xl font-semibold">
            Your Workspaces
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateWorkingSpace}
            disabled={recentWorkspaces === undefined}
          >
            <Plus className="h-4 w-4 sm:mr-2 mr-0" />
            <span className="hidden sm:block">New Workspace</span>
          </Button>
        </div>

        {recentWorkspaces === undefined ? (
          <Slider>
            {[1, 2, 3, 4].map((i) => (
              <WorkspaceCardSkeleton key={i} />
            ))}
          </Slider>
        ) : recentWorkspaces.length > 0 ? (
          <Slider>
            {recentWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace._id}
                workspace={workspace}
                handleCreateWorkingSpace={handleCreateWorkingSpace}
                loading={false}
              />
            ))}
          </Slider>
        ) : (
          <WorkingSpaceNotFound />
        )}
      </div>

      {/* Pinned Notes Slider */}
      {(favStatus === "LoadingFirstPage" || pinnedNotes.length > 0) && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-foreground text-xl font-semibold">
              Pinned Notes
            </h2>
          </div>
          {favStatus === "LoadingFirstPage" ? (
            <Slider>
              {[1, 2, 3].map((i) => (
                <NoteCardSkeleton key={i} />
              ))}
            </Slider>
          ) : (
            <Slider>
              {pinnedNotes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </Slider>
          )}
        </div>
      )}

      {/* Recent Notes Slider */}
      {results.length !== 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-foreground text-xl font-semibold">
              Recent Notes
            </h2>
          </div>

          {status === "LoadingFirstPage" ? (
            <Slider>
              {[1, 2, 3, 4].map((i) => (
                <NoteCardSkeleton key={i} />
              ))}
            </Slider>
          ) : results.length > 0 ? (
            <Slider>
              {results.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </Slider>
          ) : (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No notes yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first note to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </MaxWContainer>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-border flex-shrink-0 w-[300px] h-fit">
      <CardHeader className="pb-3 relative">
        <div className="h-5 bg-primary/20 rounded-lg w-3/4 animate-pulse"></div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="h-20 flex items-center justify-center">
          <div className="h-14 w-14 bg-primary/20 rounded-full animate-pulse"></div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border">
        <div className="h-4 bg-primary/20 rounded-lg w-24 animate-pulse"></div>
        <div className="h-7 bg-primary/20 rounded-lg w-16 animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}

function NoteCardSkeleton() {
  return (
    <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-border flex-shrink-0 w-[300px] h-[225px] ">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-primary/20 rounded-lg w-3/4 animate-pulse"></div>
            <div className="h-3 bg-primary/20 rounded-lg w-1/2 animate-pulse"></div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-2">
        <div className="h-3 bg-primary/20 rounded-lg w-full animate-pulse"></div>
        <div className="h-3 bg-primary/20 rounded-lg w-5/6 animate-pulse"></div>
        <div className="h-3 bg-primary/20 rounded-lg w-4/6 animate-pulse"></div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border">
        <div className="h-4 bg-primary/20 rounded-lg w-24 animate-pulse"></div>
        <div className="h-7 bg-primary/20 rounded-lg w-16 animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}

function Slider({ children }: { children: React.ReactNode }) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 10);
    setCanScrollRight(
      hasOverflow &&
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    const mutationObserver = new MutationObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(container);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <div ref={wrapperRef} className="relative w-full h-[250px] group">
      {/* Left gradient fade */}
      {canScrollLeft && (
        <div className="absolute -left-1 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-[5] pointer-events-none" />
      )}

      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}

      {/* Scrollable container - ABSOLUTE POSITIONED */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 flex gap-4 h-fit overflow-x-auto scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Right gradient fade */}
      {canScrollRight && (
        <div className="absolute -right-1 top-0 bottom-0 w-16 sm:w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-[5] pointer-events-none" />
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  );
}

interface Workspace {
  _id: Id<"workingSpaces">;
  name: string;
  slug?: string;
  favorite?: boolean;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  handleCreateWorkingSpace: () => void;
  loading: boolean;
}

function WorkspaceCard({
  workspace,
  handleCreateWorkingSpace,
  loading,
}: WorkspaceCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card/90 backdrop-blur-sm border-border flex-shrink-0 w-[300px] h-fit hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base font-semibold text-foreground">
          {workspace.name.length > 20
            ? `${workspace.name.substring(0, 20)}...`
            : workspace.name}
        </CardTitle>
        <div className="absolute top-3 right-3">
          <WorkingSpaceSettings
            workingSpaceId={workspace._id}
            workingspaceName={workspace.name}
          />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="h-20 flex items-center justify-center">
          <FolderClosed className="h-8 w-8 text-primary" />
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {typeof window !== "undefined" ? (
            <span>{`${new Date(workspace.updatedAt).toLocaleDateString()}`}</span>
          ) : (
            <SkeletonTextAnimation className="w-20" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 px-2 text-xs hover:bg-primary/10"
        >
          <Link href={`/home/${workspace._id}`}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

interface Note {
  _id: Id<"notes">;
  title?: string;
  slug?: string;
  workingSpacesSlug?: string;
  workingSpaceId?: Id<"workingSpaces">;
  userId?: Id<"users">;
  body?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: Id<"tags">[];
  order?: number;
}

function NoteCard({ note }: { note: Note }) {
  const getContentPreview = (content: any) => {
    if (!content) return "No content yet. Click to start writing...";

    try {
      const plainText = parseTiptapContentExtractText(content);
      return plainText
        ? parseTiptapContentTruncateText(plainText, 80)
        : "No content yet. Click to start writing...";
    } catch (error) {
      console.error("Error parsing content:", error);
      return "Unable to display content preview";
    }
  };

  const isEmpty = !note.body;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card/90 backdrop-blur-sm border transition-all duration-300 flex-shrink-0 w-[300px] h-[225px] flex flex-col",
        isEmpty ? "border-dashed border-border" : "border-border",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {note.title || "Untitled"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {note.workingSpacesSlug || "Personal Workspace"}
            </CardDescription>
          </div>
          {note.favorite && (
            <Star className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="h-full">
        <p
          className={cn(
            "text-sm line-clamp-3",
            isEmpty ? "text-muted-foreground italic" : "text-muted-foreground",
          )}
        >
          {getContentPreview(note.body)}
        </p>
      </CardContent>

      <CardFooter className="pt-3 flex justify-between items-center text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {typeof window !== "undefined" ? (
            <span>{`${new Date(note.updatedAt).toLocaleDateString()}`}</span>
          ) : (
            <SkeletonTextAnimation className="w-20" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 px-2 text-xs hover:bg-primary/10"
        >
          <Link
            href={`/home/${note.workingSpaceId}/${note.slug}?id=${note._id}`}
          >
            Open
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
