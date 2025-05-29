import Head from 'next/head';

const SEO = ({ title, description, canonical, structuredData, children, noindex = false }) => {
  const siteTitle = 'UNION - 学生団体連合';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || '学生の声を社会に響かせる。学生団体と企業・社会をつなぐ架け橋となる学生メディア＆連合コミュニティ';
  const canonicalUrl = canonical ? `https://union-student.jp${canonical}` : 'https://union-student.jp/';
  const ogImageUrl = 'https://union-student.jp/logo.png';
  const ogType = 'website';
  const twitterCard = 'summary';

  return (
    <Head>
      {/* Basic metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured data if provided */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Additional head elements */}
      {children}
    </Head>
  );
};

export default SEO; 