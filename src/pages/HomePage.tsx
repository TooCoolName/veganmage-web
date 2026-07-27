import { Brain, HeartHandshake, Zap } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

export function HomePage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-20 pb-16 md:space-y-28 md:pb-24"
    >
      {/* Hero Section */}
      <div className="min-h-[72vh] rounded-[2rem] bg-card overflow-hidden relative border border-border/70 flex items-center justify-center shadow-[0_24px_80px_-48px_color-mix(in_oklch,var(--foreground)_30%,transparent)]">
        <div className="absolute inset-0 bg-grid-pattern text-primary opacity-[0.055]"></div>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
        <div className="text-center max-w-4xl relative z-10 px-6 py-16 md:py-20">
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mb-10 relative"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 p-1 bg-gradient-to-tr from-primary via-primary to-accent rounded-full shadow-2xl shadow-primary/20">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center overflow-hidden p-1 pt-5">
                  <img
                    src="/icon330.png"
                    alt="Vegan Mage Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <Badge className="absolute -bottom-2 -right-2 shadow-lg rotate-12 text-sm px-3 py-1">
                v1.0
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black mb-6 tracking-[-0.045em] leading-[0.95] text-foreground"
            >
              AI Meets Veganism
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-2xl text-muted-foreground max-w-2xl text-balance leading-relaxed"
            >
              A powerful fusion of Artificial Intelligence and vegan activism.
              <span className="font-semibold text-primary block mt-2">
                Empowering advocates to help every animal.
              </span>
            </motion.p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/16 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000"></div>
      </div>

      {/* Mission Section */}
      {/* Core Concepts Section */}
      <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl mx-auto px-4">
        <motion.div variants={itemVariants} className="flex-1 space-y-6">
          <Badge
            variant="outline"
            className="mb-2 border-primary/40 bg-primary-card text-primary"
          >
            The Vision
          </Badge>
          <h2 className="text-4xl font-bold">Empowering Advocates</h2>
          <p className="text-lg opacity-80 leading-relaxed">
            Vegan Mage is the merge of{" "}
            <span className="text-primary font-semibold">
              Artificial Intelligence
            </span>{" "}
            with vegan activism. We exist to empower vegan advocates via
            different tools, evolving constantly to enhance human potential and
            help every animal.
          </p>

          <ul className="space-y-4 pt-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-full text-primary">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold">The Browser Extension</h3>
                <p className="text-sm opacity-70">
                  Your digital companion that brings advocacy tools directly to
                  your browsing experience.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-accent-card p-2 rounded-full text-foreground">
                <HeartHandshake size={20} />
              </div>
              <div>
                <h3 className="font-bold">Advocacy Support</h3>
                <p className="text-sm opacity-70">
                  Get practical help shaping compassionate, evidence-informed
                  responses when conversations matter.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-muted-card p-2 rounded-full text-muted-foreground">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="font-bold">Constant Evolution</h3>
                <p className="text-sm opacity-70">
                  Always improving to provide more effective, accessible support
                  for the animals.
                </p>
              </div>
            </li>
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="flex-1 relative">
          <Card className="shadow-2xl shadow-primary/5 border-border/70 overflow-hidden relative bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-card via-transparent to-accent-card z-0"></div>
            <CardContent className="p-10 relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shadow-xl">
                <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                  <HeartHandshake size={48} className="text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Built for Advocates</h3>
                <p className="opacity-70">
                  Vegan Mage helps advocates respond with clarity, compassion,
                  and stronger arguments wherever outreach happens.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-4">
                <Badge className="text-sm px-3 py-1">Compassion</Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  Evidence
                </Badge>
                <Badge variant="accent" className="text-sm px-3 py-1">
                  Action
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        variants={itemVariants}
        className="bg-primary text-primary-foreground rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/15"
      >
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Evolve?</h2>
          <p className="text-xl md:text-2xl opacity-90">
            Bring smarter tools into your advocacy. The animals need your voice,
            and every conversation can matter.
          </p>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}
