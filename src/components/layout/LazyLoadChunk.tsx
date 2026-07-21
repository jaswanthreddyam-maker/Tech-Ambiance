import React, { Suspense, useRef } from 'react';
import { useInView } from 'framer-motion';

interface LazyLoadChunkProps {
  children: React.ReactNode;
  height?: string; // e.g. "min-h-[80vh]" to reserve layout space and prevent CLS
}

export const LazyLoadChunk: React.FC<LazyLoadChunkProps> = ({ 
  children, 
  height = "min-h-[80vh]" 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "400px 0px 400px 0px"
  });

  return (
    <div ref={ref} className={`${!inView ? height : ''} w-full relative`}>
      {inView ? (
        <Suspense fallback={<div className={`${height} w-full`} />}>
          {children}
        </Suspense>
      ) : (
        <div className={`${height} w-full`} />
      )}
    </div>
  );
};
