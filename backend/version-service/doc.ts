import { z } from "zod";
import { extendZodWithOpenApi, createDocument } from "zod-openapi";

extendZodWithOpenApi(z);

const Document = z.object({
  id: z.string().openapi({ example: "doc-uuid" }),
  title: z.string().openapi({ example: "My Document" }),
  author: z.string().nullable().openapi({ example: "Benson" }),
  createdAt: z.string().openapi({ example: "2024-05-01T00:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2024-05-01T00:00:00.000Z" }),
}).openapi("Document");

const Version = z.object({
  id: z.string().openapi({ example: "ver-uuid" }),
  documentId: z.string().openapi({ example: "doc-uuid" }),
  s3Key: z.string().openapi({ example: "doc-uuid/uuid.json" }),
  version: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: "2024-05-01T00:00:00.000Z" }),
  updatedAt: z.string().openapi({ example: "2024-05-01T00:00:00.000Z" }),
}).openapi("Version");

export const openApiDoc = createDocument({
  openapi: "3.0.0",
  info: {
    title: "Version Service API",
    version: "1.0.0",
    description: "API documentation for Version Service (zod-openapi)",
  },
  components: {
    schemas: { Document, Version },
  },
  paths: {
    "/documents": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: Document.pick({ title: true, author: true }),
            },
          },
        },
        responses: {
          200: {
            description: "成功回傳文檔",
            content: {
              "application/json": { schema: Document },
            },
          },
        },
      },
    },
    "/documents/{id}": {
      get: {
        requestParams: { path: z.object({ id: z.string().openapi({ example: "doc-uuid" }) }) },
        responses: {
          200: {
            description: "成功回傳文檔",
            content: {
              "application/json": { schema: Document },
            },
          },
          404: { description: "找不到文檔" },
        },
      },
    },
    "/documents/{id}/versions": {
      get: {
        requestParams: { path: z.object({ id: z.string().openapi({ example: "doc-uuid" }) }) },
        responses: {
          200: {
            description: "成功回傳版本列表",
            content: {
              "application/json": { schema: z.array(Version) },
            },
          },
        },
      },
      post: {
        summary: "創建文檔版本",
        requestParams: { path: z.object({ id: z.string().openapi({ example: "doc-uuid" }) }) },
        requestBody: {
          content: {
            "application/json": {
              schema: z.object({ s3Key: z.string().openapi({ example: "doc-uuid/uuid.json" }) }),
            },
          },
        },
        responses: {
          200: {
            description: "成功回傳新版本",
            content: {
              "application/json": { schema: Version },
            },
          },
        },
      },
    },
    "/documents/{id}/versions/presigned-url": {
      post: {
        summary: "產生 S3 上傳 presigned URL",
        requestParams: { path: z.object({ id: z.string().openapi({ example: "doc-uuid" }) }) },
        responses: {
          200: {
            description: "成功回傳 presignedUrl 與 fileName",
            content: {
              "application/json": {
                schema: z.object({
                  presignedUrl: z.string().openapi({ example: "https://s3..." }),
                  fileName: z.string().openapi({ example: "doc-uuid/uuid.json" }),
                }),
              },
            },
          },
        },
      },
    },
    "/documents/{id}/versions/{version}": {
      get: {
        requestParams: { path: z.object({ id: z.string().openapi({ example: "doc-uuid" }), version: z.number().openapi({ example: 1 }) }) },
        responses: {
          200: {
            description: "成功回傳特定版本文檔",
            content: {
              "application/json": { schema: Version },
            },
          },
          404: { description: "找不到文檔版本" },
        },
      },
    },
    "/health": {
      get: {
        summary: "健康檢查",
        responses: {
          200: {
            description: "服務健康狀態",
            content: {
              "application/json": {
                schema: z.object({ status: z.string().openapi({ example: "healthy" }) }),
              },
            },
          },
        },
      },
    },
    "/events": {
      get: {
        summary: "SSE 事件串流",
        responses: {
          200: {
            description: "SSE 事件串流 (text/event-stream)",
            content: {
              "text/event-stream": {
                schema: z.string().openapi({ example: 'data: {"status": "connected"}\n\n' }),
              },
            },
          },
        },
      },
    },
  }
});
