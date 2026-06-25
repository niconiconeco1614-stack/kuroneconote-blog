import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="relative sticky top-0 z-50 overflow-hidden">
      <Image
        src="/くろねこ写真02.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-white/10 border border-white/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-6 h-6" aria-hidden="true">
                <ellipse cx="50" cy="65" rx="26" ry="21" fill="white" />
                <circle cx="50" cy="38" r="21" fill="white" />
                <polygon points="30,22 23,3 43,18" fill="white" />
                <polygon points="70,22 77,3 57,18" fill="white" />
                <ellipse cx="42" cy="36" rx="3.5" ry="4.5" fill="#1a1a2e" />
                <ellipse cx="58" cy="36" rx="3.5" ry="4.5" fill="#1a1a2e" />
                <circle cx="43" cy="34" r="1.2" fill="white" />
                <circle cx="59" cy="34" r="1.2" fill="white" />
                <ellipse cx="50" cy="43" rx="2.5" ry="1.8" fill="#ffb3c6" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight block">
                まくろなねこNOTE
              </span>
              <span className="text-xs text-white/70 leading-tight block hidden sm:block">
                総務・人事の業務効率化ツール情報
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white/90 hover:text-indigo-300 transition-colors font-medium"
            >
              ホーム
            </Link>
            <Link
              href="/category"
              className="text-sm text-white/90 hover:text-indigo-300 transition-colors font-medium"
            >
              カテゴリ
            </Link>
            <Link
              href="/about"
              className="text-sm text-white/90 hover:text-indigo-300 transition-colors font-medium"
            >
              このブログについて
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="メニューを開く"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
