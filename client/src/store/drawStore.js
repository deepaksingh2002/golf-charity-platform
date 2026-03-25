import { create } from 'zustand';
import { drawApi } from '../api/draw.api';

export const useDrawStore = create((set) => ({
  currentDraw: null,
  publishedDraws: [],
  isLoading: false,
  fetchDraws: async () => {
    set({ isLoading: true });
    try {
      const [currentRes, publishedRes] = await Promise.all([
        drawApi.getCurrentDraw().catch(() => ({ data: null })),
        drawApi.getPublishedDraws()
      ]);
      set({ 
        currentDraw: currentRes.data, 
        publishedDraws: publishedRes.data,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to fetch draws:', error);
    }
  }
}));
