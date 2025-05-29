import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  // モバイルメニュー表示状態の管理
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // ヘッダーの背景色を管理（スクロールで変更）
  const [isScrolled, setIsScrolled] = useState(false);

  // スクロールイベントのリスナー設定
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // スクロールイベントリスナーを追加
    window.addEventListener('scroll', handleScroll);
    
    // 初期状態をチェック
    handleScroll();
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // モバイルメニューの開閉
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* ロゴ */}
          <Link href="/" className="flex-shrink-0" onClick={closeMobileMenu}>
            <img 
              src={isScrolled ? "/logo.png" : "/logo-white.png"} 
              alt="UNION" 
              className="h-10 w-auto" 
              onError={(e) => { e.target.src = isScrolled ? "/logo-placeholder.png" : "/logo-white-placeholder.png" }}
            />
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/about" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? 'text-blue-600' 
                    : isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`
              }
            >
              About
            </Link>
            <Link 
              href="/media" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? 'text-blue-600' 
                    : isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`
              }
            >
              Media
            </Link>
            <Link 
              href="/organizations" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? 'text-blue-600' 
                    : isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`
              }
            >
              団体一覧
            </Link>
            <Link 
              href="/events" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? 'text-blue-600' 
                    : isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`
              }
            >
              イベント
            </Link>
            <Link 
              href="/contact" 
              className={({ isActive }) => 
                `text-sm font-medium transition ${
                  isActive 
                    ? 'text-blue-600' 
                    : isScrolled ? 'text-gray-800 hover:text-blue-600' : 'text-white hover:text-gray-200'
                }`
              }
            >
              お問い合わせ
            </Link>
            <Link 
              href="/join" 
              className={`ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-full text-sm font-medium text-white ${
                isScrolled ? 'bg-gradient-primary' : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30'
              } transition`}
            >
              加盟する
            </Link>
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button 
              type="button"
              onClick={toggleMobileMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : 'text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-10'
              }`}
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-300 transform ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/about" 
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'}`
            }
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link 
            href="/media" 
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'}`
            }
            onClick={closeMobileMenu}
          >
            Media
          </Link>
          <Link 
            href="/organizations" 
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'}`
            }
            onClick={closeMobileMenu}
          >
            団体一覧
          </Link>
          <Link 
            href="/events" 
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'}`
            }
            onClick={closeMobileMenu}
          >
            イベント
          </Link>
          <Link 
            href="/contact" 
            className={({ isActive }) => 
              `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-800 hover:bg-gray-50'}`
            }
            onClick={closeMobileMenu}
          >
            お問い合わせ
          </Link>
          <Link 
            href="/join" 
            className="block w-full mt-4 px-4 py-2 bg-gradient-primary text-white text-center rounded-full font-medium"
            onClick={closeMobileMenu}
          >
            加盟する
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 