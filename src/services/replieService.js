import { replieQueue } from '../utils/queues/replieQueue.js';
import { GENERIC_REPLIES } from '../utils/readyMadeReplies/ReadyMadeRepliesList.js';
import { formatError } from '../utils/errorUtils.js';

// Variável para contar o número de posts respondidos globalmente
let repliedPostsCount = 0;

const logPostsReplied = (replyMessage, repliedPostsCount) => {
    console.log(`Posts comentados pelas palavras-chave: ${repliedPostsCount} - Resposta usada: "${replyMessage}"`);
};

export const replyToPosts = async (agent, uri, cid) => {
    try {
        const replyMessage = GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)];

        if (GENERIC_REPLIES.length === 0)
            console.log('Respostas estão ativas, mas não há respostas prontas');

        // Adiciona o comentário à fila de respostas
        replieQueue.addReplie(uri, cid, async (uri, cid) => {
            await agent.post({
                reply: {
                    root: { cid: cid, uri: uri },
                    parent: { cid: cid, uri: uri }
                },
                text: replyMessage
            });

            repliedPostsCount++; // Incrementa a contagem após a resposta ser enviada
            logPostsReplied(replyMessage, repliedPostsCount); // Log da resposta e contagem
        });
    } catch (error) {
        console.error(`Erro ao responder o post ${uri}:`, formatError(error));
    }
};
