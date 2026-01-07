import React, { useState } from 'react';
import Chessboard from './components/Chessboard';
import CaroBoard from './components/CaroBoard';
import TetEffect from './components/TetEffect';
import SystemMonitor from './components/SystemMonitor';
import { GameMode, BotDifficulty, GameType } from './types';
import { 
  Bot, Users, Crown, ArrowLeft, Swords, Brain, Zap, Grid3X3, Castle, Flower2 
} from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showTetEffect, setShowTetEffect] = useState(true);

  // Handlers
  const handleSelectGame = (game: GameType) => {
      setActiveGame(game);
      setGameMode('menu'); 
  };

  const handleModeSelect = (mode: 'pvp' | 'bot_select') => {
      if (mode === 'bot_select') {
          setShowDifficultySelect(true);
      } else {
          setGameMode('pvp');
      }
  };

  const handleStartBotGame = (difficulty: BotDifficulty) => {
    setBotDifficulty(difficulty);
    setGameMode('bot');
    setShowDifficultySelect(false);
  };

  const goHome = () => {
      setActiveGame(null);
      setGameMode('menu');
      setShowDifficultySelect(false);
  };

  const goBackToMenu = () => {
      setGameMode('menu');
      setShowDifficultySelect(false);
  };

  const ToggleEffectButton = () => (
      <button 
        onClick={() => setShowTetEffect(!showTetEffect)}
        className={`fixed top-4 right-4 z-50 p-2 rounded-full transition-all duration-300 shadow-lg flex items-center gap-2 ${showTetEffect ? 'bg-yellow-500 text-red-900 ring-2 ring-yellow-300' : 'bg-gray-700 text-gray-400'}`}
        title={showTetEffect ? "Tắt hiệu ứng Tết" : "Bật hiệu ứng Tết"}
      >
          <Flower2 size={20} className={showTetEffect ? 'animate-spin-slow' : ''} />
          <span className="text-xs font-bold hidden md:inline">{showTetEffect ? 'Tết 2026 On' : 'Tết Off'}</span>
      </button>
  );

  const FooterCredit = () => (
      <footer className="fixed bottom-2 w-full text-center pointer-events-none z-30">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10 text-[10px] md:text-xs text-gray-300 shadow-lg pointer-events-auto transition-all hover:bg-black/60 hover:scale-105">
              <span>Powered By</span>
              <a 
                href="https://www.tiktok.com/@nhutcoder0902?_r=1&_t=ZS-92rkC6Gm1cF" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 hover:text-white transition-colors underline decoration-dotted decoration-gray-500"
              >
                 Nhutcoder
              </a>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Test demo by Vy</span>
          </div>
      </footer>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {showTetEffect && <TetEffect />}
        <SystemMonitor />
        <ToggleEffectButton />

        {!activeGame ? (
            <div className="z-10 text-center animate-fade-in px-4">
                {showTetEffect && (
                    <div className="mb-6 animate-bounce-in select-none">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#e63946] drop-shadow-[0_2px_0_rgba(255,215,0,1)] font-serif tracking-widest uppercase mb-1">Happy New Year</h2>
                        <div className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">2026</div>
                    </div>
                )}
                <div className="mb-8 p-6 bg-gray-800/80 backdrop-blur-lg rounded-full shadow-2xl border border-gray-700 inline-block relative">
                    <Crown size={64} className="text-amber-500" />
                    {showTetEffect && <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🌸</div>}
                </div>
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2 drop-shadow-sm">VinaGames</h1>
                <p className="text-gray-400 mb-12 text-lg">Chọn trò chơi yêu thích của bạn</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                    <button onClick={() => handleSelectGame('chess')} className="group relative flex flex-col items-center justify-center p-10 bg-gray-900/50 hover:bg-gray-800 border-2 border-transparent hover:border-amber-500 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-amber-900/30 hover:-translate-y-2">
                        <Castle size={64} className="text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                        <span className="text-3xl font-bold text-white">Cờ Vua</span>
                        <span className="text-gray-400 mt-2">Chiến thuật đỉnh cao</span>
                    </button>
                    <button onClick={() => handleSelectGame('caro')} className="group relative flex flex-col items-center justify-center p-10 bg-gray-900/50 hover:bg-gray-800 border-2 border-transparent hover:border-blue-500 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-blue-900/30 hover:-translate-y-2">
                        <Grid3X3 size={64} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                        <span className="text-3xl font-bold text-white">Cờ Ca-rô</span>
                        <span className="text-gray-400 mt-2">Nối 5 để thắng</span>
                    </button>
                </div>
            </div>
        ) : showDifficultySelect ? (
            <div className="z-10 w-full max-w-lg px-4 animate-fade-in text-center">
                <button onClick={() => setShowDifficultySelect(false)} className="absolute top-8 left-8 p-3 bg-gray-800 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white mb-8">Chọn Độ Khó ({activeGame === 'chess' ? 'Cờ Vua' : 'Ca-rô'})</h2>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => handleStartBotGame('easy')} className="group flex items-center p-6 bg-gray-800 hover:bg-green-900/30 border-2 border-transparent hover:border-green-500 rounded-xl transition-all shadow-lg">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-green-400"><Zap size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-green-400">Dễ</h3><p className="text-gray-400 text-sm">Bot chơi nhẹ nhàng, dễ thắng.</p></div>
                    </button>
                    <button onClick={() => handleStartBotGame('medium')} className="group flex items-center p-6 bg-gray-800 hover:bg-yellow-900/30 border-2 border-transparent hover:border-yellow-500 rounded-xl transition-all shadow-lg">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-yellow-400"><Brain size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-yellow-400">Trung Bình</h3><p className="text-gray-400 text-sm">Bot biết tấn công và phòng thủ.</p></div>
                    </button>
                    <button onClick={() => handleStartBotGame('hard')} className="group flex items-center p-6 bg-gray-800 hover:bg-red-900/30 border-2 border-transparent hover:border-red-500 rounded-xl transition-all shadow-lg">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-red-500"><Swords size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-red-500">Khó</h3><p className="text-gray-400 text-sm">Thử thách thực sự.</p></div>
                    </button>
                </div>
            </div>
        ) : gameMode === 'menu' ? (
            <div className="z-10 flex flex-col items-center justify-center animate-fade-in text-center">
                <button onClick={goHome} className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition z-20">
                    <ArrowLeft size={20} /> <span className="font-bold">Đổi Game</span>
                </button>
                <h1 className="text-4xl font-bold text-white mb-2">{activeGame === 'chess' ? 'Cờ Vua' : 'Cờ Ca-rô'}</h1>
                <p className="text-gray-400 mb-12">Chọn chế độ chơi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                    <button onClick={() => handleModeSelect('bot_select')} className="group relative flex flex-col items-center justify-center p-8 bg-gray-800/50 hover:bg-gray-700 border-2 border-transparent hover:border-amber-500/50 rounded-2xl transition-all duration-300 shadow-xl">
                        <Bot size={48} className="text-amber-400 mb-4" />
                        <span className="text-2xl font-bold text-white">Đấu với Máy</span>
                        <span className="text-sm text-gray-400 mt-2">Luyện tập offline</span>
                    </button>
                    <button onClick={() => handleModeSelect('pvp')} className="group relative flex flex-col items-center justify-center p-8 bg-gray-800/50 hover:bg-gray-700 border-2 border-transparent hover:border-blue-500/50 rounded-2xl transition-all duration-300 shadow-xl">
                        <Users size={48} className="text-blue-400 mb-4" />
                        <span className="text-2xl font-bold text-white">Hai Người</span>
                        <span className="text-sm text-gray-400 mt-2">Chơi cùng bạn bè</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="z-10 w-full max-w-4xl px-4 animate-fade-in">
                {activeGame === 'chess' ? (
                    <Chessboard mode={gameMode} difficulty={botDifficulty} onGoBack={goBackToMenu} />
                ) : (
                    <CaroBoard mode={gameMode} difficulty={botDifficulty} onGoBack={goBackToMenu} />
                )}
            </div>
        )}
        
        <FooterCredit />
    </div>
  );
}