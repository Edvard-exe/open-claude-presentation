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
const ADVISOR_ID = 'tile-advisor';
const MEMORY_ID = 'tile-memory';
const PROMPT_ID = 'tile-prompt-stack';
const SECURITY_ID = 'tile-security';

export const useBoardStore = create<BoardState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1,
  tiles: [
    // ════════════════════════════════════════════════════════════
    //  ROW 1 — Main flow: Memory → Prompt → Core → Agents → Mailbox
    // ════════════════════════════════════════════════════════════
    {
      id: MEMORY_ID,
      position: { x: 50, y: 50 },
      width: 360,
      height: 480,
      title: 'Memory Vault',
      content: 'Three-layer persistent memory: global → project → local. Four types: user, feedback, project, reference. Verified before use — "memory says X exists" ≠ "X exists now."',
      filePath: '/src/utils/claudemd.ts',
      color: '#60C0A0',
      animated: true,
      backgroundType: 'orbital',
      subItems: [
        {
          label: 'Three Layers',
          description: 'Layer 1: ~/.claude/CLAUDE.md (global). Layer 2: ./CLAUDE.md + .claude/rules/*.md (project). Layer 3: CLAUDE.local.md (local, gitignored). Later overrides earlier.',
          color: '#60C0A0',
          filePath: 'src/utils/claudemd.ts',
          line: 92,
        },
        {
          label: '@include Directives',
          description: 'Memory files can reference other files: @./path, @~/home, @/absolute. Circular reference prevention, binary file blocking, HTML comment stripping.',
          color: '#60C0A0',
          filePath: 'src/utils/claudemd.ts',
          line: 336,
        },
        {
          label: 'Verification Loop',
          description: 'System prompt instructs: "If memory names a file path, check it exists. If memory names a function, grep for it." Stale memories updated or removed.',
          color: '#60C0A0',
        },
        {
          label: 'Auto-Memory',
          description: 'Saves runtime memories to ~/.claude/projects/{hash}/MEMORY.md. Frontmatter with name, description, type. Max 40K chars, 200 lines per file, 60KB per session.',
          color: '#60C0A0',
          filePath: 'src/memdir/memoryScan.ts',
          line: 13,
        },
      ],
    },
    {
      id: PROMPT_ID,
      position: { x: 480, y: 50 },
      width: 360,
      height: 440,
      title: 'Prompt Stack',
      content: 'Layered system prompt: identity → tools → guidelines → environment → git → CLAUDE.md → memory → autonomous. Static prefix cached globally; dynamic sections per-session.',
      filePath: '/src/constants/prompts.ts',
      color: '#40A0E0',
      animated: true,
      subItems: [
        {
          label: 'Static Prefix (~15K tokens)',
          description: 'Identity, coding rules, tool guidance, safety ("blast radius"), style — identical for ALL users. Cached at scope:global. 90% cheaper on cache hits.',
          color: '#40A0E0',
          filePath: 'src/constants/prompts.ts',
          line: 175,
        },
        {
          label: '__DYNAMIC_BOUNDARY__',
          description: 'Marker that splits static from dynamic. Everything before = globally cached. Everything after = per-session (CLAUDE.md, env info, MCP instructions, memory).',
          color: '#40A0E0',
          filePath: 'src/constants/prompts.ts',
          line: 115,
        },
        {
          label: 'Section Memoization',
          description: 'systemPromptSection() caches results until /clear or /compact. DANGEROUS_uncachedSystemPromptSection() recomputes every turn (breaks cache if value changes).',
          color: '#40A0E0',
          filePath: 'src/constants/systemPromptSections.ts',
        },
        {
          label: 'Mode Switching',
          description: 'Same loop, different prompt: Default (coding assistant), Coordinator (orchestrate workers), Proactive/Kairos (autonomous with Sleep), Custom Agent (explore, plan, verify).',
          color: '#40A0E0',
          filePath: 'src/utils/systemPrompt.ts',
          line: 41,
        },
      ],
    },
    {
      id: CORE_ID,
      position: { x: 910, y: 50 },
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
      position: { x: 1400, y: 50 },
      width: 360,
      height: 540,
      title: 'Agent System',
      content: 'Multi-agent orchestration — spawn sub-agents, coordinate work, manage autonomous sessions. Parent of Advisor, Kairos, and Mailbox.',
      filePath: '/src/tools/AgentTool/',
      color: '#2563EB',
      diagramId: 'agent-system',
      animated: true,
      subItems: [
        {
          label: 'SubAgent',
          description: 'Forks nested query loops with message interrupt — peeks between serial tools & batches, aborts on urgent SendMessage so the coordinator can redirect mid-execution.',
          color: '#2563EB',
          filePath: 'src/services/tools/toolOrchestration.ts',
          line: 126,
        },
        {
          label: 'Advisor (server-side)',
          description: 'Server-side reviewer model that checks the agent\'s work before substantive actions. Haiku reviews for $0.001, catches mistakes before Opus spends $0.15.',
          color: '#E040A0',
          filePath: 'src/utils/advisor.ts',
          line: 46,
        },
        {
          label: 'Kairos (autonomous)',
          description: 'Long-lived assistant mode (--assistant) with tick-driven wake-ups, Sleep pacing, SendUserMessage communication, persistent sessions, and cron scheduling.',
          color: '#50B0F0',
          filePath: 'src/main.tsx',
          line: 1048,
        },
        {
          label: 'Fork-Join Parallelism',
          description: 'Byte-identical API prefix shares KV cache. A 100K context fork costs ~1K new tokens. CacheSafeParams ensures system prompt + tools + history match exactly.',
          color: '#2563EB',
          filePath: 'src/tools/AgentTool/forkSubagent.ts',
          line: 107,
        },
        {
          label: 'Coordinator Mode',
          description: 'Orchestrates parallel workers: Investigate → Synthesize → Implement → Verify. Workers can\'t see parent conversation — prompts must be self-contained.',
          color: '#2563EB',
          filePath: 'src/coordinator/coordinatorMode.ts',
          line: 111,
        },
        {
          label: 'Worktree Isolation',
          description: 'isolation="worktree" creates a temporary git branch + worktree for conflict-free parallel coding. Auto-cleanup on agent exit.',
          color: '#2563EB',
          filePath: 'src/tools/AgentTool/runAgent.ts',
          line: 248,
        },
      ],
    },
    {
      id: MAILBOX_ID,
      position: { x: 1830, y: 50 },
      width: 360,
      height: 440,
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
          filePath: 'src/tools/SendMessageTool/SendMessageTool.ts',
          line: 741,
        },
        {
          label: 'Pending Messages',
          description: 'In-memory queue on LocalAgentTaskState, drained at tool-round boundaries via getAgentPendingMessageAttachments() into queued_command attachments.',
          color: '#DC2626',
          filePath: 'src/tasks/LocalAgentTask/LocalAgentTask.tsx',
          line: 162,
        },
        {
          label: 'File Mailbox',
          description: '~/.claude/teams/{team}/inboxes/{name}.json — file-locked writes, 1s polling via useInboxPoller, routes permission requests/shutdowns/regular messages.',
          color: '#DC2626',
          filePath: 'src/utils/teammateMailbox.ts',
          line: 134,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    //  ROW 2 — Support systems below the main flow
    // ════════════════════════════════════════════════════════════
    {
      id: SECURITY_ID,
      position: { x: 50, y: 600 },
      width: 360,
      height: 480,
      title: 'Security & Permissions',
      content: '23-point bash security validation + 4-layer permission gate. Blocks command injection, shell escapes, zsh module attacks, Unicode lookalikes, and /proc/environ exfiltration.',
      filePath: '/src/tools/BashTool/bashSecurity.ts',
      color: '#FF4040',
      animated: true,
      backgroundType: 'shield',
      subItems: [
        {
          label: '23 Security Checks',
          description: 'Incomplete commands, jq abuse, obfuscated flags, shell metacharacters, IFS injection, command substitution, /proc/environ access, Unicode whitespace, brace expansion, quoted newlines, and more.',
          color: '#FF4040',
          filePath: 'src/tools/BashTool/bashSecurity.ts',
          line: 76,
        },
        {
          label: 'Zsh Module Attacks',
          description: 'Blocks 18 commands: zmodload (loads mapfile, system, zpty, net/tcp, files modules), emulate -c (eval equivalent), sysopen, sysread, ztcp, zsocket, zf_rm, zf_chmod, etc.',
          color: '#FF4040',
          filePath: 'src/tools/BashTool/bashSecurity.ts',
          line: 45,
        },
        {
          label: '/dev/null Exploit',
          description: 'Without boundary check (?=\\s|$), "> /dev/nullo" matches "/dev/null" as PREFIX, strips it, leaving "o" — the write to /dev/nullo is auto-allowed. Fixed with trailing boundary.',
          color: '#FF4040',
          filePath: 'src/tools/BashTool/bashSecurity.ts',
          line: 176,
        },
        {
          label: 'Permission Gate',
          description: '4 layers: auto-approve reads → safe-bash prefix list (29 patterns) → hook-based decisions → interactive y/N/a prompt. ResolveOnce prevents race conditions between 3 async handlers.',
          color: '#FF4040',
          filePath: 'src/hooks/toolPermission/PermissionContext.ts',
          line: 63,
        },
      ],
    },
    {
      id: CACHE_ID,
      position: { x: 480, y: 600 },
      width: 360,
      height: 480,
      title: 'Prompt Caching',
      content: 'Ephemeral KV-cache breakpoints on the Anthropic API — cache system prompts, tool schemas, and conversation prefixes to avoid re-processing thousands of tokens every turn.',
      filePath: '/src/services/api/claude.ts',
      color: '#059669',
      diagramId: 'cache-economics',
      animated: true,
      backgroundType: 'cache',
      subItems: [
        {
          label: 'Cache Breakpoints',
          description: 'One cache_control marker per request on the last message — everything before it becomes a reusable KV-cache prefix with 5 min or 1 h TTL.',
          color: '#059669',
          filePath: 'src/services/api/claude.ts',
          line: 3063,
        },
        {
          label: 'Microcompact (cache_edits)',
          description: 'Surgically deletes old tool results from the cached prefix via cache_edits without invalidating it — messages stay intact locally, only the server-side cache shrinks.',
          color: '#059669',
          filePath: 'src/services/compact/microCompact.ts',
          line: 305,
        },
        {
          label: 'Sticky-On Latches',
          description: 'Beta headers latched ON for the session once first sent. Prevents mid-session toggles from busting ~50-70K cached tokens. 4 headers: fast mode, AFK, cache editing, thinking clear.',
          color: '#059669',
          filePath: 'src/services/api/claude.ts',
          line: 1405,
        },
        {
          label: 'Cache Break Detection',
          description: '16-factor tracker: hashes system prompt, tool schemas, TTL, scope, betas, model, effort before each call — flags unexpected cache_read drops above 2K tokens.',
          color: '#059669',
          filePath: 'src/services/api/promptCacheBreakDetection.ts',
          line: 247,
        },
      ],
    },
    {
      id: HOOKS_ID,
      position: { x: 910, y: 600 },
      width: 360,
      height: 480,
      title: 'Hooks',
      content: '27 lifecycle events — shell commands, LLM prompts, or HTTP webhooks that can block, modify, or observe every tool call.',
      filePath: '/src/utils/hooks.ts',
      color: '#EA580C',
      diagramId: 'hook-lifecycle',
      animated: true,
      backgroundType: 'hooks',
      subItems: [
        {
          label: 'Hook Engine',
          description: 'Main async generator (5,022 lines): matches hooks by event + matcher, parallel-executes all matched hooks, aggregates results. Exit code 2 blocks operations.',
          color: '#EA580C',
          filePath: 'src/utils/hooks.ts',
          line: 1952,
        },
        {
          label: 'PreToolUse',
          description: 'Runs before every tool: can deny (block execution), modify input (updatedInput), or approve. Fast-path for trusted tools. Returns permission decisions.',
          color: '#EA580C',
          filePath: 'src/utils/hooks.ts',
          line: 3394,
        },
        {
          label: 'Stop Hook',
          description: 'Fires when model thinks it\'s done. If hook returns exit code 2, model gets feedback and CONTINUES — can\'t stop until hook passes (e.g., "npm test" must pass).',
          color: '#EA580C',
          filePath: 'src/utils/hooks.ts',
          line: 3639,
        },
        {
          label: '5 Hook Types',
          description: 'Shell command spawn, LLM prompt verification, HTTP POST webhook, agent-based structured reasoning, TypeScript callback. All receive JSON context, return JSON responses.',
          color: '#EA580C',
          filePath: 'src/types/hooks.ts',
          line: 210,
        },
      ],
    },
    {
      id: ADVISOR_ID,
      position: { x: 1400, y: 600 },
      width: 360,
      height: 440,
      title: 'Advisor Model',
      content: 'Server-side tool where a cheaper model (Haiku) silently reviews the main model\'s work mid-generation — feedback injected into system prompt before Opus responds.',
      filePath: '/src/utils/advisor.ts',
      color: '#E040A0',
      animated: true,
      backgroundType: 'neural',
      subItems: [
        {
          label: 'server_tool_use',
          description: 'Opus calls advisor tool during generation → API routes to Haiku internally → Haiku returns feedback → Opus reads it and continues. All inside one streaming response.',
          color: '#E040A0',
          filePath: 'src/utils/advisor.ts',
          line: 9,
        },
        {
          label: 'Encrypted Feedback',
          description: 'advisor_redacted_result blocks contain encrypted_content — can\'t be decrypted client-side. The main model sees it server-side; the user sees "Advisor reviewed."',
          color: '#E040A0',
          filePath: 'src/utils/advisor.ts',
          line: 16,
        },
        {
          label: 'When to Advise',
          description: 'Call BEFORE substantive work, AFTER task completion, when STUCK. Give advice serious weight — only override with empirical evidence. On conflict: reconciliation call.',
          color: '#E040A0',
          filePath: 'src/utils/advisor.ts',
          line: 130,
        },
        {
          label: 'Cost Asymmetry',
          description: 'Haiku costs ~$0.001/call. Catches mistakes before Opus spends $0.15. Advisor tokens billed at advisor model rate, tracked separately.',
          color: '#E040A0',
          filePath: 'src/cost-tracker.ts',
          line: 304,
        },
      ],
    },
    {
      id: AUTO_ID,
      position: { x: 1830, y: 600 },
      width: 360,
      height: 480,
      title: 'Autonomous Mode',
      content: 'Kairos: tick-driven autonomous agent + YOLO classifier for auto-approving safe tool calls. Combines persistent sessions with intelligent permission gating.',
      filePath: '/src/utils/permissions/yoloClassifier.ts',
      color: '#D97706',
      animated: true,
      backgroundType: 'shield',
      subItems: [
        {
          label: 'YOLO Classifier',
          description: 'LLM call evaluates tool safety — returns shouldBlock boolean. One classifier call per tool boundary, zero cost for safe-listed tools.',
          color: '#D97706',
          filePath: 'src/utils/permissions/yoloClassifier.ts',
          line: 1012,
        },
        {
          label: 'Tick Timer (Kairos)',
          description: 'Background timer injects <tick> messages every N seconds. Model decides: work, Sleep, or SendUserMessage. Prompt cache expires after 5 min — balance pacing.',
          color: '#D97706',
          filePath: 'src/main.tsx',
          line: 1048,
        },
        {
          label: 'Sleep + SendUserMessage',
          description: 'Sleep pauses ticks while waiting. SendUserMessage is the agent-to-user communication channel — plain text may not be visible, put results here.',
          color: '#D97706',
          filePath: 'src/constants/prompts.ts',
          line: 860,
        },
        {
          label: 'Permission Setup',
          description: 'CLI initialization: --permission-mode auto flag, feature gates, strips dangerous permissions (Bash(*), Agent(*)), activates auto mode state machine.',
          color: '#D97706',
          filePath: 'src/utils/permissions/permissionSetup.ts',
          line: 689,
        },
      ],
    },

    // ════════════════════════════════════════════════════════════
    //  ROW 3 — Compaction (below caching)
    // ════════════════════════════════════════════════════════════
    {
      id: COMPACT_ID,
      position: { x: 480, y: 1150 },
      width: 360,
      height: 480,
      title: 'Compaction',
      content: 'Context management — summarizes old messages when tokens run high. 5-layer pipeline from cheap to expensive.',
      filePath: '/src/services/compact/compact.ts',
      color: '#0891B2',
      diagramId: 'compaction-pipeline',
      animated: true,
      backgroundType: 'compactor',
      subItems: [
        {
          label: 'Full Compaction',
          description: 'Sends old messages to Claude for 9-section structured summary (intent, files, errors, fixes, pending tasks). Reserves 20K output tokens. Replaces originals with compact boundary.',
          color: '#0891B2',
          filePath: 'src/services/compact/compact.ts',
          line: 387,
        },
        {
          label: 'Micro-Compaction',
          description: 'Clears old tool result content without API call. Cached path uses cache_edits to shrink server-side; time-based path mutates messages directly when cache is cold.',
          color: '#0891B2',
          filePath: 'src/services/compact/microCompact.ts',
          line: 253,
        },
        {
          label: 'Auto-Compact',
          description: 'Monitors token usage. Fires at effective_context_window - 13K buffer. 70% threshold. Warning/error/blocking levels.',
          color: '#0891B2',
          filePath: 'src/services/compact/autoCompact.ts',
          line: 241,
        },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  //  CONNECTIONS — clear parent-child hierarchy
  //  Index:  0       1       2       3       4       5       6       7       8       9
  // ═══════════════════════════════════════════════════════════════
  connections: [
    { from: MEMORY_ID,  to: PROMPT_ID,   label: 'CLAUDE.md + memory' },    // 0
    { from: PROMPT_ID,  to: CORE_ID,     label: 'buildSystemPrompt()' },    // 1
    { from: CORE_ID,    to: AGENT_ID,    label: 'AgentTool' },              // 2
    { from: AGENT_ID,   to: MAILBOX_ID,  label: 'SendMessage' },           // 3  ← child of Agent
    { from: AGENT_ID,   to: ADVISOR_ID,  label: 'advisor tool' },          // 4  ← child of Agent
    { from: AGENT_ID,   to: AUTO_ID,     label: 'Kairos / auto-mode' },    // 5  ← child of Agent
    { from: CORE_ID,    to: HOOKS_ID,    label: 'executeHooks' },          // 6
    { from: CORE_ID,    to: CACHE_ID,    label: 'cache_control' },         // 7
    { from: CORE_ID,    to: COMPACT_ID,  label: 'autoCompact' },           // 8
    { from: CORE_ID,    to: SECURITY_ID, label: 'canUseTool()' },          // 9
  ],

  selectedTileId: null,
  openDiagramId: null,
  openSubItemData: null,

  // Presentation playback
  presentationActive: false,
  presentationStepIndex: -1,
  presentationTransitioning: false,
  activeTileId: null,
  activeConnectionIndex: null,

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
      activeConnectionIndex: null,
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

      return {
        presentationStepIndex: index,
        presentationTransitioning: true,
        activeTileId: step.tileId,
        activeConnectionIndex: step.connectionIndex,
        pan: { x: targetPanX, y: targetPanY },
        zoom: targetZoom,
      };
    }),
  setPresentationTransitioning: (v: boolean) => set({ presentationTransitioning: v }),

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
