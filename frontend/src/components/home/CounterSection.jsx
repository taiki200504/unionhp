import React, { useEffect, useState, useRef } from 'react';

const CounterSection = () => {
  // カウンターの設定
  const counters = [
    { id: 'organizations', label: '加盟団体数', target: 28 },
    { id: 'students', label: '加盟学生数', target: 512 },
    { id: 'partners', label: '提携企業数', target: 9 }
  ];

  // カウンターアニメーション用のステート
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="counter-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {counters.map(counter => (
            <CounterItem
              key={counter.id}
              target={counter.target}
              label={counter.label}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// カウンターアイテムコンポーネント
const CounterItem = ({ target, label, isVisible }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    // アニメーションの時間（ミリ秒）
    const duration = 2000;
    // 更新の頻度
    const steps = 60;
    const stepTime = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += target / steps;
      if (current > target) {
        current = target;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [isVisible, target]);
  
  return (
    <div className="counter-item">
      <div className="counter-number">{count}</div>
      <div className="counter-label">{label}</div>
    </div>
  );
};

export default CounterSection; 