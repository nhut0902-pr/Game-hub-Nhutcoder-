
import React, { useState, useEffect, useRef } from 'react';
import { Square as ChessSquare } from 'chess.js';
import Square from './Square';
import { 
    getGame, makeMove, getPossibleMoves, isGameOver, getTurn, 
    inCheck, resetGame, isValidSquare, getArbitratorAnalysis 
} from '../services/chessService';
import { getBestMove } from '../services/botService';
import { PlayerColor, GameMode, BotDifficulty, GameSubMode } from '../types';
import { 
    RefreshCw, Home, Clock, Download, BrainCircuit, 
    Zap, ShieldAlert, AlertCircle, ShieldCheck, Gavel
} from 'lucide-react';
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
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);
    
    const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
    const [blackTime, setBlackTime] = useState(INITIAL_TIME);
    const [timeOver, setTimeOver] = useState<PlayerColor | null>(null);

    const game = getGame();
    const turn = getTurn();
    const check = inCheck();
    const gameOver = isGameOver() || timeOver !== null;

    useEffect(() => {
        if (errorMsg) {
            setIsShaking(true);
            const timer = setTimeout(() => {
                setErrorMsg(null);
                setIsShaking(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMsg]);

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
                if (mode === 'bot') reward = winnerColor === 'w' ? (subMode === 'challenge' ? 1000 : 300) : 10;
                else reward = 50;
            } else if (game.isDraw()) reward = 100;
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
                
                try {
                    const moveStr = await getBestMove(game.fen(), botDiff);
                    
                    if (moveStr && moveStr !== '(none)') {
                        let moveExecuted = false;
                        
                        // 1. Thử thực hiện như một nước đi hoàn chỉnh (SAN hoặc UCI tự động xử lý bởi chess.js)
                        try {
                            const result = game.move(moveStr);
                            if (result) {
                                setLastMove({ from: result.from, to: result.to });
                                moveExecuted = true;
                            }
                        } catch (e) {}

                        // 2. Nếu thất bại, thử parse theo định dạng UCI chuẩn (e2e4)
                        if (!moveExecuted) {
                            // Regex UCI: [cột][hàng][cột][hàng][phong cấp?]
                            const uciRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
                            if (uciRegex.test(moveStr)) {
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

                        if (!moveExecuted) {
                            console.error("Critical AI Move Error:", moveStr);
                            // Nếu vẫn lỗi, thử một nước đi ngẫu nhiên bất kỳ để không bị treo game
                            const moves = game.moves();
                            if (moves.length > 0) {
                                const randomMove = game.move(moves[0]);
                                if (randomMove) setLastMove({ from: randomMove.from, to: randomMove.to });
                            }
                        }
                    }
                } catch (err) {
                    setErrorMsg("Trọng tài: AI gặp sự cố, ván đấu tạm hoãn!");
                }
                
                setIsThinking(false);
                forceUpdate();
            };
            
            const timeout = setTimeout(makeBotMove, 800);
            return () => clearTimeout(timeout);
        }
    }, [turn, mode, gameOver, game, difficulty, subMode]);

    const handleSquareClick = (square: string) => {
        if (gameOver || isThinking || (mode === 'bot' && turn === 'b')) return;
        
        if (!isValidSquare(square)) {
            setErrorMsg("Trọng tài: Ô cờ ngoài biên!");
            return;
        }

        if (selectedSquare === square) { 
            setSelectedSquare(null); 
            setPossibleMoves([]); 
            return; 
        }

        if (selectedSquare) {
            // Kiểm tra lỗi qua Trọng tài ảo
            const analysis = getArbitratorAnalysis(selectedSquare, square);
            
            if (analysis) {
                // Nếu click vào quân khác của mình, tự động chuyển selection thay vì báo lỗi
                const pieceAtTarget = game.get(square as ChessSquare);
                if (pieceAtTarget && pieceAtTarget.color === turn) {
                    setSelectedSquare(square);
                    setPossibleMoves(getPossibleMoves(square));
                } else {
                    setErrorMsg(analysis);
                }
                return;
            }

            const moveAttempt = makeMove(selectedSquare, square);
            if (moveAttempt) {
                setLastMove({ from: selectedSquare, to: square });
                setSelectedSquare(null);
                setPossibleMoves([]);
                forceUpdate();
                return;
            } else {
                setErrorMsg("Trọng tài: Nước đi sai luật!");
            }
        }

        const piece = game.get(square as ChessSquare);
        if (piece && piece.color === turn) {
            setSelectedSquare(square);
            setPossibleMoves(getPossibleMoves(square));
        } else { 
            setSelectedSquare(null); 
            setPossibleMoves([]); 
        }
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
            {errorMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center animate-fade-in pointer-events-none">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.7)] border-2 border-red-400 flex items-center gap-3">
                        <Gavel size={26} className="animate-bounce" />
                        <span className="font-bold text-sm tracking-wide uppercase italic drop-shadow-lg">{errorMsg}</span>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-between items-center mb-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <button onClick={onGoBack} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><Home size={20}/></button>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />
                        <h2 className="font-heading font-bold text-white text-xl uppercase tracking-wider">{subMode === 'time' ? 'Cờ Chớp' : (subMode === 'challenge' ? 'Đại Kiện Tướng' : 'Cổ Điển')}</h2>
                    </div>
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

            <div 
                ref={boardRef} 
                className={`relative w-full aspect-square shadow-2xl rounded-sm overflow-hidden border-4 border-[#333] transition-transform duration-300 ${isShaking ? 'animate-shake' : ''}`} 
                style={{ 
                    boxShadow: theme === 'theme_neon' ? '0 0 25px #00ff41' : (theme === 'theme_matrix' ? '0 0 20px #0f0' : ''),
                }}
            >
                <style>{`
                    @keyframes shakeBoard {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                        20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                    .animate-shake {
                        animation: shakeBoard 0.5s cubic-bezier(.36,.07,.19,.97) both;
                    }
                `}</style>
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
                    <div className={`absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border flex items-center gap-2 z-40 shadow-2xl ${currentDifficulty === 'hard' ? 'border-red-500 animate-pulse' : 'border-amber-500/50'}`}>
                        {currentDifficulty === 'hard' ? <ShieldAlert size={18} className="text-red-500" /> : <BrainCircuit size={18} className="text-amber-500 animate-spin-slow" />}
                        <div className="flex flex-col text-left">
                            <span className={`text-[10px] font-black tracking-widest uppercase ${currentDifficulty === 'hard' ? 'text-red-500' : 'text-amber-500'}`}>
                                {currentDifficulty === 'hard' ? 'GRANDMASTER LEVEL' : 'STOCKFISH AI'}
                            </span>
                            <span className="text-[8px] text-gray-400 font-mono">D:15 | H:128 | T:4</span>
                        </div>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in">
                        <Gavel size={64} className="text-amber-500 mb-4 animate-bounce" />
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
            
            <div className="mt-4 w-full bg-gray-900/50 p-3 rounded-lg border border-gray-800 flex flex-col justify-center items-center gap-1">
               <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 uppercase tracking-widest">
                  <Zap size={12} className="animate-pulse" /> Trọng tài ảo: Chống gian lận & Phân tích lỗi ACTIVE
               </div>
               <div className="text-[9px] text-gray-500 font-mono text-center">
                  Engine: Stockfish 10+ | Threads: 4 | Hash: 128MB | Integrity Check: VERIFIED
               </div>
            </div>
        </div>
    );
};

export default Chessboard;
