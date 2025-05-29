import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴと説明 */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">UNION</h2>
            <p className="text-gray-400 mb-4">
              学生の声を社会に響かせる。学生団体と企業・社会をつなぐ架け橋となる学生メディア＆連合コミュニティ
            </p>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-lg font-semibold mb-4">リンク</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  UNIONについて
                </Link>
              </li>
              <li>
                <Link href="/media" className="text-gray-400 hover:text-white">
                  メディア
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="text-gray-400 hover:text-white">
                  加盟団体
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white">
                  イベント
                </Link>
              </li>
            </ul>
          </div>

          {/* お問い合わせ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  お問い合わせフォーム
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-gray-400 hover:text-white">
                  加盟団体募集
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} UNION. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 