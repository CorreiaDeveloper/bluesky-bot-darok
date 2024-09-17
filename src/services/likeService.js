import { likeQueue } from '../utils/queues/likeQueue.js';
import { formatError } from '../utils/errorUtils.js';

// Variável para contar o número de posts curtidos globalmente
let likedPostsCount = 0;

const logPostsLiked = () => {
    console.log(`Posts curtidos pelas palavras-chave: ${likedPostsCount}`);
};

export const likePosts = async (agent, uri, cid) => {
    try {
        // Adiciona a curtida à fila e processa a fila
        likeQueue.addLike(uri, cid, async (uri, cid) => {
            await agent.like(uri, cid);  // Executa a curtida
            likedPostsCount++;  // Incrementa o contador após a curtida ser concluída
            logPostsLiked();  // Exibe o log da contagem de curtidas
        });
    } catch (error) {
        console.error(`Erro ao curtir o post ${uri}:`, formatError(error));
    }
};
