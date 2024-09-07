import dotenv from 'dotenv';
import agent, { login } from './src/api/blueskyApi.js';
import { subscribeRepos } from 'atproto-firehose';
import { findPostsAndLikes } from './src/services/likeService.js';
import { findAndHandleNonMutualFollows, getAllFollowing, getAllFollowers } from './src/services/followService.js';
import { formatError } from './src/utils/errorUtils.js';

dotenv.config();

async function initialize() {
    try {
        console.log(`
            _____                       _               ____   _                _____  _             ____          _
           |  __ \\                     | |             |  _ \\ | |              / ____|| |           |  _ \\        | |
           | |  | |  __ _  _ __   ___  | | __  ______  | |_) || | _   _   ___ | (___  | | __ _   _  | |_) |  ___  | |_
           | |  | | / _\` || '__| / _ \\ | |/ / |______| |  _ < | || | | | / _ \\ \\___ \\ | |/ /| | | | |  _ <  / _ \\ | __|
           | |__| || (_| || |   | (_) ||   <           | |_) || || |_| ||  __/ ____) ||   < | |_| | | |_) || (_) || |_
           |_____/  \\__,_||_|    \\___/ |_\\_\\           |____/ |_| \\__,_| \\___||_____/ |_\\_\\ \\__,  | |____/  \\___/  \\__|
                                                                                              __/ |
                                                                                             |___/`);

        await login(); // Garantir que estamos autenticados
        const currentTime = new Date().toLocaleTimeString();
        console.log(`Autenticado com sucesso!! Hora: ${currentTime}`);
        
        // Obtendo seguidores e contas seguidas
        const allFollowers = await getAllFollowers();
        const allFollowing = await getAllFollowing();
        
        // Log com a contagem de seguidores e contas seguidas
        console.log(`Iniciando bot com ${allFollowers.length} seguidores e seguindo ${allFollowing.length} contas`);

        const intervalorEntreRequisicoes = process.env.INTERVAL_IN_MINUTES_BETWEEN_REQUESTS * 60 * 1000; // minuto em milissegundos

        setInterval(async () => {
            try {
                await findAndHandleNonMutualFollows();
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