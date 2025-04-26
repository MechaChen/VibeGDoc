import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 創建第一個文件 - 版本 1
  const doc1v1 = await prisma.document.create({
    data: {
      title: "Getting Started with TypeScript",
      author: "Benson",
      s3Key: "documents/doc1/v1.json",
      version: 1
    }
  })
  console.log('Created document 1, version 1:', doc1v1)

  // 創建第一個文件 - 版本 2
  const doc1v2 = await prisma.document.create({
    data: {
      id: doc1v1.id,  // 使用相同的 ID
      title: "Getting Started with TypeScript - Updated",
      author: "Benson",
      s3Key: "documents/doc1/v2.json",
      version: 2
    }
  })
  console.log('Created document 1, version 2:', doc1v2)

  // 創建第二個文件 - 只有一個版本
  const doc2 = await prisma.document.create({
    data: {
      title: "React Best Practices",
      author: "Benson",
      s3Key: "documents/doc2/v1.json",
      version: 1
    }
  })
  console.log('Created document 2:', doc2)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 