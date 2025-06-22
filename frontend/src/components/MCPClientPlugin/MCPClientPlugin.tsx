import React, { useState, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

import mcpClientIcon from "../../assets/mcp.png";
import bouncingCirclesWhiteIcon from "../../assets/bouncing-circles-white.svg";
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
        <div className="flex-1 overflow-y-auto py-2 px-2">{children}</div>
      </div>
    </>,
    drawerRoot
  );
};

type TServer = {
  serverName: string;
  tools: string[];
};

const MCPClientPlugin = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [server, setServer] = useState<TServer | null>(null);
  const [path, setPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDrawer = () => setDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

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
    <>
      <button
        onClick={openDrawer}
        className={`group ${tool_layout} ${tool_hover_style}`}
      >
        <img src={mcpClientIcon} alt="MCP Client" className="w-full" />
        <div className={tool_tooltip_style}>Toggle MCP Client</div>
      </button>
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} title="MCP Client">
        <div className="p-4">
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
                className="w-[100px] flex justify-center items-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
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
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>

          <div className="pt-4">
            {server === null ? (
              <p className="text-sm text-gray-500">No servers connected yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2.5 w-2.5 bg-green-500 rounded-full flex-shrink-0"></span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{server.serverName}</span>
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
          <hr className="my-8 border-gray-200" />
        </div>
      </Drawer>
    </>
  );
};

export default MCPClientPlugin;
