import React, { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import MarkdownPreview from '@uiw/react-markdown-preview';

import mcpClientIcon from "../../assets/mcp.png";
import bouncingCirclesWhiteIcon from "../../assets/bouncing-circles-white.svg";
import bouncingCirclesIcon from "../../assets/bouncing-circles.svg";

import {
  tool_hover_style,
  tool_layout,
  tool_tooltip_style,
} from "../ToolbarPlugin/styles";
import { serviceDomains } from "../../config/services";

const drawerRoot = document.body;

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  position?: "left" | "right";
}

const Drawer = ({
  isOpen,
  onClose,
  children,
  title,
  position = "right",
}: DrawerProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const drawerClasses = `
    fixed top-0 h-full w-[400px] bg-white z-[1050] flex flex-col
    shadow-lg transition-transform duration-300 transform
    ${position === "right" ? "right-0 rounded-l-xl" : "left-0 rounded-r-xl"}
    ${
      position === "right"
        ? isOpen
          ? "translate-x-0"
          : "translate-x-full"
        : isOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }
  `;

  return createPortal(
    <>
      <div
        className={drawerClasses}
        style={{ boxShadow: "0 0 32px 0 rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none cursor-pointer"
            onClick={onClose}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>,
    drawerRoot
  );
};

type TServer = {
  serverName: string;
  tools: string[];
};

type TextPart = {
  type: "text";
  text: string;
};

type ToolCallPart = {
  type: "tool_call";
  toolName: string;
  toolArgs: Record<string, unknown>;
};

type MessageContent = TextPart | ToolCallPart;

type Message = {
  author: "user" | "bot";
  content: MessageContent;
  id: string;
};

const InitMCPServer = ({
  server,
  setServer,
}: {
  server: TServer | null;
  setServer: (server: TServer) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${serviceDomains.ai}/mcp-init`, {
        serverScriptPath: path,
      });

      setServer(data);
      setPath("");
    } catch (err) {
      setError(
        "Failed to connect to MCP server. Check the path and try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 pb-6">
          Connect to MCP Server
        </h3>
        <label
          htmlFor="mcp-path"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          MCP Server Path
        </label>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            id="mcp-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="e.g., mcp-servers/weather.js"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-[100px] flex justify-center items-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading && (
              <img
                className="h-5 w-5"
                src={bouncingCirclesWhiteIcon}
                alt="Loading"
              />
            )}
            {!isLoading && "Connect"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-700 bg-red-100 px-4 py-2 rounded-md">
            {error}
          </p>
        )}
      </form>

      <div className="pt-4">
        {server === null ? (
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 bg-gray-500 rounded-full flex-shrink-0"></span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-500">
                No MCP server connected
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full flex-shrink-0"></span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {server.serverName}
                </span>
                <span className="text-sm text-gray-500">connected</span>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {server.tools.map((tool) => (
                <li
                  key={tool}
                  className="bg-gray-100 py-1 px-2 rounded-md inline-block text-xs mr-2"
                >
                  <code className=" text-gray-600">{tool}</code>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

const ChatWithMCPServer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      author: "user",
      content: { type: "text", text: input },
      id: Date.now().toString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<{ response: MessageContent[] }>(
        `${serviceDomains.ai}/mcp-chat`,
        {
          query: currentInput,
        }
      );

      const botMessages: Message[] = data.response.map((part, index) => ({
        author: "bot",
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

  const groupedMessages = messages.reduce<Message[][]>((acc, msg) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup[0].author === msg.author) {
      lastGroup.push(msg);
    } else {
      acc.push([msg]);
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-gray-900 pb-6">
        Chat with MCP Server
      </h3>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2">
        {groupedMessages.map((group, index) => {
          const author = group[0].author;
          const isUser = author === "user";

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
                  if (msg.content.type === "text") {
                    return (
                      <div
                        key={msg.id}
                        className={`px-4 ${
                          isUser ? "whitespace-pre-wrap" : ""
                        }`}
                      >
                        <MarkdownPreview
                          source={msg.content.text}
                          className="!bg-inherit !text-inherit"
                        />
                      </div>
                    );
                  }
                  if (msg.content.type === "tool_call") {
                    return (
                      <div
                        key={msg.id}
                        className="bg-gray-100 rounded-lg p-3 mx-4 my-4"
                      >
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
                  }
                  return null;
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
      <form onSubmit={handleSubmit} className="pt-4">
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
    </div>
  );
};

const MCPClientPlugin = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [server, setServer] = useState<TServer | null>(null);

  const openDrawer = () => setDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <button
        onClick={openDrawer}
        className={`group ${tool_layout} ${tool_hover_style}`}
      >
        <img src={mcpClientIcon} alt="MCP Client" className="w-full" />
        <div className={tool_tooltip_style}>Toggle MCP Client</div>
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title="MCP Client">
        <div className="flex flex-col h-full">
          <InitMCPServer setServer={setServer} server={server} />
          {server && (
            <>
              <hr className="my-8 border-gray-200" />
              <ChatWithMCPServer />
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default MCPClientPlugin;
