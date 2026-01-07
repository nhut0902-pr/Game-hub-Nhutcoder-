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
  themeColors,
  pieceStyle
}) => {
  // Determine background color based on Theme
  let bgStyle = { backgroundColor: isLight ? themeColors.light : themeColors.dark };
  
  // Overrides for states
  if (isSelected) {
     // Mix selection color (semi-transparent) over the base color could be better, but simple override for now
     // Let's use a nice yellow-green
     bgStyle = { backgroundColor: 'rgba(187, 196, 58, 0.9)' }; 
  } else if (isLastMove) {
     bgStyle = { backgroundColor: isLight ? 'rgba(205, 206, 120, 0.8)' : 'rgba(170, 162, 59, 0.8)' };
  }

  // Check visual
  if (isCheck && piece?.type === 'k') {
    bgStyle = { backgroundColor: '#ef4444' };
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none transition-colors duration-200`}
      style={{ width: '100%', paddingBottom: '100%', ...bgStyle }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Rank/File labels for corners (Dynamic Color) */}
        {square.endsWith('1') && (
            <span className="absolute bottom-0.5 right-1 text-[10px] font-bold" style={{ color: isLight ? themeColors.dark : themeColors.light }}>
                {square[0]}
            </span>
        )}
        {square.startsWith('a') && (
            <span className="absolute top-0.5 left-1 text-[10px] font-bold" style={{ color: isLight ? themeColors.dark : themeColors.light }}>
                {square[1]}
            </span>
        )}

        {/* The Piece */}
        {piece && <Piece type={piece.type} color={piece.color} style={pieceStyle} />}
        
        {/* Possible Move Indicator */}
        {isPossibleMove && (
          <div className={`absolute w-3 h-3 rounded-full ${piece ? 'border-4 border-[rgba(0,0,0,0.3)] w-full h-full rounded-full bg-transparent' : 'bg-[rgba(0,0,0,0.2)]'}`}></div>
        )}
      </div>
    </div>
  );
};

export default Square;