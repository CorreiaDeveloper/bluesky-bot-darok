import dotenv from 'dotenv';
dotenv.config();


/*****************************************************      REPLIES     *********************************************************************************/
export const ENABLE_REPLIES = false; // ATIVAR/DESATIVAR MENSAGENS PRONTAS (PARAMETRIZAR MENSAGENS EM src/utils/readyMadeReplies/ReadyMadeRepliesList.js)
export const REPLIE_INTERVAL_IN_SECONDS = 15 //QUANTIDADE EM SEGUNDOS PARA EFETUAR CADA REPLIE -- FORTEMENTE SUGERIDO A DEIXAR MAIOR OU IGUAL A 15
/*****************************************************      REPLIES     *********************************************************************************/

/*****************************************************      LIKES     *********************************************************************************/
export const ENABLE_LIKES = true; // ATIVAR/DESATIVAR LIKES
export const LIKE_INTERVAL_IN_SECONDS = 15 //QUANTIDADE EM SEGUNDOS PARA EFETUAR CADA LIKE -- FORTEMENTE SUGERIDO A DEIXAR MAIOR OU IGUAL A 15
/*****************************************************      LIKES     *********************************************************************************/

export const DETAILED_LOGS = false; // ATIVAR/DESATIVAR LOGS DETALADOS