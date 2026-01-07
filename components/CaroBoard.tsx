import React, { useState, useEffect, useRef } from 'react';
import { GameMode, BotDifficulty, CaroState } from '../types';
import { initCaroGame, makeCaroMove, undoCaroMove, loadCaroGame, BOARD_SIZE } from '../services/caroService';
import { getBestCaroMove } from '../services/caroBotService';
import { RefreshCw, SkipBack, Home, Download, Upload, ZoomIn, ZoomOut } from 'lucide-react';

interface CaroBoardProps {
    mode: GameMode;
    difficulty?: BotDifficulty;
    onGoBack: () => void;
}

const CaroBoard: React.FC<CaroBoardProps> = ({ mode, difficulty, onGoBack }) => {
    const [state, setState] = useState<CaroState>(initCaroGame());
    const [isThinking, setIsThinking] = useState(false);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    // Initialize
    useEffect(() => {
        setState(initCaroGame());
    }, [mode, difficulty]);

    // Center board on mount
    useEffect(() => {
        if (boardRef.current) {
            const scrollWidth = boardRef.current.scrollWidth;
            const clientWidth = boardRef.current.clientWidth;
            boardRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, []);

    // Bot Logic
    useEffect(() => {
        let isMounted = true;
        
        const runBot = async () => {
            if (mode === 'bot' && state.turn === 'O' && !state.winner) {
                setIsThinking(true);
                // Artificial delay for realism
                await new Promise(r => setTimeout(r, 600));
                
                try {
                    const move = await getBestCaroMove(state, difficulty || 'medium');
                    if (isMounted && move) {
                        setState(prev => makeCaroMove(prev, move.r, move.c));
                    }
                } catch (e) {
                    console.error("Bot failed", e);
                } finally {
                    if (isMounted) setIsThinking(false);
                }
            }
        };

        runBot();

        return () => { isMounted = false; };
    }, [state.turn, state.winner, mode, difficulty]); // Depend on turn to trigger

    const handleCellClick = (r: number, c: number) => {
        if (state.winner || isThinking) return;
        
        // Validation: If Bot mode, ensure it's User's turn (X)
        if (mode === 'bot' && state.turn !== 'X') return;
        
        // Cell must be empty
        if (state.board[r][c] !== null) return;

        setState(prev => makeCaroMove(prev, r, c));
    };

    const handleUndo = () => {
        if (isThinking || state.history.length === 0) return;
        
        setState(prev => {
            let newState = undoCaroMove(prev);
            // If playing bot, undo twice to get back to user turn
            if (mode === 'bot' && newState.history.length > 0) {
                newState = undoCaroMove(newState);
            }
            return newState;
        });
    };

    const handleReset = () => {
        setState(initCaroGame());
    };

    const handleSave = () => {
        const data = JSON.stringify(state);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caro_${mode}_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const loaded = loadCaroGame(JSON.parse(ev.target?.result as string));
                if (loaded) setState(loaded);
            } catch (err) {
                alert("File lỗi");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Zoom controls
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2.0));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.6));

    // Colors
    const isPlayerTurn = (mode === 'bot' && state.turn === 'X') || mode === 'pvp';
    const turnColorClass = state.turn === 'X' ? 'text-blue-500' : 'text-red-500';
    const statusMsg = state.winner 
        ? (state.winner === 'draw' ? 'Hòa!' : `Người chơi ${state.winner} Thắng!`)
        : (isThinking ? 'Máy đang tính...' : `Lượt: ${state.turn === 'X' ? 'Xanh (X)' : 'Đỏ (O)'}`);

    return (
        <div className="flex flex-col items-center w-full h-full min-h-[500px] max-w-6xl mx-auto p-2">
            {/* Control Panel */}
            <div className="w-full bg-gray-900 text-white p-4 rounded-xl shadow-lg mb-4 border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={onGoBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"><Home size={20}/></button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Cờ Ca-rô
                            {mode === 'bot' && <span className="text-xs bg-amber-600 px-2 py-0.5 rounded uppercase">{difficulty}</span>}
                        </h2>
                        <div className={`text-sm font-semibold ${state.winner ? 'text-yellow-400 animate-pulse' : turnColorClass}`}>
                            {statusMsg}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleZoomOut} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><ZoomOut size={18}/></button>
                    <button onClick={handleZoomIn} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><ZoomIn size={18}/></button>
                    <div className="w-px bg-gray-700 mx-1"></div>
                    <button onClick={handleUndo} disabled={state.history.length === 0 || isThinking} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"><SkipBack size={18}/></button>
                    <button onClick={handleReset} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><RefreshCw size={18}/></button>
                    <div className="w-px bg-gray-700 mx-1"></div>
                    <button onClick={handleSave} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><Download size={18}/></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><Upload size={18}/></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                </div>
            </div>

            {/* Game Board Area */}
            <div className="w-full flex-1 relative overflow-hidden bg-[#2a2a2a] rounded-xl shadow-inner flex flex-col">
                <div 
                    ref={boardRef}
                    className="overflow-auto flex-1 p-8 flex justify-center items-center" // Centering logic
                >
                    <div 
                        className="bg-[#eecfa1] p-4 shadow-2xl rounded border-4 border-[#8b4513] relative transition-transform duration-200 ease-out origin-center"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <div 
                            className="grid gap-[1px] bg-[#8b4513] border-2 border-[#8b4513]"
                            style={{ 
                                gridTemplateColumns: `repeat(${BOARD_SIZE}, 40px)`,
                                gridTemplateRows: `repeat(${BOARD_SIZE}, 40px)`
                            }}
                        >
                            {state.board.map((row, r) => (
                                row.map((cell, c) => {
                                    const isLastMove = state.history.length > 0 && 
                                        state.history[state.history.length - 1].r === r && 
                                        state.history[state.history.length - 1].c === c;
                                    const isWinningPiece = state.winningLine?.some(p => p.r === r && p.c === c);

                                    return (
                                        <div 
                                            key={`${r}-${c}`}
                                            onClick={() => handleCellClick(r, c)}
                                            className={`
                                                w-10 h-10 bg-[#eecfa1] flex items-center justify-center 
                                                cursor-pointer relative hover:bg-[#ffe4b5]
                                                ${isWinningPiece ? 'bg-green-300' : ''}
                                            `}
                                        >
                                            {/* Grid Lines Helper (Optional visual polish) */}
                                            {/* Using simple background color for cells instead of lines for clearer visibility of pieces */}

                                            {/* Pieces */}
                                            {cell === 'X' && (
                                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 drop-shadow-sm pointer-events-none">
                                                    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                    <line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                </svg>
                                            )}
                                            {cell === 'O' && (
                                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-600 drop-shadow-sm pointer-events-none">
                                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" fill="none" />
                                                </svg>
                                            )}

                                            {/* Last Move Indicator */}
                                            {isLastMove && !isWinningPiece && (
                                                <div className="absolute inset-0 border-2 border-purple-500 rounded-sm pointer-events-none animate-pulse"></div>
                                            )}
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile scroll hint */}
                <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 pointer-events-none md:hidden">
                    Kéo để di chuyển bàn cờ
                </div>

                {/* Game Over Modal */}
                {state.winner && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-100 animate-bounce-in max-w-sm mx-4">
                            <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
                                {state.winner === 'draw' ? 'Hòa!' : `${state.winner === 'X' ? 'Xanh' : 'Đỏ'} Thắng!`}
                            </h3>
                            <p className="text-gray-500 mb-6">Trận đấu đã kết thúc.</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={onGoBack} className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition">
                                    Thoát
                                </button>
                                <button onClick={handleReset} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition">
                                    Chơi Lại
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaroBoard;