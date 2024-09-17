import { likePosts } from './../services/likeService.js';
import { replyToPosts } from './../services/replieService.js';
import { formatError } from './errorUtils.js';
import { ComAtprotoSyncSubscribeRepos } from 'atproto-firehose';  // Importe para verificar commits
import { badEnglishWords, updateBadEnglishWords } from '../utils/badWords/getAndUpdateRelatedBadWords.js';
import { badWords } from '../utils/badWords/badWordsList.js';
import { ENABLE_REPLIES, ENABLE_LIKES } from './../config/config.js';

// Obter palavras e frases das variáveis de ambiente
const unwantedWordsEnv = (process.env.UNWANTED_WORDS ?? '').split(',');
const requiredWords = (process.env.REQUIRED_WORDS ?? '').split(',');
const shouldReply = ENABLE_REPLIES;
const shouldLike = ENABLE_LIKES;

// Atualiza as palavras indesejadas (sincronização)
await updateBadEnglishWords();

// Combinar as palavras indesejadas do .env com as palavras do arquivo badWords.js
const unwantedWordsFilter = [...new Set([...unwantedWordsEnv, ...badWords, ...badEnglishWords])];

export const atprotoSubscribeRepos = async (client, agent) => {
    client.on('message', async (m) => {
        // Verifica se a mensagem é um commit
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
                    try {
                        if (shouldLike)
                            await likePosts(agent, uri, cid);  // Curte o post

                        if (shouldReply)
                            await replyToPosts(agent, uri, cid);  // Responde o post
                    } catch (error) {
                        console.error(`Erro ao processar o post ${uri}:`, formatError(error));
                    }
                }
            }
        }
    });

    client.on('error', (error) => {
        console.error('Erro de conexão:', formatError(error));
    });
};