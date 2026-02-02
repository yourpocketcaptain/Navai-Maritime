"use client";

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useState, useRef } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 animate-pulse rounded-xl border border-white/10" />
});

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**'
});

// CRITICAL: Prevent escaping. Flutter renderers hate \n, \#, etc.
turndownService.escape = (text) => text;

// Minimal custom rules only for critical mobile renderer quirks

// Ensure headers have blank lines around them
turndownService.addRule('headers', {
  filter: ['h1', 'h2', 'h3'],
  replacement: (content, node) => {
    const level = (node as HTMLElement).nodeName.charAt(1);
    const prefix = '#'.repeat(Number(level));
    return `\n\n${prefix} ${content}\n\n`;
  }
});

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // Initialize with value directly (assuming it's HTML) or parsed if it's legacy Markdown
  const [content, setContent] = useState(() => {
    if (!value) return '';
    // If it looks like HTML (has tags), use it. Else assume legacy markdown and parse it.
    if (value.trim().startsWith('<')) return value;
    try {
      return marked.parse(value) as string;
    } catch {
      return value;
    }
  });
  const [showSource, setShowSource] = useState(false);
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (value === lastValueRef.current) return;

    // If external update, determine content type again
    let newContent = value || '';
    if (!newContent.trim().startsWith('<') && newContent.trim().length > 0) {
      newContent = marked.parse(newContent) as string;
    }

    if (newContent !== content) {
      setContent(newContent);
    }
    lastValueRef.current = value;
  }, [value]);

  const handleChange = (html: string, delta: any, source: string) => {
    if (source === 'user') {
      setContent(html);
      lastValueRef.current = html;
      onChange(html); // Save HTML directly
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
      ['image'] // Added image support since sample had <img>
    ],
  };

  return (
    <div className="rich-text-editor rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:border-maritime-ocean transition-all">
      <style jsx global>{`
        /* ... existing styles ... */
        .ql-toolbar.ql-snow {
          border: none !important;
          background: rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 300px;
          font-family: inherit;
          font-size: 0.875rem;
          color: white;
        }
        .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.2) !important;
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: rgba(255, 255, 255, 0.6) !important;
        }
        .ql-snow .ql-fill {
          fill: rgba(255, 255, 255, 0.6) !important;
        }
        .ql-snow .ql-picker {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .ql-snow .ql-picker-options {
          background-color: #0c141c !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ql-editor {
          padding: 1rem 1.5rem;
          line-height: 1.6;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
          color: #84a5b8;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }
        .ql-editor p {
          margin-bottom: 1rem;
        }
        .ql-editor blockquote {
          border-left: 4px solid #84a5b8;
          padding-left: 1rem;
          margin-left: 0;
          color: #5d8e92;
        }
        .ql-editor pre.ql-syntax {
          background-color: rgba(0, 0, 0, 0.3) !important;
          color: #c4a484 !important;
          padding: 1rem;
          border-radius: 0.5rem;
        }
      `}</style>
      <div className="flex justify-end p-2 bg-white/5 border-b border-white/10">
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className="text-xs text-maritime-teal hover:underline flex items-center gap-1"
        >
          {showSource ? "Hide HTML Source" : "Show HTML Source"}
        </button>
      </div>

      {showSource ? (
        <textarea
          defaultValue={content} // Content is HTML
          onChange={(e) => {
            const newHtml = e.target.value;
            setContent(newHtml);
            lastValueRef.current = newHtml;
            onChange(newHtml);
          }}
          className="w-full h-[600px] bg-[#0c141c] text-maritime-clean p-4 font-mono text-sm resize-none focus:outline-none border border-white/10 rounded-xl"
          placeholder="<div>Edit HTML content directly...</div>"
        />
      ) : (
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
