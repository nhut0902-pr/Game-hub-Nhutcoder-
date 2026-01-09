
import { Chess, Square } from 'chess.js';

let chessInstance: Chess;

export const isValidSquare = (square: string): boolean => {
    return /^[a-h][1-8]$/.test(square);
};

export const initGame = (fen?: string) => {
    try {
        chessInstance = new Chess(fen);
    } catch (e) {
        console.error("Invalid FEN provided, resetting to default.");
        chessInstance = new Chess();
    }
    return chessInstance;
};

export const getGame = () => {
    if (!chessInstance) initGame();
    return chessInstance;
}

export const resetGame = () => {
    initGame();
};

/**
 * Trọng tài ảo phân tích lỗi chi tiết
 */
export const getArbitratorAnalysis = (from: string, to: string): string | null => {
    if (!chessInstance) return "Trọng tài: Trận đấu chưa sẵn sàng!";
    if (!isValidSquare(from) || !isValidSquare(to)) return "Trọng tài: Ô cờ nằm ngoài phạm vi 8x8!";

    const piece = chessInstance.get(from as Square);
    if (!piece) return "Trọng tài: Ô xuất phát không có quân cờ!";
    
    const turn = chessInstance.turn();
    if (piece.color !== turn) {
        return `Trọng tài: Đang là lượt của bên ${turn === 'w' ? 'Trắng' : 'Đen'}!`;
    }

    // Lấy danh sách nước đi hợp lệ cho ô này
    const legalMoves = chessInstance.moves({ square: from as Square, verbose: true });
    const isLegal = legalMoves.some(m => m.to === to);

    if (!isLegal) {
        const targetPiece = chessInstance.get(to as Square);
        
        // 1. Lỗi ăn quân cùng màu
        if (targetPiece && targetPiece.color === piece.color) {
            return "Trọng tài: Không được phép ăn quân của phe mình!";
        }

        // 2. Lỗi ghim quân hoặc không giải vây chiếu
        // Tạo bản sao để kiểm tra giả lập (pseudo-legal moves)
        const tempGame = new Chess(chessInstance.fen());
        const inCheckBefore = tempGame.inCheck();

        // Kiểm tra xem quân cờ có bị ghim (Pinned) không bằng cách bỏ qua luật chiếu của Vua tạm thời
        // Trong chess.js, moves() đã bao gồm kiểm tra chiếu. 
        // Nếu nước đi không có trong moves() nhưng về lý thuyết (hình học) là đúng, thì đó là lỗi Ghim quân hoặc để Vua bị chiếu.
        
        if (inCheckBefore) {
            return "Trọng tài: Vua đang bị chiếu! Bạn phải di chuyển Vua hoặc chặn đường chiếu!";
        }

        // Kiểm tra lỗi ghim quân (di chuyển quân làm lộ Vua bị chiếu)
        // Đây là logic giả định: nếu quân đó có thể di chuyển hình học đến đó nhưng không được phép
        return "Trọng tài: Nước đi phạm quy! Quân cờ đang bị ghim bảo vệ Vua hoặc đi sai luật!";
    }

    return null;
};

export const makeMove = (from: string, to: string, promotion: string = 'q') => {
    if (!chessInstance) initGame();
    
    if (!isValidSquare(from) || !isValidSquare(to)) return null;

    try {
        const move = chessInstance.move({ from, to, promotion });
        return move;
    } catch (e) {
        return null;
    }
};

export const getPossibleMoves = (square: string) => {
    if (!chessInstance) initGame();
    if (!isValidSquare(square)) return [];
    
    try {
        return chessInstance.moves({ square: square as Square, verbose: true }).map((m: any) => m.to);
    } catch (e) {
        return [];
    }
};

export const isGameOver = () => {
    if (!chessInstance) initGame();
    return chessInstance.isGameOver();
};

export const getTurn = () => {
    if (!chessInstance) initGame();
    return chessInstance.turn();
};

export const inCheck = () => {
    if (!chessInstance) initGame();
    return chessInstance.inCheck();
}
