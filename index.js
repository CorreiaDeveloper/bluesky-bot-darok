import dotenv from 'dotenv';
import agent, { login } from './src/api/blueskyApi.js';
import { subscribeRepos } from 'atproto-firehose';
import { findAndHandleNonMutualFollows, getAllFollowing, getAllFollowers } from './src/services/followService.js';
import { formatError } from './src/utils/errorUtils.js';
import { printAuthenticationMessage } from './src/utils/welcome.js';
import { atprotoSubscribeRepos } from './src/utils/atprotoSubscribeRepos.js';  // Importa o handler de mensagens

dotenv.config();

async function initialize() {
    try {
        await login();  // Garantir que estamos autenticados
        printAuthenticationMessage();

        // Obtendo seguidores e contas seguidas
        const Follower = await getAllFollowers();
        const Following = await getAllFollowing();
        const initialFollowerCount = Follower.length;
        const initialFollowingCount = Following.length;

        const intervalorEntreRequisicoes = process.env.INTERVAL_IN_MINUTES_BETWEEN_REQUESTS * 60 * 1000;  // minuto em milissegundos
        const client = subscribeRepos("wss://bsky.network", { decodeRepoOps: true });

        console.log(`Iniciando bot com ${initialFollowerCount} seguidores e ${initialFollowingCount} seguidos`);

        // Executa o processo de encontrar perfis que não seguem de volta periodicamente
        setInterval(async () => {
            try {
                await findAndHandleNonMutualFollows(initialFollowerCount, initialFollowingCount);
            } catch (error) {
                console.error('Erro ao executar findAndHandleNonMutualFollows:', formatError(error));
            }
        }, intervalorEntreRequisicoes);

        // Processa curtidas e respostas a posts usando o handler de mensagens
        atprotoSubscribeRepos(client, agent);

    } catch (error) {
        console.error('Erro durante a inicialização:', formatError(error));
    }
}

initialize();
