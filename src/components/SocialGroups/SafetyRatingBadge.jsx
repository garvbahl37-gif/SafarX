
import React from 'react';
import { Shield } from 'lucide-react';

const SafetyRatingBadge = ({ score, size = 'md' }) => {
  const getScoreColor = (score) => {
      if (score >= 9) return 'text-green-700 bg-green-50 border-green-200';
      if (score >= 7) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      if (score >= 5) return 'text-orange-700 bg-orange-50 border-orange-200';
      return 'text-red-700 bg-red-50 border-red-200';
  };

  const sizeClasses = {
      sm: 'text-xs px-1.5 py-0.5',
      md: 'text-sm px-2.5 py-1',
      lg: 'text-base px-3 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border font-bold ${getScoreColor(score)} ${sizeClasses[size]}`}>
        <Shield size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="fill-current opacity-20" />
        <span>{score.toFixed(1)}</span>
    </div>
  );
};

export default SafetyRatingBadge;
