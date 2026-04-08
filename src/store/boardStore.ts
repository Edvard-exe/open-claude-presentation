import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { BoardState, Position, TileData } from '../types/board';

const CORE_ID = 'tile-core-architecture';
const AGENT_ID = 'tile-agent-system';
const CACHE_ID = 'tile-caching';

export const useBoardStore = create<BoardState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1,
  tiles: [
    {
      id: CORE_ID,
      position: { x: 200, y: 150 },
      width: 360,
      height: 300,
      title: 'Core Architecture',
      content: 'The agentic while-loop that powers Claude Code — from user input through API streaming, tool execution, and back.',
      filePath: '/src/query.ts',
      url: 'https://ccunpacked.dev/#agent-loop',
      color: '#7C3AED',
      diagramId: 'core-architecture',
      animated: true,
    },
    {
      id: AGENT_ID,
      position: { x: 650, y: 120 },
      width: 360,
      height: 440,
      title: 'Agent System',
      content: 'Multi-agent orchestration — spawn sub-agents, coordinate work, and manage autonomous sessions.',
      filePath: '/src/tools/AgentTool/',
      color: '#2563EB',
      animated: true,
      subItems: [
        {
          label: 'SubAgent',
          description: 'Forks nested query loops with message interrupt — peeks between serial tools & batches, aborts on urgent SendMessage so the coordinator can redirect mid-execution',
          color: '#2563EB',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/tools/toolOrchestration.ts',
          line: 126,
        },
        {
          label: 'Advisor',
          description: 'Server-side reviewer model that checks the agent\'s work before substantive actions',
          color: '#2563EB',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/commands/advisor.ts',
          line: 16,
        },
        {
          label: 'Kairos',
          description: 'Long-lived assistant mode (--assistant) with persistent daily logs, /dream memory consolidation, cron scheduling, and push notifications',
          color: '#2563EB',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/main.tsx',
          line: 1048,
        },
      ],
    },
    {
      id: CACHE_ID,
      position: { x: 200, y: 520 },
      width: 360,
      height: 480,
      title: 'Prompt Caching',
      content: 'Ephemeral KV-cache breakpoints on the Anthropic API — cache system prompts, tool schemas, and conversation prefixes to avoid re-processing thousands of tokens every turn.',
      filePath: '/src/services/api/claude.ts',
      color: '#059669',
      animated: true,
      backgroundType: 'cache',
      subItems: [
        {
          label: 'Cache Breakpoints',
          description: 'One cache_control marker per request on the last message — everything before it becomes a reusable KV-cache prefix with 5 min or 1 h TTL',
          color: '#059669',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/api/claude.ts',
          line: 3063,
        },
        {
          label: 'Microcompact (cache_edits)',
          description: 'Surgically deletes old tool results from the cached prefix via cache_edits without invalidating it — messages stay intact locally, only the server-side cache shrinks',
          color: '#059669',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/compact/microCompact.ts',
          line: 305,
        },
        {
          label: 'Time-Based Microcompact',
          description: 'Fallback path: when the 1 h TTL has expired, mutates message content directly — replaces old tool results with "[Old tool result content cleared]", intentionally busting the cold cache to shrink the prompt',
          color: '#059669',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/compact/microCompact.ts',
          line: 401,
        },
        {
          label: 'Cache Break Detection',
          description: 'Two-phase tracker: hashes system prompt, tool schemas, TTL, scope, and betas before each call, then compares cache_read_input_tokens after — flags unexpected drops above 2 000 tokens',
          color: '#059669',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/api/promptCacheBreakDetection.ts',
          line: 247,
        },
      ],
    },
  ],
  connections: [
    { from: CORE_ID, to: AGENT_ID, label: 'AgentTool' },
    { from: CORE_ID, to: CACHE_ID, label: 'cache_control' },
  ],
  selectedTileId: null,
  openDiagramId: null,
  openSubItemData: null,

  setPan: (pan: Position) => set({ pan }),
  setZoom: (zoom: number) => set({ zoom: Math.min(Math.max(zoom, 0.1), 5) }),
  addTile: (tile: Omit<TileData, 'id'>) =>
    set((state) => ({ tiles: [...state.tiles, { ...tile, id: nanoid() }] })),
  updateTilePosition: (id: string, position: Position) =>
    set((state) => ({
      tiles: state.tiles.map((t) => (t.id === id ? { ...t, position } : t)),
    })),
  updateTile: (id: string, updates: Partial<TileData>) =>
    set((state) => ({
      tiles: state.tiles.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTile: (id: string) =>
    set((state) => ({
      tiles: state.tiles.filter((t) => t.id !== id),
      selectedTileId: state.selectedTileId === id ? null : state.selectedTileId,
    })),
  selectTile: (id: string | null) => set({ selectedTileId: id }),
  openDiagram: (diagramId: string) => set({ openDiagramId: diagramId }),
  closeDiagram: () => set({ openDiagramId: null }),
  openSubItem: (item) => set({ openSubItemData: item }),
  closeSubItem: () => set({ openSubItemData: null }),
}));
