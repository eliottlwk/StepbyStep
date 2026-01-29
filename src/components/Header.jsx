import React from 'react';
import { Settings } from 'lucide-react';

const Header = ({ onToggleSettings }) => (
  <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
    <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Step by Step</h1>
      <button onClick={onToggleSettings} className="p-2 hover:bg-gray-100 rounded-xl">
        <Settings size={24} />
      </button>
    </div>
  </header>
);

export default Header;
