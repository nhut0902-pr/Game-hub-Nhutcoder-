import React from 'react';
import { PieceType, PlayerColor } from '../types';

interface PieceProps {
  type: PieceType;
  color: PlayerColor;
  style: string;
}

const getPieceColors = (color: PlayerColor, style: string) => {
    // Default / Standard
    let fill = color === 'w' ? '#fff' : '#000';
    let stroke = color === 'w' ? '#000' : '#fff';

    if (style === 'piece_gold') {
        fill = color === 'w' ? '#fff8e7' : '#ffd700'; // Cream for white, Gold for black
        stroke = color === 'w' ? '#d4af37' : '#b8860b';
    } else if (style === 'piece_diamond') {
        fill = color === 'w' ? '#e0ffff' : '#00bfff'; // Light Cyan vs Deep Sky Blue
        stroke = color === 'w' ? '#00ced1' : '#191970';
    }
    
    return { fill, stroke };
};

const Piece: React.FC<PieceProps> = ({ type, color, style }) => {
  const { fill, stroke } = getPieceColors(color, style);
  
  // We reconstruct SVG content using dynamic colors
  // Note: To keep code compact, I'm injecting the colors into the paths.
  // Ideally this would be separate components, but for this structure:

  const PieceIcons: Record<string, React.ReactNode> = {
      // PAWN
      p: <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />,
      // KNIGHT
      n: <g><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" /><path d="M24 18c.38 2.32-2.41 2.65-4.35.37-1.75-2.06-1.57-6.27.76-7.76C24.47 9.17 23.6 15.65 24 18z" /></g>,
      // BISHOP
      b: <g><path d="M9 36c3.39-.47 5.5-1.73 9-4.5.3-2.11-2.03-6.53-4.22-9.43-1.41-1.87-1.75-5.22.84-7.31 3.25-2.63 7.72-2.31 10.38 0 2.62 2.28 2.34 5.34.84 7.31-2.19 2.9-4.5 7.31-4.22 9.43 3.5 2.77 5.61 4.03 9 4.5V40H9v-4z" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0" /><path d="M23 7c0-2.5-3.5-3.5-1-6" strokeLinejoin="miter" /><path d="M22 22l-3-3" /></g>,
      // ROOK
      r: <g><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt" /><path d="M11 14c0 2.5 2.5 6 3.5 7.5S18.5 28 18.5 28h8s4-5 5-6.5 3.5-5 3.5-7.5" /><path d="M11 14h23" fill="none" stroke={stroke} strokeLinejoin="miter" /></g>,
      // QUEEN
      q: <g><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" strokeLinecap="butt" /><path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4" /><path d="M9 26h27" fill="none" stroke={stroke} strokeLinejoin="miter" /><path d="M11 38.5a35 35 1 0 0 0 23 0" fill="none" stroke={stroke} strokeLinecap="butt" /><path d="M11 29a35 35 1 0 0 1 23 0" fill="none" stroke={stroke} strokeLinejoin="miter" /></g>,
      // KING
      k: <g><path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" /><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" strokeLinecap="butt" /><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-4-8-4-5 4-8 4-5-3-8-2c-3 6 6 10.5 6 10.5v7z" /><path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none" /><path d="M11.5 33.5c5.5-3 15.5-3 21 0" fill="none" /><path d="M11.5 37c5.5-3 15.5-3 21 0" fill="none" /></g>
  };

  return (
      <div className="w-full h-full p-0.5 pointer-events-none select-none">
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
            <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {PieceIcons[type]}
            </g>
          </svg>
      </div>
  );
};

export default Piece;