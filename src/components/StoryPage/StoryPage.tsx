import { useState, useRef } from 'react';
import { HeroSection } from './HeroSection';
import { Section } from './Section';
import { StoryTimeline, type StoryStepData } from './StoryTimeline';
import { TerminalMockup } from './TerminalMockup';
import { StickyNav } from './StickyNav';
import './StoryPage.css';

// ── Section definitions ──────────────────────────────────────────

const SECTIONS = [
  { id: 'sec-loop', label: 'Agent Loop', color: '#c9a84c' },
  { id: 'sec-agents', label: 'Agent System', color: '#2563EB' },
  { id: 'sec-prompt', label: 'Prompt & Memory', color: '#40A0E0' },
  { id: 'sec-cache', label: 'Cache Economics', color: '#059669' },
  { id: 'sec-security', label: 'Security', color: '#FF4040' },
  { id: 'sec-hooks', label: 'Hooks', color: '#EA580C' },
  { id: 'sec-compact', label: 'Compaction', color: '#0891B2' },
  { id: 'sec-hidden', label: 'Hidden Features', color: '#E040A0' },
];

// ── Step data for each section ───────────────────────────────────

const LOOP_STEPS: StoryStepData[] = [
  {
    label: 'Input', title: 'User Input', source: 'src/components/TextInput.tsx',
    description: 'User types a message or pipes input through stdin.',
    content: <TerminalMockup><span className="terminal__prompt">● </span><span className="terminal__cmd">claude-code</span>{'\n'}<span className="terminal__prompt">$ </span><span className="terminal__cmd">Find all TODO comments in src/ and fix them</span></TerminalMockup>,
    footer: "Keyboard input comes from Ink's <code>TextInput</code> component. In non-interactive mode, it reads from piped <code>stdin</code> instead.",
  },
  {
    label: 'Message', title: 'Build User Message', source: 'src/utils/messages.ts',
    description: 'The raw input is wrapped in a message object with UUID, timestamp, and content blocks.',
    footer: "Messages use a neutral format: <code>{ role, content, tool_calls }</code>. Converted to provider-specific format at the API boundary.",
  },
  {
    label: 'History', title: 'Load Conversation History', source: 'src/utils/sessionStorage.ts',
    description: 'Previous messages loaded from session transcript. Compact boundaries reconnect the message chain via UUID pointers.',
    footer: "The compact boundary is a linked list: <code>headUuid → anchorUuid → tailUuid</code>. Messages survive disk round-trips and crash recovery.",
  },
  {
    label: 'System', title: 'Assemble System Prompt', source: 'src/constants/prompts.ts:444',
    description: '8 layers assembled: identity → tool descriptions (53+) → coding guidelines → environment → git info → CLAUDE.md → memory → autonomous section.',
    footer: "Static prefix (~15K tokens) cached globally at <code>scope: 'global'</code>. Dynamic sections per-session. The <code>__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__</code> marker splits them.",
  },
  {
    label: 'API', title: 'Call Claude API', source: 'src/services/api/claude.ts:1017',
    description: 'queryModelWithStreaming() sends the full context to Claude. Streaming response arrives as message_start → content_block_delta → message_stop events.',
    content: <TerminalMockup title="API request"><span className="terminal__highlight">anthropic.beta.messages.create</span>{'({ stream: true, model, messages, tools, system })'}</TerminalMockup>,
    footer: "The <code>withRetry()</code> wrapper handles 10 retries, fast-mode cooldown, 529→fallback model cascade, and context window overflow recovery.",
  },
  {
    label: 'Tokens', title: 'Token Usage & Cache', source: 'src/services/api/claude.ts:2924',
    description: 'Track input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens. Cache reads cost 90% less than uncached input.',
    footer: "Sticky-on latches prevent header toggles from busting 50-70K cached tokens. A 16-factor cache break detector diagnoses misses.",
  },
  {
    label: 'Tools?', title: 'Detect Tool Calls', source: 'src/query.ts:826',
    description: 'If the response contains tool_use content blocks, set needsFollowUp = true. Otherwise, check recovery conditions and return.',
    footer: "16 termination conditions: completed, max_turns, aborted, prompt_too_long, model_error, hook_stopped, budget_exhausted, and 9 more.",
  },
  {
    label: 'Loop', title: 'Execute Tools → Loop', source: 'src/services/tools/toolOrchestration.ts:19',
    description: 'partitionToolCalls() batches tools: read-only concurrent (up to 10 parallel), writes serial. Results appended to messages, loop continues.',
    content: <TerminalMockup title="agent.py"><span className="terminal__highlight">while True:</span>{'\n  stream → collect tool_use blocks\n  '}<span className="terminal__highlight">if not tool_calls: break</span>{'\n  for tool in tool_calls:\n    result = execute(tool)\n    messages.append(result)'}</TerminalMockup>,
    footer: "This is the entire architecture. No LangChain, no state machine. Just <code>while(true)</code> + prompts + tools.",
  },
  {
    label: 'Render', title: 'Stream to Terminal', source: 'src/screens/REPL.tsx',
    description: 'TextChunk events rendered progressively. Tool calls shown with permission prompts. Markdown re-rendered after streaming completes.',
  },
  {
    label: 'Hooks', title: 'Post-Sampling Hooks', source: 'src/utils/hooks.ts:999',
    description: 'PostToolUse hooks observe results. Stop hooks can force the model to continue (exit code 2). Auto-compact fires if context exceeds 70% threshold.',
    footer: "The Stop hook is the power move: <code>npm test || exit 2</code> means the model literally can't stop until tests pass.",
  },
  {
    label: 'Await', title: 'Await Next Input', source: 'src/query.ts:1357',
    description: 'Loop complete. In interactive mode, REPL awaits next prompt. In autonomous/Kairos mode, the tick timer fires <tick> messages to keep the agent alive.',
  },
];

const AGENT_STEPS: StoryStepData[] = [
  {
    label: 'Spawn', title: 'AgentTool Spawns Sub-Agent', source: 'src/tools/AgentTool/runAgent.ts:248',
    description: 'Creates a new query() call with isolated context — separate message history, file state cache, abort controller. 5 built-in types: coder, reviewer, researcher, tester, general-purpose.',
  },
  {
    label: 'Fork', title: 'Fork-Join KV Cache Exploit', source: 'src/tools/AgentTool/forkSubagent.ts:107',
    description: 'Fork children construct byte-identical API request prefixes — same system prompt, same tools, same history, identical placeholder tool results. Only the final directive differs.',
    footer: "A 100K-token context fork costs ~1K new tokens. The KV cache is fully reused. The prompt tells the model: \"Don't set model on a fork — a different model can't reuse the parent's cache.\"",
  },
  {
    label: 'Coordinate', title: 'Coordinator Mode', source: 'src/coordinator/coordinatorMode.ts:111',
    description: 'Orchestrates parallel workers through 4 phases: Investigate (parallel research) → Synthesize (coordinator reads findings) → Implement (targeted changes) → Verify (test everything).',
    footer: "Key rule: \"Workers can't see your conversation. Never write 'based on your findings' — synthesize the findings yourself before delegating.\"",
  },
  {
    label: 'Worktree', title: 'Worktree Isolation', source: 'src/tools/AgentTool/runAgent.ts',
    description: 'isolation="worktree" creates a temporary git branch + directory. Parallel agents edit files without merge conflicts. Auto-cleanup on exit.',
    content: <TerminalMockup title="git"><span className="terminal__prompt">$ </span><span className="terminal__cmd">git worktree add /tmp/agent-abc feat/agent-abc</span>{'\n'}<span className="terminal__output">Preparing worktree (new branch \'feat/agent-abc\')</span></TerminalMockup>,
  },
  {
    label: 'Advisor', title: 'Advisor Model (Server-Side)', source: 'src/utils/advisor.ts',
    description: 'A server-side tool where Haiku ($0.001) silently reviews Opus\'s work mid-generation. Feedback returned as advisor_tool_result — some encrypted (advisor_redacted_result).',
    footer: "Call BEFORE substantive work, AFTER completion, when STUCK. \"Give advice serious weight — only override with empirical evidence.\"",
  },
  {
    label: 'Kairos', title: 'Kairos / Autonomous Mode', source: 'src/main.tsx:1048',
    description: 'Persistent tick-driven agent. TickTimer injects <tick> messages every N seconds. Sleep tool paces wake-ups. SendUserMessage communicates results. Same loop — different prompt.',
    content: <TerminalMockup title="kairos tick"><span className="terminal__prompt">⏰ </span><span className="terminal__highlight">{'<tick>14:32:15</tick>'}</span>{'\n'}<span className="terminal__output">Agent wakes up, checks for work...</span>{'\n'}<span className="terminal__prompt">⚙ </span><span className="terminal__cmd">Sleep(30, "waiting for build")</span>{'\n'}<span className="terminal__output">Tick timer paused for 30s</span></TerminalMockup>,
  },
];

const PROMPT_STEPS: StoryStepData[] = [
  {
    label: 'Memory', title: 'Three-Layer Memory', source: 'src/utils/claudemd.ts',
    description: 'Layer 1: ~/.claude/CLAUDE.md (global). Layer 2: ./CLAUDE.md + .claude/rules/*.md (project). Layer 3: CLAUDE.local.md (local, gitignored). Later overrides earlier.',
    footer: "4 memory types: <code>user</code> (preferences), <code>feedback</code> (corrections), <code>project</code> (initiatives), <code>reference</code> (external pointers). Max 40K chars, 200 lines per file.",
  },
  {
    label: 'Prompt', title: 'System Prompt Assembly', source: 'src/constants/prompts.ts:444',
    description: '8 layers: identity → tool descriptions (53+) → coding guidelines ("three lines > premature abstraction") → environment → git → CLAUDE.md → memory → autonomous section.',
  },
  {
    label: 'Boundary', title: 'Cache Boundary Split', source: 'src/constants/prompts.ts:115',
    description: '__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__ splits static from dynamic. Static prefix (~15K tokens) cached at scope:global — shared across ALL users. Dynamic sections per-session.',
    footer: "This single marker saves 90% on input costs for the static portion. Everyone shares the same identity + coding rules cache.",
  },
  {
    label: 'Verify', title: 'Memory Verification', source: 'system prompt',
    description: '"A memory that names a file path is a claim it existed when the memory was written. Before recommending it: check the file exists. If memory conflicts with current code, trust what you observe now."',
    footer: "Memories are verified at use time, not at load time. The system prompt instructs the model to grep for functions before recommending them.",
  },
];

const CACHE_STEPS: StoryStepData[] = [
  {
    label: 'Cost', title: 'The Cost Problem', source: 'src/cost-tracker.ts',
    description: 'Every API call sends the full context. 100K tokens at Opus pricing = ~$1.50/call. Over 50 calls/session = $75. Cache reads cost 90% less — turning $75 into ~$10.',
  },
  {
    label: 'Latches', title: 'Sticky-On Beta Latches', source: 'src/services/api/claude.ts:1405',
    description: 'Once a beta header is sent, it stays ON for the session. Toggling fast mode would bust ~50-70K cached tokens. 4 headers: fast mode, AFK, cache editing, thinking clear.',
    content: <TerminalMockup title="claude.ts"><span className="terminal__highlight">// Sticky-on: once first sent, keeps being sent</span>{'\nlet fastModeHeaderLatched = getFastModeHeaderLatched()\nif (!fastModeHeaderLatched && isFastMode) {\n  fastModeHeaderLatched = true\n  '}<span className="terminal__highlight">setFastModeHeaderLatched(true)</span>{' // permanent\n}'}</TerminalMockup>,
  },
  {
    label: 'Detect', title: '16-Factor Cache Break Detection', source: 'src/services/api/promptCacheBreakDetection.ts:247',
    description: 'Hashes 16+ factors before each call: system prompt, tool schemas, cache_control, per-tool hashes, model, betas, effort, extra body params. Flags drops >5% or >2K tokens.',
    footer: "Attribution cascade: \"system prompt changed (+42 chars)\", \"tools changed (+1/-0)\", \"possible 5min TTL expiry.\"",
  },
  {
    label: 'Edit', title: 'Microcompact Cache Editing', source: 'src/services/compact/microCompact.ts:305',
    description: 'Adds cache_reference to tool_result blocks. Sends cache_edits with delete requests. Server removes content from cache without client retransmitting. Suppresses false-positive break detection.',
  },
];

const SECURITY_STEPS: StoryStepData[] = [
  {
    label: 'Checks', title: '23-Point Bash Security', source: 'src/tools/BashTool/bashSecurity.ts:76',
    description: 'Every bash command validated: incomplete commands, jq system() abuse, obfuscated flags (Unicode), shell metacharacters, IFS injection, command substitution, /proc/environ access, brace expansion, quoted newlines, and more.',
  },
  {
    label: 'Zsh', title: 'Zsh Module Attack Prevention', source: 'src/tools/BashTool/bashSecurity.ts:45',
    description: 'Blocks 18 commands: zmodload (loads mapfile, system, zpty, net/tcp modules), emulate -c (eval equivalent), sysopen, sysread, ztcp, zsocket, zf_rm, zf_chmod, etc.',
    content: <TerminalMockup title="blocked"><span className="terminal__prompt">$ </span><span className="terminal__cmd">zmodload zsh/net/tcp</span>{'\n'}<span style={{color: '#f87171'}}>✗ BLOCKED: Zsh module loading is a gateway to raw TCP, filesystem, and pseudo-terminal attacks</span></TerminalMockup>,
  },
  {
    label: 'Exploit', title: '/dev/null Boundary Exploit', source: 'src/tools/BashTool/bashSecurity.ts:176',
    description: 'Without (?=\\s|$) boundary, "> /dev/nullo" matches "/dev/null" as PREFIX → strips it → "echo hi > /dev/nullo" becomes "echo hi o" → the write is auto-allowed.',
    content: <TerminalMockup title="the fix"><span className="terminal__highlight">{'// SECURITY: All patterns MUST have trailing boundary'}</span>{'\n.replace(/[012]?\\s*>\\s*\\/dev\\/null'}<span className="terminal__highlight">{'(?=\\s|$)'}</span>{'/g, \'\')'}</TerminalMockup>,
  },
  {
    label: 'Gate', title: '4-Layer Permission Gate', source: 'src/hooks/toolPermission/PermissionContext.ts:63',
    description: 'Layer 1: auto-approve reads (Read, Glob, Grep, WebFetch). Layer 2: safe-bash prefix list (29 patterns). Layer 3: hook-based decisions. Layer 4: interactive y/N/a prompt.',
    footer: "<code>ResolveOnce</code> prevents race conditions: 3 async handlers (user, classifier, hooks) race to resolve one permission. Atomic <code>claim()</code> ensures exactly one wins.",
  },
];

const HOOKS_STEPS: StoryStepData[] = [
  {
    label: 'Events', title: '27 Lifecycle Events', source: 'src/utils/hooks.ts',
    description: 'PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, PermissionDenied, UserPromptSubmit, SessionStart/End, Stop/StopFailure, SubagentStart/Stop, PreCompact/PostCompact, FileChanged, ConfigChange, and more.',
    footer: "The hooks file is <strong>5,022 lines</strong> — bigger than the agentic loop itself. The extensibility layer is more complex than the core.",
  },
  {
    label: 'Types', title: '5 Hook Types', source: 'src/types/hooks.ts:210',
    description: 'Shell command (spawn + JSON I/O), LLM prompt (model evaluates safety), HTTP POST (webhook to external), Agent (structured reasoning), TypeScript callback (inline function).',
  },
  {
    label: 'Block', title: 'PreToolUse — Block or Modify', source: 'src/utils/hooks.ts:3394',
    description: 'Runs before every tool call. Can deny execution, modify input (updatedInput), approve, or inject additionalContext. Fast-path for trusted tools.',
    content: <TerminalMockup title="settings.json">{'{\n  "hooks": {\n    "PreToolUse": [{\n      "matcher": "Bash",\n      "hooks": [{\n        "type": "command",\n        "command": "python3 validate_command.py"\n      }]\n    }]\n  }\n}'}</TerminalMockup>,
  },
  {
    label: 'Stop', title: 'Stop Hook — Force Continue', source: 'src/utils/hooks.ts:3639',
    description: 'Fires when the model thinks it\'s done. If the hook returns exit code 2, the model gets feedback and CONTINUES. The model literally cannot stop until the hook passes.',
    content: <TerminalMockup title="stop hook example"><span className="terminal__highlight">{"# Model can't stop until tests pass"}</span>{'\n"command": "bash -c \'if ! npm test; then echo Tests failing >&2; exit 2; fi\'"'}</TerminalMockup>,
    footer: "This is how you enforce quality gates: the model keeps working until <code>npm test</code> passes.",
  },
];

const COMPACT_STEPS: StoryStepData[] = [
  {
    label: 'Estimate', title: 'Token Estimation', source: 'src/services/compact/autoCompact.ts',
    description: 'Estimates tokens at ~3.5 chars/token. Fires at 70% of context window (effective_context - 13K buffer). Warning → error → blocking thresholds.',
  },
  {
    label: 'Micro', title: 'Microcompact (Two Paths)', source: 'src/services/compact/microCompact.ts:253',
    description: 'Path 1 (cache warm): cache_edits delete from server cache without retransmitting. Path 2 (cache cold, 60min gap): mutate local messages directly, replace content with "[Old tool result content cleared]".',
  },
  {
    label: 'Full', title: 'Full LLM Compaction', source: 'src/services/compact/compact.ts:387',
    description: 'Sends old messages to Claude for 9-section structured summary: Primary Request, Key Concepts, Files & Code, Errors & Fixes, Problem Solving, All User Messages, Pending Tasks, Current Work, Next Step.',
    footer: "The compact boundary is a linked list: <code>headUuid</code> (first preserved) → <code>anchorUuid</code> (insertion point) → <code>tailUuid</code> (last preserved). Survives crash recovery.",
  },
];

// ── Feature cards for Section 8 ──────────────────────────────────

const HIDDEN_FEATURES = [
  { icon: '⚕️', title: 'Advisor Model', desc: 'Server-side tool: Haiku reviews Opus\'s work mid-generation. Encrypted feedback. Cost: $0.001/call.', source: 'src/utils/advisor.ts' },
  { icon: '🤖', title: 'Kairos Mode', desc: 'Persistent tick-driven agent with Sleep pacing, SendUserMessage, cron scheduling, and push notifications.', source: 'src/main.tsx:1048' },
  { icon: '🐾', title: 'Buddy System', desc: 'Virtual pets! Species encoded via String.fromCharCode() to bypass code canary detection for "capybara".', source: 'src/buddy/types.ts' },
  { icon: '🕵️', title: 'Undercover Mode', desc: 'Anthropic employees auto-hide AI attribution in public repos. "Do not blow your cover." No force-OFF.', source: 'src/utils/undercover.ts' },
  { icon: '🦡', title: 'Numbat', desc: 'Next model codename. Found in: // @[MODEL LAUNCH]: Remove this section when we launch numbat.', source: 'src/constants/prompts.ts:402' },
  { icon: '🧠', title: 'UltraPlan', desc: 'Long planning on Opus-class models, up to 30-minute execution windows. Feature-gated.', source: 'src/commands/ultraplan.tsx' },
  { icon: '🏗️', title: 'Coordinator Mode', desc: 'Lead agent breaks tasks, spawns parallel workers in isolated worktrees, collects results.', source: 'src/coordinator/coordinatorMode.ts' },
  { icon: '📱', title: 'Bridge', desc: 'Control Claude Code from phone or browser. Full remote session with permission approvals.', source: 'src/bridge/bridgeMain.ts' },
];

// ── Main Component ───────────────────────────────────────────────

export function StoryPage() {
  const firstSectionRef = useRef<HTMLDivElement>(null);
  const [stepStates, setStepStates] = useState<Record<string, number>>({});
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const getStep = (id: string) => stepStates[id] ?? 0;
  const setStep = (id: string) => (i: number) => setStepStates((s) => ({ ...s, [id]: i }));

  const scrollToFirst = () => firstSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="story">
      <StickyNav sections={SECTIONS} />
      <HeroSection onStart={scrollToFirst} />

      <div ref={firstSectionRef}>
        <Section id="sec-loop" number={1} title="The Agent Loop" subtitle="From keypress to rendered response, step by step through the source" color="#c9a84c" chips={['11 steps', 'query.ts']}>
          <StoryTimeline steps={LOOP_STEPS} color="#c9a84c" activeStep={getStep('loop')} onStepChange={setStep('loop')} />
        </Section>
      </div>

      <Section id="sec-agents" number={2} title="Agent System" subtitle="Fork-join parallelism, coordinator mode, worktree isolation, advisor, Kairos" color="#2563EB" chips={['6 steps', '5 agent types']}>
        <StoryTimeline steps={AGENT_STEPS} color="#2563EB" activeStep={getStep('agents')} onStepChange={setStep('agents')} />
      </Section>

      <Section id="sec-prompt" number={3} title="Prompt & Memory" subtitle="Three-layer memory, 8-layer system prompt, cache boundary split" color="#40A0E0" chips={['4 steps', '15K static tokens']}>
        <StoryTimeline steps={PROMPT_STEPS} color="#40A0E0" activeStep={getStep('prompt')} onStepChange={setStep('prompt')} />
      </Section>

      <Section id="sec-cache" number={4} title="Cache Economics" subtitle="90% cheaper reads, sticky latches, 16-factor break detection" color="#059669" chips={['4 steps', '$75 → $10']}>
        <StoryTimeline steps={CACHE_STEPS} color="#059669" activeStep={getStep('cache')} onStepChange={setStep('cache')} />
      </Section>

      <Section id="sec-security" number={5} title="Security & Permissions" subtitle="23-point bash validation, zsh module attacks, 4-layer permission gate" color="#FF4040" chips={['4 steps', '23 checks']}>
        <StoryTimeline steps={SECURITY_STEPS} color="#FF4040" activeStep={getStep('security')} onStepChange={setStep('security')} />
      </Section>

      <Section id="sec-hooks" number={6} title="Hooks System" subtitle="27 lifecycle events, 5 hook types, can block/modify/force-continue" color="#EA580C" chips={['4 steps', '5,022 lines']}>
        <StoryTimeline steps={HOOKS_STEPS} color="#EA580C" activeStep={getStep('hooks')} onStepChange={setStep('hooks')} />
      </Section>

      <Section id="sec-compact" number={7} title="Context Management" subtitle="5-layer compaction pipeline, microcompact cache editing, LLM summary" color="#0891B2" chips={['3 steps', '70% threshold']}>
        <StoryTimeline steps={COMPACT_STEPS} color="#0891B2" activeStep={getStep('compact')} onStepChange={setStep('compact')} />
      </Section>

      <Section id="sec-hidden" number={8} title="Hidden Features" subtitle="Stuff that's in the code but not shipped yet" color="#E040A0" chips={[`${HIDDEN_FEATURES.length} features`]}>
        <div className="features-grid">
          {HIDDEN_FEATURES.map((f) => (
            <div
              key={f.title}
              className={`feature-card ${expandedFeature === f.title ? 'feature-card--expanded' : ''}`}
              onClick={() => setExpandedFeature(expandedFeature === f.title ? null : f.title)}
            >
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
              {expandedFeature === f.title && (
                <div className="feature-card__details">
                  <div className="feature-card__source">{f.source}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '4rem 2rem 2rem', color: '#444', fontSize: '0.8rem' }}>
        Based on Claude Code source analysis · Not affiliated with Anthropic
      </footer>
    </div>
  );
}
