import React, { useState } from "react";
import axios from "axios";

import bouncingCirclesWhiteIcon from "../../assets/bouncing-circles-white.svg";
import { serviceDomains } from "../../config/services";
import type { TServer } from "./types";


const InitMcpServer = ({
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
            placeholder="e.g., local-mcp-servers/weather.js"
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

export default InitMcpServer;
