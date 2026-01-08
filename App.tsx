import React, { useState, useEffect } from 'react';
import Chessboard from './components/Chessboard';
import CaroBoard from './components/CaroBoard';
import TetEffect from './components/TetEffect';
import SystemMonitor from './components/SystemMonitor';
import Shop, { ShopItem } from './components/Shop';
import { GameMode, BotDifficulty, GameType, GameSubMode } from './types';
import { 
  Bot, Users, Crown, ArrowLeft, Swords, Brain, Zap, Grid3X3, Castle, Flower2, ShoppingBag, Timer, ShieldAlert, Globe
} from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [subMode, setSubMode] = useState<GameSubMode>('classic');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [showSubModeSelect, setShowSubModeSelect] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showTetEffect, setShowTetEffect] = useState(true);
  
  // Shop & Economy State
  const [showShop, setShowShop] = useState(false);
  const [coins, setCoins] = useState(() => {
      const saved = localStorage.getItem('vina_coins');
      return saved ? parseInt(saved) : 2500;
  });
  const [ownedItems, setOwnedItems] = useState<string[]>(() => {
      const saved = localStorage.getItem('vina_owned_items');
      return saved ? JSON.parse(saved) : ['theme_green', 'theme_wood', 'piece_standard'];
  });
  const [activeItems, setActiveItems] = useState<Record<string, string>>(() => {
      const saved = localStorage.getItem('vina_active_items');
      return saved ? JSON.parse(saved) : { theme: 'theme_green', piece_style: 'piece_standard' };
  });

  useEffect(() => { localStorage.setItem('vina_coins', coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem('vina_owned_items', JSON.stringify(ownedItems)); }, [ownedItems]);
  useEffect(() => { localStorage.setItem('vina_active_items', JSON.stringify(activeItems)); }, [activeItems]);

  const handleEquipItem = (item: ShopItem) => {
      if (item.type === 'theme') {
          setActiveItems(prev => ({ ...prev, theme: item.id }));
      } else if (item.type === 'piece_style') {
          setActiveItems(prev => ({ ...prev, piece_style: item.id }));
      }
  };

  const handleBuyItem = (item: ShopItem) => {
      if (coins >= item.price && !ownedItems.includes(item.id)) {
          setCoins(prev => prev - item.price);
          setOwnedItems(prev => [...prev, item.id]);
          if (item.type === 'theme' || item.type === 'piece_style') {
              handleEquipItem(item);
          }
      }
  };

  const handleEarnCoins = (amount: number) => {
      setCoins(prev => prev + amount);
  };

  const handleSelectGame = (game: GameType) => {
      setActiveGame(game);
      setShowSubModeSelect(true);
  };

  const handleSubModeSelect = (mode: GameSubMode) => {
      if (mode === 'online') return;
      setSubMode(mode);
      setShowSubModeSelect(false);
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
      setShowSubModeSelect(false);
      setShowDifficultySelect(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {showTetEffect && <TetEffect />}
        <SystemMonitor />
        
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
            <button 
                onClick={() => setShowTetEffect(!showTetEffect)}
                className={`p-2 rounded-full transition-all shadow-lg flex items-center gap-2 ${showTetEffect ? 'bg-yellow-500 text-red-900 ring-2 ring-yellow-300' : 'bg-gray-700 text-gray-400'}`}
            >
                <Flower2 size={20} className={showTetEffect ? 'animate-spin-slow' : ''} />
                <span className="text-xs font-bold hidden md:inline">{showTetEffect ? 'Tết 2026' : 'Tết Off'}</span>
            </button>
            <button 
                onClick={() => setShowShop(true)}
                className="p-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-full shadow-lg border border-amber-400/30 transition-all hover:scale-105 group"
            >
                <div className="flex items-center gap-2 px-1">
                    <ShoppingBag size={20} className="group-hover:animate-bounce" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xs font-bold">{coins.toLocaleString()} 🪙</span>
                    </div>
                </div>
            </button>
        </div>

        <Shop 
            isOpen={showShop} 
            onClose={() => setShowShop(false)} 
            coins={coins}
            ownedItems={ownedItems}
            activeItems={activeItems}
            onBuy={handleBuyItem}
            onEquip={handleEquipItem}
        />

        {!activeGame ? (
            <div className="z-10 text-center animate-fade-in px-4">
                <div className="mb-12 select-none">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-[#e63946] drop-shadow-[0_2px_0_rgba(255,215,0,1)] font-serif tracking-widest uppercase mb-1 animate-pulse">VinaGames</h2>
                    <div className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">2026</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
                    <button onClick={() => handleSelectGame('chess')} className="group p-10 bg-gray-900/50 hover:bg-gray-800 border-2 border-transparent hover:border-amber-500 rounded-3xl transition-all shadow-xl hover:-translate-y-2">
                        <Castle size={64} className="text-amber-400 mb-6 group-hover:scale-110 transition-transform mx-auto" />
                        <span className="text-3xl font-bold text-white">Cờ Vua</span>
                        <p className="text-gray-400 mt-2">Trận chiến của vua và hậu</p>
                    </button>
                    <button onClick={() => handleSelectGame('caro')} className="group p-10 bg-gray-900/50 hover:bg-gray-800 border-2 border-transparent hover:border-blue-500 rounded-3xl transition-all shadow-xl hover:-translate-y-2">
                        <Grid3X3 size={64} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform mx-auto" />
                        <span className="text-3xl font-bold text-white">Cờ Ca-rô</span>
                        <p className="text-gray-400 mt-2">Nối 5 để giành vinh quang</p>
                    </button>
                </div>
            </div>
        ) : showSubModeSelect ? (
            <div className="z-10 w-full max-w-2xl px-4 animate-fade-in text-center">
                <button onClick={goHome} className="absolute top-20 left-4 p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white transition shadow-lg border border-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-tight">Chọn Chế Độ</h1>
                <p className="text-gray-400 mb-10">Khám phá phong cách chơi mới</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleSubModeSelect('classic')} className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 border-2 border-transparent hover:border-amber-500 rounded-2xl transition-all">
                        <Swords className="text-amber-500 mb-3" size={32} />
                        <span className="text-xl font-bold text-white">Cổ Điển</span>
                        <span className="text-xs text-gray-500">Quy tắc chuẩn mực</span>
                    </button>
                    <button onClick={() => handleSubModeSelect('time')} className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 border-2 border-transparent hover:border-blue-500 rounded-2xl transition-all">
                        <Timer className="text-blue-400 mb-3" size={32} />
                        <span className="text-xl font-bold text-white">Thời Gian</span>
                        <span className="text-xs text-gray-500">Giới hạn 5 phút</span>
                    </button>
                    <button onClick={() => handleSubModeSelect('challenge')} className="flex flex-col items-center p-6 bg-gray-800 hover:bg-gray-700 border-2 border-transparent hover:border-purple-500 rounded-2xl transition-all">
                        <ShieldAlert className="text-purple-400 mb-3" size={32} />
                        <span className="text-xl font-bold text-white">Thử Thách</span>
                        <span className="text-xs text-gray-500">Đấu với Máy cực khó</span>
                    </button>
                    <div className="relative group overflow-hidden flex flex-col items-center p-6 bg-gray-900/50 border-2 border-gray-800 rounded-2xl opacity-70 cursor-not-allowed">
                        <Globe className="text-gray-500 mb-3" size={32} />
                        <span className="text-xl font-bold text-gray-500">Online</span>
                        <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded mt-1">sắp tới sẽ có nhaa!</span>
                        <div className="absolute inset-0 bg-black/40 group-hover:opacity-0 transition-opacity"></div>
                    </div>
                </div>
            </div>
        ) : showDifficultySelect ? (
            <div className="z-10 w-full max-w-lg px-4 animate-fade-in text-center">
                <button onClick={() => {setShowDifficultySelect(false); setGameMode('menu');}} className="absolute top-20 left-4 p-3 bg-gray-800 rounded-full text-gray-400 hover:text-white transition shadow-lg border border-gray-700">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white mb-8 uppercase">Chọn Độ Khó</h2>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => handleStartBotGame('easy')} className="group flex items-center p-6 bg-gray-800 hover:bg-green-900/30 border-2 border-transparent hover:border-green-500 rounded-xl transition-all">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-green-400"><Zap size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-green-400">Dễ</h3><p className="text-gray-400 text-sm">Bot chơi thư giãn.</p></div>
                    </button>
                    <button onClick={() => handleStartBotGame('medium')} className="group flex items-center p-6 bg-gray-800 hover:bg-yellow-900/30 border-2 border-transparent hover:border-yellow-500 rounded-xl transition-all">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-yellow-400"><Brain size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-yellow-400">Trung Bình</h3><p className="text-gray-400 text-sm">Bot có chiến thuật.</p></div>
                    </button>
                    <button onClick={() => handleStartBotGame('hard')} className="group flex items-center p-6 bg-gray-800 hover:bg-red-900/30 border-2 border-transparent hover:border-red-500 rounded-xl transition-all">
                        <div className="p-4 bg-gray-900 rounded-full mr-6 text-red-500"><Swords size={32} /></div>
                        <div className="text-left"><h3 className="text-xl font-bold text-white group-hover:text-red-500">Khó</h3><p className="text-gray-400 text-sm">Thách thức cực đại.</p></div>
                    </button>
                </div>
            </div>
        ) : gameMode === 'menu' ? (
            <div className="z-10 flex flex-col items-center animate-fade-in text-center">
                <button onClick={() => setShowSubModeSelect(true)} className="absolute top-20 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                    <ArrowLeft size={20} /> <span className="font-bold">Đổi Chế Độ</span>
                </button>
                <h1 className="text-4xl font-bold text-white mb-2 uppercase">{activeGame === 'chess' ? 'Cờ Vua' : 'Cờ Ca-rô'}</h1>
                <p className="text-amber-500 font-bold mb-10 px-4 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">CHẾ ĐỘ: {subMode.toUpperCase()}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                    <button onClick={() => subMode === 'challenge' ? handleStartBotGame('hard') : handleModeSelect('bot_select')} className="group p-8 bg-gray-800/50 hover:bg-gray-700 border-2 border-transparent hover:border-amber-500/50 rounded-2xl transition-all shadow-xl">
                        <Bot size={48} className="text-amber-400 mb-4 mx-auto" />
                        <span className="text-2xl font-bold text-white">Đấu với Máy</span>
                        <span className="text-sm text-gray-400 mt-2 block">Luyện tập trí tuệ</span>
                    </button>
                    <button onClick={() => subMode === 'challenge' ? null : handleModeSelect('pvp')} disabled={subMode === 'challenge'} className={`group p-8 bg-gray-800/50 border-2 border-transparent rounded-2xl transition-all shadow-xl ${subMode === 'challenge' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-700 hover:border-blue-500/50'}`}>
                        <Users size={48} className="text-blue-400 mb-4 mx-auto" />
                        <span className="text-2xl font-bold text-white">Hai Người</span>
                        <span className="text-sm text-gray-400 mt-2 block">{subMode === 'challenge' ? 'Không hỗ trợ Thử Thách' : 'Vui vẻ cùng bạn bè'}</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="z-10 w-full max-w-4xl px-4 animate-fade-in mt-14">
                {activeGame === 'chess' ? (
                    <Chessboard 
                        mode={gameMode} 
                        difficulty={botDifficulty} 
                        onGoBack={() => setGameMode('menu')} 
                        theme={activeItems.theme}
                        pieceStyle={activeItems.piece_style}
                        onEarnCoins={handleEarnCoins}
                        subMode={subMode}
                    />
                ) : (
                    <CaroBoard 
                        mode={gameMode} 
                        difficulty={botDifficulty} 
                        onGoBack={() => setGameMode('menu')}
                        onEarnCoins={handleEarnCoins}
                        subMode={subMode}
                    />
                )}
            </div>
        )}
        
        <footer className="fixed bottom-2 w-full text-center pointer-events-none z-30">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10 text-[10px] md:text-xs text-gray-300 shadow-lg pointer-events-auto transition-all hover:bg-black/60 hover:scale-105">
                <span>Powered By</span>
                <a href="https://www.tiktok.com/@nhutcoder0902" target="_blank" rel="noopener noreferrer" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 hover:text-white transition-colors underline decoration-dotted decoration-gray-500">Nhutcoder</a>
                <span className="text-gray-500">|</span>
                <span className="text-purple-400 font-bold">Test by Vy</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">VinaGames 2026</span>
            </div>
        </footer>
    </div>
  );
}