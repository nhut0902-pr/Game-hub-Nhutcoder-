import { Chess } from 'chess.js';

// NOTE: We rely on the window.Chess injection from index.html for browser environments 
// that don't have a bundler, but for proper TS support we import it.
// If running in a raw ESM environment without node_modules, this import might need adjustment.
// We'll wrap the instantiation to be safe.

let chessInstance: Chess;

export const initGame = (fen?: string) => {
    // @ts-ignore - Handle the case where Chess might be on window in no-bundler envs
    const ChessCtor = (typeof window !== 'undefined' && (window as any).Chess) ? (window as any).Chess : Chess;
    chessInstance = new ChessCtor(fen);
    return chessInstance;
};

export const getGame = () => {
    if (!chessInstance) initGame();
    return chessInstance;
}

export const resetGame = () => {
    initGame();
};

export const makeMove = (from: string, to: string, promotion: string = 'q') => {
    if (!chessInstance) initGame();
    try {
        const move = chessInstance.move({ from, to, promotion });
        return move;
    } catch (e) {
        return null;
    }
};

export const getPossibleMoves = (square: string) => {
    if (!chessInstance) initGame();
    return chessInstance.moves({ square, verbose: true }).map((m: any) => m.to);
};

export const isGameOver = () => {
    if (!chessInstance) initGame();
    return chessInstance.isGameOver();
};

export const getTurn = () => {
    if (!chessInstance) initGame();
    return chessInstance.turn();
};

export const getFen = () => {
    if (!chessInstance) initGame();
    return chessInstance.fen();
};

export const getBoard = () => {
    if (!chessInstance) initGame();
    return chessInstance.board();
}

export const getHistory = () => {
    if (!chessInstance) initGame();
    return chessInstance.history();
}

export const inCheck = () => {
    if (!chessInstance) initGame();
    return chessInstance.inCheck();
}

export const getPgn = () => {
    if (!chessInstance) initGame();
    return chessInstance.pgn();
}

export const loadPgn = (pgn: string) => {
    if (!chessInstance) initGame();
    try {
        chessInstance.loadPgn(pgn);
        return true;
    } catch (e) {
        console.error("Failed to load PGN", e);
        return false;
    }
}