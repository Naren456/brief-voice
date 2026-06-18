import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Mic2, Sparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const STAGGER = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden selection:bg-primary/30">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/15 blur-[150px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-tertiary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="bg-grid-fade absolute inset-0 opacity-[0.15]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow-primary/20">
            <Mic2 className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-geist font-bold text-on-surface text-lg leading-tight tracking-tight">
              BriefVoice
            </h1>
            <p className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] font-medium">
              Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate("/dashboard")}
            className="hidden md:block font-mono text-label-md text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider"
          >
            Sign In
          </button>
          <Button variant="primary" onClick={() => navigate("/dashboard")} className="shadow-glow-primary">
            Launch App
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-24 pb-32 md:pt-36 md:pb-48 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/50 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-tertiary" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">Powered by AssemblyAI</span>
          </motion.div>
          
          <motion.h1 
            variants={FADE_UP}
            className="font-geist font-semibold text-5xl md:text-7xl lg:text-[80px] leading-[1.05] tracking-tight text-on-surface"
          >
            Distill every meeting into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">pure intelligence.</span>
          </motion.h1>
          
          <motion.p 
            variants={FADE_UP}
            className="font-geist text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          >
            Transform raw audio into structured executive briefs, semantic search vaults, and actionable insights in minutes.
          </motion.p>
          
          <motion.div variants={FADE_UP} className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto h-14 px-8 text-lg shadow-[0_0_40px_rgba(208,188,255,0.25)] hover:shadow-[0_0_60px_rgba(208,188,255,0.4)] transition-all">
              Start Processing Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/vault")} className="w-full sm:w-auto h-14 px-8 text-lg bg-surface-container/50 backdrop-blur-md">
              Explore Vault
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER}
          className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {FEATURES.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={FADE_UP}
              className="group relative p-8 rounded-3xl bg-surface-container-low/30 backdrop-blur-xl border border-outline-variant/30 hover:bg-surface-container-low/60 hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-surface-container border border-outline-variant group-hover:scale-110 transition-transform duration-500 shadow-lg ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-geist font-semibold text-2xl text-on-surface mb-3">{feature.title}</h3>
                <p className="font-geist text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline-variant/30 bg-surface/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Mic2 className="w-4 h-4" />
            <span className="font-geist font-medium text-sm">BriefVoice © 2026</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: "Executive Summaries",
    desc: "Our LLMs digest hours of conversation to produce highly structured, actionable executive briefs instantly.",
    icon: BrainCircuit,
    color: "text-primary shadow-primary/20",
  },
  {
    title: "Semantic Vault",
    desc: "Every spoken word is vectorized. Find specific moments across thousands of meetings using natural language search.",
    icon: Network,
    color: "text-tertiary shadow-tertiary/20",
  },
  {
    title: "Speaker Diarization",
    desc: "Automatically detect, separate, and label multiple speakers with high accuracy using state-of-the-art audio models.",
    icon: Mic2,
    color: "text-secondary shadow-secondary/20",
  },
];
