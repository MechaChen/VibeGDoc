import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { REDO_COMMAND, UNDO_COMMAND } from "lexical";

import { tool_hover_style, tool_layout, tool_tooltip_style } from "../ToolbarPlugin/styles";
import undo from '../../assets/undo.svg';
import redo from '../../assets/redo.svg';

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