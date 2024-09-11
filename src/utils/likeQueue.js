// likeQueue.js

import { LOGS, LIKE_INTERVAL } from '../config/config.js';

const LIKE_INTERVAL_MS = LIKE_INTERVAL * 1000; 

class LikeQueue {
    constructor() {
        this.queue = [];
        this.maxSize = 10;
        this.isProcessing = false;
    }

    addLike(uri, cid, action) {
        if (this.queue.length >= this.maxSize) {
            if (LOGS)
                console.log('Fila cheia. Aguardando processamento.');
            return;
        }

        this.queue.push({ uri, cid, action });

        if (LOGS)
            console.log(`Item adicionado à fila. Tamanho atual da fila: ${this.queue.length}`);

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const { uri, cid, action } = this.queue.shift();
            if (LOGS)
                console.log(`Processando curtida. Tamanho atual da fila: ${this.queue.length}`);

            try {
                await action(uri, cid);
            } catch (error) {
                console.error(`Erro ao processar a curtida no post ${uri}:`, formatError(error));
            }

            // Aguarda 15 segundos antes de processar o próximo item
            await this.sleep(LIKE_INTERVAL_MS);
        }

        this.isProcessing = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const likeQueue = new LikeQueue();
