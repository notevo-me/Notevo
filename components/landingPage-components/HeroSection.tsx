"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useEffect } from "react";
import MaxWContainer from "../ui/MaxWContainer";
import { useMediaQuery } from "react-responsive";
import { usePaginatedQuery } from "convex/react";
import Image from "next/image";
import { useTheme } from "next-themes";

// Real 128×128 grayscale noise PNG — baked in as base64, no external files
const NOISE_PNG =
  "data:image/png;base64,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";

function PaperPieceIcon({ className }: { className?: string }) {
  return (
    <svg
      width="109"
      height="99"
      viewBox="0 0 109 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_224_10)">
        <path
          d="M21.19 92.23L25.62 88.71L24.9 81.26L30.87 77.44L30.82 73.73L35.4 71.59L36.32 66.55L46.4 62.44L53.35 64.52L56.25 61.92L60.99 63.91L64.29 64.87L69.03 60.74L73.77 59.67L81.11 54.63V48.36L87.22 46.22L88.91 41.33L92.42 41.02L91.96 35.67L93.95 32.77L91.57 30.01L86.53 26.46L87.22 20.99L93.95 18.7L100.68 16.25V13.04L104.19 10.45L102.51 6.63L106.21 4.08L107.17 -1L109 4.73L106.25 8.25L107.93 12.07L104.41 14.67V17.88L97.69 20.32L90.96 22.62L90.35 25.98L95.55 30.87L97.69 34.39L95.7 37.29L96.16 42.64L92.64 42.95L90.96 47.84L84.85 49.98V56.25L77.51 61.29L72.77 62.36L68.03 66.49L61.46 66.95L56.72 64.96L53.81 67.56L46.94 65.42L40.06 68.17L39.14 73.22L34.55 75.36L34.25 78.87L28.29 82.69L29.36 90.34L24.92 93.85L24.62 98.52L21.9 96.3L21.19 92.23Z"
          fill="#644A40"
          fillOpacity={0.2}
        />
        <path
          d="M107.17 -1L106.21 4.08L102.51 6.63L104.19 10.45L100.68 13.04V16.25L93.9499 18.7L87.2199 20.99L86.5299 26.46L91.5699 30.01L93.9499 32.77L91.9599 35.67L92.4199 41.02L88.9099 41.33L87.2199 46.22L81.1099 48.36V54.63L73.7699 59.67L69.0299 60.74L64.2899 64.87L60.9899 63.91L56.2499 61.92L53.3499 64.52L46.3999 62.44L36.3199 66.55L35.3999 71.59L30.8199 73.73L30.8699 77.44L24.8999 81.26L25.6199 88.71L21.1899 92.23L21.8999 96.3L24.6199 98.52H-0.150078V-0.77L107.17 -1Z"
          fill="#644A40"
        />
      </g>
      <defs>
        <clipPath id="clip0_224_10">
          <rect
            width="109"
            height="99"
            fill="white"
            transform="matrix(-1 0 0 1 109 0)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function HeroSection() {
  const { results, status } = usePaginatedQuery(
    api.users.users,
    {},
    { initialNumItems: 6 },
  );
  const [showBackground, setShowBackground] = useState(false);
  const { scrollY } = useScroll();
  const [inView, setInView] = useState<boolean>(false);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTabletAir_horizontal = useMediaQuery({ maxWidth: 1180 });
  const isTabletPro_horizontal = useMediaQuery({ maxWidth: 1366 });
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 90) {
      setInView(true);
    } else {
      setInView(false);
    }
  });

  return (
    <section
      id="home"
      className="relative pb-12 pt-28 Desktop:pt-32 flex items-center justify-center overflow-hidden"
    >
      {/* Real PNG grain noise overlay — always light mode, fixed values */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 mask-image-gradient"
        style={{
          backgroundImage: `url(${NOISE_PNG})`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.07,
          mixBlendMode: "multiply",
          zIndex: 5,
        }}
      />

      {/* PaperPiece decorative element — top-left corner */}
      <div className="absolute -top-3 -left-14 z-[2]  pointer-events-none select-none">
        <PaperPieceIcon className="w-40 h-36 md:w-56 md:h-48 lg:w-72 lg:h-64" />
      </div>

      <div className="absolute inset-0 z-[1] h-full w-full bg-transparent mask-image-gradient">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(-180deg, transparent, transparent 5px, rgba(75, 85, 99,0.4) 3px, rgba(75, 85, 99, 0.2) 7px, transparent 6px, transparent 112px),
              repeating-linear-gradient(-180deg, transparent, transparent 5px, rgba(107, 114, 128, 0.4) 3px, rgba(107, 114, 128, 0.2) 3px, transparent 5px, transparent 70px)
            `,
          }}
        />
      </div>

      {/* Hand-drawn doodles with real drawing animation */}
      <div className="absolute inset-0 pointer-events-none select-none z-[1]">
        <motion.svg
          className="absolute rotate-90 -top-16 -right-20 w-40 h-40 md:w-48 md:h-48 text-primary/80"
          viewBox="0 0 120 120"
          initial={{ opacity: 0 }}
          animate={showBackground ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            d="M30 60 Q15 35,50 25 Q85 15,95 50 Q105 75,80 90 Q55 105,30 85"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              showBackground
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: { duration: 0.5, ease: "easeOut", delay: 0.1 },
              opacity: { duration: 0.4 },
            }}
          />
        </motion.svg>

        <motion.svg
          className="absolute -left-8 top-[30%] w-32 h-24 text-primary/50 rotate-[8deg]"
          viewBox="0 0 140 100"
          initial={{ opacity: 0 }}
          animate={showBackground ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.path
            d="M120 70 Q90 40,50 65 T20 45"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              showBackground
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: { duration: 0.5, delay: 0.2, ease: "easeOut" },
              opacity: { duration: 0.01 },
            }}
          />
        </motion.svg>
      </div>

      <MaxWContainer className="z-[6] relative flex flex-col items-center justify-center space-y-5">
        {/* Centered Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-5 text-center "
        >
          <motion.h1
            className="bg-gradient-to-r from-primary/80 via-primary to-primary/80  bg-clip-text text-transparent leading-[50px] text-[46px] md:text-8xl Desktop:text-[100px] font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span>Simple, Structured</span>
            <br />
            <motion.span
              className="relative inline-block px-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-primary/80 via-primary to-primary/80 bg-clip-text">
                Note-Taking
              </span>
              <motion.svg
                viewBox="0 0 300 40"
                preserveAspectRatio="none"
                className="absolute left-0 -bottom-4 w-full h-8"
              >
                <motion.path
                  d="M 5 25 Q 40 22, 80 26 T 150 24 T 220 26 T 295 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    showBackground
                      ? { pathLength: 1, opacity: 1 }
                      : { pathLength: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                />
              </motion.svg>
            </motion.span>
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-lg md:text-2xl text-muted-foreground font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Notevo helps you capture your thoughts{" "}
            <br className=" hidden Desktop:block tabletAir:block tabletPro:block" />{" "}
            and organize them in one clean, modern interface.
          </motion.p>
          <motion.div
            className="flex gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              asChild
              size="lg"
              className="relative group overflow-hidden"
            >
              <Link prefetch={true} href="/signup">
                <span className="relative z-10">Get Started for Free</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="relative group"
            >
              <Link prefetch={true} href="#features">
                <span className="relative z-10">Learn More</span>
                <motion.span
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
          </motion.div>
          <motion.div
            className="flex items-center justify-center gap-8 pb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex -space-x-4">
              {status === "LoadingFirstPage" ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 rounded-full animate-pulse" />
                    </Avatar>
                  </motion.div>
                ))
              ) : (
                <>
                  {results
                    .filter((user) => user.image && user.name)
                    .slice(0, 5)
                    .map((user, indx) => (
                      <motion.div
                        key={user._id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + indx * 0.1 }}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.image || "/placeholder.svg"}
                            alt={user.name || "User"}
                            className="rounded-full"
                          />
                          <AvatarFallback className="bg-primary/20 rounded-full">
                            {user.name ? user.name.charAt(0) : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    ))}
                  {results.length > 5 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="text-sm font-medium rounded-full">
                          + 75
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Join{" "}
              <span className="font-semibold text-foreground">
                {!results ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  ` 79 +`
                )}
              </span>{" "}
              Active users
            </p>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className=" relative w-full p-1 Desktop:p-2 rounded-lg bg-gradient-to-t from-transparent from-10% to-primary/50 backdrop-blur-lg"
        >
          <Image
            src="/NotevoLightHomePagePic.svg"
            alt="Notevo home page"
            className=" mask-image-gradient p-full w-full rounded-lg"
            width={300}
            height={300}
          />
        </motion.div>
      </MaxWContainer>
    </section>
  );
}
