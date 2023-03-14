import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import express, { Router, Request, Response } from 'express'
import { transaction_session_store } from '../store'

import { v4 as uuid } from "uuid"

const router: Router = express.Router()

type GetResponseType = {
  state: string,
  err?: string | null,
  signature?: string
} 

const TRANSACTION_TIMEOUT = 15000

router.get('/transaction_session', async (req: Request, res: Response) => {

  console.log("Get transaction session")

  if (!req.query['transaction_session_id']) {
    res.status(400).send("No transaction session id")
    return
  }

  const transaction_session_id = req.query['transaction_session_id'].toString()

  if (!(transaction_session_id in transaction_session_store)) {
    return res.status(400).send("Invalid session id")
  }

  const session = transaction_session_store[transaction_session_id]

  console.log(session)

  // Timeout
  console.log(Date.now() - session['created_at'])
  if (Date.now() - session['created_at'] >= TRANSACTION_TIMEOUT) {
    session['state'] = 'timeout'
  }

  if (!(session['state'] in ['timeout', 'finalized'])) {
    // Get state of tx on blockchain

    const connection = new Connection('https://api.devnet.solana.com')
    //const connection = new Connection('http://127.0.0.1:8899')

    const txPublicKey = new PublicKey(session['public_key'])
    const txMessage = session['message']

    const sigsForAddress = await connection.getSignaturesForAddress(txPublicKey, {}, "confirmed")

    const sigs = sigsForAddress.map(item => item.signature)

    //console.log("Sigs:", sigs.join(', '))

    if(sigs.length) {

      const txs = await connection.getTransactions(sigs, "confirmed")

      for(const tx of txs) {

        if (tx == null) continue

        const { transaction: { message: tx_message, signatures: tx_signatures } } = tx

        const tx_sig = tx_signatures[0]

        const tx_message_base64 = tx_message.serialize().toString('base64')

        //console.log("TX by address")
        //console.log("Sig:", tx_sig)
        //console.log("Message:", tx_message_base64)

        if(tx_message_base64 == txMessage) {
          console.log("TARGET FOUND!")

          const origMeta = sigsForAddress.filter(item => item.signature == tx_sig)[0]
          console.log("Details:", origMeta)

          session['state'] = origMeta.confirmationStatus as ("confirmed" | "finalized")
          session['err'] = tx.meta?.err as (string | null)
          session['signature'] = tx_sig
        }
      }
    }
  }

  if(session['state'] in ['init', 'requested', 'timeout']) {
    res.status(200).send({
      state: session['state'],
    } as GetResponseType)
  } else {
    res.status(200).send({
      state: session['state'],
      err: session['err'] as (string | null),
      signature: session['signature'] as string
    } as GetResponseType)
  }
})

router.post('/transaction_session', (req: Request, res: Response) => {

  console.log("Create new transaction session")

  const transaction = req.body.transaction

  //console.log(transaction)

  if (!transaction) {
    res.status(400).send("No transaction")
    return
  }

  const recoveredTx = Transaction.from(Buffer.from(transaction, 'base64'))

  if (!recoveredTx.signatures.length) {
    res.status(400).send("Transaction must have at least one public key")
    return
  }

  const transaction_session_id = uuid()
  console.log("ID:", transaction_session_id)

  const publicKey = recoveredTx.signatures[0].publicKey.toBase58()

  const messageBase64 = recoveredTx.serializeMessage().toString('base64')

  console.log("Public Key:", publicKey)
  console.log("Message:", messageBase64)

  const session = {
    state: "init" as "init",
    transaction: transaction,
    created_at: Date.now(),
    public_key: publicKey,
    message: messageBase64
  }

  console.log(session)

  transaction_session_store[transaction_session_id] = session

  res.send({transaction_session_id})
})

export default router
