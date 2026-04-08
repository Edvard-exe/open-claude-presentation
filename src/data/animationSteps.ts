import type { AnimationStep } from '../types/board';

/**
 * Presentation steps following the exact execution flow of the agentic loop
 * in src/query.ts queryLoop(). Each step maps to a tile and optionally
 * highlights the connection traversed to reach it.
 *
 * Connection indices reference the connections[] array in boardStore.ts:
 *   0: Core → Agent System  (AgentTool)
 *   1: Core → Caching       (cache_control)
 *   2: Core → Autonomous    (hasToolPermission)
 *   3: Agent → Mailbox      (SendMessage)
 *   4: Core → Hooks         (executeHooks)
 *   5: Core → Compaction    (autoCompact)
 */
export const ANIMATION_STEPS: AnimationStep[] = [
  {
    tileId: 'tile-core-architecture',
    connectionIndex: null,
    label: 'queryLoop() while(true)',
    codeRef: 'query.ts:307',
    description: 'User prompt enters the agentic while-loop',
  },
  {
    tileId: 'tile-compaction',
    connectionIndex: 5,
    label: 'Check compaction thresholds',
    codeRef: 'query.ts:401,453',
    description: 'Snip, microcompact, and auto-compact checks before API call',
  },
  {
    tileId: 'tile-caching',
    connectionIndex: 1,
    label: 'Microcompact + cache breakpoints',
    codeRef: 'query.ts:414',
    description: 'Apply cache_edits and prepare KV-cache breakpoints for API call',
  },
  {
    tileId: 'tile-core-architecture',
    connectionIndex: null,
    label: 'API call streams response',
    codeRef: 'query.ts:651',
    description: 'claude() fires, response streams back with tool_use blocks',
  },
  {
    tileId: 'tile-hooks',
    connectionIndex: 4,
    label: 'PreToolUse hooks fire',
    codeRef: 'toolExecution.ts:800',
    description: 'Lifecycle hooks run before each tool — can block, modify, or approve',
  },
  {
    tileId: 'tile-autonomous',
    connectionIndex: 2,
    label: 'Permission check',
    codeRef: 'useCanUseTool.tsx:32',
    description: 'LLM classifier evaluates tool safety, fast-path for safe-listed tools',
  },
  {
    tileId: 'tile-core-architecture',
    connectionIndex: null,
    label: 'Tool executes',
    codeRef: 'toolExecution.ts:1012',
    description: 'tool.call() runs — Bash, FileEdit, Agent, or any of 40+ tools',
  },
  {
    tileId: 'tile-agent-system',
    connectionIndex: 0,
    label: 'AgentTool spawns sub-agent',
    codeRef: 'AgentTool',
    description: 'Creates a new QueryEngine with forked context for parallel work',
  },
  {
    tileId: 'tile-mailbox',
    connectionIndex: 3,
    label: 'Sub-agent communicates back',
    codeRef: 'SendMessageTool',
    description: 'In-process queue or file-based mailbox for cross-agent messages',
  },
  {
    tileId: 'tile-hooks',
    connectionIndex: 4,
    label: 'PostToolUse hooks fire',
    codeRef: 'toolExecution.ts:1151',
    description: 'Post-execution hooks run for observation and cleanup',
  },
  {
    tileId: 'tile-core-architecture',
    connectionIndex: null,
    label: 'Loop continues',
    codeRef: 'query.ts loop',
    description: 'Back to while(true) — the cycle repeats until stop condition',
  },
];
