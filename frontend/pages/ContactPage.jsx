import React, { useEffect, useState } from 'react';
import MainLayout from './layouts/MainLayout';

const ContactPage = () => {
  // フォーム入力のステート
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    type: 'general',
    message: ''
  });

  // 送信状態のステート
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // 入力変更のハンドラ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // フォーム送信のハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 本来はAPIリクエストを送信する
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // ダミーの非同期処理（実際の実装では削除）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功時の処理
      setSubmitResult({
        success: true,
        message: 'お問い合わせありがとうございます。内容を確認後、担当者からご連絡いたします。'
      });
      
      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        organization: '',
        type: 'general',
        message: ''
      });
    } catch (error) {
      // エラー時の処理
      setSubmitResult({
        success: false,
        message: 'エラーが発生しました。しばらく経ってから再度お試しください。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // ページタイトルを設定
    document.title = 'お問い合わせ | 学生団体連合UNION';
    
    // スクロールを上部に戻す
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      {/* ヒーローセクション */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient-primary">お問い合わせ</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              UNIONに関するご質問やご相談はこちらからお気軽にどうぞ
            </p>
          </div>
        </div>
      </section>

      {/* お問い合わせフォームセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 送信結果の表示 */}
          {submitResult && (
            <div className={`mb-8 p-4 rounded-lg ${submitResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {submitResult.success ? (
                    <i className="fas fa-check-circle text-green-500 text-xl"></i>
                  ) : (
                    <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{submitResult.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">お問い合わせフォーム</h2>
            
            <div className="space-y-6">
              {/* 氏名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="山田 太郎"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="example@email.com"
                />
              </div>

              {/* 所属団体・組織名 */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  所属団体・組織名
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="〇〇大学 △△サークル"
                />
              </div>

              {/* 問い合わせ種類 */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  お問い合わせの種類 <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="general">一般的なお問い合わせ</option>
                  <option value="join">加盟に関するお問い合わせ</option>
                  <option value="media">メディア掲載依頼</option>
                  <option value="collaboration">企業連携・協賛について</option>
                  <option value="event">イベントについて</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* メッセージ */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="お問い合わせ内容を具体的にご記入ください。"
                ></textarea>
              </div>

              {/* 送信ボタン */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center px-8 py-3 border border-transparent rounded-full shadow-sm text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      送信中...
                    </>
                  ) : (
                    '送信する'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* お問い合わせ方法セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">その他のお問い合わせ方法</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ContactMethodCard 
              icon="fas fa-envelope"
              title="Email"
              content="info@union-student.jp"
              link="mailto:info@union-student.jp"
            />
            <ContactMethodCard 
              icon="fab fa-twitter"
              title="Twitter (X)"
              content="@UNION_gakusei"
              link="https://twitter.com/UNION_gakusei"
            />
            <ContactMethodCard 
              icon="fab fa-instagram"
              title="Instagram DM"
              content="@union_gakusei"
              link="https://www.instagram.com/union_gakusei/"
            />
          </div>
        </div>
      </section>

      {/* FAQ セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">よくあるご質問</span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="UNIONに加盟するメリットは何ですか？"
              answer="UNIONに加盟すると、メディア露出の機会獲得、他の学生団体との連携、各種イベントへの参加、企業連携の機会など様々なメリットがあります。詳しくは「加盟する」ページをご覧ください。"
            />
            <FaqItem 
              question="加盟には費用がかかりますか？"
              answer="基本的な加盟費用は無料です。ただし、一部のイベントやサービスについては、実費負担をお願いする場合があります。"
            />
            <FaqItem 
              question="どのような団体が加盟できますか？"
              answer="学生が主体となって運営している団体であれば、活動分野や規模を問わず加盟できます。ただし、UNIONの理念に沿った活動をしている団体であることが条件となります。"
            />
            <FaqItem 
              question="企業として連携するにはどうすればよいですか？"
              answer="企業様との連携については、こちらのお問い合わせフォームから「企業連携・協賛について」を選択してお問い合わせください。担当者から詳細をご連絡いたします。"
            />
            <FaqItem 
              question="UNIONのメディアに団体の活動を掲載してもらうには？"
              answer="加盟団体の場合は、運営メンバーに直接ご相談ください。非加盟団体の場合は、こちらのお問い合わせフォームから「メディア掲載依頼」を選択してお問い合わせください。"
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// お問い合わせ方法カードコンポーネント
const ContactMethodCard = ({ icon, title, content, link }) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col items-center text-center"
  >
    <div className="text-4xl text-gradient-primary mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{content}</p>
  </a>
);

// FAQアイテムコンポーネント
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition focus:outline-none"
      >
        <span className="text-lg font-medium">{question}</span>
        <i className={`fas ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500`}></i>
      </button>
      
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0 bg-gray-50">
          <p className="text-gray-600">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 