import React, { useEffect, useState } from "react";
import axios from "axios";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { marked } from "marked";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import bouncingCirclesWhiteIcon from "../../assets/bouncing-circles-white.svg";
import bouncingCirclesIcon from "../../assets/bouncing-circles.svg";
import { serviceDomains } from "../../config/services";
import type { Message, MessageContent } from "./types";
import { AUTHOR_TYPE, MESSAGE_TYPE } from "./types";

const TextMessage = ({ msg, isUser }: { msg: Message; isUser: boolean }) => {
  const [editor] = useLexicalComposerContext();

  if (msg.content.type !== MESSAGE_TYPE.TEXT) {
    return null;
  }

  const insertToEditor = async (aiTextResponse: string) => {
    const html = await marked.parse(aiTextResponse);
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    editor.update(() => {
      const nodes = $generateNodesFromDOM(editor, dom);
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selection.insertNodes(nodes);
      } else {
        $getRoot().append(...nodes, $createParagraphNode());
      }
    });

    editor.focus();
  };

  return (
    <div key={msg.id} className="group relative">
      <div className={`px-4 ${isUser ? "whitespace-pre-wrap" : ""}`}>
        <MarkdownPreview
          source={msg.content.text}
          className="!bg-inherit !text-inherit"
        />
      </div>
      {!isUser && (
        <button
          onClick={() => insertToEditor(msg.content.text)}
          title="Insert into document"
          className="absolute top-1 right-5 z-10 px-2 py-1 rounded-md bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          Insert
        </button>
      )}
    </div>
  );
};

const ToolCallMessage = ({ msg }: { msg: Message }) => {
  if (msg.content.type !== MESSAGE_TYPE.TOOL_CALL) {
    return null;
  }

  return (
    <div key={msg.id} className="bg-gray-100 rounded-lg p-3 mx-4 my-4">
      <p className="text-sm text-gray-600">
        Calling tool:{" "}
        <strong className="font-semibold text-gray-800">
          {msg.content.toolName}
        </strong>
      </p>
      <pre className="whitespace-pre-wrap break-all text-sm bg-white p-2 rounded-md mt-2 text-gray-800">
        {JSON.stringify(msg.content.toolArgs, null, 2)}
      </pre>
    </div>
  );
};

const PromptInput = ({
  isLoading,
  setMessages,
  setIsLoading,
}: {
  isLoading: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editor] = useLexicalComposerContext();

  const talkWithMcpServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      author: AUTHOR_TYPE.USER,
      content: { type: MESSAGE_TYPE.TEXT, text: input },
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const editorState = editor.getEditorState();
      const editorContent = JSON.stringify(editorState.toJSON());

      const { data } = await axios.post<{ response: MessageContent[] }>(
        `${serviceDomains.ai}/mcp-chat`,
        {
          query: input,
          editorContent,
        }
      );

      const botMessages: Message[] = data.response.map((part, index) => ({
        author: AUTHOR_TYPE.BOT,
        content: part,
        id: `${Date.now()}-${index}`,
      }));

      setMessages((prev) => [...prev, ...botMessages]);
    } catch (err) {
      setError(
        "Failed to send message to MCP server. Check the path and try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={talkWithMcpServer} className="pt-4">
      <div className="flex items-center gap-2 pb-4">
        <input
          type="text"
          id="mcp-chat"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="Ask the MCP server a question"
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-[100px] flex justify-center items-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <img
              className="h-5 w-5"
              src={bouncingCirclesWhiteIcon}
              alt="Loading"
            />
          ) : (
            "Send"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-700 bg-red-100 px-4 py-2 rounded-md">
          {error}
        </p>
      )}
    </form>
  );
};

const MessageMap = {
  [MESSAGE_TYPE.TEXT]: TextMessage,
  [MESSAGE_TYPE.TOOL_CALL]: ToolCallMessage,
};

const ChatWithMCPServer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messageGroupsByAuthor = messages.reduce<Message[][]>((group, msg) => {
    const lastGroup = group[group.length - 1];
    const isSameAuthorAsLastGroup =
      lastGroup && lastGroup[0].author === msg.author;

    if (isSameAuthorAsLastGroup) {
      lastGroup.push(msg);
    } else {
      group.push([msg]);
    }
    return group;
  }, []);

  useEffect(() => {
    const scrollToBottom = document.getElementById("scroll-to-bottom");
    if (scrollToBottom) {
      scrollToBottom.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-gray-900 pb-6">
        Chat with MCP Server
      </h3>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {messageGroupsByAuthor.map((group, index) => {
          const author = group[0].author;
          const isUser = author === AUTHOR_TYPE.USER;

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg py-2 max-w-xs ${
                  isUser
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {group.map((msg) => {
                  const MessageUI = MessageMap[msg.content.type];
                  return <MessageUI key={msg.id} msg={msg} isUser={isUser} />;
                })}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 max-w-xs bg-gray-200 text-gray-800">
              <img
                className="h-5 w-5"
                src={bouncingCirclesIcon}
                alt="Loading"
              />
            </div>
          </div>
        )}
      </div>
      <PromptInput
        isLoading={isLoading}
        setMessages={setMessages}
        setIsLoading={setIsLoading}
      />
      <div id="scroll-to-bottom" />
    </div>
  );
};

export default ChatWithMCPServer;
