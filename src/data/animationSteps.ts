import type { AnimationStep } from '../types/board';

/**
 * Presentation steps following the exact execution flow of the agentic loop
 * in src/query.ts queryLoop(). Each step maps to a tile and optionally
 * defines a connection from the previous tile to the current one — connections
 * appear on-screen only as the animation reaches them.
 */
export const ANIMATION_STEPS: AnimationStep[] = [
  {
    tileId: 'tile-core-architecture',
    connection: null,
    label: 'queryLoop() while(true)',
    codeRef: 'query.ts:307',
    description: 'User prompt enters the agentic while-loop',
  },
  {
    tileId: 'tile-compaction',
    connection: { from: 'tile-core-architecture', to: 'tile-compaction', label: 'autoCompact' },
    label: 'Check compaction thresholds',
    codeRef: 'query.ts:401,453',
    description: 'Snip, microcompact, and auto-compact checks before API call',
  },
  {
    tileId: 'tile-caching',
    connection: { from: 'tile-compaction', to: 'tile-caching', label: 'cache_edits' },
    label: 'Microcompact + cache breakpoints',
    codeRef: 'query.ts:414',
    description: 'Apply cache_edits and prepare KV-cache breakpoints for API call',
  },
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-caching', to: 'tile-core-architecture', label: 'cached prefix' },
    label: 'API call streams response',
    codeRef: 'query.ts:651',
    description: 'claude() fires, response streams back with tool_use blocks',
  },
  {
    tileId: 'tile-hooks',
    connection: { from: 'tile-core-architecture', to: 'tile-hooks', label: 'executeHooks' },
    label: 'PreToolUse hooks fire',
    codeRef: 'toolExecution.ts:800',
    description: 'Lifecycle hooks run before each tool — can block, modify, or approve',
  },
  {
    tileId: 'tile-autonomous',
    connection: { from: 'tile-hooks', to: 'tile-autonomous', label: 'hasToolPermission' },
    label: 'Permission check',
    codeRef: 'useCanUseTool.tsx:32',
    description: 'LLM classifier evaluates tool safety, fast-path for safe-listed tools',
  },
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-autonomous', to: 'tile-core-architecture', label: 'approved' },
    label: 'Tool executes',
    codeRef: 'toolExecution.ts:1012',
    description: 'tool.call() runs — Bash, FileEdit, Agent, or any of 40+ tools',
  },
  {
    tileId: 'tile-agent-system',
    connection: { from: 'tile-core-architecture', to: 'tile-agent-system', label: 'AgentTool' },
    label: 'AgentTool spawns sub-agent',
    codeRef: 'AgentTool',
    description: 'Creates a new QueryEngine with forked context for parallel work',
  },
  {
    tileId: 'tile-mailbox',
    connection: { from: 'tile-agent-system', to: 'tile-mailbox', label: 'SendMessage' },
    label: 'Sub-agent communicates back',
    codeRef: 'SendMessageTool',
    description: 'In-process queue or file-based mailbox for cross-agent messages',
  },
  {
    tileId: 'tile-hooks',
    connection: { from: 'tile-mailbox', to: 'tile-hooks', label: 'PostToolUse' },
    label: 'PostToolUse hooks fire',
    codeRef: 'toolExecution.ts:1151',
    description: 'Post-execution hooks run for observation and cleanup',
  },
  {
    tileId: 'tile-core-architecture',
    connection: { from: 'tile-hooks', to: 'tile-core-architecture', label: 'loop' },
    label: 'Loop continues',
    codeRef: 'query.ts loop',
    description: 'Back to while(true) — the cycle repeats until stop condition',
  },
];
