import { AtpAgent } from '@atproto/api'

import {
  ComAtprotoSyncSubscribeRepos,
  subscribeRepos,
} from 'atproto-firehose'

import type { SubscribeReposMessage } from 'atproto-firehose'

const agent = new AtpAgent({
  service: 'https://bsky.social'
})

if (!process.env.BSKY_HANDLE || !process.env.BSKY_APP_PASSWORD) {
  throw new Error('BSKY_HANDLE and BSKY_APP_PASSWORD must be set')
}

await agent.login({
  identifier: process.env.BSKY_HANDLE,
  password: process.env.BSKY_APP_PASSWORD,
})

const client = subscribeRepos(`wss://bsky.network`, { decodeRepoOps: true })
client.on('message', (m: SubscribeReposMessage) => {
  if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
    // console.log(m)

    m.ops.forEach((op) => {
      if (op.payload?.$type !== 'app.bsky.feed.post') return;
      if (!op.payload?.reply) return;
      if (!(op.payload.text as string).toLowerCase().startsWith("galvão"))  return;

      console.log({
        cid: op.cid,
        uri: `at://${m.repo}/${op.path}`,
        repo: m.repo,
      })
      console.log(`at://${m.repo}/${op.path}`)

      agent.post({
        text: `Diga lá, Tino!`,
        reply: {
          root: op.payload.reply.root,
          parent: {
            cid: op.cid.toString(),
            uri: `at://${m.repo}/${op.path}`,
          },
        }
      })
    })
  }
})

client.on("error", (e) => {
  console.error(e)
})