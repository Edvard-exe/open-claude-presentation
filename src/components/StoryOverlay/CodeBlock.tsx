import { useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const html = useMemo(() => {
    const language = lang || 'typescript';
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  }, [code, lang]);

  return <div className="story-code__body" dangerouslySetInnerHTML={{ __html: html }} />;
}
