import dotenv from 'dotenv';
dotenv.config();

export const LIKE_INTERVAL_IN_SECONDS = 15 //QUANTIDADE EM SEGUNDOS PARA EFETUAR CADA LIKE -- FORTEMENTE SUGERIDO A DEIXAR MAIOR OU IGUAL A 15
export const DETAILED_LOGS = false; // ATIVAR/DESATIVAR LOGS DETALADOS
export const ENABLE_REPLIES = false; // ATIVAR/DESATIVAR MENSAGENS PRONTAS (NECESSÁRIO PARAMETRIZAR MENSAGENS EM ReadyMadeRepliesList.js)