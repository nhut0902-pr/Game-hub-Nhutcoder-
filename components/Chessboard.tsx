import React, { useState, useEffect, useRef } from 'react';
import Square from './Square';
import { getGame, makeMove, getPossibleMoves, isGameOver, getTurn, inCheck, getBoard, resetGame, getPgn, loadPgn } from '../services/chessService';
import { getBestMove } from '../services/botService';
import { PlayerColor, GameMode, BotDifficulty } from '../types';
import { RefreshCw, SkipBack, Home, Download, Upload } from 'lucide-react';

interface ChessboardProps {
    mode: GameMode;
    difficulty?: BotDifficulty;
    onGoBack: () => void;
    theme: string;
    pieceStyle: string;
    onEarnCoins: (amount: number) => void;
}

// Color maps for themes
const THEME_COLORS: Record<string, { light: string, dark: string }> = {
    'theme_wood': { light: '#e8cfa6', dark: '#8f5e36' },
    'theme_neon': { light: '#222222', dark: '#00ff41' },
    'theme_glass': { light: 'rgba(255,255,255,0.8)', dark: 'rgba(255,255,255,0.3)' },
    'theme_space': { light: '#4a4e69', dark: '#22223b' },
};

const Chessboard: React.FC<ChessboardProps> = ({ mode, difficulty, onGoBack, theme, pieceStyle, onEarnCoins }) => {
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [earnedCoins, setEarnedCoins] = useState(0);
    
    const game = getGame();
    const turn = getTurn();
    const check = inCheck();
    const gameOver = isGameOver();

    // Get current theme colors, default to wood if not found
    const currentThemeColors = THEME_COLORS[theme] || THEME_COLORS['theme_wood'];

    useEffect(() => {
        resetGame();
        setLastMove(null);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setEarnedCoins(0);
        forceUpdate();
    }, [mode, difficulty]);

    useEffect(() => {
        if (gameOver && earnedCoins === 0) {
            let reward = 0;
            if (game.isCheckmate()) {
                // Determine winner. If turn is 'w', 'b' won.
                const winnerColor = turn === 'w' ? 'b' : 'w';
                if (mode === 'bot') {
                    // Bot logic: Player is usually White. 
                    // If winner is White, Player won.
                    if (winnerColor === 'w') reward = 100;
                    else reward = 10; // Console prize for losing
                } else {
                    reward = 50; // PvP reward
                }
            } else if (game.isDraw()) {
                reward = 20;
            } else {
                reward = 5;
            }
            
            if (reward > 0) {
                setEarnedCoins(reward);
                onEarnCoins(reward);
            }
        }
    }, [gameOver, earnedCoins, mode, onEarnCoins, game, turn]);

    useEffect(() => {
        if (mode === 'bot' && turn === 'b' && !gameOver) {
            const makeBotMove = async () => {
                setIsThinking(true);
                const moveStr = await getBestMove(game.fen(), difficulty || 'medium');
                if (moveStr) {
                    try {
                        const result = game.move(moveStr);
                        if (result) {
                            setLastMove({ from: result.from, to: result.to });
                        }
                    } catch (e) {
                        console.error("Bot tried invalid move", moveStr);
                    }
                }
                setIsThinking(false);
                forceUpdate();
            };
            makeBotMove();
        }
    }, [turn, mode, gameOver, game, difficulty]);

    const handleSquareClick = (square: string) => {
        if (gameOver || isThinking) return;
        if (mode === 'bot' && turn === 'b') return; 

        if (selectedSquare === square) {
            setSelectedSquare(null);
            setPossibleMoves([]);
            return;
        }

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

        const piece = game.get(square);
        if (piece && piece.color === turn) {
            setSelectedSquare(square);
            setPossibleMoves(getPossibleMoves(square));
        } else {
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
    };

    const handleReset = () => {
        resetGame();
        setLastMove(null);
        setSelectedSquare(null);
        setPossibleMoves([]);
        setEarnedCoins(0);
        forceUpdate();
    };

    const handleUndo = () => {
        if (isThinking) return;
        game.undo();
        if (mode === 'bot') { game.undo(); }
        setLastMove(null); 
        forceUpdate();
    };

    const handleSaveGame = () => {
        const pgn = getPgn();
        const blob = new Blob([pgn], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `vinachess_${mode}_${date}.pgn`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadGameClick = () => { fileInputRef.current?.click(); };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const pgn = e.target?.result as string;
            if (pgn) {
                const success = loadPgn(pgn);
                if (success) {
                    const history = game.history({ verbose: true });
                    if (history.length > 0) {
                        const last = history[history.length - 1];
                        setLastMove({ from: last.from, to: last.to });
                    } else { setLastMove(null); }
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                    setEarnedCoins(0);
                    forceUpdate();
                } else { alert("Không thể tải ván đấu. File PGN không hợp lệ."); }
            }
        };
        reader.readAsText(file);
        event.target.value = ''; 
    };

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    let statusText = '';
    if (gameOver) {
        if (game.isCheckmate()) { statusText = `Chiếu bí! ${turn === 'w' ? 'Đen' : 'Trắng'} thắng!`; }
        else if (game.isDraw()) { statusText = 'Hòa!'; }
        else { statusText = 'Kết thúc ván đấu.'; }
    } else {
        if (check) { statusText = 'Chiếu tướng!'; }
        else { statusText = turn === 'w' ? 'Lượt Trắng' : 'Lượt Đen'; }
        if (isThinking) statusText += ' (Máy đang nghĩ...)';
    }

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
            <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center mb-4 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <button onClick={onGoBack} className="p-2 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white" title="Về Menu">
                        <Home size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">{mode === 'bot' ? 'Người vs Máy' : 'Người vs Người'}</h2>
                            {mode === 'bot' && difficulty && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase 
                                    ${difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : 
                                      difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Vừa' : 'Khó'}
                                </span>
                            )}
                        </div>
                        <p className={`text-sm font-semibold ${check ? 'text-red-400' : 'text-gray-400'}`}>{statusText}</p>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    <input type="file" accept=".pgn" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={handleSaveGame} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition" title="Lưu ván đấu (PGN)"><Download size={18} /></button>
                    <button onClick={handleLoadGameClick} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition" title="Tải ván đấu (PGN)"><Upload size={18} /></button>
                    <div className="w-px h-8 bg-gray-600 mx-1 hidden sm:block"></div>
                    <button onClick={handleUndo} className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition text-white" disabled={gameOver || isThinking || (mode === 'bot' && game.history().length < 2)}>
                        <SkipBack size={16} /> <span className="hidden sm:inline">Hoàn tác</span>
                    </button>
                    <button onClick={handleReset} className="flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded text-sm transition font-medium text-white">
                        <RefreshCw size={16} /> <span className="hidden sm:inline">Ván mới</span>
                    </button>
                </div>
            </div>
            
            {/* Board Container with Theme Styling */}
            <div className={`relative w-full aspect-square max-w-[500px] shadow-2xl rounded-sm overflow-hidden border-8 transition-colors duration-500`}
                style={{ 
                    borderColor: theme === 'theme_neon' ? '#0f0f0f' : '#5c3a21',
                    boxShadow: theme === 'theme_neon' ? '0 0 20px #00ff41' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {ranks.map((rank, rIndex) => (
                        files.map((file, cIndex) => {
                            const square = `${file}${rank}`;
                            const piece = game.get(square);
                            const isLight = (rIndex + cIndex) % 2 === 0;
                            const isSelected = selectedSquare === square;
                            const isPossible = possibleMoves.includes(square);
                            const isLast = lastMove ? (lastMove.from === square || lastMove.to === square) : false;
                            return (
                                <Square 
                                    key={square} square={square} piece={piece} isLight={isLight} isSelected={isSelected}
                                    isPossibleMove={isPossible} isLastMove={isLast} isCheck={check} onClick={() => handleSquareClick(square)}
                                    themeColors={currentThemeColors}
                                    pieceStyle={pieceStyle}
                                />
                            );
                        })
                    ))}
                </div>
                {gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="bg-white text-gray-900 p-6 rounded-xl shadow-2xl text-center animate-bounce-in">
                            <h3 className="text-2xl font-bold mb-2">Trận Đấu Kết Thúc</h3>
                            <p className="text-lg mb-4 text-amber-700 font-semibold">{statusText}</p>
                            {earnedCoins > 0 && (
                                <div className="mb-4 text-xl font-bold text-yellow-500 flex items-center justify-center gap-2 animate-pulse">
                                    <span>+{earnedCoins}</span> <span>🪙</span>
                                </div>
                            )}
                            <button onClick={handleReset} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold">Chơi Lại</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chessboard;