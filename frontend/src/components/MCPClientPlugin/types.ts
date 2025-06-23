export type TServer = {
  serverName: string;
  tools: string[];
};

export enum MESSAGE_TYPE {
  TEXT = "text",
  TOOL_CALL = "tool_call",
}

export enum AUTHOR_TYPE {
  USER = "user",
  BOT = "bot",
}

export type TextPart = {
  type: MESSAGE_TYPE.TEXT;
  text: string;
};

export type ToolCallPart = {
  type: MESSAGE_TYPE.TOOL_CALL;
  toolName: string;
  toolArgs: Record<string, unknown>;
};

export type MessageContent = TextPart | ToolCallPart;

export type Message = {
  author: AUTHOR_TYPE;
  content: MessageContent;
  id: string;
};
