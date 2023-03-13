import express, { Router, Request, Response } from 'express'
import { transaction_session_store } from '../store'
import { Transaction } from "@solana/web3.js"

import { v4 as uuid } from "uuid"

const router: Router = express.Router()

type GetResponseType = {
  state: string,
  err?: string | null,
  signature?: string
} 

router.get('/transaction_session', (req: Request, res: Response) => {

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
