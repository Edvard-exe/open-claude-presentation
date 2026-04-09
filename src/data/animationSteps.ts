import type { AnimationStep } from '../types/board';

/**
 * Presentation steps following the exact execution flow of the agentic loop.
 * Matches main branch order: Core → Compact → Cache → Core → Hooks →
 * Core → Agent → Mailbox → Core
 */
export const ANIMATION_STEPS: AnimationStep[] = [
  // ── Core loop entry ───────────────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: null,
    label: 'queryLoop() while(true)',
    codeRef: 'query.ts:307',
    description: 'User prompt enters the agentic while-loop — the 8-line core that drives everything.',
  },

  // ── Compaction check ──────────────────────────────────────────
  {
    tileId: 'tile-compaction',
    connection: { from: 'tile-core-architecture', to: 'tile-compaction', label: 'autoCompact' },
    label: 'Check compaction thresholds',
    codeRef: 'query.ts:401',
    description: 'chars÷4 token estimate. 70% threshold triggers: snip → microcompact → full compact.',
  },

  // ── Cache breakpoints ─────────────────────────────────────────
  {
    tileId: 'tile-caching',
    connection: { from: 'tile-compaction', to: 'tile-caching', label: 'cache_edits' },
    label: 'Cache breakpoints + microcompact',
    codeRef: 'claude.ts:3063',
    description: 'Apply cache_edits, set KV-cache breakpoints. Beta latches preserve headers. 90% cheaper on cache hits.',
  },

  // ── API call ──────────────────────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-caching', to: 'tile-core-architecture', label: 'cached prefix' },
    label: 'API call streams response',
    codeRef: 'query.ts:651',
    description: 'claude() fires, response streams back with text, thinking, and tool_use blocks.',
  },

  // ── Hooks + permission ────────────────────────────────────────
  {
    tileId: 'tile-hooks',
    connection: { from: 'tile-core-architecture', to: 'tile-hooks', label: 'executeHooks' },
    label: 'PreToolUse hooks fire',
    codeRef: 'hooks.ts:3394',
    description: 'Lifecycle hooks run before each tool — can block, modify input, or approve.',
  },
  // ── Tool executes ─────────────────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-hooks', to: 'tile-core-architecture', label: 'approved' },
    label: 'Tool executes',
    codeRef: 'toolExecution.ts:1012',
    description: 'tool.call() runs — Bash, FileEdit, Agent, or any of 40+ tools. Results feed back into messages.',
  },

  // ── Sub-agents ────────────────────────────────────────────────
  {
    tileId: 'tile-agent-system',
    connection: { from: 'tile-core-architecture', to: 'tile-agent-system', label: 'AgentTool' },
    label: 'AgentTool spawns sub-agent',
    codeRef: 'runAgent.ts:248',
    description: 'Fork-join: byte-identical prefix shares KV cache. Only the directive differs per child.',
  },
  {
    tileId: 'tile-mailbox',
    connection: { from: 'tile-agent-system', to: 'tile-mailbox', label: 'SendMessage' },
    label: 'Sub-agent communicates back',
    codeRef: 'SendMessageTool.ts:741',
    description: 'In-process queue or file-based mailbox. Task notifications arrive as user-role messages.',
  },

  // ── Loop back ──────────────────────────────────────────────────
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-mailbox', to: 'tile-core-architecture', label: 'loop' },
    label: 'Loop continues or completes',
    codeRef: 'query.ts:1357',
    description: 'PostToolUse + Stop hooks fire. No tool_calls → done. Tool_calls → loop. Same loop powers all modes.',
  },
];
