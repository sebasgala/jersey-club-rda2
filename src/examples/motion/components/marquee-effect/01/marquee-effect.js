import React from 'react';

const MarqueeEffect = ({ children, gap = 12, direction = 'horizontal', reverse = false, speed = 10, speedOnHover = 1 }) => {
  const animationClass = direction === 'vertical' ? 'animate-marquee-y' : 'animate-marquee-x';

  return (
    <div className="overflow-hidden relative">
      <div
        className={`${animationClass} flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} gap-${gap}`}
        style={{
          '--duration': `${speed}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MarqueeEffect;