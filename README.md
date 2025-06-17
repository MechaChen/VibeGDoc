# VibeGDoc
An AI-powered collaborative editor for vibe-driven writing, featuring:
- ✍️ AI-assisted autocomplete
- 🎙️ AI Voice to Text recognition
- 🧭 AI Version change summarize
- 📅 Google calendar integration by MCP

&nbsp;&nbsp;

## Phase 0 — Single-User AI Editor

Demo :

[https://github.com/user-attachments/assets/f3687087-9b4e-4d17-b2fe-d0b66273c22b](https://github.com/user-attachments/assets/c6fa273a-394a-4bac-958a-7fe39cf506a0)

&nbsp;

## Features

### AI Functionality

| Component | Feature | Description |
|-----------|---------|-------------|
| 🌐 Frontend | Smart Hint | hint AI-assisted autocomplete for current context, connecting to current cursor position |
| 🖥️ Backend | OpenAI Text API | use OpenAI `gpt-4o-mini` model to generate following text according to context |

&nbsp;

### Core Functionality

| Component | Feature | Description |
|-----------|---------|-------------|
| 🌐 Frontend | Rich text editor | able to insert format text, like headings, list, and custom banner |
| 🌐 Frontend | Undo / Redo | able to undo / redo to previous steps locally  | 


&nbsp;&nbsp;

## Phase 1 — Add Real-Time Collaboration

Demo :

https://github.com/user-attachments/assets/5b0f88b1-6cfe-4019-a8a9-8db1bba6ff6b

&nbsp;

### AI Functionality

| Component | Feature | Description |
| --- | ----------------------- | ------------------------------------------------------------------------- |
| 🌐 Frontend | AI Voice to text | Insert voice-to-text result directly into Lexical document, synced by Yjs |
| 🖥️ Backend | Voice Processing | Process audio input and convert to text using OpenAI Whisper |

&nbsp;

### Core Functionality

🌐 Frontend (Lexical + Yjs)

| Component | Feature | Description |
| ---- | ----------------------- | ------------------------------------------------------------------------- |
| 🌐 Frontend | Empower collaboration by integrate Yjs CRDT | Use `@lexical/yjs` plugin |
| 🌐 Frontend | WebSocket Provider | Connect via `y-websocket` client to sync server |
| 🖥️ Backend | Run y-websocket server | Set up minimum y-WebSocket to handle real-time CDRT collaboration |
| 🖥️ Backend | Run y-websocket on EC2 | Run y-websocket server on EC2 on AWS Cloud |
| 🖥️ Backend | Load Balancer Support | Balance clients across servers and sync updates consistently |


&nbsp;&nbsp;&nbsp;

## Phase 2 — Basic Scalable Collaboration Protocol

### Frontend & Backend Task Breakdown

🌐 Frontend (React)

| Feature            | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Local buffer queue | Queue unsent operations locally                           |
| requestId + ACK    | Track each op via ID, clear when ACK received from server |
| In-flight control  | Limit one pending edit at a time                          |
| MCP Apply → Buffer | Add operation into buffer on apply                        |

&nbsp;

🖥️ Backend (Node.js + Custom WebSocket Server)

| Feature                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| Receive op with requestId | Handle operation payloads with metadata       |
| Send ACK                  | Return `{ type: 'ack', requestId }` to client |
| Preserve order            | Ensure operation sequence is consistent       |
| Optional storage          | Log ops in Redis or DB for replay/debugging   |

&nbsp;&nbsp;

## Phase 3 — Persistence, History & Reconnect Support

### Frontend & Backend Task Breakdown

🌐 Frontend (React)

| Feature           | Description                                       |
| ----------------- | ------------------------------------------------- |
| IndexedDB caching | Use `y-indexeddb` to store offline state/snapshot |
| Snapshot UI       | Allow switching between snapshot versions         |
| Autosave          | Periodically upload Yjs snapshot to backend       |

&nbsp;

🖥️ Backend (Node.js + AWS)

| Feature           | Description                                         |
| ----------------- | --------------------------------------------------- |
| Snapshot API      | `GET/POST /snapshots/:docId` to save/load snapshots |
| Snapshot Storage  | Store in S3 / DynamoDB / RDS                        |
| Metadata Tracking | Save version info like time, user, description      |


&nbsp;

