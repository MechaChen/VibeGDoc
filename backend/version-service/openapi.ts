import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

// 建立 registry
export const registry = new OpenAPIRegistry();

// Document schema
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
registry.register('Document', DocumentSchema);

// Version schema
export const VersionSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  s3Key: z.string(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
registry.register('Version', VersionSchema);

// 產生 OpenAPI 文件
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Version Service API',
      version: '1.0.0',
      description: 'API documentation for Version Service (zod-to-openapi)',
    },
  });
} 