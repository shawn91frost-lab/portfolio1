import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2 text-[12px] text-slate-400 flex items-center justify-center gap-2">
      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        <strong className="text-slate-300 font-medium">Regulatory Disclaimer:</strong> Technical indicators, EMA trends, and signals shown by this application are for informational and educational purposes only and should not be considered financial or investment advice.
      </span>
    </div>
  );
};
