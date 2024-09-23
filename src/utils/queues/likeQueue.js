import { DETAILED_LOGS, LIKE_INTERVAL_IN_SECONDS } from '../../config/config.js';
import { updatePoints, canAddPoints, COST_POINTS_CREATE } from '../updatePoints.js'; // Ajuste o caminho conforme necessário

const LIKE_INTERVAL_MS = LIKE_INTERVAL_IN_SECONDS * 1000;

class LikeQueue {
    constructor() {
        this.queue = [];
        this.maxSize = 10;
        this.isProcessing = false;
    }

    addLike(uri, cid, action) {
        if (this.queue.length >= this.maxSize) {
            if (DETAILED_LOGS)
                console.log('Fila cheia. Aguardando processamento.');
            return;
        }

        this.queue.push({ uri, cid, action });

        if (DETAILED_LOGS)
            console.log(`Item adicionado à fila. Tamanho atual da fila: ${this.queue.length}`);

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const { uri, cid, action } = this.queue.shift();
            if (DETAILED_LOGS)
                console.log(`Processando curtida. Tamanho atual da fila: ${this.queue.length}`);

            try {
                if (canAddPoints(COST_POINTS_CREATE)) {
                    await action(uri, cid);
                    updatePoints(COST_POINTS_CREATE); // Atualiza os pontos após a ação ser realizada
                } else {
                    console.log('Limite de pontos atingido. Aguardando reset.');
                }
            } catch (error) {
                console.error(`Erro ao processar a curtida no post ${uri}:`, formatError(error));
            }

            await this.sleep(LIKE_INTERVAL_MS);
        }

        this.isProcessing = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const likeQueue = new LikeQueue();
