// API base URL
const API_BASE_URL = '';

/**
 * Generic fetch wrapper with error handling
 */
const fetchData = async (endpoint, options = {}) => {
  // 開発環境では常にモックデータを使用
  if (process.env.NODE_ENV === 'development') {
    return getFallbackData(endpoint);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    // 本番環境でAPIが利用できない場合もモックデータを使用
    return getFallbackData(endpoint);
  }
};

/**
 * Fallback data for development and when API is unavailable
 */
const getFallbackData = (endpoint) => {
  // Map endpoints to fallback data
  const fallbackData = {
    '/events': mockEvents,
    '/organizations': mockOrganizations,
    // Add more fallback data as needed
  };

  // Return appropriate fallback data based on endpoint
  for (const key in fallbackData) {
    if (endpoint.startsWith(key)) {
      return fallbackData[key];
    }
  }
  
  return { error: 'No fallback data available' };
};

// API methods
export const api = {
  // Events
  getEvents: () => fetchData('/events'),
  getEventById: (id) => fetchData(`/events/${id}`),
  
  // Organizations
  getOrganizations: () => fetchData('/organizations'),
  getOrganizationById: (id) => fetchData(`/organizations/${id}`),
  
  // Contact
  submitContactForm: (data) => fetchData('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Join
  submitJoinApplication: (data) => fetchData('/join', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Mock data for fallback
const mockEvents = [
  {
    id: 1,
    title: "UNION合同説明会",
    date: "2024年6月15日(土)",
    time: "13:00 - 17:00",
    location: "東京都渋谷区 Shibuya Hub",
    type: "説明会",
    status: "upcoming",
    description: "UNION加盟団体が一堂に会する合同説明会です。様々な分野の学生団体の活動を知ることができます。個別相談ブースもご用意しています。",
    image: "/events/event1.jpg",
    link: "/events/union-joint-session"
  },
  {
    id: 2,
    title: "ユニラジ公開収録",
    date: "2024年7月10日(水)",
    time: "18:30 - 20:30",
    location: "オンライン(Zoom)",
    type: "メディア",
    status: "upcoming",
    description: "UNIONのポッドキャスト「ユニラジ」の公開収録イベントです。ゲストに著名な起業家をお招きし、学生団体の活動との関わりについて語っていただきます。",
    image: "/events/event2.jpg",
    link: "/events/uniradio-live"
  },
  {
    id: 3,
    title: "学生団体リーダーシップワークショップ",
    date: "2024年8月5日(月) - 6日(火)",
    time: "10:00 - 17:00",
    location: "神奈川県箱根町 研修施設",
    type: "ワークショップ",
    status: "upcoming",
    description: "学生団体のリーダーを対象としたリーダーシップ育成ワークショップです。組織運営のノウハウや課題解決手法を学びます。",
    image: "/events/event3.jpg",
    link: "/events/leadership-workshop"
  },
  // More events...
];

const mockOrganizations = [
  { 
    id: 1, 
    name: "ONE JAPAN", 
    logo: "/logos/one-japan.png", 
    type: "起業家育成", 
    description: "日本の起業家精神を育む学生団体。イベントやワークショップを通じて起業家マインドを醸成。",
    members: 80,
    founded: "2018年",
    universities: ["東京大学", "慶應義塾大学", "早稲田大学", "他多数"],
    website: "https://onejapan.jp",
    social: {
      twitter: "https://twitter.com/onejapan",
      instagram: "https://instagram.com/onejapan"
    },
    link: "/organizations/one-japan"
  },
  { 
    id: 2, 
    name: "アイセック", 
    logo: "/logos/aiesec.png", 
    type: "国際交流", 
    description: "世界126カ国に拠点を持つ国際学生団体。海外インターンシッププログラムを提供し、グローバルリーダーを育成。",
    members: 120,
    founded: "1948年",
    universities: ["全国の大学"],
    website: "https://aiesec.jp",
    social: {
      twitter: "https://twitter.com/aiesecjapan",
      instagram: "https://instagram.com/aiesecjapan"
    },
    link: "/organizations/aiesec"
  },
  // More organizations...
];

export default api; 