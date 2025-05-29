const Subscriber = require('../models/Subscriber');
const Category = require('../models/Category');
const News = require('../models/News');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

/**
 * ニュースレターを購読する
 * @route POST /api/newsletter/subscribe
 * @access Public
 */
exports.subscribe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    const { email, name, categories, preferences } = req.body;
    
    // 既に登録されているかどうか確認
    let subscriber = await Subscriber.findOne({ email });
    
    if (subscriber) {
      // ステータスが既に有効な場合
      if (subscriber.status === 'active') {
        return res.status(400).json({
          status: 'error',
          message: 'このメールアドレスは既に登録されています。'
        });
      }
      
      // ステータスが未確認または登録解除の場合は再登録
      subscriber.status = 'pending';
      subscriber.name = name || subscriber.name;
      
      // カテゴリーの更新
      if (categories && categories.length > 0) {
        subscriber.subscribedCategories = categories;
      }
      
      // 設定の更新
      if (preferences) {
        subscriber.preferences = {
          ...subscriber.preferences,
          ...preferences
        };
      }
    } else {
      // 新規登録
      subscriber = new Subscriber({
        email,
        name,
        subscribedCategories: categories || [],
        preferences: preferences || {
          frequency: 'weekly',
          format: 'html'
        }
      });
    }
    
    // メタデータの設定
    subscriber.metadata = {
      ...subscriber.metadata,
      ip: req.ip,
      browser: req.headers['user-agent'],
      referrer: req.headers.referer || 'direct'
    };
    
    // 確認トークンを生成
    const confirmationToken = subscriber.generateConfirmationToken();
    
    // 退会トークンを生成
    if (!subscriber.unsubscribeToken) {
      subscriber.generateUnsubscribeToken();
    }
    
    await subscriber.save();
    
    // 確認URLの生成
    const confirmUrl = `${req.protocol}://${req.get('host')}/api/newsletter/confirm/${confirmationToken}`;
    
    // 確認メールを送信
    await emailService.sendConfirmationEmail(subscriber, confirmUrl);
    
    res.status(200).json({
      status: 'success',
      message: 'ご登録いただいたメールアドレスに確認メールを送信しました。メールを確認して購読を完了してください。'
    });
  } catch (error) {
    console.error('ニュースレター登録エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '購読手続き中にエラーが発生しました。'
    });
  }
};

/**
 * 購読確認
 * @route GET /api/newsletter/confirm/:token
 * @access Public
 */
exports.confirmSubscription = async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Subscriber.findOne({
      confirmationToken: token,
      confirmationExpires: { $gt: Date.now() }
    });
    
    if (!subscriber) {
      return res.status(400).json({
        status: 'error',
        message: '確認トークンが無効か、期限切れです。再度購読手続きを行ってください。'
      });
    }
    
    // 購読確定
    subscriber.status = 'active';
    subscriber.confirmationToken = undefined;
    subscriber.confirmationExpires = undefined;
    
    await subscriber.save();
    
    // HTMLレスポンス（ブラウザからのアクセスを想定）
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>購読確認完了</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          p { margin-bottom: 20px; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>購読確認完了</h1>
          <p>UNION ニュースレターの購読が完了しました。最新のニュースをお届けします。</p>
          <p><a href="/" class="button">トップページに戻る</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('購読確認エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '購読確認中にエラーが発生しました。'
    });
  }
};

/**
 * 購読解除
 * @route GET /api/newsletter/unsubscribe/:token
 * @access Public
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Subscriber.findOne({
      unsubscribeToken: token
    });
    
    if (!subscriber) {
      return res.status(400).json({
        status: 'error',
        message: '無効なトークンです。'
      });
    }
    
    // 購読解除
    subscriber.status = 'unsubscribed';
    await subscriber.save();
    
    // HTMLレスポンス（ブラウザからのアクセスを想定）
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>購読解除完了</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2c3e50; }
          p { margin-bottom: 20px; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>購読解除完了</h1>
          <p>UNION ニュースレターの購読を解除しました。</p>
          <p>またのご購読をお待ちしております。</p>
          <p><a href="/" class="button">トップページに戻る</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('購読解除エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '購読解除処理中にエラーが発生しました。'
    });
  }
};

/**
 * 購読者リストを取得（管理者用）
 * @route GET /api/newsletter/subscribers
 * @access Private/Admin
 */
exports.getSubscribers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // クエリの構築
    const query = {};
    
    // ステータスでフィルタリング
    if (status) {
      query.status = status;
    }
    
    // ソート条件
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 購読者を取得
    const subscribers = await Subscriber.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('subscribedCategories', 'name slug');
    
    // 合計件数を取得
    const total = await Subscriber.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: subscribers.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / limit),
      subscribers: subscribers.map(sub => ({
        id: sub._id,
        email: sub.email,
        name: sub.name || '',
        status: sub.status,
        preferences: sub.preferences,
        subscribed_categories: sub.subscribedCategories,
        created_at: sub.createdAt,
        last_sent: sub.lastSent || null
      }))
    });
  } catch (error) {
    console.error('購読者リスト取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '購読者リストの取得中にエラーが発生しました。'
    });
  }
};

/**
 * 手動でニュースレターを送信（管理者用）
 * @route POST /api/newsletter/send
 * @access Private/Admin
 */
exports.sendNewsletter = async (req, res) => {
  try {
    const { categories, newsIds, testEmail } = req.body;
    
    // 送信するニュース記事を取得
    let newsQuery = { status: 'published' };
    
    // 特定の記事IDが指定されている場合
    if (newsIds && newsIds.length > 0) {
      newsQuery._id = { $in: newsIds };
    } 
    // カテゴリーが指定されている場合
    else if (categories && categories.length > 0) {
      newsQuery.category = { $in: categories };
    }
    
    // 最近の記事を取得（最大10件）
    const news = await News.find(newsQuery)
      .sort({ publishedAt: -1 })
      .limit(10)
      .populate('category', 'name slug');
    
    if (news.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '送信するニュース記事が見つかりません。'
      });
    }
    
    // テスト送信用
    if (testEmail) {
      const testSubscriber = {
        email: testEmail,
        name: 'テストユーザー',
        unsubscribeToken: 'test-token'
      };
      
      const unsubscribeUrl = `${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe/test-token`;
      
      await emailService.sendNewsletter(testSubscriber, news, unsubscribeUrl);
      
      return res.status(200).json({
        status: 'success',
        message: `テストメールを ${testEmail} に送信しました。`
      });
    }
    
    // 本送信用
    let subscriberQuery = { status: 'active' };
    
    // カテゴリーが指定されている場合、そのカテゴリーを購読しているユーザーに限定
    if (categories && categories.length > 0) {
      subscriberQuery.$or = [
        { subscribedCategories: { $in: categories } },
        { subscribedCategories: { $exists: false } },  // カテゴリーが指定されていない（全カテゴリー購読）ユーザーも含める
        { subscribedCategories: { $size: 0 } }
      ];
    }
    
    // 購読者を取得
    const subscribers = await Subscriber.find(subscriberQuery);
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '送信先の購読者が見つかりません。'
      });
    }
    
    // 各購読者にニュースレターを送信
    let successCount = 0;
    let errorCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
        
        await emailService.sendNewsletter(subscriber, news, unsubscribeUrl);
        
        // 最終送信日時を更新
        subscriber.lastSent = new Date();
        await subscriber.save();
        
        successCount++;
      } catch (error) {
        console.error(`${subscriber.email} へのメール送信エラー:`, error);
        errorCount++;
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: `${successCount}件のメールを送信しました。${errorCount}件のエラーが発生しました。`,
      sent: successCount,
      errors: errorCount,
      total: subscribers.length
    });
  } catch (error) {
    console.error('ニュースレター送信エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ニュースレターの送信処理中にエラーが発生しました。'
    });
  }
}; 