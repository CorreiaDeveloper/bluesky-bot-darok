import { AtpAgent } from '@atproto/api';
import { API_SERVICE_URL } from '../config/config.js';

const agent = new AtpAgent({
    service: API_SERVICE_URL
});

export const login = async () => {
    if (!process.env.BSKY_HANDLE || !process.env.BSKY_APP_PASSWORD) {
        throw new Error('BSKY_HANDLE and BSKY_APP_PASSWORD must be set');
    }
    await agent.login({
        identifier: process.env.BSKY_HANDLE,
        password: process.env.BSKY_APP_PASSWORD,
    });
};

export default agent;
