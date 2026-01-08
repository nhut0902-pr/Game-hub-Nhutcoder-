import React from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles, Star, Trophy, Crown } from 'lucide-react';
import { ItemType } from '../types';

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    icon: string;
    description: string;
    type: ItemType;
}

export const SHOP_ITEMS: ShopItem[] = [
    // Themes
    { id: 'theme_green', type: 'theme', name: 'Bàn Classic Green', price: 0, icon: '🟩', description: 'Giao diện bàn cờ tiêu chuẩn' },
    { id: 'theme_wood', type: 'theme', name: 'Bàn Gỗ Sồi', price: 0, icon: '🟫', description: 'Giao diện cổ điển mộc mạc' },
    { id: 'theme_neon', type: 'theme', name: 'Bàn Neon', price: 500, icon: '✨', description: 'Phong cách Cyberpunk cực chất' },
    { id: 'theme_glass', type: 'theme', name: 'Bàn Thủy Tinh', price: 1000, icon: '🧊', description: 'Trong suốt tinh tế sang trọng' },
    { id: 'theme_space', type: 'theme', name: 'Nền Vũ Trụ', price: 1200, icon: '🌌', description: 'Thi đấu giữa ngân hà' },
    { id: 'theme_royal', type: 'theme', name: 'Bàn Hoàng Gia', price: 2000, icon: '🏰', description: 'Đẳng cấp quý tộc châu Âu' },
    { id: 'theme_matrix', type: 'theme', name: 'Bàn Ma Trận', price: 1800, icon: '📟', description: 'Thế giới số nhị phân' },
    { id: 'theme_lava', type: 'theme', name: 'Bàn Dung Nham', price: 2500, icon: '🌋', description: 'Rực cháy tinh thần chiến đấu' },
    
    // Pieces
    { id: 'piece_standard', type: 'piece_style', name: 'Quân Tiêu Chuẩn', price: 0, icon: '♟️', description: 'Bộ cờ quốc tế chuẩn' },
    { id: 'piece_gold', type: 'piece_style', name: 'Quân Vàng', price: 2500, icon: '🏆', description: 'Bộ cờ mạ vàng 24k' },
    { id: 'piece_diamond', type: 'piece_style', name: 'Quân Kim Cương', price: 5000, icon: '💎', description: 'Lấp lánh đẳng cấp thượng lưu' },
    { id: 'piece_neon', type: 'piece_style', name: 'Quân Neon', price: 1500, icon: '🔦', description: 'Phát sáng trong bóng tối' },
    { id: 'piece_crystal', type: 'piece_style', name: 'Quân Pha Lê', price: 3000, icon: '🔮', description: 'Trong veo và sắc sảo' },
    { id: 'piece_emerald', type: 'piece_style', name: 'Quân Ngọc Lục Bảo', price: 4000, icon: '🟢', description: 'Sắc xanh quyền quý' },

    // Avatars
    { id: 'avatar_dragon', type: 'avatar', name: 'Avatar Rồng', price: 1500, icon: '🐉', description: 'Biểu tượng uy quyền rực lửa' },
    { id: 'avatar_warrior', type: 'avatar', name: 'Chiến Binh', price: 1200, icon: '⚔️', description: 'Tinh thần thép bất khuất' },
    { id: 'avatar_mage', type: 'avatar', name: 'Pháp Sư', price: 1200, icon: '🧙', description: 'Trí tuệ vượt thời gian' },
    { id: 'avatar_phoenix', type: 'avatar', name: 'Phượng Hoàng', price: 2000, icon: '🔥', description: 'Huyền thoại tái sinh' },
    { id: 'avatar_tiger', type: 'avatar', name: 'Hổ Mãnh', price: 1800, icon: '🐯', description: 'Sức mạnh rừng xanh' },

    // Effects & Utilities
    { id: 'effect_fireworks', type: 'effect', name: 'Pháo Hoa', price: 1000, icon: '🎆', description: 'Ăn quân nổ pháo hoa rực rỡ' },
    { id: 'effect_snow', type: 'effect', name: 'Tuyết Rơi', price: 800, icon: '❄️', description: 'Không gian thi đấu lãng mạn' },
    { id: 'undo_pack', type: 'utility', name: 'Gói Hoàn Tác', price: 100, icon: '↺', description: 'Cho phép đi lại nước cờ' },
    { id: 'hint_pack', type: 'utility', name: 'Gói Gợi Ý', price: 200, icon: '💡', description: 'Máy chỉ nước đi tối ưu' },
    { id: 'vip_badge', type: 'utility', name: 'Huy Hiệu VIP', price: 10000, icon: '👑', description: 'Đẳng cấp đại gia VinaGames' },
    { id: 'god_mode', type: 'utility', name: 'Chế Độ Thần', price: 99999, icon: '😇', description: 'Sức mạnh bất khả chiến bại' },
];

interface ShopProps {
    isOpen: boolean;
    onClose: () => void;
    coins: number;
    ownedItems: string[];
    activeItems: Record<string, string>;
    onBuy: (item: ShopItem) => void;
    onEquip: (item: ShopItem) => void;
}

const Shop: React.FC<ShopProps> = ({ isOpen, onClose, coins, ownedItems, activeItems, onBuy, onEquip }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-5xl h-[85vh] rounded-2xl border border-amber-500/30 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg shadow-amber-900/50">
                            <ShoppingBag className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Cửa Hàng</h2>
                            <p className="text-gray-400 text-xs md:text-sm">Nâng cấp trải nghiệm VinaGames</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="px-4 py-2 bg-black/40 rounded-full border border-amber-500/50 text-amber-400 font-mono font-bold flex items-center gap-2 shadow-inner">
                            <span className="text-xl">🪙</span>
                            <span className="text-lg">{coins.toLocaleString()}</span>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition shadow-md">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {SHOP_ITEMS.map((item) => {
                            const isOwned = ownedItems.includes(item.id) || item.price === 0;
                            const isActive = (item.type === 'theme' && activeItems.theme === item.id) || 
                                             (item.type === 'piece_style' && activeItems.piece_style === item.id);
                            const canBuy = coins >= item.price;
                            const isEquippable = item.type === 'theme' || item.type === 'piece_style';

                            return (
                                <div key={item.id} className={`relative group p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 ${
                                    isActive
                                        ? 'border-green-400 bg-green-900/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                                        : isOwned 
                                            ? 'border-gray-600 bg-gray-800/40' 
                                            : 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-amber-500/50'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 flex items-center justify-center bg-black/30 rounded-lg text-3xl shadow-inner">
                                            {item.icon}
                                        </div>
                                        {isActive ? (
                                             <div className="px-2 py-0.5 bg-green-500 text-black text-[10px] rounded-full font-bold">ĐANG DÙNG</div>
                                        ) : isOwned && (
                                            <div className="px-2 py-0.5 bg-gray-700 text-gray-300 text-[10px] rounded-full font-bold">ĐÃ CÓ</div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-base md:text-lg ${isActive ? 'text-green-400' : isOwned ? 'text-gray-200' : 'text-white'}`}>{item.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1 h-8 line-clamp-2">{item.description}</p>
                                    </div>

                                    <div className="mt-2 pt-3 border-t border-white/5">
                                        {isActive ? (
                                            <button disabled className="w-full py-2 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg cursor-default border border-green-500/20">ĐANG TRANG BỊ</button>
                                        ) : isOwned ? (
                                            isEquippable ? (
                                                <button onClick={() => onEquip(item)} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors border border-gray-600">TRANG BỊ NGAY</button>
                                            ) : (
                                                <button disabled className="w-full py-2 bg-gray-800 text-gray-500 text-xs font-bold rounded-lg cursor-default">ĐÃ SỞ HỮU</button>
                                            )
                                        ) : (
                                            <button 
                                                onClick={() => onBuy(item)}
                                                disabled={!canBuy}
                                                className={`w-full py-2 flex items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition-all ${
                                                    canBuy ? `Mua ${item.price} 🪙` : 'Không đủ xu'
                                                }`}
                                            >
                                                {canBuy ? `Mua ${item.price} 🪙` : 'Không đủ xu'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;