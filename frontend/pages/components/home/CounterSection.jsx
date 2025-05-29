import React from 'react';

const CounterSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* 加盟団体数 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">50+</h3>
            <p className="text-gray-600">加盟団体数</p>
          </div>

          {/* メンバー数 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">1000+</h3>
            <p className="text-gray-600">メンバー数</p>
          </div>

          {/* イベント数 */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-4xl font-bold text-blue-600 mb-2">100+</h3>
            <p className="text-gray-600">年間イベント数</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterSection; 