
import { BotDifficulty } from '../types';

class StockfishService {
    private worker: Worker | null = null;
    private isReady: boolean = false;
    private resolvePromise: ((move: string) => void) | null = null;
    private timeoutId: any = null;

    constructor() {
        this.init();
    }

    private init() {
        try {
            // @ts-ignore - Stockfish is loaded via script tag in index.html
            if (typeof Stockfish === 'function') {
                // @ts-ignore
                this.worker = new Stockfish();
                this.setupWorker();
            }
        } catch (e) {
            console.error('Failed to init Stockfish:', e);
        }
    }

    private setupWorker() {
        if (!this.worker) return;

        this.worker.onmessage = (event: MessageEvent) => {
            const line = event.data;
            if (line === 'uciok') {
                this.isReady = true;
                // Cấu hình tối ưu cho engine Grandmaster
                this.worker?.postMessage('setoption name Threads value 4'); // Sử dụng tối đa luồng phổ biến
                this.worker?.postMessage('setoption name Hash value 256');  // Tăng bộ nhớ đệm lên 256MB để tính toán sâu
                this.worker?.postMessage('setoption name Ponder value true');
                this.worker?.postMessage('setoption name MultiPV value 1');  // Tập trung toàn lực vào 1 nước đi tốt nhất
                this.worker?.postMessage('setoption name Slow Mover value 100'); // Dành nhiều thời gian hơn cho các nước đi quan trọng
                this.worker?.postMessage('isready');
            } else if (line === 'readyok') {
                this.isReady = true;
            } else if (line.startsWith('bestmove')) {
                const move = line.split(' ')[1];
                if (this.resolvePromise) {
                    clearTimeout(this.timeoutId);
                    this.resolvePromise(move);
                    this.resolvePromise = null;
                }
            }
        };

        this.worker.postMessage('uci');
    }

    public async getBestMove(fen: string, difficulty: BotDifficulty): Promise<string | null> {
        if (!this.worker) return null;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;

            let depth = 10;
            let skillLevel = 10;
            let contempt = 0;

            switch (difficulty) {
                case 'easy':
                    depth = 5;
                    skillLevel = 0;
                    contempt = -100;
                    break;
                case 'medium':
                    depth = 12;
                    skillLevel = 15;
                    contempt = 0;
                    break;
                case 'hard':
                    // Cấu hình Grandmaster (GM)
                    depth = 22; // Độ sâu 22 cực kỳ mạnh cho bản JS
                    skillLevel = 20; // Max skill level
                    contempt = 100; // Cực kỳ hung hãn, ép sân đối thủ
                    break;
            }

            // Timeout linh hoạt: Chế độ khó cho phép bot nghĩ lâu hơn (tới 30 giây nếu cần)
            const maxWait = difficulty === 'hard' ? 30000 : 10000;

            this.timeoutId = setTimeout(() => {
                if (this.resolvePromise) {
                    console.warn("Stockfish thinking reached limit, forcing move...");
                    this.worker?.postMessage('stop');
                }
            }, maxWait);

            this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
            this.worker?.postMessage(`setoption name Contempt value ${contempt}`);
            this.worker?.postMessage(`position fen ${fen}`);
            this.worker?.postMessage(`go depth ${depth}`);
        });
    }

    public terminate() {
        this.worker?.terminate();
        this.worker = null;
    }
}

export const stockfishService = new StockfishService();
