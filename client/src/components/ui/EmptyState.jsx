import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = "" 
}) => {
  return (
    <AnimatePresence mode="wait">
      <Motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-zinc-100 bg-zinc-50/50 ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
          {Icon && <Icon size={32} strokeWidth={1.5} />}
        </div>
        <h3 className="text-xl font-bold text-zinc-900 leading-tight mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 max-w-[280px] leading-relaxed mb-8">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" size="sm" className="font-bold border-zinc-200">
            {actionLabel}
          </Button>
        )}
      </Motion.div>
    </AnimatePresence>
  );
};
