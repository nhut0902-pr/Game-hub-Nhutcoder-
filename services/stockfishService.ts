
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
                // Cấu hình tối ưu cho engine
                this.worker?.postMessage('setoption name Threads value 2'); // Sử dụng 2 luồng để mạnh hơn
                this.worker?.postMessage('setoption name Hash value 64');   // 64MB bộ nhớ đệm
                this.worker?.postMessage('setoption name Ponder value true');
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
                    depth = 4;
                    skillLevel = 0;
                    contempt = -100; // Chơi nhút nhát
                    break;
                case 'medium':
                    depth = 12;
                    skillLevel = 12;
                    contempt = 0;
                    break;
                case 'hard':
                    // Cấp độ Pro: Tăng depth lên 18, max skill, tăng độ hung hãn
                    depth = 18; 
                    skillLevel = 20;
                    contempt = 50; // Chơi chủ động tấn công
                    break;
            }

            // Timeout linh hoạt theo độ khó (Khó thì cho phép tính lâu hơn)
            const maxWait = difficulty === 'hard' ? 15000 : 8000;

            this.timeoutId = setTimeout(() => {
                if (this.resolvePromise) {
                    console.warn("Stockfish timeout, returning best available...");
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
