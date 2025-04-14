// ✅ 這是一份最小可用的 AWS CDK TypeScript Stack，建立一台可公開存取的 EC2 Server
// 並預設開放常用 port（22, 80, 443, 1234）供 side project 使用

import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Instance, InstanceType, MachineImage, AmazonLinuxGeneration, Vpc, SecurityGroup, Peer, Port, UserData, KeyPair } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class Ec2Stack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps & { keyPairName: string, associatePublicIpAddress: boolean }) {
    super(scope, id, props);

    // 1️⃣ 使用預設 VPC
    const vpc = Vpc.fromLookup(this, 'DefaultVPC', { isDefault: true });

    // 2️⃣ 建立一組安全群組，允許常見 port
    const securityGroup = new SecurityGroup(this, 'VibeEC2SG', {
      vpc,
      description: 'Allow HTTP, HTTPS, SSH, WebSocket ports',
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH');
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow HTTP');
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'Allow HTTPS');
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(1234), 'Allow y-websocket default port');

    // 3️⃣ 設定 EC2 啟動時的腳本
    const userData = UserData.forLinux();
    userData.addCommands(
      // 更新所有 apt 套件到最新版本
      'apt-get update && apt-get upgrade -y',
      // 安裝 curl 和其他必要工具
      'apt-get install -y curl',
      // 下載並執行 NodeSource 腳本以添加 Node.js 18.x 的軟體源
      'curl -fsSL https://deb.nodesource.com/setup_18.x | bash -',
      // 使用 apt 安裝 Node.js 和 Git
      'apt-get install -y nodejs git',
      // 全域安裝 PM2 進程管理器和 Bun 運行時
      'npm install -g pm2 bun',
      // 創建 y-websocket 應用程序目錄
      'mkdir -p /home/ubuntu/y-websocket',
      // 切換到 y-websocket 目錄
      'cd /home/ubuntu/y-websocket',
      // 初始化一個新的 Bun 項目
      'bun init -y',
      // 安裝 y-websocket 依賴包
      'bun add @y/websocket-server',
      // 使用 PM2 啟動 y-websocket 服務，設置主機和端口
      'pm2 start --interpreter bash -- bash -c "HOST=0.0.0.0 PORT=1234 bunx y-websocket"',
      // 保存當前的 PM2 進程列表
      'pm2 save',
      // 設置 PM2 開機自啟動，它會讓你的應用程式（這裡是 y-websocket）在 EC2 每次重開機的時候自動重新啟動
      'pm2 startup'
    );

    // 4️⃣ 建立 key pair
    const keyPair = KeyPair.fromKeyPairName(this, 'KeyPair', props.keyPairName);

    // 5️⃣ 建立 EC2 實例
    new Instance(this, 'VibeInstance', {
      vpc,
      instanceType: new InstanceType('t3.micro'),
      machineImage: MachineImage.genericLinux({
        'us-east-1': 'ami-084568db4383264d4', // Ubuntu 22.04 LTS
      }),
      securityGroup,
      userData,
      keyPair,
      associatePublicIpAddress: props.associatePublicIpAddress,
    });
  }
}
