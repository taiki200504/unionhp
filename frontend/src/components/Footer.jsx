import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* メインフッター */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ロゴと説明 */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block">
              <img 
                src="/logo-white.png" 
                alt="UNION" 
                className="h-12 w-auto mb-4" 
                onError={(e) => { e.target.src = "/logo-white-placeholder.png" }}
              />
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              学生団体と企業・社会をつなぐ架け橋となる
              学生メディア＆連合コミュニティ
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://twitter.com/UNION_gakusei" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <i className="fab fa-twitter text-xl"></i>
                <span className="sr-only">Twitter</span>
              </a>
              <a 
                href="https://www.instagram.com/union_gakusei/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <i className="fab fa-instagram text-xl"></i>
                <span className="sr-only">Instagram</span>
              </a>
              <a 
                href="https://www.youtube.com/channel/UNIONchannel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                <i className="fab fa-youtube text-xl"></i>
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* リンク：UNION */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">UNION</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/media" className="text-gray-400 hover:text-white transition">
                  Media
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="text-gray-400 hover:text-white transition">
                  団体一覧
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-400 hover:text-white transition">
                  イベント
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-gray-400 hover:text-white transition">
                  加盟する
                </Link>
              </li>
            </ul>
          </div>

          {/* リンク：サポート */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>

          {/* お問い合わせ */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
            <p className="text-gray-400 mb-2">
              <i className="far fa-envelope mr-2"></i> info@union-student.jp
            </p>
            <Link 
              href="/contact" 
              className="inline-block mt-2 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
              お問い合わせフォーム
            </Link>
          </div>
        </div>
      </div>

      {/* コピーライト */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} 学生団体連合UNION All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 text-sm hover:text-white transition">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="text-gray-400 text-sm hover:text-white transition">
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 