import { CaroPlayer, CaroState } from '../types';

export const BOARD_SIZE = 15;

export const initCaroGame = (): CaroState => {
    return {
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        turn: 'X',
        winner: null,
        winningLine: null,
        history: []
    };
};

export const getCaroState = () => {
    // Deprecated in favor of local state, but kept for compatibility if needed.
    // In this pure version, we don't maintain global state here.
    return initCaroGame();
};

export const makeCaroMove = (currentState: CaroState, row: number, col: number): CaroState => {
    if (currentState.winner || currentState.board[row][col] !== null) {
        return currentState;
    }

    // Deep copy board
    const newBoard = currentState.board.map(r => [...r]);
    newBoard[row][col] = currentState.turn;

    const currentTurn = currentState.turn;
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    
    // Update history
    const newHistory = [...currentState.history, { r: row, c: col, player: currentTurn }];

    let winner = currentState.winner;
    let winningLine = currentState.winningLine;

    // Check win
    const winInfo = checkWin(newBoard, row, col, currentTurn);
    if (winInfo) {
        winner = currentTurn;
        winningLine = winInfo;
    } else if (newHistory.length === BOARD_SIZE * BOARD_SIZE) {
        winner = 'draw';
    }

    return {
        board: newBoard,
        turn: winner ? currentTurn : nextTurn,
        winner,
        winningLine,
        history: newHistory
    };
};

export const undoCaroMove = (currentState: CaroState): CaroState => {
    if (currentState.history.length === 0) return currentState;
    
    // Create new history without last move
    const newHistory = currentState.history.slice(0, -1);
    
    // Rebuild board
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    newHistory.forEach(move => {
        newBoard[move.r][move.c] = move.player;
    });

    let turn: CaroPlayer = 'X';
    if (newHistory.length > 0) {
        const lastMove = newHistory[newHistory.length - 1];
        turn = lastMove.player === 'X' ? 'O' : 'X';
    }

    return {
        board: newBoard,
        turn,
        winner: null,
        winningLine: null,
        history: newHistory
    };
};

export const loadCaroGame = (data: any): CaroState | null => {
    if (data && data.board && data.turn && data.history) {
        return {
            board: data.board,
            turn: data.turn,
            winner: data.winner || null,
            winningLine: data.winningLine || null,
            history: data.history
        };
    }
    return null;
};

// Check for 5 in a row
const checkWin = (board: (CaroPlayer | null)[][], r: number, c: number, player: CaroPlayer) => {
    const directions = [
        { dr: 0, dc: 1 },  // Horizontal
        { dr: 1, dc: 0 },  // Vertical
        { dr: 1, dc: 1 },  // Diagonal \
        { dr: 1, dc: -1 }  // Diagonal /
    ];

    for (const { dr, dc } of directions) {
        let line = [{r, c}];
        
        // Check forward
        let i = 1;
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break;
            line.push({r: nr, c: nc});
            i++;
        }

        // Check backward
        i = 1;
        while (true) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break;
            line.push({r: nr, c: nc});
            i++;
        }

        if (line.length >= 5) {
            return line;
        }
    }
    return null;
};