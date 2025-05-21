# UNION 公式ホームページ

学生団体連合UNIONの公式ホームページです。学生の声を社会に響かせるためのメディア＆連合コミュニティのウェブサイトです。

## 特徴

- モバイルファーストデザイン
- モダンなUI/UX
- レスポンシブ対応
- SNS連携
- メディアコンテンツの統合

## 技術スタック

- HTML5
- Tailwind CSS
- JavaScript (Vanilla)
- Font Awesome (アイコン)

## セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

## プロジェクト構造

```
union-website/
├── index.html          # メインのHTMLファイル
├── README.md          # プロジェクトドキュメント
└── assets/            # 静的アセット
    ├── images/        # 画像ファイル
    └── fonts/         # フォントファイル
```

## 主要セクション

1. ヒーローセクション
   - メインキャッチコピー
   - CTAボタン

2. About
   - 団体紹介
   - PMVV

3. Media
   - ユニラジ
   - ここみゆの夢ぐらし

4. フッター
   - リンク
   - ソーシャルメディア
   - コピーライト

## 開発ガイドライン

- モバイルファーストのアプローチ
- アクセシビリティの考慮
- パフォーマンスの最適化
- セマンティックなHTML構造

## ライセンス

© 2024 学生団体連合UNION. All rights reserved.

## 環境変数設定

1. `.env` ファイルをプロジェクトルートに作成し、以下を参考に設定してください（`.env.example` 参照）。

- `PORT` ... サーバーのポート番号
- `MONGODB_URI` ... MongoDBの接続URI（本番はMongoDB Atlas等推奨）
- `JWT_SECRET` ... JWT署名用の強力なランダム文字列
- `UPLOAD_DIR` ... 画像アップロード先ディレクトリ
- `MAX_FILE_SIZE` ... アップロード最大サイズ（バイト）

2. 本番では `NODE_ENV=production` を必ず指定してください。 

## バックアップ・リストア手順

### MongoDB バックアップ

```sh
mongodump --uri="<MONGODB_URI>" --out=./backup
```

### MongoDB リストア

```sh
mongorestore --uri="<MONGODB_URI>" ./backup
```

- `<MONGODB_URI>` には `.env` で指定した接続URIを入力してください。
- `mongodump`/`mongorestore` コマンドはMongoDB公式ツールです。
- 詳細は [MongoDB公式ドキュメント](https://www.mongodb.com/docs/database-tools/) を参照してください。 # unionhp
