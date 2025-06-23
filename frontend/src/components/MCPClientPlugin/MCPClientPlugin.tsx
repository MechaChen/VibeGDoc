import { useState, ReactNode } from "react";
import { createPortal } from "react-dom";

import mcpClientIcon from "../../assets/mcp.png";
import {
  tool_hover_style,
  tool_layout,
  tool_tooltip_style,
} from "../ToolbarPlugin/styles";
import ChatWithMcpServer from "./_ChatWithMcpServer";
import InitMcpServer from "./_InitMcpServer";
import type { TServer } from "./types";

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

const McpClientPlugin = () => {
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
          <InitMcpServer setServer={setServer} server={server} />
          {server && (
            <>
              <hr className="my-8 border-gray-200" />
              <ChatWithMcpServer />
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default McpClientPlugin;
