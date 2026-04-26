export default function HeroSection() {
  return (
    <section className="pt-20 pb-12 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Slide Generator
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
          Turn your profile into{" "}
          <span className="text-gradient">stunning slides</span>
        </h1>

        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste a LinkedIn or GitHub URL, and get
          high-impact presentation slides in seconds. No design skills needed.
        </p>

        {/* How it works */}
        <div
          id="how-it-works"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
        >
          {[
            {
              step: "1",
              icon: "📄",
              title: "Add your content",
              desc: "Upload a resume or paste a public profile URL",
            },
            {
              step: "2",
              icon: "✨",
              title: "AI does the work",
              desc: "We extract the best points and structure your story",
            },
            {
              step: "3",
              icon: "🚀",
              title: "Present with impact",
              desc: "Share, download, or present directly from your browser",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass rounded-xl p-4 text-left"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-medium text-white text-sm mb-1">
                {item.title}
              </div>
              <div className="text-white/50 text-xs leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
