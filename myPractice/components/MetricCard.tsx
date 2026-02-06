import React from 'react';
import { Card } from './Card';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changePeriod?: string;
  unit?: string;
  trendData?: { v: number }[];
  sentimentEmoji?: string;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changePeriod, unit, trendData, sentimentEmoji, children }) => {
  const hasChange = typeof change === 'number';
  const isPositive = hasChange && change >= 0;

  return (
    <Card>
      <h4 className="text-sm font-medium text-slate-500">{title}</h4>
      <div className="flex items-baseline space-x-2 mt-2">
        <p className="text-4xl font-bold text-slate-900">{value}</p>
        {unit && <span className="text-2xl text-slate-400">{unit}</span>}
        {sentimentEmoji && <span className="text-3xl">{sentimentEmoji}</span>}
        {hasChange && (
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {changePeriod && <p className="text-xs text-slate-400 mt-1">{changePeriod}</p>}

      {trendData && (
        <div className="h-8 mt-2 -mb-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id={`color${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke={isPositive ? '#10B981' : '#EF4444'} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#color${title.replace(/\s+/g, '')})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {children}
    </Card>
  );
};
