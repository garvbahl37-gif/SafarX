
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const RSVPButtons = ({ currentStatus, onRSVP, meetupFull = false }) => {
  const buttons = [
    {
      status: 'going',
      label: 'Going',
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      status: 'maybe',
      label: 'Maybe',
      icon: HelpCircle,
      color: 'yellow',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    {
      status: 'not-going',
      label: "Can't Go",
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-red-600'
    }
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map(button => {
        const Icon = button.icon;
        const isSelected = currentStatus === button.status;
        const isDisabled = meetupFull && button.status === 'going' && !isSelected;
        
        return (
          <motion.button
            key={button.status}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl font-bold transition-all relative overflow-hidden border-2 ${
                isSelected 
                ? `bg-gradient-to-br ${button.gradient} text-white border-transparent shadow-lg` 
                : `bg-white text-gray-500 border-gray-100 hover:border-${button.color}-200 hover:text-${button.color}-600 hover:bg-${button.color}-50`
            } ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
            onClick={() => !isDisabled && onRSVP(button.status)}
            disabled={isDisabled}
            whileHover={!isDisabled ? { y: -2 } : {}}
            whileTap={!isDisabled ? { scale: 0.95 } : {}}
          >
            <Icon size={20} />
            <span className="text-sm">{button.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default RSVPButtons;
