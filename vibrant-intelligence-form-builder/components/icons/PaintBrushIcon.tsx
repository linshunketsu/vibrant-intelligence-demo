import React from 'react';

export const PaintBrushIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.385m5.043.025a23.998 23.998 0 00-3.388-1.621m-5.043-.025a23.994 23.994 0 011.622-3.385m1.622 3.385L17.53 4.22a2.25 2.25 0 013.182 3.182l-5.841 5.841m-1.622-3.385a15.996 15.996 0 00-5.043-.025m11.902 0a15.995 15.995 0 00-5.043-.025" />
    </svg>
);