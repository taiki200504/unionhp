import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const PrivacyPage = () => {
  useEffect(() => {
    // ページタイトルを設定
    document.title = 'プライバシーポリシー | 学生団体連合UNION';
    
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
              <span className="text-gradient-primary">プライバシーポリシー</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              学生団体連合UNIONのプライバシーポリシーについて
            </p>
          </div>
        </div>
      </section>

      {/* プライバシーポリシーセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p>
              学生団体連合UNION（以下、「当団体」といいます）は、ウェブサイト（https://union-student.jp）の運営において、お客様のプライバシーを尊重し、個人情報の保護に努めています。このプライバシーポリシーでは、当団体がどのような個人情報を収集し、どのように使用するかについて説明します。
            </p>

            <h2>1. 収集する情報</h2>
            <p>
              当団体は、以下の場合に個人情報を収集することがあります：
            </p>
            <ul>
              <li>お問い合わせフォームからのお問い合わせ</li>
              <li>加盟申し込みフォームからの申し込み</li>
              <li>メールマガジンの購読申し込み</li>
              <li>イベント参加申し込み</li>
            </ul>
            <p>
              収集する個人情報には、氏名、メールアドレス、電話番号、所属団体・組織名などが含まれます。また、当ウェブサイトへのアクセス情報（IPアドレス、ブラウザの種類、アクセス日時など）も自動的に収集される場合があります。
            </p>

            <h2>2. 情報の利用目的</h2>
            <p>
              収集した個人情報は、以下の目的で利用します：
            </p>
            <ul>
              <li>お問い合わせに対する回答</li>
              <li>加盟団体の審査・管理</li>
              <li>イベントの開催通知</li>
              <li>メールマガジンの配信</li>
              <li>サービス向上のための統計データの作成（個人を特定しない形で）</li>
              <li>当団体の活動に関する情報提供</li>
            </ul>

            <h2>3. 情報の第三者提供</h2>
            <p>
              当団体は、以下の場合を除き、収集した個人情報を第三者に提供することはありません：
            </p>
            <ul>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合</li>
              <li>予め同意をいただいている場合</li>
            </ul>

            <h2>4. クッキー（Cookie）の使用</h2>
            <p>
              当ウェブサイトでは、利便性向上のためにクッキーを使用することがあります。クッキーとは、ウェブサイトがお客様のコンピュータに一時的に保存する小さなテキストファイルです。お客様はブラウザの設定によりクッキーの受け入れを拒否することができますが、その場合、当ウェブサイトの一部の機能が正常に動作しなくなる可能性があります。
            </p>

            <h2>5. アクセス解析ツールの使用</h2>
            <p>
              当ウェブサイトでは、Google Analyticsなどのアクセス解析ツールを使用しています。これらのツールはクッキーを使用してデータを収集しますが、個人を特定する情報は収集しません。収集したデータは、ウェブサイトの利用状況の分析や改善のために使用します。
            </p>

            <h2>6. 情報の安全管理</h2>
            <p>
              当団体は、収集した個人情報の漏洩、紛失、改ざんなどを防ぐために適切な安全管理措置を講じます。また、個人情報を取り扱う役員・スタッフに対して、個人情報保護に関する教育を実施します。
            </p>

            <h2>7. 個人情報の開示・訂正・削除</h2>
            <p>
              当団体が保有する個人情報について、本人からの開示、訂正、削除などの要請があった場合は、本人確認の上で速やかに対応します。開示などの請求は、当ウェブサイトのお問い合わせフォームまたはメールにてご連絡ください。
            </p>

            <h2>8. プライバシーポリシーの変更</h2>
            <p>
              当団体は、必要に応じてこのプライバシーポリシーを変更することがあります。変更した場合は、当ウェブサイトに掲載することにより通知します。
            </p>

            <h2>9. お問い合わせ</h2>
            <p>
              このプライバシーポリシーに関するお問い合わせは、以下の連絡先までお願いします。
            </p>
            <p>
              学生団体連合UNION<br />
              メールアドレス：info@union-student.jp
            </p>

            <p className="text-right mt-8">
              制定日：2023年4月1日<br />
              最終更新日：2024年1月15日
            </p>
          </div>
        </div>
      </section>

      {/* ナビゲーションボタン */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Link 
            to="/terms" 
            className="bg-white text-gray-800 border-2 border-gray-300 px-6 py-3 rounded-full hover:bg-gray-100 transition inline-flex items-center"
          >
            <span>利用規約を見る</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default PrivacyPage; 