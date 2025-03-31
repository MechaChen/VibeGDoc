import { $getSelection, $isRangeSelection, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListType } from '@lexical/list';

import typeH1 from '../../assets/type-h1.svg';
import typeH2 from '../../assets/type-h2.svg';
import typeH3 from '../../assets/type-h3.svg';
import listOl from '../../assets/list-ol.svg';
import listUl from '../../assets/list-ul.svg';
import bold from '../../assets/type-bold.svg';
import italic from '../../assets/type-italic.svg';
import underline from '../../assets/type-underline.svg';
import undo from '../../assets/undo.svg';
import redo from '../../assets/redo.svg';

import vibeBanner from '/favicon.png';
import { INSERT_VIBE_BANNER_COMMAND } from '../VibeBannerPlugin/VibeBannerPlugin';

const tool_layout = 'py-1 px-3 w-10 h-10 relative rounded';
const tool_hover_style = 'hover:bg-[#eee] transition-colors duration-200 cursor-pointer';
const tool_tooltip_style = 'absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10';

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

function UnRedoToolbarPlugin() {
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

function HeadingPlugin() {
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

function FontStyleToolbarPlugin() {
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

function ListToolbarPlugin() {
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

function VibeBannerToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyVibeBanner = () => {
    editor.dispatchCommand(INSERT_VIBE_BANNER_COMMAND, undefined);
  }

  return (
    <button className={`group ${tool_layout} ${tool_hover_style}`} onClick={applyVibeBanner}>
      <img src={vibeBanner} alt="Vibe Banner" className="w-full" />
      <div className={tool_tooltip_style}>
        Vibe Banner
      </div>
    </button>
  );
}

export default function ToolbarPlugin() {
  return (
    <div className="border border-gray-300 rounded-t-xl flex items-center p-1">
      <UnRedoToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <HeadingPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <FontStyleToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <ListToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <VibeBannerToolbarPlugin />
    </div>
  )
}