export const badEnglishWords = [
    'asshole',
    'nigga',
    'ngga',
    'nigger',
    'bastard',
    'bitch',
    'blowjob',
    'bomb',
    'bugger',
    'cunt',
    'cock',
    'dick',
    'dumbass',
    'faggot',
    'fuck',
    'mother fucker',
    'prick',
    'pussy',
    'shit',
    'slut',
    'son of a bitch',
    'twat',
    'wanker',
    'clit',
    'cockface',
    'cuntface',
    'fuckstick',
    'prickface',
    'shitheap',
    'spastic',
    'tit',
    'titties',
    'wankstain',
    'wuss',
    'abuse',
    'aggression',
    'alcohol',
    'alcoholism',
    'anorexia',
    'blackmail',
    'coercion',
    'drugs',
    'drug',
    'illicit drugs',
    'heavy drugs',
    'extortion',
    'fetish',
    'homicide',
    'incest',
    'insult',
    'gambling',
    'madness',
    'massacre',
    'mutilation',
    'nudity',
    'pornography',
    'pedophilia',
    'prostitution',
    'satanism',
    'sex',
    'sexual',
    'suffocation',
    'suicide',
    'terrorism',
    'torture',
    'trafficking',
    'violence',
    'sexual violence',
    'addiction',
    'abuse',
    'self harm',
    'destruction',
    'cruelty',
    'dishonesty',
    'exploitation',
    'offender',
    'manipulation',
    'mistreatment',
    'pornography',
    'violation',
  ];

// cache para armazenar palavras relacionadas já obtidas
const cache = new Map();

// funçao para obter palavras relacionadas usando a API Datamuse
async function getRelatedBadWords(word) {
    if (cache.has(word)) {
        return cache.get(word);
    }

    try {
        const response = await fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=1`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        const relatedWords = data.map(entry => entry.word);
        cache.set(word, relatedWords); // armazena no cache

        return relatedWords;
    } catch (error) {
        console.error('Erro ao obter palavras relacionadas:', error);
        return [];
    }
}

// funçao para atualizar a lista de badWords em ingles com palavras relacionadas
export async function updateBadEnglishWords() {
    const wordsToCheck = badEnglishWords.slice(); // cria uma cópia para evitar modificações no array original
    
    // processar palavras em paralelo, limitando o numero de reqs por lote
    const BATCH_SIZE = 10;

    for (let i = 0; i < wordsToCheck.length; i += BATCH_SIZE) {
        const batch = wordsToCheck.slice(i, i + BATCH_SIZE);
        const promises = batch.map(word => getRelatedBadWords(word));
        const results = await Promise.all(promises);

        // Adiciona as palavras relacionadas na lista
        results.flat().forEach(word => {
            if (!badEnglishWords.includes(word)) {
                badEnglishWords.push(word);
            }
        });
    }
}

// testar o script
// updateBadEnglishWords().catch(err => {console.error(err);});