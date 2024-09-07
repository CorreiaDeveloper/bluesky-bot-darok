import agent from '../api/blueskyApi.js';
import { retryRequest } from '../utils/retryRequest.js';
import { formatError } from '../utils/errorUtils.js';
import dotenv from 'dotenv';
dotenv.config();

const alwaysFollowThisUser = (process.env.BSKY_ALWAYS_FOLLOW_USER ?? '').split(',').map(user => user.trim());
const neverFollowWithThisUser = (process.env.BSKY_NEVER_INTERACT_USER ?? '').split(',').map(user => user.trim());
const actorHandle = process.env.BSKY_HANDLE;

export async function findAndHandleNonMutualFollows() {
    try {

        const allFollowers = await getAllFollowers();
        console.log(`\nTotal de seguidores atualizado: ${allFollowers.length}`);
        const followerDIDs = new Set(allFollowers.map(f => f.did));

        const allFollowing = await getAllFollowing();
        console.log(`Total de contas seguidas atualizado: ${allFollowing.length}\n`);
        const followingDIDs = new Set(allFollowing.map(f => f.did));

        // Perfis que você segue, mas que não te seguem de volta (e não estão na lista de sempre seguir).
        const notFollowingBack = allFollowing.filter(followingAccount =>
            !followerDIDs.has(followingAccount.did) &&
            !neverFollowWithThisUser.includes(followingAccount.handle) &&
            !alwaysFollowThisUser.includes(followingAccount.handle) // Excluir usuários que você sempre segue.
        );

        // Perfis que te seguem, mas que você não segue de volta (e que não estão na lista de nunca seguir).
        const notFollowedByYou = allFollowers.filter(follower => !followingDIDs.has(follower.did) &&
            !neverFollowWithThisUser.includes(follower.handle)
        );

        // Perfis listados em alwaysFollowThisUser, mas removendo quem você já segue.
        const usersToFollow = alwaysFollowThisUser.filter(handle =>
            !allFollowing.some(followingAccount => followingAccount.handle === handle)
        );

        // Perfis Listados em neverFollowWithThisUser, que você segue.
        const usersToUnfollow = allFollowing.filter(followingAccount =>
            neverFollowWithThisUser.some(handle => handle.toLowerCase() === followingAccount.handle.toLowerCase()) &&
            !alwaysFollowThisUser.some(handle => handle.toLowerCase() === followingAccount.handle.toLowerCase())
        );

        // Mostrar quem você segue, mas que não te seguem de volta
        if (notFollowingBack.length > 0) {
            console.log('Perfis que você segue, mas que não te seguem de volta:');
            notFollowingBack.forEach(async (account) => {
                console.log(`- ${account.handle}`);
                try {
                    await agent.deleteFollow(account.viewer?.following ?? '');
                    console.log(`Deixou de seguir ${account.handle}`);
                } catch (error) {
                    console.error(`Erro ao deixar de seguir ${account.handle}:`, formatError(error));
                }
            });
        } else {
            console.log('Todos que você segue estão te seguindo de volta.');
        }

        // Mostrar quem te segue, mas você não segue de volta e seguir de volta
        if (notFollowedByYou.length > 0) {
            console.log('Perfis que te seguem, mas que você não segue de volta:');
            // Listar todos os perfis que te seguem, mas que você não segue de volta
            notFollowedByYou.forEach(account => {
                console.log(`- ${account.handle}`);
            });

            console.log('\nSeguindo todos de volta...');
            // Seguir de volta e listar os perfis seguidos de volta
            for (const account of notFollowedByYou) {
                try {
                    await retryRequest(() => agent.follow(account.did));
                } catch (error) {
                    console.error(`Erro ao seguir de volta ${account.handle}:`, formatError(error));
                }
            }
        } else {
            console.log('Você segue todos que te seguem de volta.');
        }

        // Seguir os usuários de alwaysFollowThisUser que eu não sigo
        for (const handle of usersToFollow) {
            try {
                // Obter perfil do usuário para obter o DID
                const { data } = await agent.getProfile({ actor: handle });
                const userDid = data.did;

                if (userDid) {
                    await retryRequest(() => agent.follow(userDid));
                    console.log(`Seguindo ${handle}, pois está configurado para sempre ser seguido`);
                }
            } catch (error) {
                console.error(`Erro ao seguir ${handle}:`, formatError(error));
            }
        }

        if (usersToUnfollow.length > 0) {
            console.log('Deixando de seguir usuários da lista Nunca Seguir:');
            // Filtrar apenas os usuários que você está seguindo
            const toUnfollowFiltered = usersToUnfollow.filter(account => followingDIDs.has(account.did));
            toUnfollowFiltered.forEach(async (account) => {
                const followUri = account.viewer?.following ?? '';
                try {
                    await retryRequest(() => agent.deleteFollow(followUri));
                    console.log(`Deixou de seguir ${account.handle}`);
                } catch (error) {
                    console.error(`Erro ao deixar de seguir ${account.handle}:`, formatError(error));
                }
            });
        }


    } catch (error) {
        console.error('Erro ao processar relações de seguidores:', formatError(error));
    }
}

// Obter a lista completa de seguidores
export async function getAllFollowers() {
    let allFollowers = [];
    let cursorFollowers = undefined;

    try {
        do {
            const followersResponse = await agent.api.app.bsky.graph.getFollowers({
                actor: actorHandle,
                limit: 100,
                cursor: cursorFollowers
            });
            allFollowers = allFollowers.concat(followersResponse.data.followers);
            cursorFollowers = followersResponse.data.cursor;
        } while (cursorFollowers);
    } catch (error) {
        console.error(`Erro ao obter seguidores: ${error}`);
    }

    return allFollowers;
}

// Obter a lista completa de contas que você está seguindo
export async function getAllFollowing() {
    let allFollowing = [];
    let cursorFollowing = undefined;

    try {
        do {
            const followingResponse = await agent.api.app.bsky.graph.getFollows({
                actor: actorHandle,
                limit: 100,
                cursor: cursorFollowing
            });
            allFollowing = allFollowing.concat(followingResponse.data.follows);
            cursorFollowing = followingResponse.data.cursor;
        } while (cursorFollowing);
    } catch (error) {
        console.error(`Erro ao obter contas seguidas: ${error}`);
    }

    return allFollowing;
}

