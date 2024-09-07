import { AtpAgent } from '@atproto/api'

import {
  ComAtprotoSyncSubscribeRepos,
  subscribeRepos,
} from 'atproto-firehose'

import type { SubscribeReposMessage } from 'atproto-firehose'

const agent = new AtpAgent({
  service: 'https://bsky.social'
})

const BSKY_HANDLE = ""
const BSKY_APP_PASSWORD = ""

if (!BSKY_HANDLE || !BSKY_APP_PASSWORD) {
  throw new Error('BSKY_HANDLE and BSKY_APP_PASSWORD must be set')
}

await agent.login({
  identifier: BSKY_HANDLE,
  password: BSKY_APP_PASSWORD,
})

const client = subscribeRepos(`wss://bsky.network`, { decodeRepoOps: true })
client.on('message', (m: SubscribeReposMessage) => {
  if (ComAtprotoSyncSubscribeRepos.isCommit(m)) {
    // console.log(m)

    m.ops.forEach((op) => {
      const payload = op.payload as any;
      const cidPadrao = op.cid !== null ? op.cid : "";
      if (payload?.$type !== 'app.bsky.feed.post') return;
      if (!payload?.reply) return;
      if (!(payload.text as string).toLowerCase().startsWith("testeapibsky"))  return;

      console.log({
        cid: op.cid,
        uri: `at://${m.repo}/${op.path}`,
        repo: m.repo,
      })
      console.log(`at://${m.repo}/${op.path}`)

      agent.post({
        text: `Diga lá, Tino!`,
        reply: {
          root: payload.reply.root,
          parent: {
            cid: cidPadrao.toString(),
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