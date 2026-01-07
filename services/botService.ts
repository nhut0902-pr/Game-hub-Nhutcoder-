import { Chess } from 'chess.js';
import { BotDifficulty } from '../types';

// Weight of pieces
const PIECE_VALUES: Record<string, number> = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900,
};

// Simplified position evaluation tables (incentivize center control)
const PAWN_TABLE = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, -20, -20, 10, 10,  5], // Penalty for center pawns to encourage moving them? Actually standard tables usually reward advancement.
    [5, -5, -10,  0,  0, -10, -5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

// Helper to get piece value with position adjustment
const getPieceValue = (piece: any, rowIndex: number, colIndex: number): number => {
    if (!piece) return 0;
    
    let val = PIECE_VALUES[piece.type] || 0;
    const isWhite = piece.color === 'w';
    
    // Adjust row index for black to mirror the board
    const r = isWhite ? 7 - rowIndex : rowIndex;
    const c = colIndex; // Symmetric horizontally roughly

    if (piece.type === 'p') {
        val += (PAWN_TABLE[r]?.[c] || 0) / 10; // Divided scale
    } else if (piece.type === 'n') {
        val += (KNIGHT_TABLE[r]?.[c] || 0) / 10;
    }

    return isWhite ? val : -val;
};

const evaluateBoard = (game: Chess): number => {
    let totalEvaluation = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            totalEvaluation += getPieceValue(board[r][c], r, c);
        }
    }
    return totalEvaluation;
};

// Minimax with Alpha-Beta Pruning
const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
    if (depth === 0 || game.isGameOver()) {
        return evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const evalScore = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const evalScore = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getBestMove = async (fen: string, difficulty: BotDifficulty = 'medium'): Promise<string | null> => {
    // We instantiate a new chess object for calculation to not mess with the UI state
    // @ts-ignore
    const ChessCtor = (typeof window !== 'undefined' && (window as any).Chess) ? (window as any).Chess : Chess;
    const game = new ChessCtor(fen);
    
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    // Difficulty Logic
    // Easy: Random move
    if (difficulty === 'easy') {
        return new Promise((resolve) => {
             setTimeout(() => {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                resolve(randomMove);
             }, 400);
        });
    }

    // Determine depth based on difficulty
    const depth = difficulty === 'hard' ? 3 : 2; 

    let bestMove = null;
    let bestValue = game.turn() === 'w' ? -Infinity : Infinity;
    const isMaximizing = game.turn() === 'w';

    return new Promise((resolve) => {
        setTimeout(() => {
            for (const move of possibleMoves) {
                game.move(move);
                const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
                game.undo();

                if (isMaximizing) {
                    if (boardValue > bestValue) {
                        bestValue = boardValue;
                        bestMove = move;
                    }
                } else {
                    if (boardValue < bestValue) {
                        bestValue = boardValue;
                        bestMove = move;
                    }
                }
            }
            // Fallback to random if no best move found (rare)
            resolve(bestMove || possibleMoves[Math.floor(Math.random() * possibleMoves.length)]);
        }, 50); 
    });
};
