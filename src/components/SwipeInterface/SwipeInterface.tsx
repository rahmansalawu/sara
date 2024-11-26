'use client';

import React, { useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

interface SwipeInterfaceProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}) => {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Configure drag gesture
  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy], cancel }) => {
      const trigger = Math.abs(vx) > 0.2 || Math.abs(vy) > 0.2;
      
      if (!down && trigger) {
        // Determine swipe direction based on velocity and movement
        if (Math.abs(mx) > Math.abs(my)) {
          // Horizontal swipe
          if (mx > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (my > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
        
        // Reset position
        api.start({ x: 0, y: 0, immediate: false });
      } else {
        // Update position while dragging
        api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down });
      }

      setIsDragging(down);
    },
    {
      bounds: { left: -100, right: 100, top: -100, bottom: 100 },
      rubberband: true,
    }
  );

  return (
    <animated.div
      ref={containerRef}
      {...bind()}
      style={{
        x,
        y,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      className="transition-shadow duration-200"
    >
      {children}
    </animated.div>
  );
};
