import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { REDO_COMMAND, UNDO_COMMAND } from "lexical";

import { tool_hover_style, tool_layout, tool_tooltip_style } from "../ToolbarPlugin/styles";
import undo from '../../assets/undo.svg';
import redo from '../../assets/redo.svg';
import { useEffect } from "react";

const unRedoTags = {
  undo: {
    tag: 'undo',
    icon: undo,
  },
  redo: {
    tag: 'redo',
    icon: redo,
  },
} as const

export default function UnRedoToolPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyUnRedo = (unRedoTag: keyof typeof unRedoTags) => {
    switch (unRedoTag) {
      case unRedoTags.undo.tag:
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        break;
      case unRedoTags.redo.tag:
        editor.dispatchCommand(REDO_COMMAND, undefined);
        break;
    }
  }

  useEffect(() => {
    // 建立一個初始的編輯器狀態
    const initialState = editor.parseEditorState(JSON.stringify({
      "root": {
        "children": [
          {
            "children": [
              {
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "這是預設的文字",
                "type": "text",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "paragraph",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
      }
    }));

    // 直接設置編輯器狀態
    editor.setEditorState(initialState);
  }, [editor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      // 直接輸出當前的 editor state
      console.log('current state', editor.getEditorState().toJSON());
      
      // 如果要解析新的狀態
      const serializedState = editor.getEditorState().toJSON();
      const parsedState = editor.parseEditorState(JSON.stringify(serializedState));
      console.log('parsed state', JSON.stringify(parsedState.toJSON()));
    });
  }, [editor]);

  return (
    <>
      {Object.keys(unRedoTags).map((unRedoTag) => (
        <button
          key={unRedoTag}
          className={`group ${tool_layout} ${tool_hover_style}`}
          onClick={() => applyUnRedo(unRedoTag as keyof typeof unRedoTags)}
        >
          <img src={unRedoTags[unRedoTag as keyof typeof unRedoTags].icon} alt={unRedoTag} className="w-full" />
          <div className={tool_tooltip_style}>
            {unRedoTag}
          </div>
        </button>
      ))}
    </>
  );
}