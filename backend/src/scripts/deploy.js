/**
 * デプロイスクリプト
 * このスクリプトはGitHub Actionsから呼び出され、バックエンドをデプロイします。
 */
require('dotenv').config();
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// デプロイ設定
const config = {
  // 本番サーバーのSSH接続情報
  host: process.env.DEPLOY_HOST || 'example.com',
  user: process.env.DEPLOY_USER || 'deploy',
  path: process.env.DEPLOY_PATH || '/var/www/union-backend',
  // デプロイに含めるファイル
  include: [
    'src/**/*',
    'package.json',
    'package-lock.json',
    '.env.example',
    'README.md'
  ],
  // デプロイから除外するファイル
  exclude: [
    'node_modules',
    'logs',
    'tests',
    'coverage',
    '.git'
  ]
};

console.log('バックエンドのデプロイを開始します...');

try {
  // デプロイキーを一時ファイルに書き込む
  const deployKeyPath = path.join(__dirname, '../../deploy_key');
  fs.writeFileSync(deployKeyPath, process.env.DEPLOY_KEY || '', { mode: 0o600 });

  // ビルドディレクトリの作成
  const buildDir = path.join(__dirname, '../../build');
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);

  // ファイルのコピー
  console.log('ファイルを準備しています...');
  config.include.forEach(pattern => {
    const sourcePath = path.join(__dirname, '../..', pattern);
    const targetDir = path.join(buildDir, path.dirname(pattern));
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    try {
      execSync(`cp -r ${sourcePath} ${targetDir}`);
    } catch (err) {
      console.warn(`警告: ${pattern}のコピーに失敗しました`, err.message);
    }
  });

  // .envファイルの作成
  console.log('環境変数を設定しています...');
  const envContent = `
NODE_ENV=production
PORT=5001
MONGODB_URI=${process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp'}
JWT_SECRET=${process.env.JWT_SECRET || 'your-jwt-secret'}
UPLOAD_DIR=${process.env.UPLOAD_DIR || '/var/www/union-uploads'}
`;
  fs.writeFileSync(path.join(buildDir, '.env'), envContent);

  // デプロイの実行
  console.log(`${config.host}にデプロイしています...`);
  const deployCommand = `
    cd ${buildDir} && 
    tar -czf ../backend.tar.gz . && 
    scp -i ${deployKeyPath} -o StrictHostKeyChecking=no ../backend.tar.gz ${config.user}@${config.host}:${config.path}/backend.tar.gz && 
    ssh -i ${deployKeyPath} -o StrictHostKeyChecking=no ${config.user}@${config.host} "
      cd ${config.path} && 
      tar -xzf backend.tar.gz && 
      npm install --production && 
      pm2 restart union-backend || pm2 start src/app.js --name union-backend
    "
  `;
  
  // デプロイが実行環境で利用可能な場合のみ実行
  if (process.env.DEPLOY_KEY) {
    execSync(deployCommand, { stdio: 'inherit' });
    console.log('デプロイが完了しました！');
  } else {
    console.log('デプロイキーが設定されていないため、デプロイをスキップします。本番環境で実行してください。');
  }

  // 一時ファイルの削除
  fs.unlinkSync(deployKeyPath);
  
} catch (error) {
  console.error('デプロイエラー:', error.message);
  process.exit(1);
} 