import { Anthropic } from "@anthropic-ai/sdk";
import {
  type MessageParam,
  type Tool,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from 'child_process';
// import readline from "readline/promises";
// import dotenv from "dotenv";

// dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

// async function main() {
//   if (process.argv.length < 3) {
//     console.log("Usage: node index.ts <path_to_server_script>");
//     return;
//   }
//   const mcpClient = new MCPClient();
//   try {
//     await mcpClient.connectToServer('');
//     // await mcpClient.chatLoop();
//   } finally {
//     // await mcpClient.cleanup();
//     // process.exit(0);
//   }
// }

export default class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }
  
  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }

      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;
  
      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);
  
      const toolsResult = await this.mcp.listTools();

      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });
      
      // Extract server name from the script path (e.g., "mcp-servers/weather.js" -> "weather")
      const serverName = serverScriptPath.split('/').pop()?.split('.').slice(0, -1).join('.');
      if (!serverName) {
        console.error('Could not determine server name from path:', serverScriptPath);
        return;
      }
      
      return {
        serverName,
        tools: this.tools.map(({ name }) => name),
      };
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async chat(query: string) {
    const messages: MessageParam[] = [
      {
        role: "user",
        content: query,
      },
    ];
  
    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages,
      tools: this.tools,
    });
  
    const finalText = [];
  
    for (const content of response.content) {
      if (content.type === "text") {
        finalText.push({
          type: 'text',
          text: content.text,
        });
      } else if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;
  
        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });
        finalText.push(
          {
            type: 'tool_call',
            toolName,
            toolArgs,
          }
        );
  
        messages.push({
          role: "user",
          content: result.content as string,
        });
  
        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages,
        });
  
        finalText.push(
          {
            type: "text",
            text: response.content[0]?.type === "text" ? response.content[0].text : "",
          }
        );
      }
    }
  
    return finalText;
  }
}