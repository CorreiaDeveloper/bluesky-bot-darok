import dotenv from 'dotenv';
import agent, { login } from './src/api/blueskyApi.js';
import { subscribeRepos } from 'atproto-firehose';
import { findPostsAndLikes } from './src/services/likeService.js';
import { findAndHandleNonMutualFollows, getAllFollowing, getAllFollowers } from './src/services/followService.js';
import { formatError } from './src/utils/errorUtils.js';
import { printAuthenticationMessage } from './src/utils/welcome.js'

dotenv.config();

async function initialize() {
    try {
        await login(); // Garantir que estamos autenticados
        printAuthenticationMessage();
        // Obtendo seguidores e contas seguidas
        const Follower = await getAllFollowers();
        const Following = await getAllFollowing();

        //Contagem de seguidores e seguidos
        const initialFollowerCount = Follower.length;
        const initialFollowingCount = Following.length;

        // Log com a contagem de seguidores e contas seguidas
        console.log(`Iniciando bot com ${initialFollowerCount} seguidores e ${initialFollowingCount} seguidos`);

        const intervalorEntreRequisicoes = process.env.INTERVAL_IN_MINUTES_BETWEEN_REQUESTS * 60 * 1000; // minuto em milissegundos

        setInterval(async () => {
            try {
                await findAndHandleNonMutualFollows(initialFollowerCount, initialFollowingCount);
            } catch (error) {
                console.error('Erro ao executar findAndHandleNonMutualFollows:', formatError(error));
            }
        }, intervalorEntreRequisicoes);

        const client = subscribeRepos("wss://bsky.network", { decodeRepoOps: true });
        findPostsAndLikes(client, agent);

    } catch (error) {
        console.error('Erro durante a inicialização:', formatError(error));
    }
}

initialize();