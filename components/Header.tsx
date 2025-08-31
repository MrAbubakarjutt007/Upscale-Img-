
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
        AI Virtual Try-On
      </h1>
      <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
        See yourself in any outfit. Upload your photo and an item of clothing to begin.
      </p>
    </header>
  );
};

export default Header;
