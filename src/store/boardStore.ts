import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { BoardState, Position, TileData } from '../types/board';
import { ANIMATION_STEPS } from '../data/animationSteps';

const CORE_ID = 'tile-core-architecture';
const AGENT_ID = 'tile-agent-system';
const CACHE_ID = 'tile-caching';
const AUTO_ID = 'tile-autonomous';
const MAILBOX_ID = 'tile-mailbox';
const HOOKS_ID = 'tile-hooks';
const COMPACT_ID = 'tile-compaction';

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
    {
      id: AUTO_ID,
      position: { x: 650, y: 620 },
      width: 360,
      height: 480,
      title: 'Autonomous Mode',
      content: 'LLM-based classifier that evaluates every tool call against user-defined rules — auto-approves safe ops, prompts on anything risky.',
      filePath: '/src/utils/permissions/yoloClassifier.ts',
      color: '#D97706',
      animated: true,
      backgroundType: 'shield',
      subItems: [
        {
          label: 'YOLO Classifier',
          description: 'Calls Claude API with conversation transcript + pending action — returns shouldBlock boolean. One classifier call per tool boundary, zero cost for safe-listed tools.',
          color: '#D97706',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/permissions/yoloClassifier.ts',
          line: 1012,
        },
        {
          label: 'Auto Mode State',
          description: 'Session-level state machine — tracks active/inactive, CLI flag origin, and circuit-breaker status. GrowthBook can remotely disable auto mode.',
          color: '#D97706',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/permissions/autoModeState.ts',
          line: 11,
        },
        {
          label: 'Permission Check',
          description: 'Fast-path allowlist for reads/search/tasks, then falls through to classifier. Dangerous permissions (Bash(*), Agent(*)) are stripped before auto mode starts.',
          color: '#D97706',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/permissions/permissions.ts',
          line: 693,
        },
        {
          label: 'Permission Setup',
          description: 'CLI initialization — resolves --permission-mode auto flag, checks feature gates, strips dangerous permissions, activates auto mode state.',
          color: '#D97706',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/permissions/permissionSetup.ts',
          line: 689,
        },
      ],
    },
    {
      id: MAILBOX_ID,
      position: { x: 1100, y: 120 },
      width: 360,
      height: 480,
      title: 'Agent Mailbox',
      content: 'Dual message-passing — in-process pending queue for fast subagent comms, file-based mailbox for cross-process teams.',
      filePath: '/src/tools/SendMessageTool/SendMessageTool.ts',
      color: '#DC2626',
      animated: true,
      backgroundType: 'mailbox',
      subItems: [
        {
          label: 'SendMessageTool',
          description: 'Routes messages: in-process → queuePendingMessage(), cross-process → writeToMailbox(). Handles structured messages (shutdown, permissions, plan approval).',
          color: '#DC2626',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/tools/SendMessageTool/SendMessageTool.ts',
          line: 741,
        },
        {
          label: 'Pending Messages',
          description: 'In-memory queue on LocalAgentTaskState, drained at tool-round boundaries via getAgentPendingMessageAttachments() into queued_command attachments.',
          color: '#DC2626',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/tasks/LocalAgentTask/LocalAgentTask.tsx',
          line: 162,
        },
        {
          label: 'File Mailbox',
          description: '~/.claude/teams/{team}/inboxes/{name}.json — file-locked writes, 1s polling via useInboxPoller, routes permission requests/shutdowns/regular messages.',
          color: '#DC2626',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/teammateMailbox.ts',
          line: 134,
        },
      ],
    },
    {
      id: HOOKS_ID,
      position: { x: 1100, y: 660 },
      width: 360,
      height: 480,
      title: 'Hooks',
      content: '27 lifecycle events — shell commands, LLM prompts, or HTTP webhooks that can block, modify, or observe every tool call.',
      filePath: '/src/utils/hooks.ts',
      color: '#EA580C',
      animated: true,
      backgroundType: 'hooks',
      subItems: [
        {
          label: 'Hook Engine',
          description: 'Main async generator: matches hooks by event + matcher, parallel-executes all matched hooks, aggregates results. Exit code 2 blocks operations.',
          color: '#EA580C',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/hooks.ts',
          line: 1952,
        },
        {
          label: 'PreToolUse',
          description: 'Runs before every tool: can deny (block execution), modify input (updatedInput), or approve. Fast-path for trusted tools. Returns permission decisions.',
          color: '#EA580C',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/utils/hooks.ts',
          line: 3394,
        },
        {
          label: 'Hook Types',
          description: '4 executors: shell command spawn, LLM prompt-based verification, HTTP POST webhook, direct TypeScript callback. All receive JSON context, return JSON responses.',
          color: '#EA580C',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/types/hooks.ts',
          line: 210,
        },
      ],
    },
    {
      id: COMPACT_ID,
      position: { x: 650, y: 1160 },
      width: 360,
      height: 480,
      title: 'Compaction',
      content: 'Context management — summarizes old messages when tokens run high. Full compaction via API, micro-compaction by clearing old tool results.',
      filePath: '/src/services/compact/compact.ts',
      color: '#0891B2',
      animated: true,
      backgroundType: 'compactor',
      subItems: [
        {
          label: 'Full Compaction',
          description: 'Sends old messages to Claude for 9-section structured summary (intent, files, errors, fixes, pending tasks). Reserves 20K output tokens. Replaces originals with compact boundary.',
          color: '#0891B2',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/compact/compact.ts',
          line: 387,
        },
        {
          label: 'Micro-Compaction',
          description: 'Clears old tool result content without API call. Cached path uses cache_edits to shrink server-side only; time-based path mutates messages directly when cache is cold.',
          color: '#0891B2',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/compact/microCompact.ts',
          line: 253,
        },
        {
          label: 'Auto-Compact',
          description: 'Monitors token usage in the main query loop. Fires at effective_context_window - 13K buffer. Warning/error/blocking thresholds. Env override via CLAUDE_AUTOCOMPACT_PCT_OVERRIDE.',
          color: '#0891B2',
          filePath: '/Users/edvardsivickij/Documents/claude code/src/services/compact/autoCompact.ts',
          line: 241,
        },
      ],
    },
  ],
  connections: [],
  selectedTileId: null,
  openDiagramId: null,
  openSubItemData: null,

  // Presentation playback
  presentationActive: false,
  presentationStepIndex: -1,
  presentationTransitioning: false,
  activeTileId: null,
  activeConnection: null,

  startPresentation: () => {
    set({ presentationActive: true });
    useBoardStore.getState().goToStep(0);
  },
  stopPresentation: () =>
    set({
      presentationActive: false,
      presentationStepIndex: -1,
      presentationTransitioning: false,
      activeTileId: null,
      activeConnection: null,
      connections: [],
    }),
  presentationNext: () => {
    const { presentationStepIndex, goToStep } = useBoardStore.getState();
    if (presentationStepIndex < ANIMATION_STEPS.length - 1) {
      goToStep(presentationStepIndex + 1);
    }
  },
  presentationPrev: () => {
    const { presentationStepIndex, goToStep } = useBoardStore.getState();
    if (presentationStepIndex > 0) {
      goToStep(presentationStepIndex - 1);
    }
  },
  goToStep: (index: number) =>
    set((state) => {
      const step = ANIMATION_STEPS[index];
      if (!step) return state;

      const tile = state.tiles.find((t) => t.id === step.tileId);
      if (!tile) return state;

      const targetZoom = 0.85;
      const tileCenterX = tile.position.x + tile.width / 2;
      const tileCenterY = tile.position.y + tile.height / 2;
      const targetPanX = window.innerWidth / 2 - tileCenterX * targetZoom;
      const targetPanY = window.innerHeight / 2 - tileCenterY * targetZoom;

      // Build up connections from all steps up to current
      const visibleConnections = ANIMATION_STEPS
        .slice(0, index + 1)
        .map((s) => s.connection)
        .filter((c): c is NonNullable<typeof c> => c !== null);

      return {
        presentationStepIndex: index,
        presentationTransitioning: true,
        activeTileId: step.tileId,
        activeConnection: step.connection,
        connections: visibleConnections,
        pan: { x: targetPanX, y: targetPanY },
        zoom: targetZoom,
      };
    }),
  setPresentationTransitioning: (v: boolean) => set({ presentationTransitioning: v }),

  // QR overlay
  showQR: false,
  toggleQR: () => set((state) => ({ showQR: !state.showQR })),
  closeQR: () => set({ showQR: false }),

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
