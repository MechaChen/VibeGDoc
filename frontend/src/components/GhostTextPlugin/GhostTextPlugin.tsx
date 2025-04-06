import {
  $getSelection,
  $isRangeSelection,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useRef, useCallback } from "react";

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 工具函式：根據目前 cursor 所在段落，取出段落內容供 GPT 使用
function getContextForSuggestion(editor: LexicalEditor): string {
  let context = "";
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchor = selection.anchor.getNode();
    const paragraph = anchor.getTopLevelElementOrThrow();
    context = paragraph.getTextContent();
  });
  return context;
}

function isCursorAtEnd(editor: LexicalEditor): boolean {
  let isAtEnd = false;
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchor = selection.anchor;
    const node = anchor.getNode();

    // 檢查游標位置是否在節點的最後
    isAtEnd = anchor.offset === node.getTextContent().length;
  });
  return isAtEnd;
}

export function GhostTextPlugin() {
  const [editor] = useLexicalComposerContext();
  const [suggestion, setSuggestion] = useState("");
  const ghostRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);

  // debounce 包裝 fetch
  const debouncedFetch = useCallback(
    debounce(async (context: string) => {
      try {
        if (abortController.current) {
          abortController.current.abort();
        }

        abortController.current = new AbortController();

        const response = await fetch("http://localhost:3000/ghost-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context }),
          signal: abortController.current.signal,
        });
        const data = await response.text();

        if (context.length === 0) {
          setSuggestion("");
        } else {
          setSuggestion(data);
        }
      } catch (err) {
        console.error("GhostText fetch error:", err);
      }
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // 監聽文字變化觸發 GPT 建議請求
  useEffect(() => {
    return editor.registerTextContentListener(() => {
      const context = getContextForSuggestion(editor);

      debouncedFetch(context);
    });
  }, [editor, debouncedFetch]);

  useEffect(() => {
    const context = getContextForSuggestion(editor);
    if (context.length === 0) {
      setSuggestion("");
    }
  }, [editor]);

  // NOTE: listen tab key to insert suggestion into editor context
  useEffect(() => {
    const insertAiSuggestionToContext = (event: KeyboardEvent) => {
      if (!suggestion) return false;
      event.preventDefault();
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(suggestion);
          setSuggestion("");
        }
      });

      return true;
    };

    return editor.registerCommand(
      KEY_TAB_COMMAND,
      insertAiSuggestionToContext,
      COMMAND_PRIORITY_LOW
    );
  }, [editor, suggestion]);

  // 顯示 ghost 文字浮動在游標位置
  useEffect(() => {
    const updateGhostPosition = () => {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      const range = selection.getRangeAt(0).cloneRange();
      const rect = range.getBoundingClientRect();
      const ghost = ghostRef.current;

      if (rect && ghost) {
        const editorRoot = editor.getRootElement();
        const offsetParent = editorRoot?.offsetParent;
        const offsetTop =
          offsetParent instanceof HTMLElement
            ? offsetParent.getBoundingClientRect().top
            : 0;
        const offsetLeft =
          offsetParent instanceof HTMLElement
            ? offsetParent.getBoundingClientRect().left
            : 0;

        if (rect.top === 0) {
          setSuggestion("");
          ghost.style.opacity = "0";
          return;
        }

        const shouldShowSuggestion = suggestion && isCursorAtEnd(editor);
        ghost.style.opacity = shouldShowSuggestion ? "1" : "0";
        ghost.style.top = `${rect.top - offsetTop - 3}px`;
        ghost.style.left = `${rect.left - offsetLeft + 1}px`;
      }
    };

    updateGhostPosition();
    document.addEventListener("selectionchange", updateGhostPosition);
    window.addEventListener("resize", updateGhostPosition);
    return () => {
      document.removeEventListener("selectionchange", updateGhostPosition);
      window.removeEventListener("resize", updateGhostPosition);
    };
  }, [editor, suggestion]);

  useEffect(() => {
    const removeSuggestion = (event: KeyboardEvent) => {
      event.preventDefault();
      setSuggestion("");
      return true;
    };

    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      removeSuggestion,
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);
  return (
    <div
      ref={ghostRef}
      className="absolute text-black/30 italic pointer-events-none select-none z-10 transition-opacity duration-200 opacity-0 whitespace-pre"
    >
      {suggestion}
    </div>
  );
}

export default GhostTextPlugin;
