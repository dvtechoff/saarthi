import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
                    changeColors[changeType]
                  )}
                >
                  {change}
                </span>
                {description && (
                  <span className="text-xs text-gray-500">{description}</span>
                )}
              </div>
            )}
          </div>
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}