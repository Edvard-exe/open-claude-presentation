export const diagrams: Record<string, string> = {
  'core-architecture': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#7C3AED', 'primaryTextColor': '#fff', 'primaryBorderColor': '#6D28D9', 'lineColor': '#1E1B4B', 'edgeLabelBackground': '#EDE9FE', 'secondaryColor': '#EDE9FE', 'tertiaryColor': '#F5F3FF', 'fontFamily': 'system-ui, sans-serif', 'fontSize': '18px' }}}%%
flowchart TB
    subgraph ENTRY["Entry Point"]
        CLI["cli.tsx<br/><i>Bootstrap & fast paths</i>"]
        MAIN["main.tsx<br/><i>Config, auth, plugins, MCP</i>"]
    end

    subgraph USER_INPUT["User Input"]
        REPL["REPL.tsx<br/><i>Terminal UI & state</i>"]
        INPUT["processUserInput.ts<br/><i>Parse commands, attachments</i>"]
    end

    QUERY["query.ts — queryLoop()<br/><b>while (true)</b>"]
    PREPARE["Prepare Messages<br/><i>Budget, snip, compact</i>"]
    API_CALL["Call Claude API<br/><i>queryModelWithStreaming()</i>"]
    STREAM["Stream Response<br/><i>text, thinking, tool_use</i>"]
    EXECUTE["Execute Tools<br/><i>StreamingToolExecutor</i>"]
    DECISION{{"More tools needed?"}}

    PERMS["Permissions<br/><i>Rule-based + hooks</i>"]
    HOOKS["Hook System<br/><i>Pre/PostToolUse</i>"]
    COMPACT["Context Compaction<br/><i>Auto-compact</i>"]
    MEMORY["Session Memory<br/><i>JSONL transcript</i>"]

    CLI --> MAIN
    MAIN --> REPL
    REPL --> INPUT
    INPUT --> QUERY
    QUERY --> PREPARE --> API_CALL --> STREAM --> EXECUTE --> DECISION
    DECISION -->|"<b>Yes</b>"| PREPARE
    DECISION -->|"<b>No — done</b>"| REPL

    EXECUTE -.-> PERMS
    EXECUTE -.-> HOOKS
    PREPARE -.-> COMPACT
    QUERY -.-> MEMORY

    style ENTRY fill:#F3F0FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6
    style USER_INPUT fill:#F3F0FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6
    style QUERY fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
    style INPUT fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
    style DECISION fill:#7C3AED,stroke:#6D28D9,stroke-width:2px,color:#fff
    style PERMS fill:#E0E7FF,stroke:#6366F1,stroke-width:1.5px,color:#312E81
    style HOOKS fill:#E0E7FF,stroke:#6366F1,stroke-width:1.5px,color:#312E81
    style COMPACT fill:#E0E7FF,stroke:#6366F1,stroke-width:1.5px,color:#312E81
    style MEMORY fill:#E0E7FF,stroke:#6366F1,stroke-width:1.5px,color:#312E81
`,

  'agent-system': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#2563EB', 'primaryTextColor': '#fff', 'primaryBorderColor': '#1D4ED8', 'lineColor': '#1E1B4B', 'edgeLabelBackground': '#DBEAFE', 'secondaryColor': '#DBEAFE', 'tertiaryColor': '#EFF6FF', 'fontFamily': 'system-ui, sans-serif', 'fontSize': '18px' }}}%%
flowchart TB
    subgraph PARENT["Parent Agent (Main Loop)"]
        BRAIN["query.ts<br/><b>while (true)</b>"]
        TOOL_USE["Tool: Agent<br/><i>subagent_type, prompt, isolation</i>"]
    end

    subgraph FORK["Fork Path (KV Cache Exploit)"]
        CACHE["Byte-identical prefix<br/><i>Same system prompt + tools + history</i>"]
        PLACEHOLDER["Placeholder tool results<br/><i>'Fork started — processing'</i>"]
        DIRECTIVE["Per-child directive<br/><i>Only this differs</i>"]
    end

    subgraph WORKERS["Sub-Agent Types"]
        W1["🔧 general-purpose<br/><i>Full tool set (default)</i>"]
        W2["🔍 Explore<br/><i>Read, Glob, Grep, Web</i>"]
        W3["📋 Plan<br/><i>Architecture & planning</i>"]
        W4["✅ verification<br/><i>Review & verify</i>"]
    end

    subgraph ISOLATION["Worktree Isolation"]
        GIT["git worktree add<br/><i>Temp branch + directory</i>"]
        PARALLEL["Parallel file edits<br/><i>No merge conflicts</i>"]
        CLEANUP["Auto-cleanup<br/><i>Remove worktree on exit</i>"]
    end

    COORD["Coordinator Mode<br/><b>Investigate → Synthesize → Implement → Verify</b>"]
    NOTIFY["Task Notification<br/><i>user-role message with result</i>"]
    SEND["SendMessage<br/><i>Continue existing worker</i>"]

    BRAIN --> TOOL_USE
    TOOL_USE --> CACHE --> PLACEHOLDER --> DIRECTIVE
    DIRECTIVE --> W1 & W2 & W3 & W4
    W1 & W2 & W3 & W4 --> NOTIFY --> BRAIN
    BRAIN --> SEND --> W1
    TOOL_USE -.-> GIT --> PARALLEL --> CLEANUP
    BRAIN -.-> COORD

    style PARENT fill:#EFF6FF,stroke:#2563EB,stroke-width:1.5px,color:#1E40AF
    style FORK fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E
    style WORKERS fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px,color:#166534
    style ISOLATION fill:#FDF2F8,stroke:#DB2777,stroke-width:1.5px,color:#9D174D
    style BRAIN fill:#2563EB,color:#fff,stroke:#1D4ED8,stroke-width:2px
    style COORD fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
    style CACHE fill:#F59E0B,color:#000,stroke:#D97706,stroke-width:2px
    style NOTIFY fill:#16A34A,color:#fff,stroke:#15803D,stroke-width:2px
`,

  'cache-economics': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#059669', 'primaryTextColor': '#fff', 'primaryBorderColor': '#047857', 'lineColor': '#1E1B4B', 'edgeLabelBackground': '#D1FAE5', 'secondaryColor': '#D1FAE5', 'tertiaryColor': '#ECFDF5', 'fontFamily': 'system-ui, sans-serif', 'fontSize': '18px' }}}%%
flowchart LR
    subgraph SYSTEM_PROMPT["System Prompt (split by boundary)"]
        STATIC["Static Prefix<br/><i>Identity, tools, guidelines</i><br/><b>scope: global</b><br/>~15K tokens"]
        BOUNDARY["__DYNAMIC_BOUNDARY__"]
        DYNAMIC["Dynamic Suffix<br/><i>CLAUDE.md, env, git, memory</i><br/><b>scope: null</b>"]
    end

    subgraph LATCHES["Sticky-On Latches (session-stable)"]
        FAST["fast_mode<br/><i>Once ON → stays ON</i>"]
        AFK["afk_mode<br/><i>Once ON → stays ON</i>"]
        CACHE_EDIT["cache_editing<br/><i>Once ON → stays ON</i>"]
        THINK["thinking_clear<br/><i>Once ON → stays ON</i>"]
    end

    subgraph DETECTION["Cache Break Detection (16+ factors)"]
        HASH["Hash: system + tools +<br/>cache_control + betas"]
        CHECK["cache_read drops >5%?"]
        ATTR["Attribute: model? tools?<br/>TTL? betas? effort?"]
    end

    subgraph MICROCOMPACT["Microcompact Cache Editing"]
        REF["cache_reference on<br/>tool_result blocks"]
        EDIT["cache_edits: delete<br/><i>Server-side removal</i>"]
        SUPPRESS["Suppress false-positive<br/>cache break detection"]
    end

    COST["Cost Impact<br/><b>Cache read = 10% of input price</b><br/>100K context: $1.50 → $0.15"]

    STATIC --> BOUNDARY --> DYNAMIC
    LATCHES -.->|"prevent 50-70K bust"| HASH
    HASH --> CHECK --> ATTR
    REF --> EDIT --> SUPPRESS

    style SYSTEM_PROMPT fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46
    style LATCHES fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E
    style DETECTION fill:#EFF6FF,stroke:#2563EB,stroke-width:1.5px,color:#1E40AF
    style MICROCOMPACT fill:#FDF2F8,stroke:#DB2777,stroke-width:1.5px,color:#9D174D
    style STATIC fill:#059669,color:#fff,stroke:#047857,stroke-width:2px
    style BOUNDARY fill:#D97706,color:#fff,stroke:#B45309,stroke-width:2px
    style COST fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
`,

  'hook-lifecycle': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#EA580C', 'primaryTextColor': '#fff', 'primaryBorderColor': '#C2410C', 'lineColor': '#1E1B4B', 'edgeLabelBackground': '#FED7AA', 'secondaryColor': '#FED7AA', 'tertiaryColor': '#FFF7ED', 'fontFamily': 'system-ui, sans-serif', 'fontSize': '16px' }}}%%
flowchart TB
    subgraph SESSION["Session Lifecycle"]
        SETUP["Setup"]
        START["SessionStart<br/><i>startup|resume|clear|compact</i>"]
        ENDD["SessionEnd<br/><i>1.5s timeout</i>"]
    end

    subgraph USER["User Interaction"]
        SUBMIT["UserPromptSubmit<br/><i>Can inject context</i>"]
        PERM_REQ["PermissionRequest<br/><i>Auto-approve/deny</i>"]
        PERM_DEN["PermissionDenied<br/><i>Enable retry</i>"]
    end

    subgraph TOOL["Tool Execution (per tool call)"]
        PRE["PreToolUse<br/><b>Can BLOCK or MODIFY input</b>"]
        POST["PostToolUse<br/><i>Can modify MCP output</i>"]
        FAIL["PostToolUseFailure<br/><i>Error handling</i>"]
    end

    subgraph AGENT["Agent Events"]
        SUB_START["SubagentStart"]
        SUB_STOP["SubagentStop<br/><i>Can force continue</i>"]
        TASK_C["TaskCreated"]
        TASK_D["TaskCompleted"]
    end

    subgraph STOP_FLOW["Stop Flow"]
        STOP["Stop<br/><b>Can force model to continue!</b>"]
        STOP_F["StopFailure"]
    end

    subgraph TYPES["4 Hook Types (configurable in settings.json)"]
        CMD["🖥️ command<br/><i>Shell spawn + JSON I/O</i>"]
        PROMPT["🤖 prompt<br/><i>LLM evaluates safety</i>"]
        HTTP["🌐 http<br/><i>POST webhook</i>"]
        AG["🏭 agent<br/><i>Structured reasoning</i>"]
    end

    START --> SUBMIT --> PRE --> POST --> STOP --> ENDD
    PRE -->|"exit code 2"| FAIL
    STOP -->|"exit code 2<br/>blocking error"| ENDD

    style SESSION fill:#FFF7ED,stroke:#EA580C,stroke-width:1.5px,color:#9A3412
    style USER fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E
    style TOOL fill:#FEE2E2,stroke:#DC2626,stroke-width:1.5px,color:#991B1B
    style AGENT fill:#EFF6FF,stroke:#2563EB,stroke-width:1.5px,color:#1E40AF
    style STOP_FLOW fill:#F3E8FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6
    style TYPES fill:#ECFDF5,stroke:#059669,stroke-width:1.5px,color:#065F46
    style PRE fill:#DC2626,color:#fff,stroke:#B91C1C,stroke-width:2px
    style STOP fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
`,

  'compaction-pipeline': `%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#0891B2', 'primaryTextColor': '#fff', 'primaryBorderColor': '#0E7490', 'lineColor': '#1E1B4B', 'edgeLabelBackground': '#CFFAFE', 'secondaryColor': '#CFFAFE', 'tertiaryColor': '#ECFEFF', 'fontFamily': 'system-ui, sans-serif', 'fontSize': '18px' }}}%%
flowchart LR
    TURN["Turn Start<br/><i>autoCompactIfNeeded()</i>"]
    EST["Estimate Tokens<br/><i>chars / 4</i>"]
    THRESHOLD{"tokens ><br/>contextWindow − 13K?"}

    subgraph LAYER1["Layer 1: Tool Result Truncation"]
        BUDGET["Strip oversized results<br/><i>Images stripped before summary</i>"]
    end

    subgraph LAYER2["Layer 2: Microcompact"]
        MC_CACHE["Cache editing path<br/><i>cache_edits: delete refs</i><br/><i>Server-side only</i>"]
        MC_TIME["Time-based path<br/><i>Mutate local messages</i><br/><i>60min gap trigger</i>"]
    end

    subgraph LAYER3["Layer 3: Full Compact"]
        SUMMARY["LLM Summary Call<br/><b>9-section structured format</b>"]
        BOUNDARY["Compact Boundary<br/><i>logicalParentUuid pointers</i>"]
        KEEP["Keep recent messages<br/><i>+ summary + preserved</i>"]
    end

    COLLAPSE["Context Collapse<br/><i>(parallel system,<br/>suppresses autocompact)</i>"]

    DONE["Continue Turn<br/><i>Context reduced</i>"]

    TURN --> EST --> THRESHOLD
    THRESHOLD -->|"No"| DONE
    THRESHOLD -->|"Yes"| BUDGET --> MC_CACHE & MC_TIME
    MC_CACHE & MC_TIME --> SUMMARY --> BOUNDARY --> KEEP --> DONE
    THRESHOLD -.->|"feature gate"| COLLAPSE -.-> DONE

    style LAYER1 fill:#ECFEFF,stroke:#0891B2,stroke-width:1.5px,color:#155E75
    style LAYER2 fill:#FEF3C7,stroke:#D97706,stroke-width:1.5px,color:#92400E
    style LAYER3 fill:#EFF6FF,stroke:#2563EB,stroke-width:1.5px,color:#1E40AF
    style THRESHOLD fill:#0891B2,color:#fff,stroke:#0E7490,stroke-width:2px
    style SUMMARY fill:#2563EB,color:#fff,stroke:#1D4ED8,stroke-width:2px
    style BOUNDARY fill:#7C3AED,color:#fff,stroke:#6D28D9,stroke-width:2px
    style COLLAPSE fill:#FDF2F8,stroke:#DB2777,stroke-width:1.5px,color:#9D174D
`,
};
