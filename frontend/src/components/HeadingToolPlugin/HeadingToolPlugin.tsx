import { $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection, } from "lexical";
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { tool_hover_style, tool_layout, tool_tooltip_style } from "../ToolbarPlugin/styles";
import typeH1 from '../../assets/type-h1.svg';
import typeH2 from '../../assets/type-h2.svg';
import typeH3 from '../../assets/type-h3.svg';

const headingTags = {
    h1: {
      tag: 'h1',
      icon: typeH1,
    },
    h2: {
      tag: 'h2',
      icon: typeH2,
    },
    h3: {
      tag: 'h3',
      icon: typeH3,
    },
  } as const
  
export default function HeadingToolPlugin() {
    const [editor] = useLexicalComposerContext();
  
    const applyHeading = (heading: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
  
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(heading));
        }
      });
    };
  
  
    return (
      <>
        {Object.keys(headingTags).map((headingTag) => (
          <button
            key={headingTag}
            className={`group ${tool_layout} ${tool_hover_style}`}
            onClick={() => applyHeading(headingTag as HeadingTagType)}
          >
            <img src={headingTags[headingTag as keyof typeof headingTags].icon} alt={headingTag} className="w-full" />
            <div className={tool_tooltip_style}>
              {`Heading ${headingTag.toUpperCase()}`}
            </div>
          </button>
        ))}
      </>
    );
} 