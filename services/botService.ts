
import { Chess } from 'chess.js';
import { BotDifficulty } from '../types';
import { stockfishService } from './stockfishService';

const getFallbackRandomMove = (game: Chess): string | null => {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    const move = moves[Math.floor(Math.random() * moves.length)];
    // Trả về định dạng UCI (ví dụ: e2e4)
    return move.from + move.to + (move.promotion || '');
};

export const getBestMove = async (fen: string, difficulty: BotDifficulty = 'medium'): Promise<string | null> => {
    const game = new Chess(fen);
    
    // Ưu tiên sử dụng Stockfish Engine
    try {
        const sfMove = await stockfishService.getBestMove(fen, difficulty);
        if (sfMove && sfMove !== '(none)') {
            return sfMove;
        }
    } catch (e) {
        console.error("Stockfish move failed, using fallback", e);
    }

    // Fallback: Nếu Stockfish không phản hồi, dùng nước đi ngẫu nhiên
    return new Promise(r => setTimeout(() => r(getFallbackRandomMove(game)), 600));
};
