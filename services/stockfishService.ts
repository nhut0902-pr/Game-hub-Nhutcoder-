
import { BotDifficulty } from '../types';

class StockfishService {
    private worker: Worker | null = null;
    private isReady: boolean = false;
    private isBusy: boolean = false;
    private resolvePromise: ((move: string) => void) | null = null;
    private timeoutId: any = null;
    private initAttempts: number = 0;
    private maxInitAttempts: number = 30; // Tăng thêm số lần thử

    constructor() {
        this.tryInit();
    }

    private tryInit() {
        // Kiểm tra cả 2 biến global phổ biến mà Stockfish.js có thể sử dụng
        const SF = (window as any).Stockfish || (window as any).stockfish;
        
        if (typeof SF === 'function') {
            console.log("Stockfish library detected successfully.");
            this.init(SF);
        } else if (this.initAttempts < this.maxInitAttempts) {
            this.initAttempts++;
            
            // Nếu sau 5 lần thử (5 giây) vẫn chưa thấy, hãy thử nạp lại script thủ công
            if (this.initAttempts === 5) {
                console.warn("Attempting manual script injection for Stockfish...");
                this.injectScript();
            }

            console.warn(`Stockfish not found yet, retrying... (${this.initAttempts}/${this.maxInitAttempts})`);
            setTimeout(() => this.tryInit(), 1000);
        } else {
            console.error("Critical: Stockfish library could not be loaded. Engine features will be disabled.");
        }
    }

    private injectScript() {
        const scriptId = 'stockfish-manual-inject';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";
        script.async = true;
        document.head.appendChild(script);
    }

    private init(SF: any) {
        try {
            if (this.worker) this.worker.terminate();
            // Khởi tạo worker
            // Một số bản Stockfish.js yêu cầu 'new SF()', một số chỉ 'SF()'
            try {
                this.worker = new SF();
            } catch (e) {
                this.worker = SF();
            }
            this.setupWorker();
        } catch (e) {
            console.error('Failed to instantiate Stockfish Worker:', e);
        }
    }

    private setupWorker() {
        if (!this.worker) return;

        this.worker.onerror = (e) => {
            console.error("Stockfish Worker Internal Error:", e);
            this.isReady = false;
            this.isBusy = false;
            this.handleCrash();
        };

        this.worker.onmessage = (event: any) => {
            const line = typeof event === 'string' ? event : event.data;
            if (typeof line !== 'string') return;

            // console.debug("SF Log:", line); // Debugging

            if (line === 'uciok') {
                this.worker?.postMessage('setoption name Threads value 4');
                this.worker?.postMessage('setoption name Hash value 128');
                this.worker?.postMessage('isready');
            } else if (line === 'readyok') {
                this.isReady = true;
                console.log("Stockfish Engine is ready for battle.");
            } else if (line.startsWith('bestmove')) {
                const parts = line.split(' ');
                const move = parts[1];
                this.isBusy = false;
                if (this.resolvePromise) {
                    if (this.timeoutId) clearTimeout(this.timeoutId);
                    this.resolvePromise(move);
                    this.resolvePromise = null;
                }
            }
        };

        this.worker.postMessage('uci');
    }

    private handleCrash() {
        if (this.resolvePromise) {
            this.resolvePromise('(none)');
            this.resolvePromise = null;
        }
        // Thử khởi động lại sau 3 giây
        setTimeout(() => this.tryInit(), 3000);
    }

    public async getBestMove(fen: string, difficulty: BotDifficulty): Promise<string | null> {
        if (!this.isReady || !this.worker) {
            if (!this.worker) this.tryInit();
            return null;
        }

        if (this.isBusy) return null;

        return new Promise((resolve) => {
            this.isBusy = true;
            this.resolvePromise = resolve;

            let depth = 10;
            let skillLevel = 10;

            switch (difficulty) {
                case 'easy': depth = 4; skillLevel = 0; break;
                case 'medium': depth = 8; skillLevel = 8; break;
                case 'hard': depth = 15; skillLevel = 20; break;
            }

            const maxWait = difficulty === 'hard' ? 20000 : 10000;

            this.timeoutId = setTimeout(() => {
                if (this.resolvePromise) {
                    console.warn("Stockfish timeout reached, forcing response.");
                    this.isBusy = false;
                    this.worker?.postMessage('stop');
                }
            }, maxWait);

            this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
            this.worker?.postMessage(`position fen ${fen}`);
            this.worker?.postMessage(`go depth ${depth}`);
        });
    }

    public terminate() {
        this.worker?.terminate();
        this.worker = null;
        this.isReady = false;
        this.isBusy = false;
    }
}

export const stockfishService = new StockfishService();
