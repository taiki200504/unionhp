/**
 * フロントエンドデプロイ環境チェックスクリプト
 * このスクリプトは、デプロイ先環境が正しく設定されているかを確認します。
 */
require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// チェック項目
const checks = [
  {
    name: '環境変数のチェック',
    check: () => {
      const requiredVars = [
        'DEPLOY_HOST',
        'DEPLOY_USER',
        'DEPLOY_PATH',
        'DEPLOY_KEY'
      ];
      
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        return {
          success: false,
          message: `以下の環境変数が設定されていません: ${missingVars.join(', ')}`
        };
      }
      
      return { success: true, message: '必要な環境変数が設定されています' };
    }
  },
  {
    name: 'デプロイキーのチェック',
    check: () => {
      if (!process.env.DEPLOY_KEY) {
        return {
          success: false,
          message: 'DEPLOY_KEYが設定されていません'
        };
      }
      
      // 一時ファイルに書き込んでチェック
      const deployKeyPath = path.join(__dirname, '../deploy_key_temp');
      try {
        fs.writeFileSync(deployKeyPath, process.env.DEPLOY_KEY, { mode: 0o600 });
        
        // キーの形式をチェック
        const keyContent = fs.readFileSync(deployKeyPath, 'utf8');
        if (!keyContent.includes('PRIVATE KEY')) {
          fs.unlinkSync(deployKeyPath);
          return {
            success: false,
            message: 'デプロイキーの形式が正しくありません'
          };
        }
        
        fs.unlinkSync(deployKeyPath);
        return { success: true, message: 'デプロイキーの形式が正しいです' };
      } catch (error) {
        if (fs.existsSync(deployKeyPath)) {
          fs.unlinkSync(deployKeyPath);
        }
        return {
          success: false,
          message: `デプロイキーのチェックに失敗しました: ${error.message}`
        };
      }
    }
  },
  {
    name: 'ビルドディレクトリのチェック',
    check: () => {
      const distDir = path.join(__dirname, '../dist');
      
      // 既にビルドディレクトリが存在するか確認
      if (fs.existsSync(distDir)) {
        return { success: true, message: 'ビルドディレクトリが存在します' };
      }
      
      // ビルドディレクトリが存在しなければ作成可能か確認
      try {
        fs.mkdirSync(distDir);
        fs.rmdirSync(distDir);
        return { success: true, message: 'ビルドディレクトリを作成できます' };
      } catch (error) {
        return {
          success: false,
          message: `ビルドディレクトリを作成できません: ${error.message}`
        };
      }
    }
  },
  {
    name: 'サーバー接続チェック',
    check: () => {
      if (!process.env.DEPLOY_HOST || !process.env.DEPLOY_USER || !process.env.DEPLOY_KEY) {
        return {
          success: false,
          message: 'サーバー接続情報が不足しています'
        };
      }
      
      const deployKeyPath = path.join(__dirname, '../deploy_key_temp');
      try {
        fs.writeFileSync(deployKeyPath, process.env.DEPLOY_KEY, { mode: 0o600 });
        
        // SSHで接続テスト
        try {
          execSync(`ssh -i ${deployKeyPath} -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${process.env.DEPLOY_USER}@${process.env.DEPLOY_HOST} "echo 'Connection successful'"`, { stdio: 'pipe' });
          fs.unlinkSync(deployKeyPath);
          return { success: true, message: 'サーバーに接続できました' };
        } catch (error) {
          fs.unlinkSync(deployKeyPath);
          return {
            success: false,
            message: `サーバーに接続できませんでした: ${error.message}`
          };
        }
      } catch (error) {
        if (fs.existsSync(deployKeyPath)) {
          fs.unlinkSync(deployKeyPath);
        }
        return {
          success: false,
          message: `サーバー接続テストに失敗しました: ${error.message}`
        };
      }
    }
  },
  {
    name: 'デプロイディレクトリのチェック',
    check: () => {
      if (!process.env.DEPLOY_HOST || !process.env.DEPLOY_USER || !process.env.DEPLOY_KEY || !process.env.DEPLOY_PATH) {
        return {
          success: false,
          message: 'デプロイ情報が不足しています'
        };
      }
      
      const deployKeyPath = path.join(__dirname, '../deploy_key_temp');
      try {
        fs.writeFileSync(deployKeyPath, process.env.DEPLOY_KEY, { mode: 0o600 });
        
        // デプロイディレクトリの存在チェック
        try {
          execSync(`ssh -i ${deployKeyPath} -o StrictHostKeyChecking=no ${process.env.DEPLOY_USER}@${process.env.DEPLOY_HOST} "test -d ${process.env.DEPLOY_PATH} && echo 'Directory exists'"`, { stdio: 'pipe' });
          fs.unlinkSync(deployKeyPath);
          return { success: true, message: 'デプロイディレクトリが存在します' };
        } catch (error) {
          fs.unlinkSync(deployKeyPath);
          return {
            success: false,
            message: `デプロイディレクトリが存在しないか、アクセス権限がありません: ${error.message}`
          };
        }
      } catch (error) {
        if (fs.existsSync(deployKeyPath)) {
          fs.unlinkSync(deployKeyPath);
        }
        return {
          success: false,
          message: `デプロイディレクトリのチェックに失敗しました: ${error.message}`
        };
      }
    }
  }
];

// チェックの実行
console.log('フロントエンドデプロイ環境チェックを開始します...\n');

let allSuccess = true;
for (const check of checks) {
  process.stdout.write(`${check.name}... `);
  
  const result = check.check();
  
  if (result.success) {
    console.log('\x1b[32m成功\x1b[0m');
  } else {
    console.log('\x1b[31m失敗\x1b[0m');
    console.log(`  \x1b[31m${result.message}\x1b[0m`);
    allSuccess = false;
  }
}

console.log('\n');
if (allSuccess) {
  console.log('\x1b[32mすべてのチェックが成功しました。デプロイを続行できます。\x1b[0m');
  process.exit(0);
} else {
  console.log('\x1b[31mいくつかのチェックが失敗しました。デプロイ環境を確認してください。\x1b[0m');
  process.exit(1);
} 