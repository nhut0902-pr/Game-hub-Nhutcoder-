import { Chess } from 'chess.js';
import { BotDifficulty } from '../types';

// Piece Values
const PIECE_VALUES: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
};

const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
    [0,  0,  0,  5,  5,  0,  0,  0],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_PST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

const getPiecePstValue = (piece: any, x: number, y: number): number => {
    if (!piece) return 0;
    let r = piece.color === 'w' ? y : 7 - y;
    let c = x;
    switch(piece.type) {
        case 'p': return PAWN_PST[r][c];
        case 'n': return KNIGHT_PST[r][c];
        case 'b': return BISHOP_PST[r][c];
        case 'r': return ROOK_PST[r][c];
        case 'q': return QUEEN_PST[r][c];
        case 'k': return KING_PST[r][c];
        default: return 0;
    }
};

const evaluateBoard = (game: Chess): number => {
    let totalEval = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const material = PIECE_VALUES[piece.type];
                const positional = getPiecePstValue(piece, j, i);
                const val = material + positional;
                totalEval += piece.color === 'w' ? val : -val;
            }
        }
    }
    return totalEval;
};

const quiescenceSearch = (game: Chess, alpha: number, beta: number, qDepth: number = 0): number => {
    const standPat = evaluateBoard(game);
    // Quiescence depth limit to prevent infinite recursions in complex scenarios
    if (qDepth > 4) return standPat;

    if (game.turn() === 'w') {
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;
    } else {
        if (standPat <= alpha) return alpha;
        if (beta > standPat) beta = standPat;
    }

    const captureMoves = game.moves({ verbose: true }).filter(m => m.captured);
    captureMoves.sort((a, b) => PIECE_VALUES[b.captured || 'p'] - PIECE_VALUES[a.captured || 'p']);

    for (const move of captureMoves) {
        game.move(move);
        const score = quiescenceSearch(game, alpha, beta, qDepth + 1);
        game.undo();

        if (game.turn() === 'w') {
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        } else {
            if (score <= alpha) return alpha;
            if (score < beta) beta = score;
        }
    }
    return game.turn() === 'w' ? alpha : beta;
};

const orderMoves = (game: Chess, moves: string[]): string[] => {
    return moves.sort((a, b) => {
        const moveA = game.move(a);
        game.undo();
        const moveB = game.move(b);
        game.undo();
        
        let scoreA = 0;
        let scoreB = 0;

        if (moveA && moveA.captured) scoreA += PIECE_VALUES[moveA.captured] * 10;
        if (moveB && moveB.captured) scoreB += PIECE_VALUES[moveB.captured] * 10;
        
        if (moveA && moveA.promotion) scoreA += 800;
        if (moveB && moveB.promotion) scoreB += 800;

        return scoreB - scoreA;
    });
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0) {
        return quiescenceSearch(game, alpha, beta);
    }

    if (game.isGameOver()) {
        if (game.isCheckmate()) {
            return isMaximizing ? -30000 : 30000;
        }
        return 0;
    }

    const rawMoves = game.moves();
    const moves = orderMoves(game, rawMoves);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            game.move(move);
            const ev = minimax(game, depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, ev);
            alpha = Math.max(alpha, ev);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            game.move(move);
            const ev = minimax(game, depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, ev);
            beta = Math.min(beta, ev);
            if (beta <= alpha) break;
        }
        return minEval;
    }
};

export const getBestMove = async (fen: string, difficulty: BotDifficulty = 'medium'): Promise<string | null> => {
    const game = new Chess(fen);
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return null;

    if (difficulty === 'easy') {
        return new Promise((resolve) => {
             setTimeout(() => {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                resolve(randomMove);
             }, 300);
        });
    }

    // Depth 3 for Medium, Depth 4 for Hard in JS to avoid lag while staying very strong
    const depth = difficulty === 'hard' ? 4 : 3; 

    let bestMove = null;
    let bestValue = game.turn() === 'w' ? -Infinity : Infinity;
    const isWhiteTurn = game.turn() === 'w';

    const orderedMoves = orderMoves(game, possibleMoves);

    // CHUNKING: Evaluate each top-level move in its own tick to keep UI responsive
    return new Promise(async (resolve) => {
        for (const move of orderedMoves) {
            // Yield control back to the UI thread before evaluating each candidate
            await new Promise(r => setTimeout(r, 0));
            
            game.move(move);
            const boardValue = minimax(game, depth - 1, -Infinity, Infinity, !isWhiteTurn);
            game.undo();

            if (isWhiteTurn) {
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
        resolve(bestMove || orderedMoves[0]);
    });
};