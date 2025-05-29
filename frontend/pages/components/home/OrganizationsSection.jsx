import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const OrganizationsSection = () => {
  const organizations = [
    {
      name: '学生団体A',
      description: '社会問題に取り組む学生団体',
      logo: '/images/photo/UNION-icon.png',
      category: '社会活動'
    },
    {
      name: '学生団体B',
      description: '教育支援を行う学生団体',
      logo: '/images/photo/UNION-icon.png',
      category: '教育'
    },
    {
      name: '学生団体C',
      description: '環境保護を推進する学生団体',
      logo: '/images/photo/UNION-icon.png',
      category: '環境'
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">加盟団体</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {organizations.map((org, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={org.logo}
                    alt={org.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{org.name}</h3>
                  <span className="text-sm text-blue-600">{org.category}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{org.description}</p>
              <Link
                href={`/organizations/${org.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                詳しく見る →
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/organizations"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            加盟団体一覧を見る
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OrganizationsSection; 