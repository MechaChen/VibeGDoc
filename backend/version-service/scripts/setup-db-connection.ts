import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabaseConnection() {
    const client = new SecretsManagerClient({
        region: 'us-east-1'
    });

    try {
        // 獲取 RDS 密鑰
        const command = new GetSecretValueCommand({
            SecretId: 'VersionServiceInfraStackVer-yMD47sgI914F'
        });
        
        const response = await client.send(command);

        if (response.SecretString) {
            const dbCredentials = JSON.parse(response.SecretString);
            
            // 建立 Prisma 的資料庫連線字串
            const databaseUrl = `postgresql://${dbCredentials.username}:${dbCredentials.password}@${dbCredentials.host}:${dbCredentials.port}/${dbCredentials.dbname}`;
            
            // 更新 .env 檔案
            const envPath = path.join(__dirname, '..', '.env');
            fs.writeFileSync(envPath, `DATABASE_URL="${databaseUrl}"\n`);
            console.log('Database connection configured successfully!');
        }
    } catch (error) {
        console.error('Error setting up database connection:', error);
        throw error;
    }
}

setupDatabaseConnection(); 