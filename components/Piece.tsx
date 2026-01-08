import React from 'react';
import { PieceType, PlayerColor } from '../types';

interface PieceProps {
  type: PieceType;
  color: PlayerColor;
  style: string;
}

const getPieceColors = (color: PlayerColor, style: string) => {
    let fill = color === 'w' ? '#ffffff' : '#333333';
    let stroke = '#000000';
    let strokeWidth = "1.5";

    if (style === 'piece_gold') {
        fill = color === 'w' ? '#fff8e7' : '#ffd700';
        stroke = color === 'w' ? '#d4af37' : '#b8860b';
    } else if (style === 'piece_diamond') {
        fill = color === 'w' ? '#e0ffff' : '#00bfff';
        stroke = color === 'w' ? '#00ced1' : '#191970';
    } else if (style === 'piece_neon') {
        fill = color === 'w' ? '#ccff00' : '#39ff14';
        stroke = '#000';
    }
    
    return { fill, stroke, strokeWidth };
};

const Piece: React.FC<PieceProps> = ({ type, color, style }) => {
  const { fill, stroke, strokeWidth } = getPieceColors(color, style);

  // Áp dụng hình ảnh thực tế cho quân Mã (Knight) - Đã sửa lại đúng URL
  if (type === 'n') {
    const knightSrc = color === 'w' 
      ? 'https://res.cloudinary.com/dl8tczibo/image/upload/v1767848374/SmartSelect_20260108_115528_Gallery_ztqloa.jpg'
      : 'https://res.cloudinary.com/dl8tczibo/image/upload/v1767848376/SmartSelect_20260108_115515_Gallery_w82ubg.jpg';
    return (
      <div className="w-full h-full flex items-center justify-center p-[2%]">
        <img 
          src={knightSrc} 
          className="w-full h-full object-contain mix-blend-multiply" 
          alt={`${color} knight`} 
          style={{ filter: color === 'b' ? 'contrast(1.1) brightness(0.9)' : 'none' }}
        />
      </div>
    );
  }

  // Áp dụng hình ảnh thực tế cho quân Xe (Rook) - Đã sửa lại đúng URL
  if (type === 'r') {
    const rookSrc = color === 'w'
      ? 'https://res.cloudinary.com/dl8tczibo/image/upload/v1767848366/SmartSelect_20260108_115601_Chrome_edvyvq.jpg'
      : 'https://res.cloudinary.com/dl8tczibo/image/upload/v1767848366/SmartSelect_20260108_115619_Chrome_nsmxec.jpg';
    return (
      <div className="w-full h-full flex items-center justify-center p-[2%]">
        <img 
          src={rookSrc} 
          className="w-full h-full object-contain mix-blend-multiply" 
          alt={`${color} rook`}
          style={{ filter: color === 'b' ? 'contrast(1.1) brightness(0.9)' : 'none' }}
        />
      </div>
    );
  }
  
  const PieceIcons: Record<string, React.ReactNode> = {
      p: <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />,
      b: <g>
          <path d="M9 36c3.39-.47 5.5-1.73 9-4.5.3-2.11-2.03-6.53-4.22-9.43-1.41-1.87-1.75-5.22.84-7.31 3.25-2.63 7.72-2.31 10.38 0 2.62 2.28 2.34 5.34.84 7.31-2.19 2.9-4.5 7.31-4.22 9.43 3.5 2.77 5.61 4.03 9 4.5V40H9v-4z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0" fill="none" stroke={stroke} />
          <path d="M23 7c0-2.5-3.5-3.5-1-6" fill="none" stroke={stroke} />
        </g>,
      q: <g>
          <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM38.5 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 1 2.5 1 4.5 1 4.5h20s0-2 1-4.5c1-2 2.5-2 2.5-4" />
          <path d="M11 38.5a35 35 1 0 0 0 23 0" fill="none" stroke={stroke} />
          <path d="M11 29a35 35 1 0 0 1 23 0" fill="none" stroke={stroke} />
        </g>,
      k: <g>
          <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={stroke} />
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-5 2-8 2s-4-4-8-4-5 4-8 4-5-3-8-2c-3 6 6 10.5 6 10.5v7z" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0" fill="none" stroke={stroke} />
          <path d="M11.5 33.5c5.5-3 15.5-3 21 0" fill="none" stroke={stroke} />
        </g>
  };

  return (
      <div className="w-full h-full p-0.5 pointer-events-none select-none">
          <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-sm">
            <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                {PieceIcons[type]}
            </g>
          </svg>
      </div>
  );
};

export default Piece;