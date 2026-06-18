import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Mic2, Sparkles, Network, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroTerminal } from "@/components/landing/HeroTerminal";

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const STAGGER = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

function MockupDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-16 w-full max-w-4xl mx-auto perspective-1000 hidden md:block"
      style={{ perspective: "1000px" }}
    >
      <div className="relative z-10">
        {/* Live ingestion terminal */}
        <HeroTerminal />

        {/* Floating Intelligence Badge */}
        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-14 -top-10 p-4 rounded-2xl bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant shadow-2xl z-20 hidden lg:block"
        >
           <div className="flex items-start gap-4 w-64">
             <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center shrink-0 border border-success/30">
               <CheckCircle2 className="w-5 h-5 text-success" />
             </div>
             <div>
               <div className="text-[13px] font-semibold text-on-surface mb-1">Action Item Detected</div>
               <div className="text-[11px] text-on-surface-variant leading-relaxed">
                 "Sarah will finalize the Q3 marketing budget by Thursday."
               </div>
             </div>
           </div>
        </motion.div>
        
        {/* Floating Summary Badge */}
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -left-14 -bottom-14 p-4 rounded-2xl bg-surface-container-high/90 backdrop-blur-xl border border-outline-variant shadow-2xl z-20 hidden lg:block"
        >
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-tertiary/20 flex items-center justify-center shrink-0 border border-tertiary/30">
               <Sparkles className="w-5 h-5 text-tertiary" />
             </div>
             <div>
               <div className="text-[13px] font-semibold text-on-surface">Summary Generated</div>
               <div className="text-[11px] text-on-surface-variant">4 Key Decisions • 2 Open Questions</div>
             </div>
           </div>
        </motion.div>
      </div>
      
      {/* Decorative Glow behind mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
    </motion.div>
  );
}

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden selection:bg-primary/30">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[150px] rounded-full mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen opacity-50" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-tertiary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="bg-grid-fade absolute inset-0 opacity-[0.12]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow-primary/20 group-hover:scale-105 transition-transform">
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
          <Button variant="primary" onClick={() => navigate("/dashboard")} className="shadow-glow-primary group">
            Launch App
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center pt-20 pb-32 md:pt-28 md:pb-48 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={STAGGER}
          className="text-center max-w-5xl mx-auto space-y-8"
        >
          <motion.div variants={FADE_UP} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container/80 border border-outline-variant/50 backdrop-blur-md shadow-lg cursor-default hover:bg-surface-container transition-colors">
            <Sparkles className="w-4 h-4 text-tertiary animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Powered by Deep Learning & AssemblyAI</span>
          </motion.div>
          
          <motion.h1 
            variants={FADE_UP}
            className="font-geist font-bold text-5xl md:text-7xl lg:text-[84px] leading-[1.05] tracking-tight text-on-surface"
          >
            Distill every meeting into <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">pure intelligence.</span>
          </motion.h1>
          
          <motion.p 
            variants={FADE_UP}
            className="font-geist text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
          >
            Turn unorganized meeting recordings into structured, searchable, and fully actionable knowledge assets in under 2 minutes.
          </motion.p>
          
          <motion.div variants={FADE_UP} className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button variant="primary" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto h-14 px-8 text-lg shadow-[0_0_40px_rgba(208,188,255,0.25)] hover:shadow-[0_0_60px_rgba(208,188,255,0.4)] transition-all group">
              Start Processing Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/vault")} className="w-full sm:w-auto h-14 px-8 text-lg bg-surface-container/50 backdrop-blur-md hover:bg-surface-container transition-colors border border-outline-variant/50">
              Explore The Vault
            </Button>
          </motion.div>
        </motion.div>

        {/* Abstract App Mockup */}
        <MockupDashboard />

        {/* Features Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={STAGGER}
          className="mt-32 md:mt-48 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full"
        >
          {FEATURES.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={FADE_UP}
              className="group relative p-8 md:p-10 rounded-[32px] bg-surface-container-low/30 backdrop-blur-xl border border-outline-variant/40 hover:bg-surface-container-low/80 hover:border-outline-variant transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-surface-container border border-outline-variant group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-xl ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-geist font-semibold text-2xl md:text-3xl text-on-surface mb-4 tracking-tight">{feature.title}</h3>
                <p className="font-geist text-on-surface-variant leading-relaxed text-lg">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Block */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={FADE_UP}
          className="mt-40 w-full relative overflow-hidden rounded-[40px] bg-surface-container border border-outline-variant/50 p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-tertiary/10 to-secondary/10 opacity-50" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="font-geist font-bold text-4xl md:text-5xl text-on-surface tracking-tight">
              Ready to reclaim your team's velocity?
            </h2>
            <p className="font-geist text-xl text-on-surface-variant">
              Upload your first meeting recording today and let our AI distill it into actionable intelligence.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate("/dashboard")} className="h-14 px-10 text-lg shadow-glow-primary group mt-4">
              Upload Meeting Now
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-outline-variant/30 bg-surface/50 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Mic2 className="w-5 h-5" />
            <span className="font-geist font-semibold tracking-tight text-base">BriefVoice © 2026</span>
          </div>
          <div className="flex items-center gap-8 font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
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
    title: "Kill the Meeting Tax",
    desc: "Stop losing information. Automatically capture speaker-labelled transcripts and checkable action items with owners and deadlines.",
    icon: BrainCircuit,
    color: "text-primary shadow-primary/20",
  },
  {
    title: "Zero Onboarding",
    desc: "Bring new team members up to speed instantly without forcing them to sit through hours of replaying past context-setting conversations.",
    icon: Mic2,
    color: "text-secondary shadow-secondary/20",
  },
  {
    title: "Full Traceability",
    desc: "Never struggle to revisit the exact background or reasoning behind a critical decision. Everything is semantically searchable in the vault.",
    icon: Network,
    color: "text-tertiary shadow-tertiary/20",
  },
];
