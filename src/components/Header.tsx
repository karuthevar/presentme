import Link from "next/link";

export default function Header() {
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

        <nav className="flex items-center gap-6 text-sm text-white/60">
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors"
          >
            How it works
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
