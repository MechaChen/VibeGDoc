import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import { PrismaClient } from './generated/prisma';
import { openApiDoc } from "./doc";

const app = express();
const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

// 創建文檔
app.post('/documents', async (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const document = await prisma.document.create({
      data: {
        title,
        author,
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// 獲取文檔
app.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// 獲取文檔版本列表
app.get('/documents/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const versions = await prisma.version.findMany({
      where: { documentId: id },
      orderBy: { version: 'desc' },
    });

    res.json(versions);
  } catch (error) {
    console.error('Error fetching document versions:', error);
    res.status(500).json({ error: 'Failed to fetch document versions' });
  }
});

// 生成 pre-signed URL 的端點
app.post('/documents/:id/versions/presigned-url', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // 生成一個唯一的文件名
    const fileName = `${id}/${uuidv4()}.json`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({
      presignedUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

app.get('/documents/:id/versions/presigned-url', async (req, res) => {
  try {
    const { id } = req.params;
    const { s3Key } = req.query;

    if (!id || !s3Key) {
      return res.status(400).json({ error: 'Document ID and s3Key are required' });
    }

    if (typeof s3Key !== 'string') {
      return res.status(400).json({ error: 's3Key must be a string' });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({
      presignedUrl,
    });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned download URL' });
  }
});

// 1. 全域 clients 陣列
const clients: any[] = [];

// 2. SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  res.write('data: {"status": "connected"}\n\n');

  req.on('close', () => {
    clients.splice(clients.indexOf(res), 1);
  });
});

// 3. 廣播 function
function broadcastVersionSaved(documentId: string, version: any) {
  const payload = JSON.stringify({ type: 'version_saved', documentId, version });
  clients.forEach(res => {
    if (typeof res.write === 'function') {
      res.write(`data: ${payload}\n\n`);
    }
  });
}

// 創建文檔版本
app.post('/documents/:id/versions', async (req, res) => {
  try {
    const { id } = req.params;
    const { s3Key } = req.body;

    if (!s3Key) {
      return res.status(400).json({ error: 's3Key is required' });
    }

    // 獲取當前最高版本
    const prevVersion = await prisma.version.findFirst({
      where: { documentId: id },
      orderBy: { version: 'desc' },
    });
    const prevS3Key = prevVersion?.s3Key;

    let versionDiffSummary = '';

    if (prevVersion) {
      const prevContent = await s3Client.send(new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: prevS3Key,
        }))
        .then(response => response.Body?.transformToString());

      const curContent = await s3Client.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      }))
      .then(response => response.Body?.transformToString());
      
      const response = await axios.post("http://localhost:3000/summarize-version-diff", {
        prevVersion: prevContent,
        curVersion: curContent,
      })
      versionDiffSummary = response.data;
    }

    // 創建新版本
    const newVersion = await prisma.version.create({
      data: {
        documentId: id,
        s3Key,
        version: prevVersion ? prevVersion.version + 1 : 1,
        diff: versionDiffSummary,
      },
    });

    broadcastVersionSaved(id, newVersion);
    res.json(newVersion);
  } catch (error) {
    console.error('Error creating new document version:', error);
    res.status(500).json({ error: 'Failed to create new document version' });
  }
});

// 健康檢查端點
app.get('/health', (_, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
