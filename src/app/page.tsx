"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputForm from "@/components/InputForm";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import type { GenerateRequest } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(data: GenerateRequest) {
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

      // Store result in sessionStorage and navigate to slides page
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
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <InputForm
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          error={error}
        />
      </section>
    </main>
  );
}
