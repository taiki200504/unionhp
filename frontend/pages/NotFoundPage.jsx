import React from 'react';
import Link from 'next/link';
import MainLayout from './layouts/MainLayout';

const NotFoundPage = () => {
  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-7xl md:text-9xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            ページが見つかりません
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            お探しのページは移動または削除された可能性があります。
          </p>
          <Link 
            href="/" 
            className="btn-primary inline-flex items-center"
          >
            <i className="fas fa-home mr-2"></i> ホームに戻る
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage; 