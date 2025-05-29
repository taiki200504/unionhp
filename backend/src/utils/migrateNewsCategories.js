const mongoose = require('mongoose');
const News = require('../models/News');
const Category = require('../models/Category');
require('dotenv').config();

const migrateCategoriesForNews = async () => {
  try {
    console.log('ニュース記事のカテゴリー移行を開始します...');
    
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp');
    console.log('MongoDB接続成功');
    
    // カテゴリーデータを取得
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('カテゴリーが存在しません。先にカテゴリーを作成してください。');
      await mongoose.disconnect();
      return;
    }
    
    // 既存のニュース記事を取得
    const news = await News.find();
    console.log(`${news.length}件のニュース記事が見つかりました。`);
    
    // デフォルトのカテゴリー
    const defaultCategory = categories.find(c => c.slug === 'announcements') || categories[0];
    console.log(`デフォルトカテゴリー: ${defaultCategory.name} (${defaultCategory._id})`);
    
    // カテゴリー名からIDへのマッピング
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name] = category._id;
      // スラッグも対応
      categoryMap[category.slug] = category._id;
      // 小文字変換したものも対応
      categoryMap[category.name.toLowerCase()] = category._id;
    });
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // 各ニュース記事を処理
    for (const item of news) {
      try {
        // 既存のcategoryが文字列かObjectIdかをチェック
        if (typeof item.category === 'string') {
          // 既存のカテゴリー名に対応するIDを探す
          let categoryId = null;
          
          // カテゴリー名が直接マップにあるか確認
          if (categoryMap[item.category]) {
            categoryId = categoryMap[item.category];
          } 
          // なければその他のマッピングを試す
          else {
            // 最も類似したカテゴリーを探す
            const lowerCaseCat = item.category.toLowerCase();
            const match = Object.keys(categoryMap).find(key => 
              key.toLowerCase().includes(lowerCaseCat) || 
              lowerCaseCat.includes(key.toLowerCase())
            );
            
            if (match) {
              categoryId = categoryMap[match];
            } else {
              // 一致するものがない場合はデフォルトを使用
              categoryId = defaultCategory._id;
              console.log(`記事ID: ${item._id}, タイトル: "${item.title}" のカテゴリー "${item.category}" には一致するものがないためデフォルトを使用します`);
            }
          }
          
          // カテゴリーを更新
          await News.updateOne(
            { _id: item._id },
            { $set: { category: categoryId } }
          );
          
          updatedCount++;
        } else if (mongoose.Types.ObjectId.isValid(item.category)) {
          // 既にObjectIdの場合はスキップ
          continue;
        }
      } catch (err) {
        console.error(`記事ID: ${item._id} の処理中にエラーが発生しました:`, err);
        errorCount++;
      }
    }
    
    console.log(`移行完了: ${updatedCount}件のニュース記事を更新しました。`);
    if (errorCount > 0) {
      console.log(`${errorCount}件のエラーが発生しました。`);
    }
    
    // MongoDBから切断
    await mongoose.disconnect();
    console.log('MongoDB切断成功');
    
  } catch (error) {
    console.error('移行スクリプトエラー:', error);
    process.exit(1);
  }
};

// スクリプトの実行
migrateCategoriesForNews(); 