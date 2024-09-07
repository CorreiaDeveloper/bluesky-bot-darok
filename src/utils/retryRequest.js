import { formatError } from '../utils/errorUtils.js';

export async function retryRequest(func, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await func();
        } catch (error) {
            console.error(`Tentativa ${i + 1} falhou:`, formatError(error));
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
}
