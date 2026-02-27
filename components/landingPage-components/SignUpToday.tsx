"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Section from "../ui/Section";
import MaxWContainer from "../ui/MaxWContainer";

export default function SignUpToday() {
  return (
    <Section className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center justify-center gap-8 "
      >
        <div className="text-center space-y-4 ">
          <h2 className="text-6xl md:text-7xl Desktop:text-[94px] font-bold tracking-tight bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent">
            Ready to Boost Your Productivity
          </h2>
          <p className="text-xl font-semibold text-muted-foreground">
            Start your journey today and experience the power of Simple,
            Structured Note Taking.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link
              prefetch={true}
              href="/signup"
              className="text-base font-medium"
            >
              Start Free
            </Link>
          </Button>
          {/* <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/#pricing" className="text-base font-medium">
                View Pricing
              </Link>
            </Button> */}
        </div>
      </motion.div>
    </Section>
  );
}
