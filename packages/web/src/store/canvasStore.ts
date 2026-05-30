import { create } from "zustand";
import type { CanvasNode } from "../types";

interface CanvasStore {
  nodes: CanvasNode[];
  connected: boolean;
  generating: boolean;
  setNodes: (nodes: CanvasNode[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  setConnected: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [],
  connected: false,
  generating: false,
  setNodes: (nodes) => set({ nodes, generating: false }),
  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),
  setConnected: (connected) => set({ connected }),
  setGenerating: (generating) => set({ generating }),
}));
