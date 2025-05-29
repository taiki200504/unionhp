# デプロイ設定手順

このドキュメントでは、UNION公式ウェブサイトのデプロイ環境を設定する手順を説明します。

## 1. サーバー環境の準備

### 1.1 必要なソフトウェアのインストール

サーバーに以下のソフトウェアをインストールします：

```bash
# Node.jsとnpmのインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pm2のインストール（プロセス管理ツール）
sudo npm install -g pm2

# Nginxのインストール（Webサーバー）
sudo apt-get install -y nginx
```

### 1.2 デプロイユーザーの作成

```bash
# デプロイ用ユーザーの作成
sudo adduser deploy
sudo usermod -aG sudo deploy

# SSHディレクトリの作成
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
```

### 1.3 デプロイディレクトリの作成

```bash
# バックエンド用ディレクトリ
sudo mkdir -p /var/www/union-backend
sudo chown deploy:deploy /var/www/union-backend

# フロントエンド用ディレクトリ
sudo mkdir -p /var/www/union-frontend
sudo chown deploy:deploy /var/www/union-frontend

# アップロード用ディレクトリ
sudo mkdir -p /var/www/union-uploads
sudo chown deploy:deploy /var/www/union-uploads
sudo chmod 755 /var/www/union-uploads
```

## 2. SSH鍵の生成と設定

### 2.1 デプロイ用SSH鍵の生成

ローカル環境で以下のコマンドを実行して、デプロイ用のSSH鍵を生成します：

```bash
# バックエンド用
ssh-keygen -t ed25519 -C "backend-deploy-key" -f ~/.ssh/union_backend_deploy

# フロントエンド用
ssh-keygen -t ed25519 -C "frontend-deploy-key" -f ~/.ssh/union_frontend_deploy
```

### 2.2 公開鍵をサーバーに登録

生成した公開鍵をサーバーの`/home/deploy/.ssh/authorized_keys`に追加します：

```bash
# ローカルから公開鍵をサーバーにコピー
cat ~/.ssh/union_backend_deploy.pub | ssh user@your-server "cat >> /home/deploy/.ssh/authorized_keys"
cat ~/.ssh/union_frontend_deploy.pub | ssh user@your-server "cat >> /home/deploy/.ssh/authorized_keys"

# 権限の設定
ssh user@your-server "chmod 600 /home/deploy/.ssh/authorized_keys"
```

## 3. GitHub Secretsの設定

GitHubリポジトリの設定からSecrets and variablesを開き、以下の環境変数を設定します：

### 3.1 デプロイ共通設定

- `DEPLOY_HOST`: サーバーのホスト名またはIPアドレス
- `DEPLOY_USER`: デプロイユーザー名（通常は「deploy」）

### 3.2 バックエンド用設定

- `BACKEND_DEPLOY_KEY`: バックエンドデプロイ用SSH秘密鍵の内容（`~/.ssh/union_backend_deploy`の内容）
- `BACKEND_DEPLOY_PATH`: バックエンドのデプロイパス（例: `/var/www/union-backend`）
- `MONGODB_URI`: 本番環境のMongoDBの接続URI
- `JWT_SECRET`: JWT認証用の秘密鍵（ランダムな文字列を生成して設定）

### 3.3 フロントエンド用設定

- `FRONTEND_DEPLOY_KEY`: フロントエンドデプロイ用SSH秘密鍵の内容（`~/.ssh/union_frontend_deploy`の内容）
- `FRONTEND_DEPLOY_PATH`: フロントエンドのデプロイパス（例: `/var/www/union-frontend`）
- `API_URL`: APIのベースURL（例: `https://api.union-website.com`）
- `PUBLIC_URL`: フロントエンドの公開URL（例: `https://union-website.com`）

## 4. Webサーバーの設定

### 4.1 Nginxの設定（バックエンド）

```bash
sudo nano /etc/nginx/sites-available/union-backend

# 以下の内容を追加
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2 Nginxの設定（フロントエンド）

```bash
sudo nano /etc/nginx/sites-available/union-frontend

# 以下の内容を追加
server {
    listen 80;
    server_name example.com;

    root /var/www/union-frontend/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.3 設定を有効化して再起動

```bash
sudo ln -s /etc/nginx/sites-available/union-backend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/union-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL/TLSの設定（Let's Encrypt）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com -d api.example.com
```

## 6. デプロイのテスト

環境設定が完了したら、GitHub Actionsのデプロイパイプラインをテストします：

1. リポジトリの「Actions」タブを開く
2. 「CI/CD Pipeline」ワークフローを選択
3. 「Run workflow」をクリックして手動でワークフローを実行
4. ログを確認してデプロイが成功したか確認

## 7. トラブルシューティング

### 7.1 SSH接続の問題

```bash
# ローカルからSSH接続をテスト
ssh -i ~/.ssh/union_backend_deploy deploy@your-server
```

### 7.2 権限の問題

```bash
# デプロイディレクトリの権限を確認
ls -la /var/www/
```

### 7.3 pm2の問題

```bash
# プロセスリストの確認
pm2 list

# ログの確認
pm2 logs union-backend
``` 