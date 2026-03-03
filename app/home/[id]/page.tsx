"use client";
import {
  Calendar,
  FileText,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { useQuery } from "@/cache/useQuery";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import MaxWContainer from "@/components/ui/MaxWContainer";
import CreateTableBtn from "@/components/home-components/CreateTableBtn";
import CreateNoteBtn from "@/components/home-components/CreateNoteBtn";
import TableSettings from "@/components/home-components/TableSettings";
import NoteSettings from "@/components/home-components/NoteSettings";
import TablesNotFound from "@/components/home-components/TablesNotFound";
import SkeletonTextAnimation from "@/components/ui/SkeletonTextAnimation";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContentPreview } from "@/lib/getContentPreview";
import { cn } from "@/lib/utils";
import { usePaginatedQuery } from "convex/react";

type ViewMode = "grid" | "list";

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
  notesTableId?: Id<"notesTables"> | any | undefined;
  order?: number;
}

interface NotesDroppableContainerProps {
  tableId: Id<"notesTables">;
  viewMode: ViewMode;
  notes?: Note[];
  workspaceSlug?: string;
  workspaceId?: Id<"workingSpaces">;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  tables: any[];
  setViewMode: (mode: ViewMode) => void;
}

interface NoteCardProps {
  note: Note;
  workspaceId?: Id<"workingSpaces">;
  onDelete?: (noteId: Id<"notes">) => void;
}

interface EmptySearchResultsProps {
  searchQuery: string;
  onClearSearch: () => void;
}

interface EmptyTableStateProps {
  tableId: Id<"notesTables">;
  workspaceSlug?: string;
  workspaceId?: Id<"workingSpaces">;
}

const STORAGE_KEYS = {
  VIEW_MODE: "notevo_view_mode",
  ACTIVE_TABLE: "notevo_active_table",
};

// ─── Slider Tab List ───────────────────────────────────────────────────────────

interface SliderTabsListProps {
  tables: any[];
  activeTableId: string;
  onTabChange: (id: string) => void;
}

function SliderTabsList({
  tables,
  activeTableId,
  onTabChange,
}: SliderTabsListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const canScroll = canScrollLeft || canScrollRight;

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, tables]);

  // When active tab changes, scroll it into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(
      `[data-tab-id="${activeTableId}"]`,
    ) as HTMLElement | null;
    if (activeBtn) {
      const btnLeft = activeBtn.offsetLeft;
      const btnRight = btnLeft + activeBtn.offsetWidth;
      const visLeft = el.scrollLeft;
      const visRight = visLeft + el.clientWidth;
      if (btnLeft < visLeft + 16) {
        el.scrollTo({ left: btnLeft - 16, behavior: "smooth" });
      } else if (btnRight > visRight - 16) {
        el.scrollTo({
          left: btnRight - el.clientWidth + 16,
          behavior: "smooth",
        });
      }
    }
  }, [activeTableId]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Single layout — scrolls automatically when content overflows
  return (
    <div className=" relative py-5">
      <div className=" absolute -top-3 left-0 w-full Desktop:max-w-[900px] Desktop:w-fit">
        {/* Left arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          aria-label="Scroll tabs left"
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 rounded-md w-7 shadow-sm transition-all duration-200",
            canScrollLeft
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Right arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          aria-label="Scroll tabs right"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 rounded-md w-7 shadow-sm transition-all duration-200",
            canScrollRight
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-40 z-10 pointer-events-none rounded-l-lg transition-opacity duration-200"
          style={{
            opacity: canScrollLeft ? 1 : 0,
            background:
              "linear-gradient(to right, hsl(var(--card)) 30%, transparent)",
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-40 z-10 pointer-events-none rounded-r-lg transition-opacity duration-200"
          style={{
            opacity: canScrollRight ? 1 : 0,
            background:
              "linear-gradient(to left, hsl(var(--card)) 30%, transparent)",
          }}
        />

        {/* TabsList — naturally sized, clips + scrolls when content overflows */}
        <TabsList
          className="flex justify-start items-center px-1 py-6 bg-card/90 backdrop-blur-sm rounded-lg border border-border w-full"
          style={{ overflow: "clip" } as React.CSSProperties}
        >
          <div
            ref={scrollRef}
            className="flex items-center gap-2 flex-nowrap"
            style={
              {
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              } as React.CSSProperties
            }
          >
            {tables.map((table) => (
              <TabsTrigger
                key={table._id}
                value={table._id}
                data-tab-id={table._id}
                className="px-4 py-2.5 rounded-lg whitespace-nowrap flex-shrink-0"
              >
                {table.name}
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkingSpacePage() {
  const params = useParams();
  const workingSpaceId = params.id as Id<"workingSpaces">;

  const workspace = useQuery(
    api.workingSpaces.getWorkingSpaceById,
    workingSpaceId ? { _id: workingSpaceId } : "skip",
  );
  const workingSpacesSlug: string | undefined =
    workspace && (workspace.slug as string);

  const tables = useQuery(
    api.notesTables.getTables,
    workingSpaceId ? { workingSpaceId } : "skip",
  );

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      return stored === "list" || stored === "grid" ? stored : "grid";
    }
    return "grid";
  });

  const [activeTableId, setActiveTableId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(STORAGE_KEYS.ACTIVE_TABLE) || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    }
  }, [viewMode]);

  const defaultTableId = useMemo(() => {
    if (!tables || tables.length === 0) return undefined;
    const storedTableExists =
      activeTableId && tables.some((t) => t._id === activeTableId);
    if (storedTableExists) return activeTableId;
    return tables[0]._id;
  }, [tables, activeTableId]);

  const handleTabChange = (tableId: string) => {
    setActiveTableId(tableId);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_TABLE, tableId);
    }
  };

  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!workspace?.name) return;
    const originalTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalContent = metaDescription?.getAttribute("content");

    document.title = `${workspace.name} - Notevo Workspace`;
    const descriptionContent = `${workspace.name} workspace. `;

    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionContent);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = descriptionContent;
      document.head.appendChild(newMeta);
    }

    return () => {
      document.title = originalTitle;
      if (metaDescription && originalContent) {
        metaDescription.setAttribute("content", originalContent);
      } else if (!metaDescription) {
        document.querySelector('meta[name="description"]')?.remove();
      }
    };
  }, [workspace?.name, tables?.length]);

  return (
    <MaxWContainer className="my-5">
      {/* Header */}
      <header className="pb-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted from-20% via-transparent via-70% to-muted p-8">
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {!workspace ? (
                    <div className="bg-primary/20 rounded-md animate-pulse h-10 w-64 inline-block" />
                  ) : (
                    workspace.name
                  )}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm">
                    <LayoutGrid className="h-4 w-4" />
                    {tables?.length || 0} tables
                  </span>
                </div>
              </div>
              <CreateTableBtn workingSpaceId={workingSpaceId} />
            </div>
          </div>
        </div>
      </header>

      {/* Tables and Notes Content */}
      <div>
        {tables?.length ? (
          <Tabs
            value={defaultTableId}
            onValueChange={handleTabChange}
            className="mt-6"
          >
            {/* Slider Tab Bar */}
            <div className="mb-6">
              <SliderTabsList
                tables={tables}
                activeTableId={defaultTableId ?? ""}
                onTabChange={handleTabChange}
              />
            </div>

            {tables.map((table) => (
              <TabsContent key={table._id} value={table._id}>
                <NotesDroppableContainer
                  tableId={table._id}
                  viewMode={viewMode}
                  workspaceSlug={workingSpacesSlug}
                  workspaceId={workingSpaceId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  tables={tables}
                  setViewMode={setViewMode}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : tables ? (
          <TablesNotFound workingSpaceId={workingSpaceId} />
        ) : (
          <TablesSkeleton />
        )}
      </div>
    </MaxWContainer>
  );
}

// ─── Notes Container ───────────────────────────────────────────────────────────

export function NotesDroppableContainer({
  tableId,
  viewMode,
  notes,
  workspaceSlug,
  workspaceId,
  searchQuery,
  setSearchQuery,
  tables,
  setViewMode,
}: NotesDroppableContainerProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.notes.getNotesByTableId,
    { notesTableId: tableId },
    { initialNumItems: 5 },
  );

  const [deletedNoteIds, setDeletedNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDeletedNoteIds(new Set());
  }, [tableId]);

  const filteredNotes = useMemo(() => {
    const notDeletedNotes = results.filter(
      (note) => note && !deletedNoteIds.has(note._id),
    );
    if (!searchQuery.trim()) return notDeletedNotes;
    const q = searchQuery.toLowerCase();
    return notDeletedNotes.filter((note) => {
      return (
        note.title?.toLowerCase().includes(q) ||
        note.body?.toLowerCase().includes(q)
      );
    });
  }, [results, searchQuery, deletedNoteIds]);

  const handleNoteDelete = useCallback((noteId: Id<"notes">) => {
    setDeletedNoteIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(noteId);
      return newSet;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search Notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant="SidebarMenuButton"
              size="sm"
              className={cn(
                "rounded-none",
                viewMode === "grid" && "bg-foreground/10",
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid
                className={`h-4 w-4 ${viewMode === "grid" && "text-primary"}`}
              />
            </Button>
            <Button
              variant="SidebarMenuButton"
              size="sm"
              className={cn(
                "rounded-none",
                viewMode === "list" && "bg-foreground/10",
              )}
              onClick={() => setViewMode("list")}
            >
              <List
                className={`h-4 w-4 ${viewMode === "list" && "text-primary"}`}
              />
            </Button>
          </div>
          <CreateNoteBtn
            workingSpaceId={workspaceId}
            workingSpacesSlug={workspaceSlug}
            CNBP_notesTableId={tableId}
          />
          <TableSettings
            notesTableId={tableId}
            tableName={tables?.find((t) => t._id === tableId)?.name}
          />
        </div>
      </div>

      {/* Notes */}
      {status === "LoadingFirstPage" ? (
        <NotesSkeleton viewMode={viewMode} />
      ) : searchQuery && filteredNotes.length === 0 ? (
        <EmptySearchResults
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : filteredNotes.length === 0 ? (
        <EmptyTableState
          tableId={tableId}
          workspaceSlug={workspaceSlug}
          workspaceId={workspaceId}
        />
      ) : (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {filteredNotes.map((note) => (
              <div key={note._id}>
                {viewMode === "grid" ? (
                  <GridNoteCard
                    note={note}
                    workspaceId={workspaceId}
                    onDelete={handleNoteDelete}
                  />
                ) : (
                  <ListNoteCard
                    note={note}
                    workspaceId={workspaceId}
                    onDelete={handleNoteDelete}
                  />
                )}
              </div>
            ))}
          </div>

          {status === "CanLoadMore" && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => loadMore(15)}
                className="border-border"
              >
                Show More
              </Button>
            </div>
          )}

          {status === "LoadingMore" && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" disabled className="border-border">
                <LoadingAnimation className="h-4 w-4 mr-2" />
                Loading...
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Note Cards ────────────────────────────────────────────────────────────────

function GridNoteCard({ note, workspaceId, onDelete }: NoteCardProps) {
  const isEmpty = !note.body || note.body.trim() === "";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card/90 backdrop-blur-sm border transition-all duration-300 flex flex-col h-full",
        isEmpty
          ? "border-dashed border-border"
          : "border-border hover:border-border",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold text-foreground line-clamp-2 flex-1">
            {note.title || "Untitled"}
          </CardTitle>
          <NoteSettings
            noteId={note._id}
            noteTitle={note.title}
            ShowWidthOp={false}
            IconVariant="vertical_icon"
            DropdownMenuContentAlign="start"
            TooltipContentAlign="start"
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      <CardContent className="h-full">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground italic">
            No content yet. Click to start writing...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {getContentPreview(note.body)}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {typeof window !== "undefined" ? (
            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          ) : (
            <SkeletonTextAnimation className="w-20" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-7 text-xs hover:bg-primary/10"
        >
          <Link href={`/home/${workspaceId}/${note.slug}?id=${note._id}`}>
            Open
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ListNoteCard({ note, workspaceId, onDelete }: NoteCardProps) {
  const isEmpty = !note.body || note.body.trim() === "";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden bg-card/90 backdrop-blur-sm border transition-all duration-300",
        isEmpty
          ? "border-dashed border-border"
          : "border-border hover:border-border",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground mb-1 truncate">
              {note.title || "Untitled"}
            </h3>
            {isEmpty ? (
              <p className="text-sm text-muted-foreground italic">
                No content yet. Click to start writing...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {getContentPreview(note.body)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {typeof window !== "undefined" ? (
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              ) : (
                <SkeletonTextAnimation className="w-20" />
              )}
            </div>
            <NoteSettings
              noteId={note._id}
              noteTitle={note.title}
              ShowWidthOp={false}
              IconVariant="vertical_icon"
              DropdownMenuContentAlign="start"
              TooltipContentAlign="start"
              onDelete={onDelete}
            />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 text-xs hover:bg-primary/10"
            >
              <Link href={`/home/${workspaceId}/${note.slug}?id=${note._id}`}>
                Open
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty States ──────────────────────────────────────────────────────────────

function EmptySearchResults({
  searchQuery,
  onClearSearch,
}: EmptySearchResultsProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardContent className="pt-12 pb-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="h-10 w-10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            No results found
          </h3>
          <p className="text-muted-foreground mb-6">
            No notes found for "{searchQuery}"
          </p>
          <Button
            variant="outline"
            onClick={onClearSearch}
            className="border-border"
          >
            Clear Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTableState({
  tableId,
  workspaceSlug,
  workspaceId,
}: EmptyTableStateProps) {
  return (
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
          <CreateNoteBtn
            workingSpaceId={workspaceId}
            workingSpacesSlug={workspaceSlug}
            CNBP_notesTableId={tableId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────────────────

function NotesSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={index}
            className="bg-card/90 backdrop-blur-sm border-border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="h-5 w-3/4 bg-primary/20 rounded animate-pulse" />
                <div className="h-5 w-5 bg-primary/20 rounded animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-primary/20 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-primary/20 rounded animate-pulse" />
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex items-center justify-between border-t border-border">
              <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
              <div className="h-7 w-16 bg-primary/20 rounded animate-pulse" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-2/3 bg-primary/20 rounded animate-pulse" />
                <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
                <div className="h-5 w-5 bg-primary/20 rounded animate-pulse" />
                <div className="h-7 w-16 bg-primary/20 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TablesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <div className="h-5 w-3/4 bg-primary/20 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2">
              <div className="h-4 w-full bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-primary/20 rounded animate-pulse" />
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t border-border">
            <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
