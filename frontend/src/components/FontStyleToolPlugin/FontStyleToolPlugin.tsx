import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

import { tool_layout, tool_hover_style, tool_tooltip_style } from "../ToolbarPlugin/styles";
import bold from '../../assets/type-bold.svg';
import italic from '../../assets/type-italic.svg';
import underline from '../../assets/type-underline.svg';

const fontStyleTags = {
    bold: {
      tag: 'bold',
      icon: bold,
    },
    italic: {
      tag: 'italic',
      icon: italic,
    },
    underline: {
      tag: 'underline',
      icon: underline,
    },
  } as const
  
export default function FontStyleToolPlugin() {
    const [editor] = useLexicalComposerContext();
  
    const applyFontStyle = (fontStyle: keyof typeof fontStyleTags) => {
      editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.formatText(fontStyle);
          }
        });
    };
  
    return (
      <>
        {Object.keys(fontStyleTags).map((fontStyle) => (
          <button
            key={fontStyle}
            className={`group ${tool_layout} ${tool_hover_style}`}
            onClick={() => applyFontStyle(fontStyle as keyof typeof fontStyleTags)}
          >
            <img src={fontStyleTags[fontStyle as keyof typeof fontStyleTags].icon} alt={fontStyle} className="w-full" />
            <div className={tool_tooltip_style}>
              {fontStyle}
            </div>
          </button>
        ))}
      </>
    );
  }