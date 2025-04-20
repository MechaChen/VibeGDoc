import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListType } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { tool_hover_style, tool_layout, tool_tooltip_style } from "../ToolbarPlugin/styles";
import listOl from '../../assets/list-ol.svg';
import listUl from '../../assets/list-ul.svg';

const listTypes = {
    number: {
      tag: 'number',
      icon: listOl,
    },
    bullet: {
      tag: 'bullet',
      icon: listUl,
    },
  } as const
  
export default function ListToolPlugin() {
    const [editor] = useLexicalComposerContext();
  
    const applyList = (listType: ListType) => {
      if (listType === listTypes.number.tag) {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        return true;
      } else if (listType === listTypes.bullet.tag) {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        return true;
      }
    };
  
    return (
      <>
        {Object.keys(listTypes).map((listType) => (
          <button
            key={listType}
            className={`group ${tool_layout} ${tool_hover_style}`}
            onClick={() => applyList(listType as ListType)}
          >
            <img src={listTypes[listType as keyof typeof listTypes].icon} alt={listType} className="w-full" />
            <div className={tool_tooltip_style}>
              {listType === 'number' ? 'Numbered List' : 'Bullet List'}
            </div>
          </button>
        ))}
      </>
    );
  }