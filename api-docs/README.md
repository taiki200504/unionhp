# UNION HP API ドキュメント

## 概要

このAPIは、UNIONホームページのバックエンド機能を提供します。主に掲示板投稿、ニュース管理、ユーザー管理のためのエンドポイントで構成されています。

## ベースURL

```
http://localhost:5000/api
```

## 認証

ほとんどのエンドポイントでは、JWT（JSON Web Token）を使用した認証が必要です。

認証ヘッダーの例:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## エンドポイント一覧

### 認証

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/auth/register | ユーザー登録 | 不要 |
| POST | /api/auth/login | ログイン | 不要 |
| GET | /api/auth/me | 現在のユーザー情報を取得 | 必要 |

### 掲示板投稿

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/posts | 全ての掲示板投稿を取得 | 不要 |
| GET | /api/posts/:id | 特定の掲示板投稿を取得 | 不要 |
| GET | /api/posts/related | 関連する掲示板投稿を取得 | 不要 |
| POST | /api/posts | 新しい掲示板投稿を作成 | 必要 |
| PUT | /api/posts/:id | 掲示板投稿を更新 | 必要 |
| DELETE | /api/posts/:id | 掲示板投稿を削除 | 必要 |

### ニュース記事

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/news | 全てのニュース記事を取得 | 不要 |
| GET | /api/news/:id | 特定のニュース記事を取得 | 不要 |
| GET | /api/news/years | 全ての年度を取得 | 不要 |
| GET | /api/news/tags | 全てのタグを取得 | 不要 |
| POST | /api/news | 新しいニュース記事を作成 | 必要 |
| PUT | /api/news/:id | ニュース記事を更新 | 必要 |
| DELETE | /api/news/:id | ニュース記事を削除 | 必要 |

### ユーザー管理

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /api/users | 全てのユーザーを取得（管理者専用） | 必要 |
| GET | /api/users/:id | 特定のユーザーを取得 | 必要 |
| PATCH | /api/users/:id | ユーザー情報を更新 | 必要 |
| PATCH | /api/users/:id/role | ユーザーの役割を更新（管理者専用） | 必要 |
| PATCH | /api/users/:id/password | パスワードを変更 | 必要 |
| DELETE | /api/users/:id | ユーザーを削除（非アクティブ化） | 必要 |

### メディアアップロード

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /api/upload/post-image | 掲示板画像をアップロード | 必要 |
| POST | /api/upload/profile-image | プロフィール画像をアップロード | 必要 |

## データモデル

### ユーザーモデル

```javascript
{
  name: String,  // 必須
  email: String,  // 必須, ユニーク
  password: String,  // 必須, 最小6文字
  role: String,  // 'admin', 'editor', 'organization'
  organizationName: String,
  organizationType: String,  // 'academic', 'environment', 'volunteer'など
  profileImage: String,
  contactInfo: {
    phone: String,
    website: String,
    address: String
  },
  active: Boolean
}
```

### 掲示板投稿モデル

```javascript
{
  title: String,  // 必須, 最大100文字
  content: String,  // 必須
  author: ObjectId,  // ユーザーIDへの参照
  authorName: String,  // 必須
  category: String,  // 'event', 'recruit', 'report'など
  group: String,  // 'academic', 'environment', 'volunteer'など
  featuredImage: String,
  details: Map,  // 追加詳細情報
  contact: {
    email: String,
    phone: String,
    website: String
  },
  isFeatured: Boolean,
  status: String,  // 'draft', 'published', 'rejected'
  publishedAt: Date,
  viewCount: Number,
  tags: [String]
}
```

### ニュース記事モデル

```javascript
{
  title: String,  // 必須, 最大100文字
  content: String,  // 必須
  author: ObjectId,  // ユーザーIDへの参照
  authorName: String,  // 必須
  category: String,  // 必須
  featuredImage: String,
  status: String,  // 'draft', 'published', 'archived'
  publishedAt: Date,
  viewCount: Number,
  isFeatured: Boolean,
  tags: [String],
  year: Number  // 必須
}
```

## リクエスト例

### ログイン

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "example@union.com",
  "password": "password123"
}
```

### 掲示板投稿の作成

```
POST /api/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "環境フォーラム開催のお知らせ",
  "content": "<p>持続可能な環境に関心のある学生が集まり、環境問題の解決策やアイデアを議論する「学生環境フォーラム2025」を開催します...</p>",
  "category": "event",
  "group": "environment",
  "details": {
    "開催日時": "2025年6月15日(日) 13:00-17:00",
    "場所": "東京都内会議ホール",
    "参加費": "無料",
    "定員": "100名"
  },
  "contact": {
    "email": "green-campus@example.com",
    "phone": "03-1234-5678",
    "website": "https://example.com/green-campus"
  },
  "status": "published"
}
```

---

このドキュメントは随時更新されます。最新の情報は開発チームにお問い合わせください。

最終更新: 2023年12月1日 