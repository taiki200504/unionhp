const mongoose = require('mongoose');
const News = require('../models/News');
const Subscriber = require('../models/Subscriber');
const emailService = require('./emailService');
require('dotenv').config();

/**
 * 定期的なニュースレター送信処理
 * cronジョブなどで定期実行することを想定
 */
const sendScheduledNewsletter = async () => {
  try {
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp');
    console.log('MongoDB接続成功');
    
    // 現在の日付情報
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0:日曜, 1:月曜, ...
    const dayOfMonth = now.getDate(); // 1-31
    
    // 頻度に応じた購読者を取得
    let frequencyQuery = {};
    
    // 毎日のニュースレター
    if (process.argv.includes('--daily')) {
      frequencyQuery = { 'preferences.frequency': 'daily' };
    } 
    // 毎週月曜のニュースレター
    else if (process.argv.includes('--weekly') || dayOfWeek === 1) {
      frequencyQuery = { 'preferences.frequency': 'weekly' };
    } 
    // 毎月1日のニュースレター
    else if (process.argv.includes('--monthly') || dayOfMonth === 1) {
      frequencyQuery = { 'preferences.frequency': 'monthly' };
    }
    // テスト用の頻度
    else if (process.argv.includes('--test')) {
      frequencyQuery = {}; // すべての購読者
    }
    // 条件に合わなければ終了
    else {
      console.log('本日は配信予定がありません');
      await mongoose.disconnect();
      return;
    }
    
    // アクティブな購読者を取得
    const subscribers = await Subscriber.find({
      status: 'active',
      ...frequencyQuery
    });
    
    if (subscribers.length === 0) {
      console.log('送信先の購読者が見つかりません');
      await mongoose.disconnect();
      return;
    }
    
    // 直近1週間の公開記事を取得
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const news = await News.find({
      status: 'published',
      publishedAt: { $gte: oneWeekAgo }
    })
    .sort({ publishedAt: -1 })
    .limit(10)
    .populate('category', 'name slug');
    
    if (news.length === 0) {
      console.log('送信するニュース記事が見つかりません');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`${subscribers.length}人の購読者に${news.length}件のニュースを送信します`);
    
    // 各購読者にニュースレターを送信
    let successCount = 0;
    let errorCount = 0;
    
    for (const subscriber of subscribers) {
      try {
        // カテゴリーフィルタリング（購読者が特定のカテゴリーを購読している場合）
        let filteredNews = news;
        if (subscriber.subscribedCategories && subscriber.subscribedCategories.length > 0) {
          filteredNews = news.filter(item => {
            if (!item.category || !item.category._id) return true;
            return subscriber.subscribedCategories.some(catId => 
              catId.toString() === item.category._id.toString()
            );
          });
          
          // フィルタリング後に記事がない場合はスキップ
          if (filteredNews.length === 0) {
            console.log(`${subscriber.email} - 購読カテゴリーに一致する記事がないためスキップします`);
            continue;
          }
        }
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
        const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
        
        await emailService.sendNewsletter(subscriber, filteredNews, unsubscribeUrl);
        
        // 最終送信日時を更新
        subscriber.lastSent = now;
        await subscriber.save();
        
        console.log(`${subscriber.email} へ送信成功`);
        successCount++;
      } catch (error) {
        console.error(`${subscriber.email} へのメール送信エラー:`, error);
        errorCount++;
      }
    }
    
    console.log(`送信完了: 成功=${successCount}, 失敗=${errorCount}`);
    
    // MongoDBから切断
    await mongoose.disconnect();
    console.log('MongoDB切断成功');
    
  } catch (error) {
    console.error('スケジュール送信エラー:', error);
    process.exit(1);
  }
};

// スクリプトの実行
sendScheduledNewsletter(); 