/**
 * フロントエンドデプロイスクリプト
 * このスクリプトはGitHub Actionsから呼び出され、フロントエンドをデプロイします。
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
  path: process.env.DEPLOY_PATH || '/var/www/union-frontend',
  // CDNなどを使用する場合のURL
  publicUrl: process.env.PUBLIC_URL || 'https://union-website.com'
};

console.log('フロントエンドのデプロイを開始します...');

try {
  // デプロイキーを一時ファイルに書き込む
  const deployKeyPath = path.join(__dirname, '../deploy_key');
  fs.writeFileSync(deployKeyPath, process.env.DEPLOY_KEY || '', { mode: 0o600 });

  // ビルドの実行（GitHub Actionsですでに実行されている場合はスキップ）
  if (!fs.existsSync(path.join(__dirname, '../dist'))) {
    console.log('フロントエンドをビルドしています...');
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }

  // デプロイの実行
  console.log(`${config.host}にデプロイしています...`);
  const deployCommand = `
    cd ${path.join(__dirname, '..')} && 
    tar -czf ./frontend-dist.tar.gz -C dist . && 
    scp -i ${deployKeyPath} -o StrictHostKeyChecking=no ./frontend-dist.tar.gz ${config.user}@${config.host}:${config.path}/frontend-dist.tar.gz && 
    ssh -i ${deployKeyPath} -o StrictHostKeyChecking=no ${config.user}@${config.host} "
      cd ${config.path} && 
      mkdir -p html && 
      rm -rf html/* && 
      tar -xzf frontend-dist.tar.gz -C html && 
      rm frontend-dist.tar.gz
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