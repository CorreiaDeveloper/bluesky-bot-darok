# Bluesky Bot

Um bot para a plataforma Bluesky que realiza ações automatizadas, como seguir perfis e curtir posts.

## Índice

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Descrição

Este bot interage com a plataforma Bluesky para realizar ações automatizadas. Ele pode seguir perfis, deixar de seguir perfis, curtir posts e gerenciar suas interações com outros usuários.

## Funcionalidades

- **Autenticação:** Conecta-se à plataforma Bluesky usando credenciais.
- **Seguir e Deixar de Seguir:** Gerencia seguidores e contas seguidas.
- **Curtir Posts:** Interage com posts na plataforma.
- **Registro e Monitoramento:** Gera logs detalhados e monitora interações.

## Pré-requisitos

Certifique-se de ter o Node.js e o npm instalados. Além disso, você precisará das seguintes dependências:

- `dotenv`
- `atproto-firehose`
- `@atproto/api`

## Instalação

1. Clone o repositório:

    ```bash
    git clone https://github.com/seu_usuario/seu_repositorio.git
    ```

2. Navegue até o diretório do projeto:

    ```bash
    cd seu_repositorio
    ```

3. Instale as dependências:

    ```bash
    npm install
    ```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto. Você pode editar o arquivo `.env.example` e configurar da sua maneira.


## Variáveis de Ambiente

Para rodar este projeto, você precisará configurar as seguintes variáveis de ambiente no seu arquivo `.env`:

- **`BSKY_HANDLE`**  
  Seu handle na plataforma Bluesky. Exemplo: `correiagabriel.bsky.social`

- **`BSKY_APP_PASSWORD`**  
  Sua senha para autenticação na plataforma Bluesky.

- **`UNWANTED_WORDS`**  
  Lista de palavras que o bot deve evitar interagir. Separe as palavras por vírgulas. Exemplo: `spam, promoção`

- **`REQUIRED_WORDS`**  
  Lista de palavras que o bot deve buscar para interagir. Separe as palavras por vírgulas. Exemplo: `importante, urgente, necessário`

- **`BSKY_ALWAYS_FOLLOW_USER`**  
  Handles de usuários que o bot deve seguir sempre, mesmo que o relacionamento não seja mútuo. Separe os handles por vírgulas. Exemplo: `usuario1.bsky.social, usuario2.bsky.social`

- **`BSKY_NEVER_INTERACT_USER`**  
  Handles de usuários que o bot deve evitar seguir ou interagir. Separe os handles por vírgulas. Exemplo: `usuario3.bsky.social, usuario4.bsky.social`

- **`INTERVAL_IN_MINUTES_BETWEEN_REQUESTS`**  
  Tempo (em minutos) entre as validações para seguir, e deixar de seguir.

Certifique-se de preencher essas variáveis corretamente para garantir que o bot funcione conforme esperado.

## Uso

Para iniciar o bot, execute:

```bash
node index.js
```

## Contribuição
Se você deseja contribuir para este projeto, siga estas etapas:

1. Faça um fork do repositório.

2. Crie uma branch para suas alterações:
```bash
git checkout -b minha-alteracao
```
3. Faça suas alterações e commit:
```bash
git commit -am 'Adiciona nova funcionalidade'
```
4. Envie para o repositório remoto:
```bash
git push origin minha-alteracao
```
5. Crie uma pull request no GitHub:

    - **Usando a Interface Gráfica do GitHub:**
      - Vá até o repositório no GitHub.
      - Navegue para a aba "Pull requests".
      - Clique no botão "New pull request".
      - Selecione a branch que você criou e clique em "Create pull request".

    - **Usando a CLI do GitHub:**
      - Instale a CLI do GitHub, se ainda não tiver:
        ```bash
        gh extension install cli/gh-pull-request
        ```
      - Navegue até o diretório do seu repositório local e crie a pull request:
        ```bash
        gh pr create --base main --head minha-alteracao --title "Título da Pull Request" --body "Descrição da Pull Request"
        ```
## Licença
Este projeto está licenciado sob a MIT License. 
[MIT](https://choosealicense.com/licenses/mit/)