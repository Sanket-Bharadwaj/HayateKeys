
import React from 'react';

interface Keyboard3DProps {
  pressedKey?: string;
  className?: string;
}

const Keyboard3D: React.FC<Keyboard3DProps> = ({ pressedKey, className }) => {
  const qwertyLayout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className={`${className} p-4 bg-gray-800 rounded-lg`}>
      <div className="flex flex-col items-center space-y-2">
        {qwertyLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex space-x-1">
            {row.map((char) => (
              <div
                key={char}
                className={`
                  w-8 h-8 flex items-center justify-center rounded
                  text-white text-sm font-mono
                  transition-all duration-150
                  ${pressedKey?.toLowerCase() === char 
                    ? 'bg-blue-500 scale-95 shadow-inner' 
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                {char.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard3D;
