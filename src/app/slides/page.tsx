"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SlideViewer from "@/components/SlideViewer";
import type { GeneratedPresentation, ContactInfo, Reference } from "@/types";

interface StoredPresentation {
  presentation: GeneratedPresentation;
  photoBase64: string | null;
  contact: ContactInfo;
  references: Reference[];
}

export default function SlidesPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredPresentation | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("presentation");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch {
      router.push("/");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white/60 text-lg">Loading your slides...</div>
      </div>
    );
  }

  return (
    <SlideViewer
      presentation={data.presentation}
      photoBase64={data.photoBase64}
      contact={data.contact}
      references={data.references}
    />
  );
}
