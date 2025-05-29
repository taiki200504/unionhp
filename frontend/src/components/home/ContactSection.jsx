import React from 'react';
import Link from 'next/link';
import AnimatedElement from '../AnimatedElement';

const ContactSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">お問い合わせ</span>
            </h2>
            <p className="text-lg text-gray-600">
              ご質問、お問い合わせ、加盟のご相談など、お気軽にご連絡ください。
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fade-up" delay={0.2}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-10">
                <h3 className="text-xl font-bold mb-4">お問い合わせ先</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <p className="font-medium">メール</p>
                      <p>info@union-student.jp</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <p className="font-medium">電話</p>
                      <p>03-XXXX-XXXX (平日10:00-18:00)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500">
                      <i className="fab fa-twitter"></i>
                    </div>
                    <div className="ml-3 text-gray-700">
                      <p className="font-medium">Twitter</p>
                      <a href="https://twitter.com/UNION_gakusei" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                        @UNION_gakusei
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center p-8 md:p-10 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-xl font-bold mb-4">お問い合わせフォーム</h3>
                <p className="text-gray-600 mb-6">
                  詳しいお問い合わせは、専用フォームよりご連絡ください。
                </p>
                <Link 
                  href="/contact"
                  className="bg-gradient-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition inline-flex items-center justify-center"
                >
                  <span>お問い合わせフォーム</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

export default ContactSection; 