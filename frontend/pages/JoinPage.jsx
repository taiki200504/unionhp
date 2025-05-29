import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const JoinPage = () => {
  // フォーム入力のステート
  const [formData, setFormData] = useState({
    organizationName: '',
    representativeName: '',
    email: '',
    phone: '',
    website: '',
    members: '',
    description: '',
    reason: '',
    sns: '',
    hearAbout: ''
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
      // const response = await fetch('/api/join', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // ダミーの非同期処理（実際の実装では削除）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 成功時の処理
      setSubmitResult({
        success: true,
        message: 'お申し込みありがとうございます。内容を確認後、担当者からご連絡いたします。'
      });
      
      // フォームをリセット
      setFormData({
        organizationName: '',
        representativeName: '',
        email: '',
        phone: '',
        website: '',
        members: '',
        description: '',
        reason: '',
        sns: '',
        hearAbout: ''
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
    document.title = '加盟する | 学生団体連合UNION';
    
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
              UNIONに<span className="text-gradient-primary">加盟する</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              あなたの団体の声を社会に響かせませんか？
            </p>
          </div>
        </div>
      </section>

      {/* 加盟メリットセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">加盟のメリット</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon="fas fa-bullhorn"
              title="メディア露出"
              description="UNIONの各種メディアで団体の活動を紹介し、認知度向上をサポートします。"
            />
            <BenefitCard 
              icon="fas fa-users"
              title="団体間連携"
              description="様々な分野の学生団体との交流や連携を通じて、新しい価値を創出できます。"
            />
            <BenefitCard 
              icon="fas fa-building"
              title="企業連携"
              description="UNIONを通じて企業との連携機会を得ることができます。"
            />
            <BenefitCard 
              icon="fas fa-calendar-alt"
              title="イベント開催"
              description="合同イベントの開催やプロモーション支援を受けることができます。"
            />
            <BenefitCard 
              icon="fas fa-graduation-cap"
              title="スキルアップ"
              description="勉強会やワークショップを通じて、運営スキルを向上させることができます。"
            />
            <BenefitCard 
              icon="fas fa-handshake"
              title="メンバー獲得"
              description="UNIONの広報を通じて、新規メンバー獲得のチャンスが広がります。"
            />
          </div>
        </div>
      </section>

      {/* 加盟団体の声セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">加盟団体の声</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              name="鈴木 太郎"
              position="ONE JAPAN 代表"
              quote="UNIONに加盟してから、他の学生団体との交流が増え、新しいプロジェクトが生まれました。メディア露出も増え、団体の認知度が大きく向上しました。"
              image="/testimonials/testimonial1.jpg"
            />
            <TestimonialCard 
              name="佐藤 花子"
              position="ミライノカタチ 代表"
              quote="メディア運営のノウハウを学べたことが大きな収穫でした。UNIONのポッドキャストに出演したことで、団体の活動に興味を持ってくれる学生が増えました。"
              image="/testimonials/testimonial2.jpg"
            />
            <TestimonialCard 
              name="田中 健太"
              position="SCORE 副代表"
              quote="企業との連携機会が増え、団体の活動が広がりました。同じ志を持つ仲間との出会いは、私たちの活動に新しい視点をもたらしてくれています。"
              image="/testimonials/testimonial3.jpg"
            />
          </div>
        </div>
      </section>

      {/* 加盟条件セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="text-gradient-primary">加盟条件</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-4">
                <RequirementItem>
                  学生が主体となって運営している団体であること
                </RequirementItem>
                <RequirementItem>
                  UNIONの理念に共感し、協力的に活動できること
                </RequirementItem>
                <RequirementItem>
                  定期的に活動実績があり、継続的な運営がなされていること
                </RequirementItem>
                <RequirementItem>
                  UNIONの活動（合同イベントやメディア出演など）に積極的に参加できること
                </RequirementItem>
                <RequirementItem>
                  団体間の交流や連携に前向きであること
                </RequirementItem>
              </ul>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  条件に当てはまらない場合でも、まずはお気軽にご相談ください。
                </p>
                <Link 
                  to="/contact" 
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                >
                  <span>お問い合わせはこちら</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 加盟申し込みフォームセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">加盟申し込み</span>
          </h2>
          
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
            <div className="space-y-6">
              {/* 団体名 */}
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                  団体名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* 代表者名 */}
              <div>
                <label htmlFor="representativeName" className="block text-sm font-medium text-gray-700 mb-1">
                  代表者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="representativeName"
                  name="representativeName"
                  value={formData.representativeName}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  連絡先メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  連絡先電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* ウェブサイト */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  ウェブサイト/SNSリンク
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://"
                />
              </div>

              {/* メンバー数 */}
              <div>
                <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
                  メンバー数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="members"
                  name="members"
                  value={formData.members}
                  onChange={handleChange}
                  required
                  min="1"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* 団体概要 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  団体概要（活動内容） <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="団体の設立目的、主な活動内容、対象者などを記入してください。"
                ></textarea>
              </div>

              {/* 加盟理由 */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  UNIONに加盟したい理由 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="UNIONに加盟することで期待することや、得たいメリットなどを記入してください。"
                ></textarea>
              </div>

              {/* SNSアカウント */}
              <div>
                <label htmlFor="sns" className="block text-sm font-medium text-gray-700 mb-1">
                  SNSアカウント
                </label>
                <textarea
                  id="sns"
                  name="sns"
                  value={formData.sns}
                  onChange={handleChange}
                  rows="2"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Instagram、Twitter、Facebookなどのアカウント名やURLを記入してください。"
                ></textarea>
              </div>

              {/* 知ったきっかけ */}
              <div>
                <label htmlFor="hearAbout" className="block text-sm font-medium text-gray-700 mb-1">
                  UNIONを知ったきっかけ
                </label>
                <textarea
                  id="hearAbout"
                  name="hearAbout"
                  value={formData.hearAbout}
                  onChange={handleChange}
                  rows="2"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="SNS、知人の紹介、イベントなど"
                ></textarea>
              </div>

              {/* 送信ボタン */}
              <div className="text-center pt-4">
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
                    '申し込む'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* よくある質問セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">よくある質問</span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="加盟には費用がかかりますか？"
              answer="基本的な加盟費用は無料です。ただし、一部のイベントやサービスについては、実費負担をお願いする場合があります。"
            />
            <FaqItem 
              question="どのような団体が加盟できますか？"
              answer="学生が主体となって運営している団体であれば、活動分野や規模を問わず加盟できます。ただし、UNIONの理念に沿った活動をしている団体であることが条件となります。"
            />
            <FaqItem 
              question="加盟後はどのような活動に参加するのですか？"
              answer="UNIONのメディア出演（ポッドキャストなど）、合同イベントへの参加、団体間交流会、スキルアップワークショップなど、様々な活動に参加いただけます。参加は基本的に任意です。"
            />
            <FaqItem 
              question="申し込みから加盟までどれくらいの期間がかかりますか？"
              answer="申し込み後、1〜2週間程度で担当者から連絡が入り、オンライン面談を実施します。その後、双方の合意が得られれば即時加盟となります。通常、申し込みから加盟まで約1ヶ月程度です。"
            />
            <FaqItem 
              question="加盟後に退会することはできますか？"
              answer="はい、いつでも退会可能です。退会を希望する場合は、運営メンバーにご連絡ください。"
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// メリットカードコンポーネント
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="text-4xl text-gradient-primary mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// 加盟条件アイテムコンポーネント
const RequirementItem = ({ children }) => (
  <li className="flex items-start">
    <div className="flex-shrink-0 mt-1">
      <i className="fas fa-check-circle text-green-500"></i>
    </div>
    <p className="ml-3 text-gray-700">{children}</p>
  </li>
);

// 団体の声カードコンポーネント
const TestimonialCard = ({ name, position, quote, image }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://via.placeholder.com/48x48?text=UNION" }}
        />
      </div>
      <div>
        <h3 className="font-bold">{name}</h3>
        <p className="text-sm text-gray-600">{position}</p>
      </div>
    </div>
    <blockquote className="italic text-gray-600 mb-2">
      "{quote}"
    </blockquote>
  </div>
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

export default JoinPage; 