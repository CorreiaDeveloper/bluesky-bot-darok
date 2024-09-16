import dotenv from 'dotenv';
dotenv.config();
import { ComAtprotoSyncSubscribeRepos } from 'atproto-firehose';
import { formatError } from '../utils/errorUtils.js';
import { badEnglishWords, updateBadEnglishWords } from '../utils/badWords/getAndUpdateRelatedBadWords.js';
import { badWords } from '../utils/badWords/badWordsList.js';
import { likeQueue } from '../utils/likeQueue.js'; // Importa a fila de curtidas
import { ENABLE_REPLIES } from './../config/config.js';
import { GENERIC_REPLIES } from './../utils/readyMadeReplies/ReadyMadeRepliesList.js';

// Obter palavras e frases das variáveis de ambiente
const unwantedWordsEnv = (process.env.UNWANTED_WORDS ?? '').split(',');
const requiredWords = (process.env.REQUIRED_WORDS ?? '').split(',');

const logPostsLiked = (likedPostsCount, reply = '') => {
    const message = reply
        ? `Posts curtidos e comentados pelas palavras-chave: ${likedPostsCount} - Resposta usada: "${reply}"`
        : `Posts curtidos pelas palavras-chave: ${likedPostsCount}`;
    console.log(message);
};


// Função para executar o processo de encontrar posts, curtir e responder
export const findPostsAndLikes = async (client, agent) => {
    try {
        // Atualizar as bad words em inglês com palavras relacionadas
        await updateBadEnglishWords();

        // Combinar as palavras indesejadas do .env com as palavras do arquivo badWords.js
        const unwantedWordsFilter = [...new Set([...unwantedWordsEnv, ...badWords, ...badEnglishWords])];

        // Variável para contar o número de posts curtidos globalmente
        let likedPostsCount = 0;

        client.on('message', async (m) => {
            if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
                for (const op of m.ops) {
                    const payload = op.payload;

                    if (!payload || payload.$type !== 'app.bsky.feed.post') continue;

                    // Convertendo o texto para minúsculo
                    const text = payload.text.toLowerCase();

                    // Verifica se o texto contém as REQUIRED_WORDS no arquivo .env
                    const containsRequiredWords = requiredWords.some(word => text.includes(word));

                    // Verifica se o texto contém as UNWANTED_WORDS no arquivo .env + palavras do badWords.js
                    const containsUnwantedWords = unwantedWordsFilter.some(word => text.includes(word));

                    // Se o texto contém palavras obrigatórias e não contém palavras indesejadas
                    if (containsRequiredWords && !containsUnwantedWords) {
                        const uri = `at://${m.repo}/${op.path}`;
                        const cid = op.cid.toString();

                        // Adiciona a curtida à fila e processa a fila
                        likeQueue.addLike(uri, cid, async (uri, cid) => {
                            try {
                                await agent.like(uri, cid);
                                // Incrementa a contagem de posts curtidos após confirmação de que a curtida foi realizada
                                likedPostsCount++;

                                const shouldReply = ENABLE_REPLIES && GENERIC_REPLIES.length > 0;
                                const reply = shouldReply ? GENERIC_REPLIES[Math.floor(Math.random() * GENERIC_REPLIES.length)] : '';

                                if (ENABLE_REPLIES && GENERIC_REPLIES.length === 0) {
                                    console.log('Respostas estão ativas, mas não há respostas prontas');
                                }

                                if (shouldReply) {
                                    await agent.post({ reply: { root: { cid: cid, uri: uri }, parent: { cid: cid, uri: uri } }, text: reply });
                                }

                                logPostsLiked(likedPostsCount, reply);

                            } catch (error) {
                                console.error(`Erro ao curtir e/ou responder o post ${uri}:`, formatError(error));
                            }
                        });
                    }
                }
            }
        });

        client.on("error", (e) => {
            console.error(formatError(e));
        });

    } catch (error) {
        console.error('Erro ao processar os posts ou bad words:', error);
    }
};
