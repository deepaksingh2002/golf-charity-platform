import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Trophy, HeartHandshake, CheckCircle2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-zinc-950 flex border-b border-zinc-800 overflow-hidden items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-violet-600/20 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
        >
          Play Golf. Win Prizes. <br className="hidden md:block"/> Change Lives.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
        >
          Your passion for the game just became a force for good. Turn your ordinary rounds into extraordinary contributions—and be rewarded for it.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-violet-600 rounded-full hover:bg-violet-700 transition w-full sm:w-auto shadow-lg shadow-violet-500/25">
            Join the Draw <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link to="/charities" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-emerald-400 border border-emerald-500/30 rounded-full hover:bg-emerald-500/10 transition w-full sm:w-auto">
            Explore Charities
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 border-t border-zinc-800/50 pt-12"
        >
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-white">4,209</span>
            <span className="text-zinc-500 mt-2">Active Players</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-violet-400">$12,500</span>
            <span className="text-zinc-500 mt-2">This Month's Pool</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-emerald-400">$142,000</span>
            <span className="text-zinc-500 mt-2">Donated to Charity</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { icon: <Target className="w-8 h-8"/>, title: "1. Subscribe", desc: "Choose a monthly or yearly plan to support a cause you love." },
    { icon: <CheckCircle2 className="w-8 h-8"/>, title: "2. Enter Scores", desc: "Play your rounds and enter up to 5 scores into our algorithmic draw." },
    { icon: <Trophy className="w-8 h-8"/>, title: "3. Win & Give", desc: "Win big in the monthly draw while your charity receives vital funds." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4">How it works</h2>
          <p className="text-lg text-zinc-600">Three simple steps to make a difference.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center p-8 rounded-2xl bg-zinc-50 border border-zinc-100"
            >
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PrizePoolSection = () => {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4">The Prize Pool Structure</h2>
          <p className="text-lg text-zinc-600">30% of all subscription revenue goes into the prize pool.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center flex flex-col justify-center transform lg:mt-6 lg:mb-6">
            <h3 className="text-xl font-semibold text-zinc-500 mb-2">3-Match</h3>
            <span className="text-4xl font-bold text-zinc-900 mb-4">25%</span>
            <p className="text-sm text-zinc-500">Shared among all players matching 3 drawn numbers.</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} className="relative bg-white p-10 rounded-2xl shadow-xl shadow-violet-500/10 border-2 border-violet-500 text-center flex flex-col justify-center transform scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">THE JACKPOT</div>
            <h3 className="text-2xl font-bold text-violet-600 mb-2 mt-4">5-Match</h3>
            <span className="text-6xl font-extrabold text-zinc-900 mb-4">40%</span>
            <p className="text-sm text-zinc-600 font-medium">Matching all 5 numbers wins the jackpot. If not won, it rolls over!</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center flex flex-col justify-center transform lg:mt-6 lg:mb-6">
            <h3 className="text-xl font-semibold text-zinc-500 mb-2">4-Match</h3>
            <span className="text-4xl font-bold text-zinc-900 mb-4">35%</span>
            <p className="text-sm text-zinc-500">Shared among all players matching 4 drawn numbers.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CharitySpotlightSection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6">Support causes that matter.</h2>
            <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
              Every subscription directly funds our partnered charities. Choose the cause that resonates with you, and watch your impact grow month by month.
            </p>
            <Link to="/charities" className="inline-flex items-center text-emerald-600 font-semibold text-lg hover:text-emerald-700 transition group">
              View Featured Charities
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-[2rem] transform rotate-3"></div>
            <img src="https://images.unsplash.com/photo-1593113511475-680f4f9547d5?auto=format&fit=crop&q=80&w=800" alt="Charity impact" className="relative rounded-[2rem] shadow-2xl object-cover h-[400px] w-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

const DrawMechanicSection = () => {
  return (
    <section className="py-24 bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <HeartHandshake className="w-16 h-16 text-emerald-500 mx-auto mb-8" />
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Your Scores = Your Draw Numbers</h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12">
          Keep a rolling tally of your last 5 rounds. Every 1st of the month, our bespoke algorithm generates a draw biased towards the least frequently played scores platform-wide. Match your scores, and win.
        </p>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <HowItWorksSection />
      <PrizePoolSection />
      <CharitySpotlightSection />
      <DrawMechanicSection />
    </div>
  );
}
