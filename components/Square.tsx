import React from 'react';
import Piece from './Piece';
import { SquareProps } from '../types';

const Square: React.FC<SquareProps> = ({
  square,
  piece,
  isLight,
  isSelected,
  isLastMove,
  isPossibleMove,
  isCheck,
  onClick,
}) => {
  // Determine background color
  let bgClass = isLight ? 'bg-[#e8cfa6]' : 'bg-[#8f5e36]';
  
  // Overrides for states
  if (isSelected) {
    bgClass = 'bg-[#bbc43a]'; // Selected highlight
  } else if (isLastMove) {
    bgClass = isLight ? 'bg-[#cdce78]' : 'bg-[#aaa23b]'; // Yellowish highlight for last move
  }

  // Check visual
  if (isCheck && piece?.type === 'k') {
    bgClass = 'bg-red-500';
  }

  return (
    <div
      onClick={onClick}
      className={`${bgClass} relative flex items-center justify-center cursor-pointer select-none transition-colors duration-100`}
      style={{ width: '100%', paddingBottom: '100%' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Rank/File labels for corners */}
        {square.endsWith('1') && (
            <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${isLight ? 'text-[#8f5e36]' : 'text-[#e8cfa6]'}`}>
                {square[0]}
            </span>
        )}
        {square.startsWith('a') && (
            <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${isLight ? 'text-[#8f5e36]' : 'text-[#e8cfa6]'}`}>
                {square[1]}
            </span>
        )}

        {/* The Piece */}
        {piece && <Piece type={piece.type} color={piece.color} />}
        
        {/* Possible Move Indicator */}
        {isPossibleMove && (
          <div className={`absolute w-3 h-3 rounded-full ${piece ? 'border-4 border-[rgba(0,0,0,0.3)] w-full h-full rounded-full bg-transparent' : 'bg-[rgba(0,0,0,0.2)]'}`}></div>
        )}
      </div>
    </div>
  );
};

export default Square;