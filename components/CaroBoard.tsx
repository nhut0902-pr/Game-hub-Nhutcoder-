import React, { useState, useEffect, useRef } from 'react';
import { GameMode, BotDifficulty, CaroState, GameSubMode } from '../types';
import { initCaroGame, makeCaroMove, undoCaroMove, loadCaroGame, BOARD_SIZE } from '../services/caroService';
import { getBestCaroMove } from '../services/caroBotService';
import { RefreshCw, SkipBack, Home, Download, Upload, ZoomIn, ZoomOut, Clock } from 'lucide-react';

interface CaroBoardProps {
    mode: GameMode;
    difficulty?: BotDifficulty;
    onGoBack: () => void;
    onEarnCoins: (amount: number) => void;
    subMode: GameSubMode;
}

const INITIAL_TIME = 300; // 5 mins

const CaroBoard: React.FC<CaroBoardProps> = ({ mode, difficulty, onGoBack, onEarnCoins, subMode }) => {
    const [state, setState] = useState<CaroState>(initCaroGame());
    const [isThinking, setIsThinking] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [earnedCoins, setEarnedCoins] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);

    // Timer State
    const [xTime, setXTime] = useState(INITIAL_TIME);
    const [oTime, setOTime] = useState(INITIAL_TIME);
    const [timeOver, setTimeOver] = useState<'X' | 'O' | null>(null);

    useEffect(() => { 
        setState(initCaroGame()); 
        setEarnedCoins(0);
        setXTime(INITIAL_TIME);
        setOTime(INITIAL_TIME);
        setTimeOver(null);
    }, [mode, difficulty, subMode]);

    useEffect(() => {
        if (subMode === 'time' && !state.winner && !timeOver && !isThinking) {
            const timer = setInterval(() => {
                if (state.turn === 'X') {
                    setXTime(t => {
                        if (t <= 1) { setTimeOver('X'); clearInterval(timer); return 0; }
                        return t - 1;
                    });
                } else {
                    setOTime(t => {
                        if (t <= 1) { setTimeOver('O'); clearInterval(timer); return 0; }
                        return t - 1;
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [state.turn, state.winner, timeOver, isThinking, subMode]);

    useEffect(() => {
        const hasWinner = state.winner || timeOver;
        if (hasWinner && earnedCoins === 0) {
             let reward = 0;
             const finalWinner = timeOver ? (timeOver === 'X' ? 'O' : 'X') : state.winner;
             
             if (finalWinner === 'draw') {
                 reward = 20;
             } else {
                 if (mode === 'bot') {
                     if (finalWinner === 'X') reward = subMode === 'challenge' ? 160 : 80;
                     else reward = 10;
                 } else {
                     reward = 40;
                 }
             }
             if (reward > 0) {
                 setEarnedCoins(reward);
                 onEarnCoins(reward);
             }
        }
    }, [state.winner, timeOver, earnedCoins, mode, onEarnCoins, subMode]);

    useEffect(() => {
        if (boardRef.current) {
            const scrollWidth = boardRef.current.scrollWidth;
            const clientWidth = boardRef.current.clientWidth;
            boardRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const runBot = async () => {
            if (mode === 'bot' && state.turn === 'O' && !state.winner && !timeOver) {
                setIsThinking(true);
                await new Promise(r => setTimeout(r, 600));
                try {
                    const botDiff = subMode === 'challenge' ? 'hard' : (difficulty || 'medium');
                    const move = await getBestCaroMove(state, botDiff);
                    if (isMounted && move) { setState(prev => makeCaroMove(prev, move.r, move.c)); }
                } catch (e) { console.error("Bot failed", e); } finally { if (isMounted) setIsThinking(false); }
            }
        };
        runBot();
        return () => { isMounted = false; };
    }, [state.turn, state.winner, timeOver, mode, difficulty, subMode]);

    const handleCellClick = (r: number, c: number) => {
        if (state.winner || timeOver || isThinking) return;
        if (mode === 'bot' && state.turn !== 'X') return;
        if (state.board[r][c] !== null) return;
        setState(prev => makeCaroMove(prev, r, c));
    };

    const handleUndo = () => {
        if (isThinking || state.history.length === 0 || state.winner || timeOver) return;
        setState(prev => {
            let newState = undoCaroMove(prev);
            if (mode === 'bot' && newState.history.length > 0) { newState = undoCaroMove(newState); }
            return newState;
        });
    };

    const handleReset = () => { 
        setState(initCaroGame()); 
        setEarnedCoins(0);
        setXTime(INITIAL_TIME);
        setOTime(INITIAL_TIME);
        setTimeOver(null);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const turnColorClass = state.turn === 'X' ? 'text-blue-500' : 'text-red-500';
    const finalWinner = timeOver ? (timeOver === 'X' ? 'O' : 'X') : state.winner;
    const statusMsg = finalWinner 
        ? (finalWinner === 'draw' ? 'Hòa!' : `${finalWinner === 'X' ? 'Xanh' : 'Đỏ'} Thắng!`)
        : (isThinking ? 'Máy đang tính...' : `Lượt: ${state.turn === 'X' ? 'Xanh (X)' : 'Đỏ (O)'}`);

    return (
        <div className="flex flex-col items-center w-full h-full min-h-[500px] max-w-6xl mx-auto p-2">
            <div className="w-full bg-gray-900 text-white p-4 rounded-xl shadow-lg mb-4 border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={onGoBack} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"><Home size={20}/></button>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">Cờ Ca-rô <span className="text-xs bg-purple-600 px-2 py-0.5 rounded uppercase">{subMode}</span></h2>
                        <div className={`text-sm font-semibold ${finalWinner ? 'text-yellow-400 animate-pulse' : turnColorClass}`}>{statusMsg}</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><ZoomOut size={18}/></button>
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.0))} className="p-2 bg-gray-800 rounded hover:bg-gray-700"><ZoomIn size={18}/></button>
                    <div className="w-px bg-gray-700 mx-1"></div>
                    <button onClick={handleUndo} disabled={state.history.length === 0 || isThinking || !!finalWinner} className="p-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50"><SkipBack size={18}/></button>
                    <button onClick={handleReset} className="p-2 bg-blue-600 rounded hover:bg-blue-500"><RefreshCw size={18}/></button>
                </div>
            </div>

            {subMode === 'time' && (
                <div className="w-full flex justify-between px-4 mb-2 max-w-[500px]">
                    <div className={`px-4 py-2 rounded-lg font-mono text-xl border-2 ${state.turn === 'X' ? 'bg-blue-600 text-white border-blue-400 scale-110' : 'bg-gray-800 text-gray-400 border-transparent'} transition-all`}>
                        <Clock className="inline mr-2" size={16}/>{formatTime(xTime)}
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-mono text-xl border-2 ${state.turn === 'O' ? 'bg-red-600 text-white border-red-400 scale-110' : 'bg-gray-800 text-gray-400 border-transparent'} transition-all`}>
                        <Clock className="inline mr-2" size={16}/>{formatTime(oTime)}
                    </div>
                </div>
            )}

            <div className="w-full flex-1 relative overflow-hidden bg-[#2a2a2a] rounded-xl shadow-inner flex flex-col">
                <div ref={boardRef} className="overflow-auto flex-1 p-8 flex justify-center items-center">
                    <div className="bg-[#eecfa1] p-4 shadow-2xl rounded border-4 border-[#8b4513] relative transition-transform duration-200 ease-out origin-center" style={{ transform: `scale(${zoom})` }}>
                        <div className="grid gap-[1px] bg-[#8b4513] border-2 border-[#8b4513]" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 40px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 40px)` }}>
                            {state.board.map((row, r) => row.map((cell, c) => {
                                const isLastMove = state.history.length > 0 && state.history[state.history.length - 1].r === r && state.history[state.history.length - 1].c === c;
                                const isWinningPiece = state.winningLine?.some(p => p.r === r && p.c === c);
                                return (
                                    <div key={`${r}-${c}`} onClick={() => handleCellClick(r, c)} className={`w-10 h-10 bg-[#eecfa1] flex items-center justify-center cursor-pointer relative hover:bg-[#ffe4b5] ${isWinningPiece ? 'bg-green-300' : ''}`}>
                                        {cell === 'X' && <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600 drop-shadow-sm pointer-events-none"><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>}
                                        {cell === 'O' && <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-600 drop-shadow-sm pointer-events-none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="4" fill="none" /></svg>}
                                        {isLastMove && !isWinningPiece && <div className="absolute inset-0 border-2 border-purple-500 rounded-sm pointer-events-none animate-pulse"></div>}
                                    </div>
                                );
                            }))}
                        </div>
                    </div>
                </div>
                {(state.winner || timeOver) && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in max-w-sm mx-4">
                            <h3 className="text-3xl font-extrabold text-gray-800 mb-2">{finalWinner === 'draw' ? 'Hòa!' : `${finalWinner === 'X' ? 'Xanh' : 'Đỏ'} Thắng!`}</h3>
                            {timeOver && <p className="text-red-500 font-bold mb-2">Hết thời gian!</p>}
                            {earnedCoins > 0 && (
                                <div className="mb-4 text-xl font-bold text-yellow-500 flex items-center justify-center gap-2 animate-pulse">
                                    <span>+{earnedCoins} 🪙</span>
                                </div>
                            )}
                            <div className="flex gap-4 justify-center">
                                <button onClick={handleReset} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition">Chơi Lại</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaroBoard;