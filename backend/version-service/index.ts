import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import dotenv from 'dotenv';

// dotenv.config();

const app = express();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME || 'version-service-bucket';

// Middleware
app.use(cors());
app.use(express.json());

// 生成 pre-signed URL 的端點
app.post('/presigned-url', async (req, res) => {
  try {
    // 生成一個唯一的文件名
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

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

// 健康檢查端點
app.get('/health', (_, res) => {
  res.json({ status: 'healthy' });
});

// 設置 SSE 端點
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 發送初始消息
  res.write('data: {"status": "connected"}\n\n');

  // 定期發送心跳
  const heartbeat = setInterval(() => {
    res.write('data: {"type": "heartbeat"}\n\n');
  }, 30000);

  // 處理客戶端斷開連接
  req.on('close', () => {
    clearInterval(heartbeat);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
