import { AtpAgent } from '@atproto/api';

const agent = new AtpAgent({
    service: 'https://bsky.social'
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
