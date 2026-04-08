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
      storySteps: [
        { label: 'Layers', title: 'Three Memory Layers', source: 'src/utils/claudemd.ts:92', description: 'Layer 1: ~/.claude/CLAUDE.md (global). Layer 2: ./CLAUDE.md + .claude/rules/*.md (project). Layer 3: CLAUDE.local.md (local, gitignored). Later overrides earlier.', spark: 'Users extend the system prompt by writing CLAUDE.md files. It\'s user-accessible prompt engineering that modifies AI behavior without touching code.' },
        { label: 'Include', title: '@include Directives', source: 'src/utils/claudemd.ts:336', description: 'Memory files can reference other files: @./path, @~/home, @/absolute. Circular reference prevention, binary file blocking, HTML comment stripping.', spark: 'You can build a tree of instructions via @include. Circular references are detected and prevented.' },
        { label: 'Verify', title: 'Memory Verification', description: '"A memory that names a file path is a claim it existed when the memory was written. Before recommending it: check the file exists. If memory conflicts with current code, trust what you observe now."', spark: '"Memory says X exists" is NOT the same as "X exists now." The system prompt instructs the model to verify before recommending.' },
        { label: 'Auto', title: 'Auto-Memory System', source: 'src/memdir/memoryScan.ts:13', description: 'Saves runtime memories to ~/.claude/projects/{hash}/MEMORY.md. Frontmatter with name, description, type. Max 40K chars, 200 lines per file, 60KB per session.', spark: '4 memory types: user (preferences), feedback (corrections), project (initiatives), reference (external pointers). Each with different scope and lifetime.' },
      ],
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
      storySteps: [
        { label: 'Layers', title: '8-Layer System Prompt', source: 'src/constants/prompts.ts:444', description: 'Identity → tool descriptions (53+) → coding guidelines → environment → git info → CLAUDE.md → memory → autonomous section.', spark: '8 lines of loop. 700 lines of prompt. The prompt IS the framework. When Claude gets smarter, Claude Code automatically gets smarter.' },
        { label: 'Boundary', title: 'Cache Boundary Split', source: 'src/constants/prompts.ts:115', description: '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__ splits static from dynamic. Static prefix (~15K tokens) cached at scope:global — shared across ALL users.', spark: 'One marker in one file saves 90% on 15K tokens for every user. That\'s the most cost-effective line of code in the entire codebase.' },
        { label: 'Memo', title: 'Section Memoization', source: 'src/constants/systemPromptSections.ts', description: 'systemPromptSection() caches until /clear. DANGEROUS_uncachedSystemPromptSection() recomputes every turn (breaks cache if changed).', spark: 'The prefix "DANGEROUS_" in the function name forces engineers to document why a section needs per-turn recomputation. Convention as safety.' },
        { label: 'Modes', title: 'Prompt Mode Switching', source: 'src/utils/systemPrompt.ts:41', description: 'Same loop, different prompt: Default (coding assistant), Coordinator (orchestrate workers), Proactive/Kairos (autonomous with Sleep), Custom Agent (explore, plan, verify).', spark: 'The entire behavior of Claude Code changes by swapping prompt text. No code changes. No new features. Just different instructions to the same loop.' },
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
      storySteps: [
        {
          label: 'Input',
          title: 'User Input',
          source: 'src/components/TextInput.tsx',
          description: 'User types a message or pipes input through stdin. Ink\'s TextInput component captures keystrokes in interactive mode.',
          terminal: { command: 'Find all TODO comments in src/ and fix them', output: '' },
        },
        {
          label: 'while(true)',
          title: 'The Core Loop',
          source: 'src/query.ts:307',
          description: 'The entire agentic architecture is a while(true) loop. No LangChain, no state machine, no decision tree. Just: stream → detect tool_use → execute → repeat.',
          code: 'while (true) {\n  // 1. Compact context if needed\n  maybe_compact(state, config)\n  // 2. Stream from provider\n  for event in stream(model, system, messages, tools):\n    yield event\n  // 3. If no tool_calls → break\n  if not assistant_turn.tool_calls:\n    break\n  // 4. Execute tools, append results\n  for tc in tool_calls:\n    result = execute_tool(tc)\n    messages.append(result)\n}',
          codeLang: 'python',
          spark: 'This is the entire framework. 8 lines of loop. 700 lines of prompt. The prompt IS the framework.',
        },
        {
          label: 'Stream',
          title: 'API Call & Streaming',
          source: 'src/services/api/claude.ts:1017',
          description: 'queryModelWithStreaming() sends the full context to Claude. Response streams as message_start → content_block_delta → message_stop events.',
          code: 'const result = await anthropic.beta.messages\n  .create(\n    { ...params, stream: true },\n    { signal, headers: { [CLIENT_REQUEST_ID_HEADER]: requestId } }\n  )\n  .withResponse()',
          codeLang: 'typescript',
          spark: 'withRetry() handles 10 retries, fast-mode cooldown, 529→fallback model cascade, and context window overflow — all transparently.',
        },
        {
          label: 'Tools?',
          title: 'Detect Tool Calls',
          source: 'src/query.ts:826',
          description: 'If the response contains tool_use content blocks, set needsFollowUp = true. Otherwise, check 16 different termination conditions.',
          spark: '16 termination conditions — the loop is 8 lines, the exits are 1,300 lines of recovery cascades.',
          footer: 'Exit reasons: completed, max_turns, aborted_streaming, aborted_tools, prompt_too_long, model_error, image_error, stop_hook_prevented, hook_stopped, blocking_limit, max_output_tokens, token_budget, and more.',
        },
        {
          label: 'Execute',
          title: 'Tool Execution',
          source: 'src/services/tools/toolOrchestration.ts:19',
          description: 'partitionToolCalls() groups tools by concurrency safety. Read-only tools (Read, Glob, Grep) run 10-parallel. Write tools (Edit, Bash) run serially.',
          code: 'function partitionToolCalls(blocks) {\n  // isConcurrencySafe() → batch together\n  // otherwise → new serial batch\n  // Result: [[Read, Glob, Grep], [Edit], [Bash]]\n}',
          codeLang: 'typescript',
          spark: 'Read-only tools run 10-parallel. Output truncated at 32K chars with first-half + last-quarter strategy.',
        },
        {
          label: 'Loop',
          title: 'State Update → Continue',
          source: 'src/query.ts:1715',
          description: 'Tool results appended to messages. Recovery counters reset. State updated. Loop continues.',
          code: 'state = {\n  messages: [...messagesForQuery, ...assistantMessages, ...toolResults],\n  turnCount: nextTurnCount,\n  maxOutputTokensRecoveryCount: 0,\n  hasAttemptedReactiveCompact: false,\n  transition: { reason: "next_turn" },\n}',
          codeLang: 'typescript',
          spark: 'Same loop powers coding assistant, coordinator, autonomous agent — only the prompt changes. When Claude gets smarter, Claude Code automatically gets smarter.',
        },
      ],
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
      storySteps: [
        { label: 'Spawn', title: 'AgentTool Spawns Sub-Agent', source: 'src/tools/AgentTool/runAgent.ts:248', description: 'Creates a new query() call with isolated context — separate message history, file state cache, abort controller. 5 built-in types: coder, reviewer, researcher, tester, general-purpose.', spark: 'Each sub-agent runs its own while(true) loop. It\'s turtles all the way down.' },
        { label: 'Fork', title: 'Fork-Join KV Cache Exploit', source: 'src/tools/AgentTool/forkSubagent.ts:107', description: 'Fork children construct byte-identical API request prefixes — same system prompt, same tools, same history, identical placeholder tool results. Only the final directive text differs per child.', code: 'const FORK_PLACEHOLDER_RESULT = "Fork started — processing in background"\nconst toolResultBlocks = toolUseBlocks.map(block => ({\n  type: "tool_result",\n  tool_use_id: block.id,\n  content: [{ type: "text", text: FORK_PLACEHOLDER_RESULT }],\n}))\n// → Only the directive after these placeholders differs per fork', codeLang: 'typescript', spark: 'A 100K-token context fork costs ~1K new tokens. The KV cache is fully reused. This is the trick that makes coordinator mode economically viable.' },
        { label: 'Coordinate', title: 'Coordinator Mode', source: 'src/coordinator/coordinatorMode.ts:111', description: 'Orchestrates parallel workers through 4 phases: Investigate (parallel research) → Synthesize (coordinator reads findings) → Implement (targeted changes) → Verify (test everything).', spark: '"Never write \'based on your findings\' — that delegates understanding to the worker. Synthesize the findings yourself." This is enforced by PROMPT TEXT, not code.' },
        { label: 'Worktree', title: 'Worktree Isolation', description: 'isolation="worktree" creates a temporary git branch + directory. Parallel agents edit files without merge conflicts. Auto-cleanup on agent exit.', terminal: { command: 'git worktree add /tmp/agent-abc feat/agent-abc', output: 'Preparing worktree (new branch \'feat/agent-abc\')' } },
        { label: 'Advisor', title: 'Advisor Model (Server-Side)', source: 'src/utils/advisor.ts', description: 'A server-side tool where Haiku ($0.001) silently reviews Opus\'s work mid-generation. Returns advisor_tool_result — some encrypted as advisor_redacted_result (can\'t decrypt client-side).', spark: 'Haiku costs $0.001 per review. Catches mistakes before Opus spends $0.15. The prompt says: "Give advice serious weight — only override with empirical evidence."' },
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
      position: { x: 1830, y: 50 },
      width: 360,
      height: 440,
      title: 'Agent Mailbox',
      content: 'Dual message-passing — in-process pending queue for fast subagent comms, file-based mailbox for cross-process teams.',
      filePath: '/src/tools/SendMessageTool/SendMessageTool.ts',
      color: '#DC2626',
      animated: true,
      backgroundType: 'mailbox',
      storySteps: [
        { label: 'Route', title: 'SendMessage Routing', source: 'src/tools/SendMessageTool/SendMessageTool.ts:741', description: 'Routes messages: in-process → queuePendingMessage(), cross-process → writeToMailbox(). Handles structured messages (shutdown, permissions, plan approval).', spark: 'Two completely different transports — in-memory queue for fast sub-agent comms, file-based JSON for cross-process teams.' },
        { label: 'Queue', title: 'Pending Message Queue', description: 'In-memory queue on LocalAgentTaskState, drained at tool-round boundaries via getAgentPendingMessageAttachments() into queued_command attachments.', spark: 'Messages are drained at tool boundaries — the agent peeks between serial tools and batches, so urgent messages can redirect execution.' },
        { label: 'File', title: 'File-Based Mailbox', source: 'src/utils/teammateMailbox.ts:134', description: '~/.claude/teams/{team}/inboxes/{name}.json — file-locked writes, 1-second polling via useInboxPoller.', spark: '1-second polling via useInboxPoller. File-locked writes prevent corruption when multiple agents write simultaneously.' },
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
      position: { x: 50, y: 600 },
      width: 360,
      height: 480,
      title: 'Security & Permissions',
      content: '23-point bash security validation + 4-layer permission gate. Blocks command injection, shell escapes, zsh module attacks, Unicode lookalikes, and /proc/environ exfiltration.',
      filePath: '/src/tools/BashTool/bashSecurity.ts',
      color: '#FF4040',
      animated: true,
      backgroundType: 'shield',
      storySteps: [
        { label: 'Checks', title: '23-Point Bash Security', source: 'src/tools/BashTool/bashSecurity.ts:76', description: 'Every bash command validated against 23 attack patterns: incomplete commands, jq abuse, obfuscated flags, shell metacharacters, IFS injection, command substitution, /proc/environ access, brace expansion, and more.', spark: '23 security checks. Each catches attacks the others miss. Defense in depth, not defense in abstraction.' },
        { label: 'Zsh', title: 'Zsh Module Attack Prevention', source: 'src/tools/BashTool/bashSecurity.ts:45', description: 'Blocks 18 commands: zmodload (loads mapfile, system, zpty, net/tcp modules), emulate -c (eval equivalent), sysopen, sysread, ztcp, zsocket, zf_rm, and more.', terminal: { command: 'zmodload zsh/net/tcp', output: '✗ BLOCKED: zmodload is the gateway to raw TCP, filesystem, and pseudo-terminal attacks' }, spark: 'zmodload is the gateway to everything: raw TCP (network exfiltration), filesystem (invisible file I/O), pseudo-terminals (command execution). One command to rule them all.' },
        { label: 'Exploit', title: '/dev/null Boundary Exploit', source: 'src/tools/BashTool/bashSecurity.ts:176', description: 'Without (?=\\s|$) boundary, "> /dev/nullo" matches "/dev/null" as PREFIX → strips it → "echo hi > /dev/nullo" becomes "echo hi o" → the write to /dev/nullo is auto-allowed.', code: '// SECURITY: All patterns MUST have trailing boundary (?=\\s|$).\n// Without it, > /dev/nullo matches /dev/null as PREFIX,\n// strips > /dev/null leaving "o", so\n// echo hi > /dev/nullo becomes echo hi o\n.replace(/[012]?\\s*>\\s*\\/dev\\/null(?=\\s|$)/g, \'\')', codeLang: 'typescript', spark: 'Without three characters — (?=\\s|$) — an attacker can write to any path starting with /dev/null.' },
        { label: 'Gate', title: '4-Layer Permission Gate', source: 'src/hooks/toolPermission/PermissionContext.ts:63', description: 'Layer 1: auto-approve reads. Layer 2: safe-bash prefix list (29 patterns). Layer 3: hook-based decisions. Layer 4: interactive y/N/a prompt.', spark: 'Three async handlers race to resolve one permission: user dialog, bash classifier, and hooks. Atomic claim() ensures exactly one wins. Called BEFORE awaiting to close the race window.' },
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
      storySteps: [
        { label: 'Cost', title: 'The Cost Problem', description: 'Every API call sends the full context. 100K tokens at Opus pricing = ~$1.50/call. Over 50 calls/session = $75. Cache reads cost 90% less.', spark: '$75/session → $10 with caching. That single optimization is what makes the product economically viable.' },
        { label: 'Latches', title: 'Sticky-On Beta Header Latches', source: 'src/services/api/claude.ts:1405', description: 'Once a beta header is sent, it stays ON for the session. Toggling fast mode would bust ~50-70K cached tokens.', code: '// Sticky-on latches for dynamic beta headers. Each header, once first\n// sent, keeps being sent so mid-session toggles don\'t change the\n// server-side cache key and bust ~50-70K tokens.\nlet fastModeHeaderLatched = getFastModeHeaderLatched()\nif (!fastModeHeaderLatched && isFastMode) {\n  fastModeHeaderLatched = true\n  setFastModeHeaderLatched(true) // permanent for session\n}', codeLang: 'typescript', spark: 'Pressing Shift+K to toggle fast mode would waste $0.07 in cached tokens. So they latch the header ON forever. This is the level of cost obsession.' },
        { label: 'Detect', title: '16-Factor Cache Break Detection', source: 'src/services/api/promptCacheBreakDetection.ts:247', description: 'Hashes 16+ factors before each call. If cache_read_input_tokens drops >5% or >2K tokens, it attributes the cause.', spark: 'The detector tracks factors that "should NOT break cache anymore" — meaning they USED to break it, and the fix needed verification.' },
        { label: 'Edit', title: 'Microcompact Cache Editing', source: 'src/services/compact/microCompact.ts:305', description: 'Adds cache_reference to tool_result blocks. Sends cache_edits with delete requests. Server removes content from cache without client retransmitting.', spark: 'Deletes content from the server\'s cache without touching local messages. The prompt cache break detector suppresses the expected token drop so it\'s not flagged as a cache miss.' },
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
      storySteps: [
        { label: 'Events', title: '27 Lifecycle Events', source: 'src/utils/hooks.ts', description: 'PreToolUse, PostToolUse, Stop, SessionStart/End, SubagentStart/Stop, PermissionRequest, UserPromptSubmit, FileChanged, ConfigChange, PreCompact/PostCompact, and 15 more.', spark: 'The hooks file is 5,022 lines — bigger than the agentic loop itself. The extensibility layer is more complex than the core.' },
        { label: 'Types', title: '5 Hook Types', description: 'Shell command (spawn + JSON I/O), LLM prompt (model evaluates safety), HTTP POST (webhook), Agent (structured reasoning), TypeScript callback (inline function). All receive JSON context.', code: '{\n  "hooks": {\n    "PreToolUse": [{\n      "matcher": "Bash",\n      "hooks": [{\n        "type": "command",\n        "command": "python3 validate_command.py",\n        "timeout": 5\n      }]\n    }]\n  }\n}', codeLang: 'json' },
        { label: 'Block', title: 'PreToolUse — Block or Modify', source: 'src/utils/hooks.ts:3394', description: 'Runs before every tool call. Can deny execution, modify input (updatedInput), approve, or inject additionalContext. Fast-path for trusted tools.', spark: 'A hook can silently rewrite what a tool sees. The model never knows the hook intervened.' },
        { label: 'Stop', title: 'Stop Hook — Force Continue', source: 'src/utils/hooks.ts:3639', description: 'Fires when the model thinks it\'s done. If the hook returns exit code 2, the model gets blocking feedback and CONTINUES.', code: '// The model literally cannot stop until tests pass:\n"command": "bash -c \'if ! npm test 2>/dev/null; then echo Tests failing >&2; exit 2; fi\'"', codeLang: 'bash', spark: 'The model literally cannot stop until tests pass. This is how you enforce quality gates — not by code validation, but by making the model keep working.' },
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
      storySteps: [
        { label: 'How', title: 'Server-Side Tool', source: 'src/utils/advisor.ts:9', description: 'Opus calls server_tool_use(name="advisor") during generation → API routes to Haiku internally → Haiku returns feedback → Opus reads it and continues. All inside one streaming response.', spark: 'It\'s not two API calls. The advisor runs INSIDE the same API call via a server-side tool. The client never makes a second request.' },
        { label: 'Encrypt', title: 'Encrypted Feedback', source: 'src/utils/advisor.ts:16', description: 'advisor_redacted_result blocks contain encrypted_content — can\'t be decrypted client-side. The main model sees feedback server-side; the user only sees "Advisor reviewed."', spark: 'The advisor can say things the user can\'t see. Encrypted feedback for internal reasoning and risk assessment.' },
        { label: 'When', title: 'When to Advise', source: 'src/utils/advisor.ts:130', description: 'Call BEFORE substantive work, AFTER task completion, when STUCK. On conflict between data and advice: do a reconciliation call, not a silent switch.', spark: '"Give advice serious weight — only override with empirical evidence." The model is told to TRUST the advisor over its own judgment unless it has proof.' },
        { label: 'Cost', title: 'Cost Asymmetry', description: 'Haiku call costs ~$0.001. Catches mistakes before Opus spends $0.15. Advisor tokens billed at advisor model rate, tracked separately.', spark: 'A $0.001 Haiku call that catches one mistake saves $0.15 of wasted Opus output. 150:1 leverage ratio.' },
      ],
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
      storySteps: [
        { label: 'YOLO', title: 'YOLO Classifier', source: 'src/utils/permissions/yoloClassifier.ts', description: 'LLM call evaluates tool safety — returns shouldBlock boolean. One classifier call per tool boundary, zero cost for safe-listed tools.', spark: 'It\'s literally called "YOLO Classifier" in the source code. That\'s the actual variable name.' },
        { label: 'Ticks', title: 'Kairos Tick Timer', source: 'src/main.tsx:1048', description: 'Background timer injects <tick>HH:MM:SS</tick> messages every N seconds. The system prompt says: "treat ticks as \'you\'re awake, what now?\'"', spark: 'Each wake-up costs an API call, but the prompt cache expires after 5 minutes of inactivity — balance accordingly. This is cache-aware autonomous pacing.' },
        { label: 'Tools', title: 'Sleep + SendUserMessage', description: 'Sleep pauses ticks while waiting. SendUserMessage is the agent-to-user channel — plain text output may not be visible, put important results here.', spark: 'The prompt says: "If you have nothing useful to do on a tick, you MUST call Sleep. Never respond with only a status message — that wastes a turn and burns tokens."' },
        { label: 'Setup', title: 'Permission Setup', source: 'src/utils/permissions/permissionSetup.ts:689', description: 'CLI initialization: resolves --permission-mode auto, checks feature gates, strips dangerous permissions.', spark: 'Bash(*) and Agent(*) are stripped before auto mode starts. The most dangerous tool permissions are removed, not just gated.' },
      ],
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
      storySteps: [
        { label: 'Estimate', title: 'Token Estimation', source: 'src/services/compact/autoCompact.ts', description: 'Estimates tokens at ~3.5 chars/token. Fires at 70% of context window (effective_context - 13K buffer).', spark: 'The threshold is 70%. Below that, nothing happens. Above it, the 5-layer cascade kicks in — from free (snip) to expensive (LLM summary).' },
        { label: 'Micro', title: 'Microcompact (Two Paths)', source: 'src/services/compact/microCompact.ts:253', description: 'Path 1 (cache warm): cache_edits delete from server cache without retransmitting. Path 2 (cache cold, 60min gap): mutate local messages directly.', spark: 'The 60-minute gap trigger matches the server\'s 1-hour cache TTL. If you were away for lunch, the cache is cold anyway — just rewrite the messages.' },
        { label: 'Full', title: 'Full LLM Compaction', source: 'src/services/compact/compact.ts:387', description: 'Sends old messages to Claude for 9-section structured summary: Primary Request, Key Concepts, Files & Code, Errors & Fixes, All User Messages, Pending Tasks, Current Work, Next Step.', spark: 'The compact boundary is a linked list: headUuid → anchorUuid → tailUuid. Messages survive disk round-trips and crash recovery via serializable UUID pointers.' },
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
  divedTileId: null,

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
  diveTile: (id: string) => set({ divedTileId: id }),
  undive: () => set({ divedTileId: null }),
}));
