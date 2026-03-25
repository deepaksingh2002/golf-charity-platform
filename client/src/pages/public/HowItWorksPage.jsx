import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-zinc-900 mb-8"
        >
          How It Works
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg prose-emerald text-zinc-600 max-w-none"
        >
          <p className="text-xl mb-8">Participating in the Golf Charity Platform is a seamless blend of doing good and having fun.</p>
          
          <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">1. Subscribe & Select a Charity</h2>
          <p>By purchasing a monthly or yearly subscription, you pledge a steady stream of revenue. From this, a large percentage is routed directly to the charity of your choice, while 30% is allocated to the monthly prize pool.</p>

          <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">2. Submit Your Scores</h2>
          <p>After your rounds of golf, log in and submit your scores (from 1 to 45). The system maintains a rolling list of your most recent 5 scores. These 5 scores act as your unique entry ticket for the upcoming draw.</p>

          <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">3. The Algorithmic Draw</h2>
          <p>On the 1st of every month, our algorithm analyzes all submitted scores from active subscribers. It identifies the least frequently played scores across the platform and performs a weighted draw to select 5 winning numbers.</p>

          <h2 className="text-2xl font-semibold text-zinc-900 mt-12 mb-4">4. Win the Prize Pool</h2>
          <p>If your 5 rolling scores match the drawn numbers, you win! The prize pool is split across tiers: 3-Match (25%), 4-Match (35%), and the 5-Match Jackpot (40%). Unclaimed jackpots roll over to the next month.</p>
        </motion.div>
      </div>
    </div>
  );
}
