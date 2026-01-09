
import React, { useState, useEffect, useRef } from 'react';
import { Square as ChessSquare } from 'chess.js';
import Square from './Square';
import { getGame, makeMove, getPossibleMoves, isGameOver, getTurn, inCheck, resetGame } from '../services/chessService';
import { getBestMove } from '../services/botService';
import { PlayerColor, GameMode, BotDifficulty, GameSubMode } from '../types';
import { RefreshCw, Home, Clock, Download, BrainCircuit, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ChessboardProps {
    mode: GameMode;
    difficulty?: BotDifficulty;
    onGoBack: () => void;
    theme: string;
    pieceStyle: string;
    onEarnCoins: (amount: number) => void;
    subMode: GameSubMode;
}

const THEME_COLORS: Record<string, { light: string, dark: string }> = {
    'theme_green': { light: '#eeeed2', dark: '#769656' },
    'theme_wood': { light: '#e8cfa6', dark: '#8f5e36' },
    'theme_neon': { light: '#222222', dark: '#00ff41' },
    'theme_glass': { light: 'rgba(255,255,255,0.8)', dark: 'rgba(255,255,255,0.3)' },
    'theme_space': { light: '#4a4e69', dark: '#22223b' },
    'theme_royal': { light: '#f1e1c2', dark: '#4c1d1d' },
    'theme_matrix': { light: '#0d1b1e', dark: '#000000' }
};

const INITIAL_TIME = 300;

const Chessboard: React.FC<ChessboardProps> = ({ mode, difficulty, onGoBack, theme, pieceStyle, onEarnCoins, subMode }) => {
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);

    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const boardRef = useRef<HTMLDivElement>(null);
    
    const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
    const [blackTime, setBlackTime] = useState(INITIAL_TIME);
    const [timeOver, setTimeOver] = useState<PlayerColor | null>(null);

    const game = getGame();
    const turn = getTurn();
    const check = inCheck();
    const gameOver = isGameOver() || timeOver !== null;

    useEffect(() => {
        if (subMode === 'time' && !gameOver && !isThinking) {
            const timer = setInterval(() => {
                if (turn === 'w') {
                    setWhiteTime(t => {
                        if (t <= 1) { setTimeOver('w'); clearInterval(timer); return 0; }
                        return t - 1;
                    });
                } else {
                    setBlackTime(t => {
                        if (t <= 1) { setTimeOver('b'); clearInterval(timer); return 0; }
                        return t - 1;
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [turn, gameOver, isThinking, subMode]);

    const currentThemeColors = THEME_COLORS[theme] || THEME_COLORS['theme_green'];

    useEffect(() => {
        resetGame();
        setLastMove(null);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setEarnedCoins(0);
        setWhiteTime(INITIAL_TIME);
        setBlackTime(INITIAL_TIME);
        setTimeOver(null);
        forceUpdate();
    }, [mode, difficulty, subMode]);

    useEffect(() => {
        if (gameOver && earnedCoins === 0) {
            let reward = 0;
            const winnerColor = timeOver ? (timeOver === 'w' ? 'b' : 'w') : (turn === 'w' ? 'b' : 'w');
            if (game.isCheckmate() || timeOver) {
                if (mode === 'bot') reward = winnerColor === 'w' ? (subMode === 'challenge' ? 500 : 200) : 10;
                else reward = 50;
            } else if (game.isDraw()) reward = 50;
            if (reward > 0) {
                setEarnedCoins(reward);
                onEarnCoins(reward);
            }
        }
    }, [gameOver, earnedCoins, mode, onEarnCoins, game, turn, timeOver, subMode]);

    useEffect(() => {
        if (mode === 'bot' && turn === 'b' && !gameOver) {
            const makeBotMove = async () => {
                setIsThinking(true);
                const botDiff = subMode === 'challenge' ? 'hard' : (difficulty || 'medium');
                
                const moveStr = await getBestMove(game.fen(), botDiff);
                
                if (moveStr && moveStr !== '(none)') {
                    let moveExecuted = false;
                    
                    try {
                        const result = game.move(moveStr);
                        if (result) {
                            setLastMove({ from: result.from, to: result.to });
                            moveExecuted = true;
                        }
                    } catch (e) {}

                    if (!moveExecuted && moveStr.length >= 4) {
                        try {
                            const from = moveStr.substring(0, 2);
                            const to = moveStr.substring(2, 4);
                            const promotion = moveStr.length > 4 ? moveStr.substring(4, 5) : 'q';
                            const result = game.move({ from, to, promotion });
                            if (result) {
                                setLastMove({ from: result.from, to: result.to });
                                moveExecuted = true;
                            }
                        } catch (e) {}
                    }
                }
                
                setIsThinking(false);
                forceUpdate();
            };
            
            const timeout = setTimeout(makeBotMove, 400);
            return () => clearTimeout(timeout);
        }
    }, [turn, mode, gameOver, game, difficulty, subMode]);

    const handleSquareClick = (square: string) => {
        if (gameOver || isThinking || (mode === 'bot' && turn === 'b')) return;
        if (selectedSquare === square) { setSelectedSquare(null); setPossibleMoves([]); return; }
        if (selectedSquare) {
            const moveAttempt = makeMove(selectedSquare, square);
            if (moveAttempt) {
                setLastMove({ from: selectedSquare, to: square });
                setSelectedSquare(null);
                setPossibleMoves([]);
                forceUpdate();
                return;
            }
        }
        const piece = game.get(square as ChessSquare);
        if (piece && piece.color === turn) {
            setSelectedSquare(square);
            setPossibleMoves(getPossibleMoves(square));
        } else { setSelectedSquare(null); setPossibleMoves([]); }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleDownloadImage = async () => {
        if (boardRef.current) {
            try {
                const canvas = await html2canvas(boardRef.current, { backgroundColor: '#0f0f0f' });
                const data = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = data;
                link.download = `vinagames-chess-${Date.now()}.png`;
                link.click();
            } catch (error) {}
        }
    };

    const currentDifficulty = subMode === 'challenge' ? 'hard' : (difficulty || 'medium');
    let statusText = gameOver ? (timeOver ? `Hết giờ! ${timeOver === 'w' ? 'Đen' : 'Trắng'} thắng!` : (game.isCheckmate() ? `Chiếu bí! ${turn === 'w' ? 'Đen' : 'Trắng'} thắng!` : 'Hòa!')) : (check ? 'Chiếu tướng!' : (turn === 'w' ? 'Lượt Trắng' : 'Lượt Đen'));

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-2">
            <div className="w-full flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <button onClick={onGoBack} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><Home size={20}/></button>
                <div className="text-center">
                    <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wider">{subMode === 'time' ? 'Cờ Chớp' : (subMode === 'challenge' ? 'Thử Thách AI' : 'Cổ Điển')}</h2>
                    <p className={`text-xs font-bold transition-colors ${check ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>{statusText}</p>
                </div>
                <button onClick={() => {resetGame(); setWhiteTime(INITIAL_TIME); setBlackTime(INITIAL_TIME); setTimeOver(null); setLastMove(null); forceUpdate();}} className="p-2 bg-amber-600 rounded-full text-white hover:rotate-180 transition-transform duration-500"><RefreshCw size={18}/></button>
            </div>

            {subMode === 'time' && (
                <div className="w-full flex justify-between px-4 mb-3">
                    <div className={`px-4 py-2 rounded-lg font-mono text-xl border-2 shadow-inner ${turn === 'w' ? 'bg-white text-black border-amber-500 scale-105' : 'bg-gray-800 text-gray-400 border-transparent'} transition-all`}>
                        <Clock className="inline mr-2" size={16}/>{formatTime(whiteTime)}
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-mono text-xl border-2 shadow-inner ${turn === 'b' ? 'bg-black/80 text-white border-amber-500 scale-105' : 'bg-gray-800 text-gray-400 border-transparent'} transition-all`}>
                        <Clock className="inline mr-2" size={16}/>{formatTime(blackTime)}
                    </div>
                </div>
            )}

            <div ref={boardRef} className={`relative w-full aspect-square shadow-2xl rounded-sm overflow-hidden border-4 border-[#333] transition-all duration-500`} style={{ boxShadow: theme === 'theme_neon' ? '0 0 25px #00ff41' : (theme === 'theme_matrix' ? '0 0 20px #0f0' : '') }}>
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {['8','7','6','5','4','3','2','1'].map((rank, r) => ['a','b','c','d','e','f','g','h'].map((file, c) => {
                        const square = `${file}${rank}`;
                        return (
                            <Square key={square} square={square} piece={game.get(square as ChessSquare)} isLight={(r+c)%2===0} isSelected={selectedSquare===square} 
                                    isPossibleMove={possibleMoves.includes(square)} isLastMove={lastMove?(lastMove.from===square||lastMove.to===square):false}
                                    isCheck={check} onClick={() => handleSquareClick(square)} themeColors={currentThemeColors} pieceStyle={pieceStyle}/>
                        );
                    }))}
                </div>

                {isThinking && (
                    <div className={`absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border flex items-center gap-2 z-40 shadow-2xl ${currentDifficulty === 'hard' ? 'border-red-500/50' : 'border-amber-500/50'}`}>
                        {currentDifficulty === 'hard' ? <Zap size={18} className="text-red-500 animate-pulse" /> : <BrainCircuit size={18} className="text-amber-500 animate-spin-slow" />}
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black tracking-widest uppercase ${currentDifficulty === 'hard' ? 'text-red-500' : 'text-amber-500'}`}>
                                {currentDifficulty === 'hard' ? 'AI PRO MODE' : 'ENGINE THINKING'}
                            </span>
                            <span className="text-[8px] text-gray-400 font-mono">STOCKFISH v10+</span>
                        </div>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
                        <h3 className="text-4xl font-heading font-black text-white mb-2 tracking-tighter uppercase italic">KẾT THÚC</h3>
                        <p className="text-xl text-amber-400 font-bold mb-8 drop-shadow-lg">{statusText}</p>
                        {earnedCoins > 0 && <div className="mb-8 text-3xl font-black text-yellow-500 animate-bounce flex items-center gap-2"><span>+{earnedCoins}</span> <span className="text-2xl">🪙</span></div>}
                        <div className="flex gap-4">
                            <button onClick={handleDownloadImage} className="px-6 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition shadow-xl flex items-center gap-2 border border-gray-600">
                                <Download size={18} /> TẢI ẢNH
                            </button>
                            <button onClick={() => {resetGame(); setEarnedCoins(0); setWhiteTime(INITIAL_TIME); setBlackTime(INITIAL_TIME); setTimeOver(null); setLastMove(null); forceUpdate();}} 
                                    className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold hover:scale-105 transition shadow-xl border border-amber-400/50">CHƠI LẠI</button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-4 w-full bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex justify-center items-center gap-4">
               <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Chế độ Khó: Depth 18 (Engine Pro)
               </div>
            </div>
        </div>
    );
};

export default Chessboard;
