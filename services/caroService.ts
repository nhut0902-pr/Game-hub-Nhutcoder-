
import { CaroPlayer, CaroState } from '../types';

export const BOARD_SIZE = 15;

// Kiểm tra xem tọa độ có nằm trong bàn cờ không
export const isInsideBoard = (r: number, c: number): boolean => {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
};

export const initCaroGame = (): CaroState => {
    return {
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
        turn: 'X',
        winner: null,
        winningLine: null,
        history: []
    };
};

export const makeCaroMove = (currentState: CaroState, row: number, col: number): CaroState => {
    // 1. Kiểm tra phạm vi
    if (!isInsideBoard(row, col)) {
        console.error(`Caro move out of bounds: ${row}, ${col}`);
        return currentState;
    }

    // 2. Kiểm tra trạng thái ô và game
    if (currentState.winner || currentState.board[row][col] !== null) {
        return currentState;
    }

    const newBoard = currentState.board.map(r => [...r]);
    newBoard[row][col] = currentState.turn;

    const currentTurn = currentState.turn;
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    const newHistory = [...currentState.history, { r: row, c: col, player: currentTurn }];

    let winner = currentState.winner;
    let winningLine = currentState.winningLine;

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

const checkWin = (board: (CaroPlayer | null)[][], r: number, c: number, player: CaroPlayer) => {
    const directions = [
        { dr: 0, dc: 1 },  // Ngang
        { dr: 1, dc: 0 },  // Dọc
        { dr: 1, dc: 1 },  // Chéo \
        { dr: 1, dc: -1 }  // Chéo /
    ];

    for (const { dr, dc } of directions) {
        let line = [{r, c}];
        
        // Tiến
        let i = 1;
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (!isInsideBoard(nr, nc) || board[nr][nc] !== player) break;
            line.push({r: nr, c: nc});
            i++;
        }

        // Lùi
        i = 1;
        while (true) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (!isInsideBoard(nr, nc) || board[nr][nc] !== player) break;
            line.push({r: nr, c: nc});
            i++;
        }

        if (line.length >= 5) return line;
    }
    return null;
};

export const undoCaroMove = (currentState: CaroState): CaroState => {
    if (currentState.history.length === 0) return currentState;
    const newHistory = currentState.history.slice(0, -1);
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    newHistory.forEach(move => {
        if (isInsideBoard(move.r, move.c)) {
            newBoard[move.r][move.c] = move.player;
        }
    });
    let turn: CaroPlayer = 'X';
    if (newHistory.length > 0) {
        const lastMove = newHistory[newHistory.length - 1];
        turn = lastMove.player === 'X' ? 'O' : 'X';
    }
    return { board: newBoard, turn, winner: null, winningLine: null, history: newHistory };
};
