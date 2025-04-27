import VoiceToTextToolPlugin from '../VoiceToTextToolPlugin';
import UnRedoToolPlugin from '../UnRedoToolPlugin';
import HeadingToolPlugin from '../HeadingToolPlugin';
import FontStyleToolPlugin from '../FontStyleToolPlugin';
import ListToolPlugin from '../ListToolPlugin';
import VibeBannerToolPlugin from '../VibeBannerPlugin/VibeBannerToolPlugin';
import VersionPlugin from '../VersionPlugin';

const toolbarPlugins = [
  VoiceToTextToolPlugin,
  VersionPlugin,
  HeadingToolPlugin,
  FontStyleToolPlugin,
  ListToolPlugin,
  VibeBannerToolPlugin,
  UnRedoToolPlugin,
]

export default function ToolbarPlugin() {
  return (
    <div className="border border-gray-300 rounded-t-xl flex items-center p-1">
      {toolbarPlugins.map((ToolPlugin, index) => (
        <>
          <ToolPlugin key={index} />
          {index < toolbarPlugins.length - 1 && (
            <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
          )}
        </>
      ))}
    </div>
  )
}