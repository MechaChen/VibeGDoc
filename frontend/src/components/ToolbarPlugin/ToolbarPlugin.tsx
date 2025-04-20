import VoiceToTextToolPlugin from '../VoiceToTextToolPlugin';
import UnRedoToolPlugin from '../UnRedoToolPlugin';
import HeadingToolPlugin from '../HeadingToolPlugin';
import FontStyleToolPlugin from '../FontStyleToolPlugin';
import ListToolPlugin from '../ListToolPlugin';
import VibeBannerToolPlugin from '../VibeBannerPlugin/VibeBannerToolPlugin';

const toolbarPlugins = [
  VoiceToTextToolPlugin,
  UnRedoToolPlugin,
  HeadingToolPlugin,
  FontStyleToolPlugin,
  ListToolPlugin,
  VibeBannerToolPlugin,
]

export default function ToolbarPlugin() {
  return (
    <div className="border border-gray-300 rounded-t-xl flex items-center p-1">
      {toolbarPlugins.map((ToolbarPlugin, index) => (
        <>
          <ToolbarPlugin key={index} />
          {index < toolbarPlugins.length - 1 && (
            <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
          )}
        </>
      ))}
    </div>
  )
}