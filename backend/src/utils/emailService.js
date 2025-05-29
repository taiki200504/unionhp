const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    this.from = process.env.EMAIL_FROM || 'info@union-web.jp';
  }
  
  /**
   * メールを送信する
   * @param {Object} options - 送信オプション
   * @param {string} options.to - 送信先メールアドレス
   * @param {string} options.subject - メールの件名
   * @param {string} options.text - プレーンテキスト版のメール本文
   * @param {string} [options.html] - HTML版のメール本文
   * @returns {Promise} メール送信の結果
   */
  async sendMail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        text,
        ...(html && { html })
      };
      
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('メール送信エラー:', error);
      throw error;
    }
  }
  
  /**
   * 購読確認メールを送信する
   * @param {Object} subscriber - 購読者情報
   * @param {string} confirmUrl - 確認URL
   */
  async sendConfirmationEmail(subscriber, confirmUrl) {
    const subject = 'UNION ニュースレター購読の確認';
    
    const text = `
${subscriber.name || 'こんにちは'}様

UNION ニュースレターの購読申し込みありがとうございます。
以下のリンクをクリックして購読を確定してください：

${confirmUrl}

このリンクは24時間有効です。
リンクが機能しない場合は、再度購読手続きを行ってください。

※このメールに心当たりがない場合は、このメールを無視してください。
`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
    .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://union-web.jp/logo.png" alt="UNION" class="logo">
      <h2>ニュースレター購読の確認</h2>
    </div>
    
    <p>${subscriber.name || 'こんにちは'}様</p>
    
    <p>UNION ニュースレターの購読申し込みありがとうございます。以下のボタンをクリックして購読を確定してください：</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${confirmUrl}" class="button">購読を確定する</a>
    </p>
    
    <p>このリンクは24時間有効です。リンクが機能しない場合は、再度購読手続きを行ってください。</p>
    
    <p>※このメールに心当たりがない場合は、このメールを無視してください。</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} UNION. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
    
    return this.sendMail({
      to: subscriber.email,
      subject,
      text,
      html
    });
  }
  
  /**
   * ニュースレターを送信する
   * @param {Object} subscriber - 購読者情報
   * @param {Array} news - ニュース記事の配列
   * @param {string} unsubscribeUrl - 退会URL
   */
  async sendNewsletter(subscriber, news, unsubscribeUrl) {
    const subject = `【UNION】ニュースレター ${new Date().toLocaleDateString('ja-JP')}`;
    
    // プレーンテキスト版
    let text = `
${subscriber.name || 'こんにちは'}様

UNIONの最新ニュースをお届けします。

`;
    
    // ニュース記事を追加
    news.forEach(item => {
      text += `■ ${item.title}\n`;
      text += `${item.content.substring(0, 100)}...\n`;
      text += `詳細: https://union-web.jp/news/${item.id}\n\n`;
    });
    
    // フッター
    text += `
購読を解除する場合は以下のURLにアクセスしてください：
${unsubscribeUrl}

© ${new Date().getFullYear()} UNION. All rights reserved.
`;
    
    // HTML版
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .news-item { margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    .news-title { color: #2c3e50; font-size: 18px; margin-bottom: 10px; }
    .news-content { color: #555; margin-bottom: 10px; }
    .news-link { color: #3498db; text-decoration: none; }
    .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://union-web.jp/logo.png" alt="UNION" class="logo">
      <h2>UNION ニュースレター</h2>
      <p>${new Date().toLocaleDateString('ja-JP')}</p>
    </div>
    
    <p>${subscriber.name || 'こんにちは'}様</p>
    
    <p>UNIONの最新ニュースをお届けします。</p>
`;
    
    // ニュース記事を追加
    news.forEach(item => {
      html += `
    <div class="news-item">
      <h3 class="news-title">${item.title}</h3>
      ${item.featuredImage ? `<img src="${item.featuredImage}" alt="${item.title}" style="max-width: 100%; margin-bottom: 10px;">` : ''}
      <p class="news-content">${item.content.substring(0, 150)}...</p>
      <p><a href="https://union-web.jp/news/${item.id}" class="news-link">続きを読む →</a></p>
    </div>
`;
    });
    
    // フッター
    html += `
    <div class="footer">
      <p><a href="${unsubscribeUrl}">ニュースレターの購読を解除する</a></p>
      <p>© ${new Date().getFullYear()} UNION. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
    
    return this.sendMail({
      to: subscriber.email,
      subject,
      text,
      html
    });
  }
}

module.exports = new EmailService(); 