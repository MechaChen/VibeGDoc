import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { tool_tooltip_style } from "../ToolbarPlugin/styles";
import { tool_hover_style } from "../ToolbarPlugin/styles";
import { tool_layout } from "../ToolbarPlugin/styles";
import { INSERT_VIBE_BANNER_COMMAND } from "./VibeBannerPlugin";
import vibeBanner from '/favicon.png';

export default function VibeBannerToolPlugin() {
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