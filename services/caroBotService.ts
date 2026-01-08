import { CaroPlayer, CaroState } from '../types';
import { BOARD_SIZE } from './caroService';

// Score constants
const SCORES = {
    WIN: 100000000,
    OPEN_FOUR: 100000,
    CLOSED_FOUR: 10000,
    OPEN_THREE: 5000,
    CLOSED_THREE: 1000,
    OPEN_TWO: 500,
    CLOSED_TWO: 100
};

export const getBestCaroMove = async (state: CaroState, difficulty: string): Promise<{r: number, c: number} | null> => {
    return new Promise(async (resolve) => {
        try {
            const move = await calculateMoveChunked(state, difficulty);
            resolve(move);
        } catch (e) {
            console.error("Bot Error", e);
            // Fallback: find first empty spot
            for(let r=0; r<BOARD_SIZE; r++) {
                for(let c=0; c<BOARD_SIZE; c++) {
                    if(state.board[r][c] === null) {
                        resolve({r, c});
                        return;
                    }
                }
            }
            resolve(null);
        }
    });
};

const calculateMoveChunked = async (state: CaroState, difficulty: string) => {
    const { board, turn } = state;
    
    // Optimization: Only consider moves near existing pieces
    const hasPieces = state.history.length > 0;
    if (!hasPieces) {
        return { r: Math.floor(BOARD_SIZE / 2), c: Math.floor(BOARD_SIZE / 2) };
    }

    // Identify candidates (cells with neighbors within radius 2)
    const candidates = new Set<string>();
    for(let r=0; r<BOARD_SIZE; r++) {
        for(let c=0; c<BOARD_SIZE; c++) {
            if (board[r][c] !== null) {
                // Check radius 2 around this piece
                for(let dr=-2; dr<=2; dr++) {
                    for(let dc=-2; dc<=2; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
                            candidates.add(`${nr},${nc}`);
                        }
                    }
                }
            }
        }
    }

    let movesToCheck = Array.from(candidates).map(s => {
        const [r, c] = s.split(',').map(Number);
        return { r, c };
    });

    if (movesToCheck.length === 0) {
         for(let r=0; r<BOARD_SIZE; r++) {
            for(let c=0; c<BOARD_SIZE; c++) {
                if(board[r][c] === null) movesToCheck.push({r, c});
            }
        }
    }

    if (difficulty === 'easy') {
        const randomIdx = Math.floor(Math.random() * movesToCheck.length);
        return movesToCheck[randomIdx];
    }

    let bestScore = -Infinity;
    let bestMoves: {r: number, c: number}[] = [];

    const botPlayer = turn;
    const opponent = turn === 'X' ? 'O' : 'X';

    // CHUNKING: Process candidates in small batches to keep UI responsive
    const batchSize = 10;
    for (let i = 0; i < movesToCheck.length; i++) {
        // Yield every batch
        if (i % batchSize === 0) {
            await new Promise(r => setTimeout(r, 0));
        }

        const move = movesToCheck[i];
        const attackScore = evaluatePoint(board, move.r, move.c, botPlayer);
        const defenseScore = evaluatePoint(board, move.r, move.c, opponent);

        let currentScore = 0;
        if (difficulty === 'medium') {
            currentScore = attackScore + defenseScore * 0.8;
        } else {
            if (attackScore >= SCORES.WIN) currentScore = Infinity; 
            else if (defenseScore >= SCORES.WIN) currentScore = SCORES.WIN - 1; 
            else currentScore = attackScore + defenseScore;
        }
        
        currentScore += Math.random() * 10;

        if (currentScore > bestScore) {
            bestScore = currentScore;
            bestMoves = [move];
        } else if (Math.abs(currentScore - bestScore) < 50) {
            bestMoves.push(move);
        }
    }

    return bestMoves.length > 0 ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : movesToCheck[0];
};

const evaluatePoint = (board: (CaroPlayer | null)[][], r: number, c: number, player: CaroPlayer) => {
    let totalScore = 0;
    const directions = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 }
    ];

    for (const { dr, dc } of directions) {
        let consecutive = 0;
        let openEnds = 0;
        
        let i = 1;
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
            if (board[nr][nc] === player) {
                consecutive++;
            } else if (board[nr][nc] === null) {
                openEnds++;
                break;
            } else {
                break; 
            }
            i++;
        }

        i = 1;
        while (true) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
            if (board[nr][nc] === player) {
                consecutive++;
            } else if (board[nr][nc] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
            i++;
        }

        if (consecutive >= 4) totalScore += SCORES.WIN;
        else if (consecutive === 3) {
            if (openEnds === 2) totalScore += SCORES.OPEN_FOUR;
            else if (openEnds === 1) totalScore += SCORES.CLOSED_FOUR;
        }
        else if (consecutive === 2) {
            if (openEnds === 2) totalScore += SCORES.OPEN_THREE;
            else if (openEnds === 1) totalScore += SCORES.CLOSED_THREE;
        }
        else if (consecutive === 1) {
            if (openEnds === 2) totalScore += SCORES.OPEN_TWO;
            else if (openEnds === 1) totalScore += SCORES.CLOSED_TWO;
        }
    }
    return totalScore;
};