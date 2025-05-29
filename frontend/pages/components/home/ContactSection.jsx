import React from 'react';
import Link from 'next/link';

const ContactSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">お問い合わせ</h2>
          <p className="text-gray-600 mb-8">
            UNIONへのご質問、ご相談、取材依頼など、
            お気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              お問い合わせフォーム
            </Link>
            <Link
              href="/join"
              className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors border border-gray-300"
            >
              加盟団体募集
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 