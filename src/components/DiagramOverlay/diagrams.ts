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
};
