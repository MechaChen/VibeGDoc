# VibeGDoc
An AI-powered collaborative editor for vibe-driven writing, featuring:
- 💬 Context-aware AI conversation
- ✍️ AI-assisted autocomplete
- 🎙️ Voice recognition

&nbsp;&nbsp;

## Phase 0 — Single-User AI Editor

### Frontend & Backend Task Breakdown

Demo :

[https://github.com/user-attachments/assets/f3687087-9b4e-4d17-b2fe-d0b66273c22b](https://github.com/user-attachments/assets/c6fa273a-394a-4bac-958a-7fe39cf506a0)

&nbsp;

🌐 Frontend (React + Lexical)

| Feature               | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Set up Lexical editor | Initialize LexicalEditor with EditorComposer and plugins                                          |
| Smart Hint            | Render suggestions near caret with `createPortal()`, apply text on Tab press                      |
| AI Toolbar            | Show toolbar on text selection to trigger Rephrase / Fix / Summarize via OpenAI and insert result |
| Voice Input           | Convert speech to text using Web Speech API, insert via `editor.update(() => insertText)`         |
| MCP Plugin            | AI side panel, apply result with custom command to insert text                                    |

🖥️ Backend (Node.js + AWS Lambda optional)

| Feature          | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| OpenAI Proxy API | Proxy endpoint for calling OpenAI securely and logging usage |
| Hosting          | Host via EC2 / Lambda + API Gateway / Vercel                 |



&nbsp;&nbsp;

## Phase 1 — Add Real-Time Collaboration

### Frontend & Backend Task Breakdown (Redis + Multi-Server Architecture)

Demo :

https://github.com/user-attachments/assets/d7621e80-4c5f-45eb-94a0-35be76a45319

&nbsp;

🌐 Frontend (Lexical + Yjs)

| Feature                 | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| Integrate Yjs + Lexical | Use `@lexical/yjs` provider                                               |
| WebSocket Provider      | Connect via `y-websocket` client to sync server                           |
| Awareness               | Show collaborator cursor, name, color via Yjs awareness                   |
| Voice AI Insert         | Insert voice-to-text result directly into Lexical document, synced by Yjs |

🖥️ Backend (Node.js + WebSocket + Redis)

| Feature                | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| Run y-websocket server | Set up WebSocket sync with room separation                            |
| One Y.Doc per document | Each room corresponds to one shared document state                    |
| Redis Pub/Sub          | Sync updates between servers (use official y-websocket Redis adapter) |
| Load Balancer Support  | Balance clients across servers and sync updates consistently          |

&nbsp;&nbsp;;&nbsp;

## Phase 2 — Basic Scalable Collaboration Protocol

### Frontend & Backend Task Breakdown

🌐 Frontend (React)

| Feature            | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Local buffer queue | Queue unsent operations locally                           |
| requestId + ACK    | Track each op via ID, clear when ACK received from server |
| In-flight control  | Limit one pending edit at a time                          |
| MCP Apply → Buffer | Add operation into buffer on apply                        |

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

🖥️ Backend (Node.js + AWS)

| Feature           | Description                                         |
| ----------------- | --------------------------------------------------- |
| Snapshot API      | `GET/POST /snapshots/:docId` to save/load snapshots |
| Snapshot Storage  | Store in S3 / DynamoDB / RDS                        |
| Metadata Tracking | Save version info like time, user, description      |


&nbsp;

