"use client";
import { HowToStartSteps } from "@/lib/data";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { UserPlus, PlusIcon, PenBoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeading from "./SectionHeading";
import Section from "@/components/ui/Section";
import Link from "next/link";
import { FolderClosed } from "lucide-react";
interface Step {
  id: string;
  StepNum: string;
  Title: string;
  Body: string;
}

const stepIcons = [UserPlus, PlusIcon, PenBoxIcon];

/* ─── Mini UI Previews ─────────────────────────────────────── */

function SignUpPreview() {
  const EMAIL = "mohammed@notevo.me";
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    function startTyping() {
      setDisplayed("");
      setDone(false);
      let i = 0;
      t = setTimeout(() => {
        interval = setInterval(() => {
          i++;
          setDisplayed(EMAIL.slice(0, i));
          if (i >= EMAIL.length) {
            clearInterval(interval);
            setDone(true);
            t = setTimeout(() => {
              let j = EMAIL.length;
              const erase = setInterval(() => {
                j--;
                setDisplayed(EMAIL.slice(0, j));
                if (j <= 0) {
                  clearInterval(erase);
                  setDone(false);
                  t = setTimeout(startTyping, 500);
                }
              }, 35);
            }, 1800);
          }
        }, 80);
      }, 600);
    }

    startTyping();
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2.5 p-5 w-full">
      <div className="bg-background rounded-lg px-3.5 py-2.5 border border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
          Email
        </p>
        <p className="text-xs text-foreground min-h-[16px] flex items-center gap-0.5">
          {displayed.length > 0 ? (
            displayed
          ) : (
            <span className="text-muted-foreground">name@email.com</span>
          )}
          {!done && (
            <span className="inline-block w-0.5 h-3 bg-primary rounded-sm cursor-blink" />
          )}
        </p>
      </div>
      <motion.div
        className="bg-primary text-primary-foreground rounded-lg py-2.5 text-center text-xs shadow-sm"
        animate={done ? { scale: [1, 0.96, 1] } : {}}
        transition={{ delay: 0.3, duration: 0.25 }}
      >
        Send sign-in link
      </motion.div>
      <div className="flex items-center gap-2 my-0.5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground tracking-widest">
          OTHER OPTIONS
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex gap-2">
        {["GitHub", "Google"].map((label) => (
          <div
            key={label}
            className="flex-1 bg-background border border-border rounded-lg py-2 text-center text-[11px] text-foreground font-medium"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspacePreview() {
  const [phase, setPhase] = useState<"idle" | "moving" | "clicked" | "created">(
    "idle",
  );

  useEffect(() => {
    function runLoop() {
      setPhase("idle");
      const t1 = setTimeout(() => setPhase("moving"), 600);
      const t2 = setTimeout(() => setPhase("clicked"), 1400);
      const t3 = setTimeout(() => setPhase("created"), 1800);
      const t4 = setTimeout(runLoop, 4200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
    const cleanup = runLoop();
    return cleanup;
  }, []);

  return (
    <div className="p-5 w-full">
      <div className="bg-background rounded-lg border border-border p-4 flex flex-col items-center gap-2.5 relative overflow-hidden">
        {phase !== "created" ? (
          <>
            <div className="w-11 h-11 rounded-lg bg-muted border border-border flex items-center justify-center text-xl">
              <FolderClosed size={24} className=" text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">
              Workspace not found
            </p>
            <p className="text-[11px] text-muted-foreground">
              You don't have any workspaces yet.
            </p>
            <motion.div
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-[11px] mt-1 shadow-sm"
              animate={
                phase === "clicked"
                  ? { scale: 0.93, opacity: 0.8 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.12 }}
            >
              Create a new workspace
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Notebook card */}
            <div className="bg-background rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-bold text-foreground">
                  Untitled
                </span>
                <div className="flex gap-0.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-muted-foreground/40"
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center py-5 border-t border-b border-border">
                <FolderClosed size={24} className=" text-primary" />
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  2/25/2026
                </div>
                <span className="text-[10px] font-medium text-primary">
                  Open
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cursor */}
        {phase !== "created" && (
          <motion.div
            className="absolute pointer-events-none z-10"
            initial={{ left: "80%", top: "15%" }}
            animate={
              phase === "idle"
                ? { left: "80%", top: "15%" }
                : { left: "46%", top: "74%" }
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
              <path
                d="M0 0L0 14L4 10L6.5 16L8.5 15L6 9L11 9L0 0Z"
                fill="#202020"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function WritingPreview() {
  const SLASH_TEXT = "/t";
  const [displayed, setDisplayed] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    function startLoop() {
      setDisplayed("");
      setShowMenu(false);
      setShowPlaceholder(true);

      // Show placeholder, then start typing /t
      t = setTimeout(() => {
        setShowPlaceholder(false);
        let i = 0;
        t = setTimeout(() => {
          interval = setInterval(() => {
            i++;
            setDisplayed(SLASH_TEXT.slice(0, i));
            if (i >= SLASH_TEXT.length) {
              clearInterval(interval);
              t = setTimeout(() => setShowMenu(true), 400);
              t = setTimeout(() => {
                setShowMenu(false);
                let j = SLASH_TEXT.length;
                const erase = setInterval(() => {
                  j--;
                  setDisplayed(SLASH_TEXT.slice(0, j));
                  if (j <= 0) {
                    clearInterval(erase);
                    t = setTimeout(startLoop, 400);
                  }
                }, 40);
              }, 2600);
            }
          }, 120);
        }, 300);
      }, 1400);
    }

    startLoop();
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-5 w-full">
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        {/* Editor line */}
        <div className="px-4 py-3 border-b border-muted flex items-center gap-2 min-h-[48px]">
          {showPlaceholder ? (
            <span className="text-[13px] text-muted-foreground/60 italic">
              Press '/' for commands, or start writing...
            </span>
          ) : (
            <>
              <span className="text-primary text-xs">⠿</span>
              <span className="text-base font-bold text-foreground">
                {displayed}
              </span>
              <span className="inline-block w-0.5 h-4 bg-foreground/50 rounded-sm cursor-blink align-middle" />
            </>
          )}
        </div>

        {/* Slash command menu */}
        <motion.div
          initial={false}
          animate={showMenu ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {[
            { icon: "≡", label: "Text", desc: "Plain text.", active: true },
            {
              icon: "☑",
              label: "To-do List",
              desc: "Track tasks with a to-do list.",
            },
            {
              icon: "•≡",
              label: "Bullet List",
              desc: "Create a simple bullet list.",
            },
            {
              icon: "1≡",
              label: "Numbered List",
              desc: "Create a list with numbering.",
            },
            { icon: "❝", label: "Quote", desc: "Capture a quote." },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 px-3.5 py-1.5 ${item.active ? "bg-accent" : ""} ${i < 4 ? "border-b border-muted" : ""}`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 border ${item.active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}
              >
                {item.icon}
              </span>
              <div>
                <p className="text-[11px] font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

const stepPreviews = [SignUpPreview, WorkspacePreview, WritingPreview];

/* ─── Main Section ─────────────────────────────────────────── */

export default function HowToStartSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <Section sectionId="how-to-start" className="relative Desktop:pt-0">
      <div className="container relative z-10 mx-auto px-4">
        <SectionHeading
          SectionTitle="How To Start"
          SectionSubTitle="in just a few simple steps"
        />

        <div ref={containerRef} className="relative max-w-7xl mx-auto">
          {/* Step connector dots row */}
          <div className="flex items-center max-w-3xl mx-auto mb-8 px-6 md:px-12">
            {HowToStartSteps.map((_: Step, i: number) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  className="z-10 w-8 h-8 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center text-xs font-bold text-primary flex-shrink-0"
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 Desktop:grid-cols-3 gap-6">
            {HowToStartSteps.map((step: Step, index: number) => {
              const Icon = stepIcons[index];
              const Preview = stepPreviews[index];
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 flex flex-col"
                >
                  {/* Preview area */}
                  <div className="bg-muted border-b border-border h-72 overflow-hidden flex items-center justify-center">
                    <Preview />
                  </div>

                  {/* Card content */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="absolute top-2 left-2 inline-flex items-center bg-secondary text-secondary-foreground rounded-md px-2.5 py-0.5 text-[11px] font-bold mb-3">
                      {step.StepNum}
                    </span>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">
                        {step.Title}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.Body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Animated beams */}
          {HowToStartSteps.map((_: Step, index: number) => {
            if (index < HowToStartSteps.length - 1) {
              return (
                <AnimatedBeam
                  key={`beam-${index}`}
                  containerRef={containerRef}
                  fromRef={{ current: nodeRefs.current[index] }}
                  toRef={{ current: nodeRefs.current[index + 1] }}
                  curvature={0}
                  duration={0}
                  gradientStartColor="hsl(var(--primary))"
                  gradientStopColor="hsl(var(--primary))"
                  pathColor="hsl(var(--primary)/0.5)"
                  pathWidth={10}
                  pathOpacity={0.5}
                />
              );
            }
            return null;
          })}
        </div>

        {/* CTA */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <Button className="px-10 text-base">
            <Link prefetch={true} href="/signup">
              Get Started Free
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            No credit card required
          </p>
        </div>
      </div>
    </Section>
  );
}
