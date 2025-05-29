# GitHub Secrets設定手順

このドキュメントでは、UNION公式ウェブサイトのデプロイに必要なGitHub Secretsの設定方法を説明します。

## 1. SSH鍵の生成

まず、デプロイに使用するSSH鍵ペアを生成します。

### 1.1 バックエンド用SSH鍵の生成

```bash
ssh-keygen -t ed25519 -C "backend-deploy-key" -f ~/.ssh/union_backend_deploy
```

### 1.2 フロントエンド用SSH鍵の生成

```bash
ssh-keygen -t ed25519 -C "frontend-deploy-key" -f ~/.ssh/union_frontend_deploy
```

## 2. GitHub Secretsの設定

GitHubリポジトリの設定ページからSecretsを設定します。

1. GitHubのリポジトリページに移動
2. 「Settings」タブをクリック
3. 左側のメニューから「Secrets and variables」→「Actions」を選択
4. 「New repository secret」ボタンをクリック

### 2.1 共通のデプロイ設定

| シークレット名 | 説明 | 例 |
|--------------|------|-----|
| `DEPLOY_HOST` | デプロイ先サーバーのホスト名またはIPアドレス | `example.com` または `192.168.1.100` |
| `DEPLOY_USER` | デプロイユーザー名 | `deploy` |

### 2.2 バックエンド用設定

| シークレット名 | 説明 | 例/生成方法 |
|--------------|------|------------|
| `BACKEND_DEPLOY_KEY` | バックエンド用SSH秘密鍵 | `cat ~/.ssh/union_backend_deploy` の出力 |
| `BACKEND_DEPLOY_PATH` | バックエンドのデプロイディレクトリ | `/var/www/union-backend` |
| `MONGODB_URI` | MongoDBの接続URI | `mongodb://user:password@host:port/database` |
| `JWT_SECRET` | JWT認証用の秘密鍵 | 以下のコマンドで生成: `openssl rand -base64 32` |

### 2.3 フロントエンド用設定

| シークレット名 | 説明 | 例/生成方法 |
|--------------|------|------------|
| `FRONTEND_DEPLOY_KEY` | フロントエンド用SSH秘密鍵 | `cat ~/.ssh/union_frontend_deploy` の出力 |
| `FRONTEND_DEPLOY_PATH` | フロントエンドのデプロイディレクトリ | `/var/www/union-frontend` |
| `API_URL` | バックエンドAPIのベースURL | `https://api.example.com` |
| `PUBLIC_URL` | フロントエンドの公開URL | `https://example.com` |

## 3. 秘密鍵のフォーマット

GitHub Secretsに秘密鍵を設定する際は、以下の点に注意してください：

- 秘密鍵の内容を完全にコピーします（`-----BEGIN ... KEY-----`から`-----END ... KEY-----`まで）
- 改行もそのまま含めてください
- 余分なスペースや文字が入らないように注意してください

### 3.1 秘密鍵をコピーするコマンド例

```bash
# macOSの場合
cat ~/.ssh/union_backend_deploy | pbcopy

# Linuxの場合（xclipが必要）
cat ~/.ssh/union_backend_deploy | xclip -selection clipboard
```

## 4. 設定のテスト

設定が完了したら、GitHub Actionsのワークフローでデプロイが正常に実行されるかテストします。

1. リポジトリの「Actions」タブに移動
2. 「CI/CD Pipeline」ワークフローを選択
3. 「Run workflow」ボタンをクリック
4. 必要に応じて、ブランチを「main」に設定してワークフローを実行

### 4.1 デプロイが失敗した場合の確認事項

- GitHub Actionsのログを確認し、エラーメッセージを確認
- 秘密鍵のフォーマットが正しいか確認
- サーバーの設定（ホスト名、ユーザー名、ディレクトリのパーミッション）を確認
- SSHでの接続が可能か手動で確認
```bash
ssh -i ~/.ssh/union_backend_deploy deploy@your-server
```

## 5. セキュリティのベストプラクティス

- デプロイキーは定期的に更新してください（推奨：3-6ヶ月ごと）
- デプロイキーには最小限の権限を付与してください
- 本番環境の認証情報（MongoDBパスワードなど）は強力なものを使用してください
- サーバーのSSHログを定期的に確認し、不審なアクセスがないか監視してください 