## Changelog

### Features 
![Features 2024](https://img.shields.io/badge/2024-features-E6007A?style=for-the-badge&logoColor=white)
- Implementado gerenciamento de filas para processar curtidas com um intervalo configurável pelo usuário, medido em segundos, entre as ações. Isso torna as curtidas mais naturais e evita que posts recentes sejam curtidos imediatamente após sua publicação.
- Adicionada a funcionalidade de resposta automática a posts com mensagens configuráveis e aleatórias. Agora, o sistema pode responder a posts com uma resposta aleatória selecionada da lista `GENERIC_REPLIES`, com verificações adicionais para garantir que respostas não sejam enviadas quando a lista estiver vazia.
- Implementada a funcionalidade de 'fila' para o serviço de respostas (replies), com intervalos configuráveis em `config.js`, semelhante ao sistema de likes.
- Agora os likes e os Replies podem ser ligados e desligados separadamente, além de terem um intervalo em segundos para cada requisição, também individual de cada um.

### Bug fixes
![Bug fixes 2024](https://img.shields.io/badge/2024-bugs-blue?style=for-the-badge&logoColor=white)
- Correção em followService onde o mesmo estava realizando a contagem incorreta do total de contas seguidas desde o acionamento do bot
