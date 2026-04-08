import type { AnimationStep } from '../types/board';

/**
 * Presentation steps following the agentic loop execution flow.
 * Each step uses inline connection objects (from upstream pattern).
 */
export const ANIMATION_STEPS: AnimationStep[] = [
  // ── Phase 1: Startup ──────────────────────────────────────────
  {
    tileId: 'tile-memory',
    connection: { from: 'tile-memory', to: 'tile-prompt-stack', label: 'CLAUDE.md + memory' },
    label: 'Load memory layers',
    codeRef: 'claudemd.ts:92',
    description: 'Three layers: global (~/.claude/CLAUDE.md), project (./CLAUDE.md), local (.local.md). Four types loaded and injected.',
  },
  {
    tileId: 'tile-prompt-stack',
    connection: { from: 'tile-prompt-stack', to: 'tile-core-architecture', label: 'buildSystemPrompt()' },
    label: 'Build system prompt',
    codeRef: 'prompts.ts:444',
    description: '8 layers: identity → tools → guidelines → env → git → CLAUDE.md → memory → autonomous. Static prefix cached globally.',
  },

  // ── Phase 2: Core Loop ────────────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: null,
    label: 'queryLoop() while(true)',
    codeRef: 'query.ts:307',
    description: 'User prompt enters the agentic while-loop — the 8-line core that drives everything.',
  },
  {
    tileId: 'tile-compaction',
    connection: { from: 'tile-core-architecture', to: 'tile-compaction', label: 'autoCompact' },
    label: 'Check compaction thresholds',
    codeRef: 'query.ts:401',
    description: '5-layer pipeline: tool budget → snip → microcompact → context collapse → full compact. 70% threshold.',
  },
  {
    tileId: 'tile-caching',
    connection: { from: 'tile-compaction', to: 'tile-caching', label: 'cache_edits' },
    label: 'Cache breakpoints + microcompact',
    codeRef: 'claude.ts:3063',
    description: 'Set KV-cache breakpoints. Static prefix cached globally — 90% cheaper. Sticky-on latches prevent $0.07 cache busts.',
  },

  // ── Phase 3: API & Streaming ──────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-caching', to: 'tile-core-architecture', label: 'cached prefix' },
    label: 'API call streams response',
    codeRef: 'query.ts:651',
    description: 'claude() fires, response streams back with text, thinking, and tool_use blocks.',
  },

  // ── Phase 4: Tool Execution ───────────────────────────────────
  {
    tileId: 'tile-hooks',
    connection: { from: 'tile-core-architecture', to: 'tile-hooks', label: 'executeHooks' },
    label: 'PreToolUse hooks fire',
    codeRef: 'hooks.ts:3394',
    description: '27 lifecycle hooks — can block, modify input, or approve. 5 hook types: command, prompt, agent, HTTP, callback.',
  },
  {
    tileId: 'tile-security',
    connection: { from: 'tile-hooks', to: 'tile-security', label: 'canUseTool()' },
    label: 'Permission + security gate',
    codeRef: 'bashSecurity.ts:76',
    description: '23-point bash validation + 4-layer permission: auto-approve reads → safe-bash → hooks → interactive ask.',
  },
  {
    tileId: 'tile-autonomous',
    connection: { from: 'tile-security', to: 'tile-autonomous', label: 'hasToolPermission' },
    label: 'Permission classifier',
    codeRef: 'yoloClassifier.ts:1012',
    description: 'LLM classifier evaluates tool safety, fast-path for safe-listed tools.',
  },
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-autonomous', to: 'tile-core-architecture', label: 'approved' },
    label: 'Tool executes',
    codeRef: 'toolExecution.ts:1012',
    description: 'tool.call() runs — Bash, FileEdit, Agent, or any of 40+ tools. Results feed back into messages.',
  },

  // ── Phase 5: Sub-Agents ───────────────────────────────────────
  {
    tileId: 'tile-agent-system',
    connection: { from: 'tile-core-architecture', to: 'tile-agent-system', label: 'AgentTool' },
    label: 'AgentTool spawns sub-agent',
    codeRef: 'runAgent.ts:248',
    description: 'Fork-join: byte-identical prefix shares KV cache. 5 types: coder, reviewer, researcher, tester, general-purpose.',
  },
  {
    tileId: 'tile-advisor',
    connection: { from: 'tile-agent-system', to: 'tile-advisor', label: 'advisor tool' },
    label: 'Advisor reviews work',
    codeRef: 'advisor.ts:51',
    description: 'Haiku ($0.001) reviews context → encrypted feedback → Opus reads as authoritative guidance. All inside one API call.',
  },
  {
    tileId: 'tile-mailbox',
    connection: { from: 'tile-agent-system', to: 'tile-mailbox', label: 'SendMessage' },
    label: 'Sub-agent communicates back',
    codeRef: 'SendMessageTool.ts:741',
    description: 'In-process queue or file-based mailbox. Task notifications arrive as user-role messages.',
  },
  {
    tileId: 'tile-autonomous',
    connection: { from: 'tile-agent-system', to: 'tile-autonomous', label: 'Kairos / auto-mode' },
    label: 'Kairos / autonomous mode',
    codeRef: 'main.tsx:1048',
    description: 'Tick-driven agent: <tick> messages every N seconds. Sleep for pacing. YOLO classifier auto-approves safe tool calls.',
  },

  // ── Phase 6: Post-Execution ───────────────────────────────────
  {
    tileId: 'tile-hooks',
    connection: { from: 'tile-mailbox', to: 'tile-hooks', label: 'PostToolUse' },
    label: 'PostToolUse + Stop hooks',
    codeRef: 'hooks.ts:3450',
    description: 'Post-execution hooks observe results. Stop hooks can FORCE model to continue (exit code 2 = blocking feedback).',
  },
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-hooks', to: 'tile-core-architecture', label: 'loop' },
    label: 'Loop continues or completes',
    codeRef: 'query.ts:1357',
    description: 'No tool_calls → done. Tool_calls → loop. 16 termination conditions. Same loop powers all modes.',
  },
];
