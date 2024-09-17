// replieQueue.js

import { DETAILED_LOGS, REPLIE_INTERVAL_IN_SECONDS } from '../../config/config.js';

const REPLIE_INTERVAL_MS = REPLIE_INTERVAL_IN_SECONDS * 1000; 

class ReplieQueue {
    constructor() {
        this.queue = [];
        this.maxSize = 10;
        this.isProcessing = false;
    }

    addReplie(uri, cid, action) {
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
                console.log(`Processando comentário. Tamanho atual da fila: ${this.queue.length}`);

            try {
                await action(uri, cid);
            } catch (error) {
                console.error(`Erro ao processar a comentário no post ${uri}:`, formatError(error));
            }

            await this.sleep(REPLIE_INTERVAL_MS);
        }

        this.isProcessing = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const replieQueue = new ReplieQueue();
