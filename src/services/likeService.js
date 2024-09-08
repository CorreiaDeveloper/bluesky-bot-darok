import { retryRequest } from '../utils/retryRequest.js';
import dotenv from 'dotenv';
dotenv.config();
import { ComAtprotoSyncSubscribeRepos } from 'atproto-firehose';
import { formatError } from '../utils/errorUtils.js';
import { badEnglishWords, updateBadEnglishWords } from '../utils/badWords/getAndUpdateRelatedBadWords.js';
import { badWords } from '../utils/badWords/badWordsList.js';

// Obter palavras e frases das variáveis de ambiente
const unwantedWordsEnv = (process.env.UNWANTED_WORDS ?? '').split(',');
const requiredWords = (process.env.REQUIRED_WORDS ?? '').split(',');

// Função para executar o processo de encontrar posts e curtidas
export const findPostsAndLikes = async (client, agent) => {
    try {
        // Atualizar as bad words em inglês com palavras relacionadas
        await updateBadEnglishWords();

        // Combinar as palavras indesejadas do .env com as palavras do arquivo badWords.js
        const unwantedWordsFilter = [...new Set([...unwantedWordsEnv, ...badWords, ...badEnglishWords])];

        let likedPostsCount = 0; // Variável para contar o número de posts curtidos globalmente

        // Exibir a contagem inicial de posts curtidos
        console.log(`Posts curtidos pelas palavras-chave: ${likedPostsCount}`);

        client.on('message', (m) => {
            if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
                m.ops.forEach((op) => {
                    const payload = op.payload;

                    if (!payload || payload.$type !== 'app.bsky.feed.post') return;

                    // Convertendo o texto para minúsculo
                    const text = payload.text.toLowerCase();

                    // Verifica se o texto contém as REQUIRED_WORDS no arquivo .env
                    const containsRequiredWords = requiredWords.some(word => text.includes(word));

                    // Verifica se o texto contém as UNWANTED_WORDS no arquivo .env + palavras do badWords.js
                    const containsUnwantedWords = unwantedWordsFilter.some(word => text.includes(word));
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

    } catch (error) {
        console.error('Erro ao processar os posts ou bad words:', error);
    }
};
