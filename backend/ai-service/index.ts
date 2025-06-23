import express from "express";
import OpenAI from "openai";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import MCPClient from "./mcp-client";

const app = express();
const execPromise = util.promisify(exec);

// 確保上傳目錄存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
    dest: uploadDir,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/mp3' || 
            file.mimetype === 'audio/mpeg' || 
            file.mimetype === 'audio/webm') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP3 and WebM files are allowed.'));
        }
    }
});

app.use(express.json());
app.use(cors());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});


app.post("/ghost-text", async (req, res) => {
    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "developer",
                content: `You are an assistant that helps users continue their writing. Respond with only the most natural next sentence based on the user's input. and give one space before sentence.`
            },
            {
                role: "user",
                content: req.body.context,
            },
        ],
        // a sentence is approximately 20 tokens
        max_tokens: 20,
    });

    res.send(completion.choices[0]?.message.content);
});

app.post("/voice-to-text", upload.single('audio'), async (req, res): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const originalPath = req.file.path;
    const wavPath = `${originalPath}.wav`;

    try {
        await execPromise(`ffmpeg -i ${originalPath} -ar 16000 -ac 1 -c:a pcm_s16le ${wavPath}`);
        const fileStream = fs.createReadStream(wavPath);
        
        const response = await client.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-1",
            language: "en",
        });

        // 確保檔案被刪除
        fs.unlinkSync(originalPath); // 刪除原始 webm
        fs.unlinkSync(wavPath);      // 刪除轉檔後的 wav
        
        res.json({ text: response.text });
    } catch (error) {
        console.error('Error processing audio:', error);
        // 確保在錯誤時也刪除檔案
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
        res.status(500).json({ error: 'Failed to process audio' });
    }
});

app.post("/summarize-version-diff", async (req, res) => {
    const { prevVersion, curVersion } = req.body;

    const summary = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: `Compare the two text versions and describe the main difference.
                    ⚠️ Limit the output to at most 10 English words.
                    ⚠️ Only output the difference itself, no explanations, no full sentences, no extra context.
                    Previous version: ${prevVersion}
                    Current version: ${curVersion}
                `,
            },
        ],
        // a sentence is approximately 20 tokens
        max_tokens: 10,
    });

    res.send(summary.choices[0]?.message.content);
});

let mcpClient: MCPClient;

app.post('/mcp-init', async (req, res) => {
    const { serverScriptPath } = req.body;

    try {
        mcpClient = new MCPClient();
        const tools = await mcpClient.connectToServer(serverScriptPath);

        function sleep(ms: number) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        await sleep(3000);

        res.json(tools);
    } catch (error) {
        console.error('Error connecting to MCP server:', error);
        res.status(500).json({ error: 'Failed to connect to MCP server' });
    }
});

app.post('/mcp-chat', async (req, res) => {
    const { query, editorContent } = req.body;
    const response = await mcpClient.chat(query, editorContent);
    res.json({ response });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});