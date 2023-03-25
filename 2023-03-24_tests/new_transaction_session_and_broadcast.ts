#!ts-node

import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import base58 from 'bs58'

const util = require('util')

const account1 = Keypair.fromSecretKey(base58.decode('4cpiUyniYK2JLDXRbTqrQgqHwLALYyEvzQKpB3tVSnvXR7cUrB3MRZ6m5Evfmnqqv62VPVEVRpk1ubToWF2bqeM8'))
const account2 = Keypair.fromSecretKey(base58.decode('3fL6jFNavnKcaNExv2ECXxKr8Gf6LLfFBrxAnRiD6o9PNepkGGyhAS4o7FMifDi7yRDynY9DWe2DxGRC6VrtKbMK'))

async function main() {
  console.log("Client: Create transaction session")

  const connection = new Connection('https://api.devnet.solana.com')
  //const connection = new Connection('http://127.0.0.1:8899')

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: account1.publicKey,
      toPubkey: account2.publicKey,
      lamports: LAMPORTS_PER_SOL * 0.01
    })
  )

  tx.feePayer = account1.publicKey

  const latestBlockhash = await connection.getLatestBlockhash()
  tx.recentBlockhash = latestBlockhash.blockhash

  // Client: SDK serializes it
  const serializedTx = tx.serialize({requireAllSignatures: false}).toString('base64')

  console.log("Transaction:", util.inspect((tx as any).toJSON(),{depth:null}))
  //console.log("Transaction:", serializedTx)

  const result = await fetch("http://localhost:3001/transaction_session", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({'transaction': serializedTx})
  })

  console.log(await result.json())

  console.log("Broadcast...")

  // This may change the recentBlockhash, but must not be a problem
  const sig = await connection.sendTransaction(tx, [account1])

  console.log("Sig:", sig)
}

main().then(null, console.error)
