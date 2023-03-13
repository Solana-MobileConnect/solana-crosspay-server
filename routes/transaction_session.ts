import express, { Router, Request, Response } from 'express'
import { transaction_session_store } from '../store'

import { v4 as uuid } from "uuid"

const router: Router = express.Router()

router.get('/transaction_session', (req: Request, res: Response) => {

  console.log("Get transaction session")

  if (!req.query['login_session_id']) {
    res.status(400).send("No login session id")
    return
  }

  const login_session_id = req.query['login_session_id'].toString()

  if (!(login_session_id in login_session_store)) {
    return res.status(400).send("Invalid session id")
  }

  const state = login_session_store[login_session_id]

  console.log(state)

  res.status(200).send(state)
})

router.post('/transaction_session', (req: Request, res: Response) => {

  console.log("Create new transaction session")

  const transaction = req.body.transaction

  if (!transaction) {
    res.status(400).send("No transaction")
    return
  }

  const recoveredTx = Transaction.from(Buffer.from(transaction, 'base64'))

  if (!recoveredTx.signatures.length) {
    res.status(400).send("Transaction must have at least one signer")
    return
  }

  const transaction_session_id = uuid()
  console.log("ID:", transaction_session_id)

  const publicKey = recoveredTx.signatures[0].publicKey.toBase58()

  const messageBase64 = recoveredTx.serializeMessage()

  console.log("Public Key:", publicKey)
  console.log("Message:", messageBase64)

  const session = {
    state: "init",
    created_at: Date.now(),
    public_key: publicKey,
    message: messageBase64
  }

  console.log(session)

  res.send({transaction_session_id})
})

export default router
