import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { BoardState, Position, TileData } from '../types/board';
import { ANIMATION_STEPS } from '../data/animationSteps';

const CORE_ID = 'tile-core-architecture';
const AGENT_ID = 'tile-agent-system';
const CACHE_ID = 'tile-caching';
const MAILBOX_ID = 'tile-mailbox';
const HOOKS_ID = 'tile-hooks';
const COMPACT_ID = 'tile-compaction';
const PROMPT_ID = 'tile-prompt-stack';
const SECURITY_ID = 'tile-security';

export const useBoardStore = create<BoardState>((set) => ({
  pan: { x: 0, y: 0 },
  zoom: 1,
  tiles: [
    // ════════════════════════════════════════════════════════════
    //  ROW 1 — Main flow: Prompt → Core → Agents → Mailbox
    // ════════════════════════════════════════════════════════════
    {
      id: PROMPT_ID,
      position: { x: -380, y: 120 },
      width: 360,
      height: 440,
      title: 'Prompt Stack',
      content: 'Layered system prompt: identity → tools → guidelines → environment → git → CLAUDE.md → memory → autonomous. Static prefix cached globally; dynamic sections per-session.',
      filePath: '/src/constants/prompts.ts',
      color: '#40A0E0',
      animated: true,
      storySteps: [
        { label: 'Layers', title: '8-Layer System Prompt', source: 'src/constants/prompts.ts:444', description: 'Identity → tool descriptions (53+) → coding guidelines → environment → git info → CLAUDE.md → memory → autonomous section.', code: '// src/constants/prompts.ts:444\nexport async function getSystemPrompt(\n  tools: Tools,\n  model: string,\n  additionalWorkingDirectories?: string[],\n  mcpClients?: MCPServerConnection[],\n): Promise<string[]> {\n  if (isEnvTruthy(process.env.CLAUDE_CODE_SIMPLE)) {\n    return [\n      `You are Claude Code, Anthropic\'s official CLI for Claude.\\n\\nCWD: ${getCwd()}\\nDate: ${getSessionStartDate()}`,\n    ]\n  }\n\n  const cwd = getCwd()\n  const [skillToolCommands, outputStyleConfig, envInfo] = await Promise.all([\n    getSkillToolCommands(cwd),\n    getOutputStyleConfig(),\n    computeSimpleEnvInfo(model, additionalWorkingDirectories),\n  ])\n  const settings = getInitialSettings()\n  const enabledTools = new Set(tools.map(_ => _.name))\n  // ... assembles 8 layers\n}', codeLang: 'typescript', spark: '8 lines of loop. 700 lines of prompt. The prompt IS the framework. When Claude gets smarter, Claude Code automatically gets smarter.' },
        { label: 'Boundary', title: 'Cache Boundary Split', source: 'src/constants/prompts.ts:115', description: '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__ splits static from dynamic. Static prefix (~15K tokens) cached at scope:global — shared across ALL users.', code: '// src/constants/prompts.ts:114\n// WARNING: Do not remove or reorder this marker without updating\n// cache logic in:\n// - src/utils/api.ts (splitSysPromptPrefix)\n// - src/services/api/claude.ts (buildSystemPromptBlocks)\nexport const SYSTEM_PROMPT_DYNAMIC_BOUNDARY =\n  \'__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__\'\n\n// @[MODEL LAUNCH]: Update the latest frontier model.\nconst FRONTIER_MODEL_NAME = \'Claude Opus 4.6\'', codeLang: 'typescript', spark: 'One marker in one file saves 90% on 15K tokens for every user. That\'s the most cost-effective line of code in the entire codebase.' },
        { label: 'Memo', title: 'Section Memoization', source: 'src/constants/systemPromptSections.ts', description: 'systemPromptSection() caches until /clear. DANGEROUS_uncachedSystemPromptSection() recomputes every turn (breaks cache if changed).', code: '// src/constants/systemPromptSections.ts:20\nexport function systemPromptSection(\n  name: string,\n  compute: ComputeFn,\n): SystemPromptSection {\n  return { name, compute, cacheBreak: false }\n}\n\n// This WILL break the prompt cache when the value changes.\n// Requires a reason explaining why cache-breaking is necessary.\nexport function DANGEROUS_uncachedSystemPromptSection(\n  name: string,\n  compute: ComputeFn,\n  _reason: string,\n): SystemPromptSection {\n  return { name, compute, cacheBreak: true }\n}\n\nexport async function resolveSystemPromptSections(\n  sections: SystemPromptSection[],\n): Promise<(string | null)[]> {\n  const cache = getSystemPromptSectionCache()\n  return Promise.all(\n    sections.map(async s => {\n      if (!s.cacheBreak && cache.has(s.name)) {\n        return cache.get(s.name) ?? null\n      }\n      const value = await s.compute()\n      setSystemPromptSectionCacheEntry(s.name, value)\n      return value\n    }),\n  )\n}', codeLang: 'typescript', spark: 'The prefix "DANGEROUS_" in the function name forces engineers to document why a section needs per-turn recomputation. Convention as safety.' },
        { label: 'Modes', title: 'Prompt Mode Switching', source: 'src/utils/systemPrompt.ts:41', description: 'Same loop, different prompt: Default (coding assistant), Coordinator (orchestrate workers), Proactive/Kairos (autonomous with Sleep), Custom Agent (explore, plan, verify).', code: '// src/utils/systemPrompt.ts:41\nexport function buildEffectiveSystemPrompt({\n  mainThreadAgentDefinition,\n  toolUseContext,\n  customSystemPrompt,\n  defaultSystemPrompt,\n  appendSystemPrompt,\n  overrideSystemPrompt,\n}: {\n  mainThreadAgentDefinition: AgentDefinition | undefined\n  toolUseContext: Pick<ToolUseContext, \'options\'>\n  customSystemPrompt: string | undefined\n  defaultSystemPrompt: string[]\n  appendSystemPrompt: string | undefined\n  overrideSystemPrompt?: string | null\n}): SystemPrompt {\n  if (overrideSystemPrompt) {\n    return asSystemPrompt([overrideSystemPrompt])\n  }\n  // Coordinator mode: use coordinator prompt instead of default\n  // ...\n}', codeLang: 'typescript', spark: 'The entire behavior of Claude Code changes by swapping prompt text. No code changes. No new features. Just different instructions to the same loop.' },
      ],
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
      storySteps: [
        {
          label: 'Input',
          title: 'User Input',
          source: 'src/components/TextInput.tsx',
          description: 'User types a message or pipes input through stdin. Ink\'s TextInput component captures keystrokes in interactive mode.',
          code: '// src/components/TextInput.tsx:37\nexport default function TextInput(props: Props): React.ReactNode {\n  const [theme] = useTheme()\n  const isTerminalFocused = useTerminalFocus()\n  const accessibilityEnabled = useMemo(\n    () => isEnvTruthy(process.env.CLAUDE_CODE_ACCESSIBILITY), []\n  )\n  const settings = useSettings()\n  const reducedMotion = settings.prefersReducedMotion ?? false\n  const voiceState = feature(\'VOICE_MODE\') ?\n    useVoiceState(s => s.voiceState) : \'idle\' as const\n  const isVoiceRecording = voiceState === \'recording\'\n  // ...\n}',
          codeLang: 'typescript',
          terminal: { command: 'Find all TODO comments in src/ and fix them', output: '' },
        },
        {
          label: 'while(true)',
          title: 'The Core Loop',
          source: 'src/query.ts:307',
          description: 'The entire agentic architecture is a while(true) loop. No LangChain, no state machine, no decision tree. Just: stream → detect tool_use → execute → repeat.',
          code: '// src/query.ts:307\nwhile (true) {\n  let { toolUseContext } = state\n  const {\n    messages, autoCompactTracking,\n    maxOutputTokensRecoveryCount,\n    hasAttemptedReactiveCompact,\n    pendingToolUseSummary, stopHookActive, turnCount,\n  } = state\n\n  // ... compact, stream API, collect tool_use blocks ...\n\n  const msgToolUseBlocks = message.message.content.filter(\n    content => content.type === \'tool_use\',\n  ) as ToolUseBlock[]\n  if (msgToolUseBlocks.length > 0) {\n    toolUseBlocks.push(...msgToolUseBlocks)\n    needsFollowUp = true\n  }\n\n  // ... execute tools, build next state ...\n\n  const next: State = {\n    messages: [...messagesForQuery, ...assistantMessages, ...toolResults],\n    toolUseContext: toolUseContextWithQueryTracking,\n    turnCount: nextTurnCount,\n    maxOutputTokensRecoveryCount: 0,\n    hasAttemptedReactiveCompact: false,\n    transition: { reason: \'next_turn\' },\n  }\n  state = next\n} // while (true)',
          codeLang: 'typescript',
          spark: 'This is the entire framework. 8 lines of loop. 700 lines of prompt. The prompt IS the framework.',
          demo: 'loop' as const,
        },
        {
          label: 'Stream',
          title: 'API Call & Streaming',
          source: 'src/services/api/claude.ts:1017',
          description: 'queryModelWithStreaming() sends the full context to Claude. Response streams as message_start → content_block_delta → message_stop events.',
          code: '// src/services/api/claude.ts:752\nexport async function* queryModelWithStreaming({\n  messages, systemPrompt, thinkingConfig,\n  tools, signal, options,\n}: {\n  messages: Message[]\n  systemPrompt: SystemPrompt\n  thinkingConfig: ThinkingConfig\n  tools: Tools\n  signal: AbortSignal\n  options: Options\n}): AsyncGenerator<\n  StreamEvent | AssistantMessage | SystemAPIErrorMessage, void\n> {\n  return yield* withStreamingVCR(messages, async function* () {\n    yield* queryModel(\n      messages, systemPrompt, thinkingConfig,\n      tools, signal, options,\n    )\n  })\n}',
          codeLang: 'typescript',
          spark: 'withRetry() handles 10 retries, fast-mode cooldown, 529→fallback model cascade, and context window overflow — all transparently.',
          demo: 'stream' as const,
        },
        {
          label: 'Tools?',
          title: 'Detect Tool Calls',
          source: 'src/query.ts:826',
          description: 'If the response contains tool_use content blocks, set needsFollowUp = true. Otherwise, check 16 different termination conditions.',
          code: '// src/query.ts:826\nif (message.type === \'assistant\') {\n  assistantMessages.push(message)\n\n  const msgToolUseBlocks = message.message.content.filter(\n    content => content.type === \'tool_use\',\n  ) as ToolUseBlock[]\n  if (msgToolUseBlocks.length > 0) {\n    toolUseBlocks.push(...msgToolUseBlocks)\n    needsFollowUp = true\n  }\n\n  if (streamingToolExecutor &&\n      !toolUseContext.abortController.signal.aborted) {\n    for (const toolBlock of msgToolUseBlocks) {\n      streamingToolExecutor.addTool(toolBlock, message)\n    }\n  }\n}',
          codeLang: 'typescript',
          spark: '16 termination conditions — the loop is 8 lines, the exits are 1,300 lines of recovery cascades.',
          footer: 'Exit reasons: completed, max_turns, aborted_streaming, aborted_tools, prompt_too_long, model_error, image_error, stop_hook_prevented, hook_stopped, blocking_limit, max_output_tokens, token_budget, and more.',
        },
        {
          label: 'Execute',
          title: 'Tool Execution',
          source: 'src/services/tools/toolOrchestration.ts:19',
          description: 'partitionToolCalls() groups tools by concurrency safety. Read-only tools (Read, Glob, Grep) run 10-parallel. Write tools (Edit, Bash) run serially.',
          code: '// src/services/tools/toolOrchestration.ts:91\nfunction partitionToolCalls(\n  toolUseMessages: ToolUseBlock[],\n  toolUseContext: ToolUseContext,\n): Batch[] {\n  return toolUseMessages.reduce((acc: Batch[], toolUse) => {\n    const tool = findToolByName(toolUseContext.options.tools, toolUse.name)\n    const parsedInput = tool?.inputSchema.safeParse(toolUse.input)\n    const isConcurrencySafe = parsedInput?.success\n      ? (() => {\n          try {\n            return Boolean(tool?.isConcurrencySafe(parsedInput.data))\n          } catch {\n            return false // conservative on parse failure\n          }\n        })()\n      : false\n    if (isConcurrencySafe && acc[acc.length - 1]?.isConcurrencySafe) {\n      acc[acc.length - 1]!.blocks.push(toolUse)\n    } else {\n      acc.push({ isConcurrencySafe, blocks: [toolUse] })\n    }\n    return acc\n  }, [])\n}',
          codeLang: 'typescript',
          spark: 'Read-only tools run 10-parallel. Output truncated at 32K chars with first-half + last-quarter strategy.',
          demo: 'parallel-tools' as const,
        },
        {
          label: 'Loop',
          title: 'State Update → Continue',
          source: 'src/query.ts:1715',
          description: 'Tool results appended to messages. Recovery counters reset. State updated. Loop continues.',
          code: '// src/query.ts:1715\nconst next: State = {\n  messages: [...messagesForQuery, ...assistantMessages, ...toolResults],\n  toolUseContext: toolUseContextWithQueryTracking,\n  autoCompactTracking: tracking,\n  turnCount: nextTurnCount,\n  maxOutputTokensRecoveryCount: 0,\n  hasAttemptedReactiveCompact: false,\n  pendingToolUseSummary: nextPendingToolUseSummary,\n  maxOutputTokensOverride: undefined,\n  stopHookActive,\n  transition: { reason: \'next_turn\' },\n}\nstate = next',
          codeLang: 'typescript',
          spark: 'Same loop powers coding assistant, coordinator, autonomous agent — only the prompt changes. When Claude gets smarter, Claude Code automatically gets smarter.',
        },
      ],
    },
    {
      id: AGENT_ID,
      position: { x: 650, y: 120 },
      width: 360,
      height: 540,
      title: 'Agent System',
      content: 'Multi-agent orchestration — spawn sub-agents, coordinate work, manage autonomous sessions. Includes Advisor, Kairos, fork-join parallelism, and coordinator mode.',
      filePath: '/src/tools/AgentTool/',
      color: '#2563EB',
      diagramId: 'agent-system',
      animated: true,
      storySteps: [
        {
          label: 'Spawn', title: 'Spawning Sub-Agents', source: 'src/tools/AgentTool/runAgent.ts:248',
          description: 'AgentTool creates a new query() loop with isolated context — its own message history, file state cache, and abort controller. 5 built-in types: coder, reviewer, researcher, tester, general-purpose.',
          code: '// src/tools/AgentTool/runAgent.ts:248\nexport async function* runAgent({\n  agentDefinition,\n  promptMessages,\n  toolUseContext,\n  canUseTool,\n  isAsync,\n  canShowPermissionPrompts,\n  forkContextMessages,\n  querySource,\n  override,\n  model,\n  maxTurns,\n  preserveToolUseResults,\n  availableTools,\n  allowedTools,\n  onCacheSafeParams,\n  contentReplacementState,\n  useExactTools,\n  worktreePath,\n  description,\n  transcriptSubdir,\n  onQueryProgress,\n}: {\n  agentDefinition: AgentDefinition\n  promptMessages: Message[]\n  toolUseContext: ToolUseContext\n  canUseTool: CanUseToolFn\n  // ...\n})',
          codeLang: 'typescript',
          spark: 'When you spawn a sub-agent, do you pass just a prompt — or the full parent context? The answer changes cost dramatically.',
        },
        {
          label: 'Fork', title: 'KV Cache Fork Trick', source: 'src/tools/AgentTool/forkSubagent.ts:107',
          description: 'Parallel sub-agents construct byte-identical API request prefixes — same system prompt, tools, history, placeholder results. Only the final directive differs. The KV cache is shared across all forks.',
          code: '// src/tools/AgentTool/forkSubagent.ts:107\nexport function buildForkedMessages(\n  directive: string,\n  assistantMessage: AssistantMessage,\n): MessageType[] {\n  // Clone the assistant message to avoid mutating the original,\n  // keeping all content blocks (thinking, text, and every tool_use)\n  const fullAssistantMessage: AssistantMessage = {\n    ...assistantMessage,\n    uuid: randomUUID(),\n    message: {\n      ...assistantMessage.message,\n      content: [...assistantMessage.message.content],\n    },\n  }\n\n  // Collect all tool_use blocks from the assistant message\n  const toolUseBlocks = assistantMessage.message.content.filter(\n    (block): block is BetaToolUseBlock => block.type === \'tool_use\',\n  )\n  // Each fork gets identical prefix → KV cache fully reused\n}',
          codeLang: 'typescript',
          spark: 'A 100K-token context fork costs ~1K new tokens because the KV cache is fully shared. This is what makes parallel agents economically viable.',
        },
        {
          label: 'Advisor', title: 'Advisor Model — Live Demo', source: 'src/utils/advisor.ts:9',
          description: 'Opus calls server_tool_use(name="advisor") during generation → API routes to Haiku internally → Haiku returns feedback → Opus reads it and continues. All inside ONE streaming response.',
          code: '// src/utils/advisor.ts:9\nexport type AdvisorServerToolUseBlock = {\n  type: \'server_tool_use\'\n  id: string\n  name: \'advisor\'\n  input: { [key: string]: unknown }\n}\n\nexport type AdvisorToolResultBlock = {\n  type: \'advisor_tool_result\'\n  tool_use_id: string\n  content:\n    | { type: \'advisor_result\'; text: string }\n    | { type: \'advisor_redacted_result\'; encrypted_content: string }\n    | { type: \'advisor_tool_result_error\'; error_code: string }\n}\n\nexport function isAdvisorBlock(param: {\n  type: string; name?: string\n}): param is AdvisorBlock {\n  return (\n    param.type === \'advisor_tool_result\' ||\n    (param.type === \'server_tool_use\' && param.name === \'advisor\')\n  )\n}',
          codeLang: 'typescript',
          spark: 'It\'s not two API calls. The advisor runs INSIDE the same streaming response. The client cannot decrypt the feedback — only the model sees it.',
          demo: 'advisor' as const,
        },
        {
          label: 'Kairos', title: 'Kairos — Tick-Driven Autonomous Agent', source: 'src/main.tsx:1048',
          description: 'Background timer injects <tick>HH:MM:SS</tick> messages every N seconds. System prompt: "treat ticks as \'you\'re awake, what now?\'" — model works, calls Sleep(), or sends a message.',
          code: '// src/main.tsx:1048\nlet kairosEnabled = false\nlet assistantTeamContext: Awaited<\n  ReturnType<NonNullable<typeof assistantModule>[\'initializeAssistantTeam\']>\n> | undefined\n\nif (feature(\'KAIROS\') && (options as {\n  assistant?: boolean\n}).assistant && assistantModule) {\n  // --assistant (Agent SDK daemon mode): force the latch before\n  // isAssistantMode() runs below. The daemon has already checked\n  // entitlement — don\'t make the child re-check tengu_kairos.\n  assistantModule.markAssistantForced()\n}\n\nif (feature(\'KAIROS\') && assistantModule?.isAssistantMode() &&\n  // Spawned teammates share the leader\'s cwd + settings.json\n  !(options as { agentId?: unknown }).agentId && kairosGate) {\n  // ...\n}',
          codeLang: 'typescript',
          spark: 'Each tick costs an API call. Cache expires after 5 min of silence. Kairos must self-regulate its own compute — by prompt text, not code.',
          demo: 'kairos' as const,
        },
      ],
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
      position: { x: 1100, y: 120 },
      width: 360,
      height: 440,
      title: 'Agent Mailbox',
      content: 'Dual message-passing — in-process pending queue for fast subagent comms, file-based mailbox for cross-process teams.',
      filePath: '/src/tools/SendMessageTool/SendMessageTool.ts',
      color: '#DC2626',
      animated: true,
      backgroundType: 'mailbox',
      storySteps: [
        { label: 'Route', title: 'SendMessage Routing', source: 'src/tools/SendMessageTool/SendMessageTool.ts:741', description: 'Routes messages: in-process → queuePendingMessage(), cross-process → writeToMailbox(). Handles structured messages (shutdown, permissions, plan approval).', code: '// src/tools/SendMessageTool/SendMessageTool.ts:741\nasync call(input, context, canUseTool, assistantMessage) {\n  if (feature(\'UDS_INBOX\') && typeof input.message === \'string\') {\n    const addr = parseAddress(input.to)\n    if (addr.scheme === \'bridge\') {\n      // Re-check handle — checkPermissions blocks on user approval\n      // (can be minutes). validateInput\'s check is stale if the\n      // bridge dropped during the prompt wait.\n      if (!getReplBridgeHandle() || !isReplBridgeActive()) {\n        return { data: { success: false,\n          message: `Remote Control disconnected — cannot deliver to ${input.to}` } }\n      }\n      const { postInterClaudeMessage } =\n        require(\'../../bridge/peerSessions.js\')\n      const result = await postInterClaudeMessage(addr.target, input.message)\n      // ...\n    }\n    if (addr.scheme === \'uds\') { /* UDS socket path */ }\n  }\n}', codeLang: 'typescript', spark: 'Two completely different transports — in-memory queue for fast sub-agent comms, file-based JSON for cross-process teams.', demo: 'mailbox-route' as const },
        { label: 'Queue', title: 'Pending Message Queue', source: 'src/tasks/LocalAgentTask/LocalAgentTask.tsx:162', description: 'In-memory queue on LocalAgentTaskState, drained at tool-round boundaries via getAgentPendingMessageAttachments() into queued_command attachments.', code: '// src/tasks/LocalAgentTask/LocalAgentTask.tsx:162\nexport function queuePendingMessage(\n  taskId: string, msg: string,\n  setAppState: (f: (prev: AppState) => AppState) => void,\n): void {\n  updateTaskState<LocalAgentTaskState>(taskId, setAppState, task => ({\n    ...task,\n    pendingMessages: [...task.pendingMessages, msg]\n  }))\n}\n\nexport function drainPendingMessages(\n  taskId: string,\n  getAppState: () => AppState,\n  setAppState: (f: (prev: AppState) => AppState) => void,\n): string[] {\n  const task = getAppState().tasks[taskId]\n  if (!isLocalAgentTask(task) || task.pendingMessages.length === 0)\n    return []\n  const drained = task.pendingMessages\n  updateTaskState<LocalAgentTaskState>(taskId, setAppState, t => ({\n    ...t, pendingMessages: []\n  }))\n  return drained\n}', codeLang: 'typescript', spark: 'Messages are drained at tool boundaries — the agent peeks between serial tools and batches, so urgent messages can redirect execution.' },
        { label: 'File', title: 'File-Based Mailbox', source: 'src/utils/teammateMailbox.ts:134', description: '~/.claude/teams/{team}/inboxes/{name}.json — file-locked writes, 1-second polling via useInboxPoller.', code: '// src/utils/teammateMailbox.ts:134\nexport async function writeToMailbox(\n  recipientName: string,\n  message: Omit<TeammateMessage, \'read\'>,\n  teamName?: string,\n): Promise<void> {\n  await ensureInboxDir(teamName)\n  const inboxPath = getInboxPath(recipientName, teamName)\n  const lockFilePath = `${inboxPath}.lock`\n\n  // Ensure the inbox file exists before locking\n  try {\n    await writeFile(inboxPath, \'[]\', { encoding: \'utf-8\', flag: \'wx\' })\n  } catch (error) {\n    const code = getErrnoCode(error)\n    if (code !== \'EEXIST\') { logError(error); return }\n  }\n\n  let release: (() => Promise<void>) | undefined\n  release = await lockfile.lock(inboxPath, {\n    lockfilePath: lockFilePath, ...LOCK_OPTIONS,\n  })\n  // Re-read messages after acquiring lock to get latest state\n  const messages = await readMailbox(recipientName, teamName)\n  // ... append and write back\n}', codeLang: 'typescript', spark: '1-second polling via useInboxPoller. File-locked writes prevent corruption when multiple agents write simultaneously.' },
      ],
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
      position: { x: 650, y: 620 },
      width: 360,
      height: 480,
      title: 'Security & Permissions',
      content: '23-point bash security validation + 4-layer permission gate. Blocks command injection, shell escapes, zsh module attacks, Unicode lookalikes, and /proc/environ exfiltration.',
      filePath: '/src/tools/BashTool/bashSecurity.ts',
      color: '#FF4040',
      animated: true,
      backgroundType: 'shield',
      storySteps: [
        { label: 'Checks', title: '23-Point Bash Security', source: 'src/tools/BashTool/bashSecurity.ts:76', description: 'Every bash command validated against 23 attack patterns: incomplete commands, jq abuse, obfuscated flags, shell metacharacters, IFS injection, command substitution, /proc/environ access, brace expansion, and more.', code: '// src/tools/BashTool/bashSecurity.ts:76\nconst BASH_SECURITY_CHECK_IDS = {\n  INCOMPLETE_COMMANDS: 1,\n  JQ_SYSTEM_FUNCTION: 2,\n  JQ_FILE_ARGUMENTS: 3,\n  OBFUSCATED_FLAGS: 4,\n  SHELL_METACHARACTERS: 5,\n  DANGEROUS_VARIABLES: 6,\n  NEWLINES: 7,\n  DANGEROUS_PATTERNS_COMMAND_SUBSTITUTION: 8,\n  DANGEROUS_PATTERNS_INPUT_REDIRECTION: 9,\n  DANGEROUS_PATTERNS_OUTPUT_REDIRECTION: 10,\n  IFS_INJECTION: 11,\n  GIT_COMMIT_SUBSTITUTION: 12,\n  PROC_ENVIRON_ACCESS: 13,\n  MALFORMED_TOKEN_INJECTION: 14,\n  BACKSLASH_ESCAPED_WHITESPACE: 15,\n  BRACE_EXPANSION: 16,\n  CONTROL_CHARACTERS: 17,\n  UNICODE_WHITESPACE: 18,\n  MID_WORD_HASH: 19,\n  ZSH_DANGEROUS_COMMANDS: 20,\n  BACKSLASH_ESCAPED_OPERATORS: 21,\n  COMMENT_QUOTE_DESYNC: 22,\n  QUOTED_NEWLINE: 23,\n} as const', codeLang: 'typescript', spark: '23 security checks. Each catches attacks the others miss. Defense in depth, not defense in abstraction.' },
        { label: 'Zsh', title: 'Zsh Module Attack Prevention', source: 'src/tools/BashTool/bashSecurity.ts:45', description: 'Blocks 18 commands: zmodload (loads mapfile, system, zpty, net/tcp modules), emulate -c (eval equivalent), sysopen, sysread, ztcp, zsocket, zf_rm, and more.', terminal: { command: 'zmodload zsh/net/tcp', output: '✗ BLOCKED: zmodload is the gateway to raw TCP, filesystem, and pseudo-terminal attacks' }, spark: 'zmodload is the gateway to everything: raw TCP (network exfiltration), filesystem (invisible file I/O), pseudo-terminals (command execution). One command to rule them all.' },
        { label: 'Exploit', title: '/dev/null Boundary Exploit', source: 'src/tools/BashTool/bashSecurity.ts:176', description: 'Without (?=\\s|$) boundary, "> /dev/nullo" matches "/dev/null" as PREFIX → strips it → "echo hi > /dev/nullo" becomes "echo hi o" → the write to /dev/nullo is auto-allowed.', code: '// src/tools/BashTool/bashSecurity.ts:176\nfunction stripSafeRedirections(content: string): string {\n  // SECURITY: All three patterns MUST have a trailing boundary (?=\\s|$).\n  // Without it, `> /dev/nullo` matches `/dev/null` as a PREFIX, strips\n  // `> /dev/null` leaving `o`, so `echo hi > /dev/nullo` becomes `echo hi o`.\n  // validateRedirections then sees no `>` and passes. The file write to\n  // /dev/nullo is auto-allowed via the read-only path.\n  return content\n    .replace(/\\s+2\\s*>&\\s*1(?=\\s|$)/g, \'\')\n    .replace(/[012]?\\s*>\\s*\\/dev\\/null(?=\\s|$)/g, \'\')\n    .replace(/\\s*<\\s*\\/dev\\/null(?=\\s|$)/g, \'\')\n}', codeLang: 'typescript', spark: 'Without three characters — (?=\\s|$) — an attacker can write to any path starting with /dev/null.' },
        { label: 'Gate', title: '4-Layer Permission Gate', source: 'src/hooks/toolPermission/PermissionContext.ts:63', description: 'Layer 1: auto-approve reads. Layer 2: safe-bash prefix list (29 patterns). Layer 3: hook-based decisions. Layer 4: interactive y/N/a prompt.', code: '// src/hooks/toolPermission/PermissionContext.ts:63\ntype ResolveOnce<T> = {\n  resolve(value: T): void\n  isResolved(): boolean\n  // Atomically check-and-mark as resolved. Returns true if\n  // this caller won the race (nobody else has resolved yet).\n  // Use in async callbacks BEFORE awaiting, to close the\n  // window between isResolved() check and resolve() call.\n  claim(): boolean\n}\n\nfunction createResolveOnce<T>(resolve: (value: T) => void): ResolveOnce<T> {\n  let claimed = false\n  let delivered = false\n  return {\n    resolve(value: T) {\n      if (delivered) return\n      delivered = true; claimed = true\n      resolve(value)\n    },\n    isResolved() { return claimed },\n    claim() {\n      if (claimed) return false\n      claimed = true\n      return true\n    },\n  }\n}', codeLang: 'typescript', spark: 'Three async handlers race to resolve one permission: user dialog, bash classifier, and hooks. Atomic claim() ensures exactly one wins. Called BEFORE awaiting to close the race window.', demo: 'permission-gate' as const },
      ],
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
      position: { x: 200, y: 520 },
      width: 360,
      height: 480,
      title: 'Prompt Caching',
      content: 'Ephemeral KV-cache breakpoints on the Anthropic API — cache system prompts, tool schemas, and conversation prefixes to avoid re-processing thousands of tokens every turn.',
      filePath: '/src/services/api/claude.ts',
      color: '#059669',
      diagramId: 'cache-economics',
      animated: true,
      backgroundType: 'cache',
      storySteps: [
        {
          label: 'Cost', title: 'The Cost Problem', description: 'Every API call sends the full context. 100K tokens at Opus pricing = ~$1.50/call. Over 50 calls/session = $75. Cache reads cost 90% less — the same tokens cost ~10× less when cached.',
          spark: '$75/session → $10 with caching. That single optimization is what makes the product economically viable.',
          demo: 'cache-cost' as const,
        },
        {
          label: 'Latches', title: 'Beta Feature Latches — Preserve Despite Toggle', source: 'src/services/api/claude.ts:1405',
          description: 'Beta headers like fast-mode, cache-editing, and extended-thinking are "latched ON" once first activated. Even if you toggle the feature off mid-session, the header keeps being sent — because changing it would bust the server-side cache key and invalidate 50-70K cached tokens.',
          code: '// src/services/api/claude.ts:1405\n// Sticky-on latches for dynamic beta headers. Each header, once first\n// sent, keeps being sent for the rest of the session so mid-session\n// toggles don\'t change the server-side cache key and bust ~50-70K tokens.\n// Latches are cleared on /clear and /compact via clearBetaHeaderLatches().\n\nlet afkHeaderLatched = getAfkModeHeaderLatched() === true\nif (feature(\'TRANSCRIPT_CLASSIFIER\')) {\n  if (!afkHeaderLatched && isAgenticQuery &&\n      shouldIncludeFirstPartyOnlyBetas() &&\n      (autoModeStateModule?.isAutoModeActive() ?? false)) {\n    afkHeaderLatched = true\n    setAfkModeHeaderLatched(true)\n  }\n}\n\nlet fastModeHeaderLatched = getFastModeHeaderLatched() === true\nif (!fastModeHeaderLatched && isFastMode) {\n  fastModeHeaderLatched = true\n  setFastModeHeaderLatched(true)\n}',
          codeLang: 'typescript',
          spark: 'Pressing Shift+K to toggle fast mode would waste $0.07 in cached tokens. So they make the toggle permanent. The UI lies to you for your own financial benefit.',
        },
        {
          label: 'Breaks', title: '16-Factor Cache Break Logging', source: 'src/services/api/promptCacheBreakDetection.ts:247',
          description: 'Before every API call, 16+ factors are hashed. After the response, if cache_read_input_tokens drops >5% or >2K tokens, the logger identifies which factor changed and logs the cause.',
          code: '// src/services/api/promptCacheBreakDetection.ts:247\nexport function recordPromptState(snapshot: PromptStateSnapshot): void {\n  const {\n    system, toolSchemas, querySource, model, agentId,\n    fastMode, globalCacheStrategy = \'\', betas = [],\n    autoModeActive = false, isUsingOverage = false,\n    cachedMCEnabled = false, effortValue, extraBodyParams,\n  } = snapshot\n  const key = getTrackingKey(querySource, agentId)\n  if (!key) return\n\n  const strippedSystem = stripCacheControl(\n    system as unknown as ReadonlyArray<Record<string, unknown>>,\n  )\n  const strippedTools = stripCacheControl(\n    toolSchemas as unknown as ReadonlyArray<Record<string, unknown>>,\n  )\n  // ... hashes 16+ factors, flags drops >5% or >2K tokens\n}',
          codeLang: 'typescript',
          spark: 'The log tracks factors marked "should NOT break cache anymore" — meaning each entry represents a past bug that was fixed and then verified.',
        },
        {
          label: 'Edit', title: 'Microcompact Intentionally Breaks the Cache', source: 'src/services/compact/microCompact.ts:305',
          description: 'Microcompact sends cache_edits to delete old tool results from the server\'s KV cache. This deliberately causes a partial cache miss — but the break detector is told to suppress the alert so it\'s not flagged as an error.',
          code: '// src/services/compact/microCompact.ts:305\nasync function cachedMicrocompactPath(\n  messages: Message[],\n  querySource: QuerySource | undefined,\n): Promise<MicrocompactResult> {\n  const mod = await getCachedMCModule()\n  const state = ensureCachedMCState()\n  const config = mod.getCachedMCConfig()\n  // ... tracks tool results, queues cache edits for API layer\n  // Does NOT modify local message content\n  // cache_reference and cache_edits are added at API layer\n  // Uses count-based trigger/keep thresholds from GrowthBook config\n}',
          codeLang: 'typescript',
          spark: 'Microcompact breaks the cache on purpose. Then it tells the cache break detector to ignore it. One system lies to another to prevent false positives.',
        },
      ],
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
      position: { x: 1100, y: 660 },
      width: 360,
      height: 480,
      title: 'Hooks',
      content: '27 lifecycle events — shell commands, LLM prompts, or HTTP webhooks that can block, modify, or observe every tool call.',
      filePath: '/src/utils/hooks.ts',
      color: '#EA580C',
      diagramId: 'hook-lifecycle',
      animated: true,
      backgroundType: 'hooks',
      storySteps: [
        { label: 'What', title: '27 Lifecycle Hook Events', source: 'src/utils/hooks.ts', description: 'Shell commands, LLM prompts, HTTP webhooks, or TypeScript callbacks that fire at 27 lifecycle points — PreToolUse, PostToolUse, Stop, SessionStart/End, UserPromptSubmit, PreCompact, and more. All receive JSON context.', code: '// ~/.claude/settings.json\n{\n  "hooks": {\n    "PreToolUse": [{\n      "matcher": "Bash",\n      "hooks": [{ "type": "command", "command": "validate.py" }]\n    }],\n    "Stop": [{\n      "hooks": [{ "type": "command", "command": "npm test || exit 2" }]\n    }]\n  }\n}', codeLang: 'json', spark: 'The hooks file is 5,022 lines — bigger than the agentic loop itself. The extensibility layer is more complex than the core.' },
        { label: 'Stop', title: 'Stop Hook — Set Exit Conditions', source: 'src/utils/hooks.ts:3639', description: 'Fires when the model thinks it\'s done. Return exit code 2 → blocking feedback injected → model MUST continue. Use this to enforce any condition before the loop exits.', code: '// Model cannot exit until ALL conditions pass:\n{\n  "Stop": [{\n    "hooks": [{\n      "type": "command",\n      // exit 2 = blocking, model must keep working\n      "command": "bash -c \'if ! npm test 2>/dev/null; then echo Tests failing >&2; exit 2; fi\'"\n    }]\n  }]\n}\n\n// Other exit conditions you can enforce:\n// - lint passes\n// - coverage threshold met\n// - PR description written\n// - no TODO comments remain', codeLang: 'json', spark: 'The model literally cannot stop until your conditions pass. This isn\'t code validation — it\'s making the model keep working until reality matches your requirements.', demo: 'hook-stop' as const },
      ],
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

    // ════════════════════════════════════════════════════════════
    //  ROW 3 — Compaction (below caching)
    // ════════════════════════════════════════════════════════════
    {
      id: COMPACT_ID,
      position: { x: 650, y: 1160 },
      width: 360,
      height: 480,
      title: 'Compaction',
      content: 'Context management — summarizes old messages when tokens run high. 5-layer pipeline from cheap to expensive.',
      filePath: '/src/services/compact/compact.ts',
      color: '#0891B2',
      diagramId: 'compaction-pipeline',
      animated: true,
      backgroundType: 'compactor',
      storySteps: [
        {
          label: 'Estimate', title: 'Token Estimation — chars / 3.5', source: 'src/services/compact/autoCompact.ts',
          description: 'Claude Code never calls the tokenizer API — too slow. Instead it estimates: chars ÷ 3.5 for most content, chars ÷ 2 for JSON (JSON is token-dense). Compaction fires at 70% of the context window.',
          code: '// src/services/tokenEstimation.ts:203\nexport function roughTokenCountEstimation(\n  content: string,\n  bytesPerToken: number = 4,\n): number {\n  return Math.round(content.length / bytesPerToken)\n}\n\n// Dense JSON: many single-char tokens ({, }, :, \", ,)\nexport function bytesPerTokenForFileType(ext: string): number {\n  switch (ext) {\n    case \'json\': case \'jsonl\': case \'jsonc\': return 2\n    default: return 4\n  }\n}\n\n// src/services/compact/autoCompact.ts:241\nexport async function autoCompactIfNeeded(\n  messages: Message[], toolUseContext: ToolUseContext,\n  cacheSafeParams: CacheSafeParams, querySource?: QuerySource,\n  tracking?: AutoCompactTrackingState,\n): Promise<{ wasCompacted: boolean; compactionResult?: CompactionResult }> {\n  if (isEnvTruthy(process.env.DISABLE_COMPACT)) {\n    return { wasCompacted: false }\n  }\n  // Circuit breaker: stop retrying after N consecutive failures\n}',
          codeLang: 'typescript',
          spark: 'chars ÷ 3.5 for text, chars ÷ 2 for JSON. A rough estimate that\'s fast enough to run every turn without slowing the loop.',
        },
        {
          label: 'Micro', title: 'Microcompact — Two Paths', source: 'src/services/compact/microCompact.ts:253',
          description: 'Path 1 (cache warm): sends cache_edits to delete old tool results from the server cache — no retransmission, cache stays intact. Path 2 (cache cold, >60min gap): mutates local messages directly. The 60-min trigger matches the server\'s 1-hour cache TTL.',
          code: '// src/services/compact/microCompact.ts:253\nexport async function microcompactMessages(\n  messages: Message[],\n  toolUseContext?: ToolUseContext,\n  querySource?: QuerySource,\n): Promise<MicrocompactResult> {\n  clearCompactWarningSuppression()\n\n  // Path 1: Time-based trigger — cache expired (>60min gap)\n  // Content-clear old tool results before the request\n  const timeBasedResult = maybeTimeBasedMicrocompact(messages, querySource)\n  if (timeBasedResult) { return timeBasedResult }\n\n  // Path 2: Cached MC — uses cache editing API to remove\n  // tool results without invalidating the cached prefix\n  if (feature(\'CACHED_MICROCOMPACT\')) {\n    const mod = await getCachedMCModule()\n    const model = toolUseContext?.options.mainLoopModel ?? getMainLoopModel()\n    if (mod.isCachedMicrocompactEnabled() &&\n        mod.isModelSupportedForCacheEditing(model) &&\n        isMainThreadSource(querySource)) {\n      return await cachedMicrocompactPath(messages, querySource)\n    }\n  }\n  return { messages }\n}',
          codeLang: 'typescript',
          spark: 'Microcompact deletes from the server\'s cache without touching your local messages. The cache break detector is told to ignore the expected token drop.',
        },
        {
          label: 'Full', title: 'Full LLM Compaction', source: 'src/services/compact/compact.ts:387',
          description: 'Sends old messages to Claude for a 9-section structured summary. Reserves 20K output tokens. Replaces originals with a compact boundary linked list.',
          code: '// src/services/compact/compact.ts:387\nexport async function compactConversation(\n  messages: Message[],\n  context: ToolUseContext,\n  cacheSafeParams: CacheSafeParams,\n  suppressFollowUpQuestions: boolean,\n  customInstructions?: string,\n  isAutoCompact: boolean = false,\n  recompactionInfo?: RecompactionInfo,\n): Promise<CompactionResult> {\n  if (messages.length === 0) {\n    throw new Error(ERROR_MESSAGE_NOT_ENOUGH_MESSAGES)\n  }\n\n  const preCompactTokenCount = tokenCountWithEstimation(messages)\n  const appState = context.getAppState()\n  void logPermissionContextForAnts(appState.toolPermissionContext, \'summary\')\n\n  context.onCompactProgress?.({\n    type: \'hooks_start\', hookType: \'pre_compact\',\n  })\n  // Execute PreCompact hooks, then 9-section structured summary\n}',
          codeLang: 'typescript',
          spark: 'The compact boundary is a linked list of UUIDs over messages. Survives disk round-trips and crash recovery — sessions resume exactly where they left off.',
          demo: 'compaction' as const,
        },
      ],
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
  connections: [],
  selectedTileId: null,
  openDiagramId: null,
  openSubItemData: null,
  divedTileId: null,

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
  diveTile: (id: string) => set({ divedTileId: id }),
  undive: () => {
    // Clear dive but preserve presentation state — user returns to where they were
    const { presentationActive, presentationStepIndex } = useBoardStore.getState();
    set({ divedTileId: null });
    // Re-navigate to current step to restore pan/zoom position
    if (presentationActive && presentationStepIndex >= 0) {
      useBoardStore.getState().goToStep(presentationStepIndex);
    }
  },
}));
