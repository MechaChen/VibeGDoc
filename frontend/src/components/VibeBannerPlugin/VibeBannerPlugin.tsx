import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType } from '@lexical/selection';
import type { EditorConfig, LexicalNode, RangeSelection } from 'lexical';
import { $createParagraphNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_LOW, createCommand, ElementNode, INSERT_LINE_BREAK_COMMAND, INSERT_PARAGRAPH_COMMAND, KEY_ENTER_COMMAND } from 'lexical';

export class VibeBannerNode extends ElementNode {
    static getType() {
        return 'banner';
    }

	static clone(node: VibeBannerNode): VibeBannerNode {
		return new VibeBannerNode(node.__key);
	}

	// tell lexical how node represent in DOM
	createDOM(config: EditorConfig): HTMLElement {
		const element = document.createElement('div');
		// 將 element 加上 className，這樣就可以 style 了
		element.className = config.theme.banner;
		return element;
	}

    insertNewAfter(): null | ElementNode {
        const newBlock = $createParagraphNode();
        const direction = this.getDirection();
        newBlock.setDirection(direction);
        this.insertAfter(newBlock);
        return newBlock;
    }

    updateDOM() {
        return false;
    }
}

export function $createVibeBannerNode(): VibeBannerNode {
	return new VibeBannerNode();
}

export function $isVibeBannerNode(node: LexicalNode): node is VibeBannerNode {
	return node instanceof VibeBannerNode;
}

export const INSERT_VIBE_BANNER_COMMAND = createCommand('insertVibeBanner');

export function VibeBannerPlugin(): null {
	const [editor] = useLexicalComposerContext();

    if (!editor.hasNode(VibeBannerNode)) {
        throw new Error('VibeBannerPlugin: VibeBannerNode not registered on editor');
    }

	editor.registerCommand(
		INSERT_VIBE_BANNER_COMMAND,
		() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, $createVibeBannerNode);
			}
			return true; // prevent propogation
		},
		COMMAND_PRIORITY_LOW,
	);

    editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }
          selection.insertParagraph();
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );

    editor.registerCommand<boolean>(
        INSERT_LINE_BREAK_COMMAND,
        (selectStart) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }
          selection.insertLineBreak(selectStart);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );

    editor.registerCommand<KeyboardEvent | null>(
        KEY_ENTER_COMMAND,
        (event) => {
            console.log('KEY_ENTER_COMMAND');
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }
  
          if (event !== null) {
            // If we have beforeinput, then we can avoid blocking
            // the default behavior. This ensures that the iOS can
            // intercept that we're actually inserting a paragraph,
            // and autocomplete, autocapitalize etc work as intended.
            // This can also cause a strange performance issue in
            // Safari, where there is a noticeable pause due to
            // preventing the key down of enter.
            event.preventDefault();
            if (event.shiftKey) {
              return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
            }
          }
          return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
        },
        COMMAND_PRIORITY_EDITOR,
      );

	return null;
}