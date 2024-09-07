import { retryRequest } from '../utils/retryRequest.js';

import dotenv from 'dotenv';
dotenv.config();
import { ComAtprotoSyncSubscribeRepos } from 'atproto-firehose';
import { formatError } from '../utils/errorUtils.js';

const unwantedWords = process.env.UNWANTED_WORDS.split(',');
const requiredWords = process.env.REQUIRED_WORDS.split(',');

export const findPostsAndLikes = (client, agent) => {
    let likedPostsCount = 0; // Variável para contar o número de posts curtidos globalmente

    // Exibir a contagem inicial de posts curtidos
    console.log(`Posts curtidos pelas palavras-chave: ${likedPostsCount}`);

    client.on('message', (m) => {
        if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
            m.ops.forEach((op) => {
                const payload = op.payload;

                if (!payload || payload.$type !== 'app.bsky.feed.post') return;

                // Convert the text to lowercase for comparison
                const text = payload.text.toLowerCase();

                // Check if the text contains any required words
                const containsRequiredWords = requiredWords.some(word => text.includes(word));

                // Check if the text contains any unwanted words
                const containsUnwantedWords = unwantedWords.some(word => text.includes(word));

                // If the text contains required words and doesn't contain unwanted words
                // Dentro do seu loop ou onde os posts são processados:
                if (containsRequiredWords && !containsUnwantedWords) {
                    const uri = `at://${m.repo}/${op.path}`;
                    const cid = op.cid.toString();

                    retryRequest(() => agent.like(uri, cid))
                        .then(() => {
                            // Incrementa a contagem de posts curtidos
                            likedPostsCount++;

                            // Atualiza a contagem no console
                            console.log(`Posts curtidos pelas palavras-chave: ${likedPostsCount}`);
                        })
                        .catch(error => {
                            console.error(`Erro ao curtir o post ${uri}:`, formatError(error));
                        });
                }
            });
        }
    });

    client.on("error", (e) => {
        console.error(formatError(e));
    });
};
