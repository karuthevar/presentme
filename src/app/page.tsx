"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import InputForm from "@/components/InputForm";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import type { GenerateRequest } from "@/types";

const FREE_USE_KEY = "presentai_used_free";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUsedFree, setHasUsedFree] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const used = localStorage.getItem(FREE_USE_KEY) === "true";
    setHasUsedFree(used);
    setAuthChecked(true);
  }, []);

  // Require sign-in if free use already consumed and not signed in
  const needsAuth = authChecked && hasUsedFree && status !== "loading" && !session;

  async function handleGenerate(data: GenerateRequest) {
    if (needsAuth) {
      router.push("/auth/signin?callbackUrl=/");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate slides");
      }

      // Mark free use as consumed (only matters for non-signed-in users)
      if (!session) {
        localStorage.setItem(FREE_USE_KEY, "true");
        setHasUsedFree(true);
      }

      sessionStorage.setItem("presentation", JSON.stringify(result));
      router.push("/slides");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950">
      <Header />
      <HeroSection />

      {/* Auth nudge banner — shown when free use is consumed */}
      {needsAuth && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-sm">
            <div className="text-white/80">
              <span className="text-indigo-300 font-medium">You&apos;ve used your free generation.</span>{" "}
              Sign in to keep creating unlimited presentations.
            </div>
            <a
              href="/auth/signin?callbackUrl=/"
              className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      )}

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <InputForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          error={error}
          needsAuth={needsAuth}
        />
      </section>
    </main>
  );
}
