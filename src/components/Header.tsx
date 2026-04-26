"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-white/5 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            P
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">
            present<span className="text-indigo-400">.ai</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <a
            href="#make-this-yours"
            className="text-white/60 hover:text-white transition-colors"
          >
            Make this App yours
          </a>

          {status === "loading" ? null : session ? (
            <div className="flex items-center gap-3">
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="w-7 h-7 rounded-full border border-white/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center">
                  <User size={14} className="text-indigo-300" />
                </div>
              )}
              <span className="text-white/60 text-sm hidden sm:block">
                {session.user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
