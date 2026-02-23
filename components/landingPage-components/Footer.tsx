"use client";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Footer() {
  return (
    <>
      <svg
        viewBox="0 0 1440 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="100%"
        className="bg-transparent"
      >
        <path
          transform="rotate(180) translate(-1440, -60)"
          d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
          fill="#efefef"
        />
      </svg>
      <footer className="relative w-full text-foreground py-10 bg-muted">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                href="/"
                onClick={() => {
                  if (window.location.pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                <Image
                  src="/Notevo-logo.svg"
                  alt="Notevo logo"
                  className="pb-2 hover:opacity-50"
                  width={50}
                  height={50}
                />
              </Link>
              <h2 className="text-2xl font-bold text-primary">Notevo</h2>
              <p className="mt-2 text-muted-foreground">
                Notes without the hassle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">Notevo</h3>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li>
                  <Link href="/#about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="hover:underline">
                    Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">Legal</h3>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li>
                  <Link
                    prefetch={true}
                    href="/terms-of-service"
                    className="hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    prefetch={true}
                    href="/privacy-policy"
                    className="hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">Social</h3>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="https://www.linkedin.com/company/notevo"
                    className="hover:underline"
                    target="_blank"
                  >
                    Linkedin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 border-t border-primary/20 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-start text-muted-foreground text-sm">
              Copyright © 2025-{new Date().getFullYear()} Notevo. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
