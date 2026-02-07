import React from 'react';

export const DatabaseIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4m0 5.5C0 14.71 3.582 16.5 8 16.5s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8-4" />
    </svg>
);