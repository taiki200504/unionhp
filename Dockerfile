# Node.js公式イメージを使用
FROM node:20-alpine

# 作業ディレクトリ作成
WORKDIR /app

# 依存関係インストール
COPY package*.json ./
RUN npm install --production

# アプリ本体コピー
COPY . .

# 静的ファイル公開用ディレクトリ作成
RUN mkdir -p public/uploads

# ポート開放
EXPOSE 3000

# 本番起動
CMD ["node", "server.js"] 