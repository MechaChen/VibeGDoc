# VibeGDoc
An AI-powered collaborative editor for vibe-driven writing, featuring:
- ✍️ AI-assisted autocomplete
- 🎙️ AI Voice-to-text recognition
- 🧭 AI-driven version change summarization

&nbsp;&nbsp;

## Phase 0 — Single-User AI Editor

Demo :

[https://github.com/user-attachments/assets/f3687087-9b4e-4d17-b2fe-d0b66273c22b](https://github.com/user-attachments/assets/c6fa273a-394a-4bac-958a-7fe39cf506a0)

&nbsp;

## Features

### AI Functionality

| Component | Feature | Description |
|-----------|---------|-------------|
| 🌐 Frontend | AI Smart Hint | Provides AI-assisted autocomplete suggestions based on the current cursor context |
| 🖥️ Backend | AI Predictive Text Generation | Uses OpenAI’s gpt-4o-mini to generate next-step content from current context |

&nbsp;

### Core Functionalities

| Component | Feature | Description |
|-----------|---------|-------------|
| 🌐 Frontend | Rich text editor | Supports formatted content including headings, lists, and custom banners |
| 🌐 Frontend | Undo / Redo | Supports local undo and redo history  | 


&nbsp;&nbsp;

## Phase 1 — Add Real-Time Collaboration

Demo :

https://github.com/user-attachments/assets/5b0f88b1-6cfe-4019-a8a9-8db1bba6ff6b

&nbsp;

### AI Functionality

| Component | Feature | Description |
| --- | ----------------------- | ------------------------------------------------------------------------- |
| 🌐 Frontend | AI Voice to text | Converts speech to text and inserts it directly into the document  |
| 🌐 Frontend | Voice recording animation | Displays wave animation while the user is speaking |  
| 🖥️ Backend | Voice Processing | Converts `.webm` audio to `.wav` via `ffmpeg`, then transcribes with OpenAI Whisper |

&nbsp;

### Core Functionalities

| Component | Feature | Description |
| ---- | ----------------------- | ------------------------------------------------------------------------- |
| 🌐 Frontend | Real-time Collaboration via Yjs | Uses @lexical/yjs plugin for CRDT-based collaboration |
| 🖥️ Backend | Run y-websocket server | Hosts a minimal y-websocket server to support collaboration |
| 🖥️ Backend | Run y-websocket on EC2 | Runs collaboration server on AWS EC2 instance |
| 🖥️ Backend | Load Balancer Support | Ensures consistent updates across multiple clients and servers |


&nbsp;&nbsp;&nbsp;


## Phase 2 — Version & Snapshot

### AI Functionality

| Component | Feature | Description |
| --- | ----------------------- | ------------------------------------------------------------------------- |
| 🌐 Frontend | AI Version Summary | Displays a summary comparing the current and previous versions |
| 🖥️ Backend | AI Snapshot Comparison | Uses OpenAI gpt-4o-mini to generate summaries based on version diffs |


&nbsp;

### Core Functionalities

| Component | Feature | Description |
|-----------|---------|-------------|
| 🌐 Frontend | Version Drawer UI | Interface for viewing and navigating saved versions |
| 🌐 Frontend | Save Version | Allows users to save a snapshot of the current document |
| 🖥️ Backend | Store snapshots | Encodes and stores snapshots in static object storage (e.g. S3)  | 
| 🖥️ Backend | Store Metadata | Saves version metadata to a SQL database  | 
| 🖥️ Backend | Retrieve Version | Retrieves a specific version snapshot from the S3 bucket  | 


&nbsp;

