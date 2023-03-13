import express, { Router, Request, Response } from 'express';
import { transaction_session_store } from '../store'

const router: Router = express.Router()

router.get('/get_transaction', (req: Request, res: Response) => {
  res.status(200).json({
    // TODO: Parametrize
    label: "Transaction",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
})

router.post('/get_transaction', async (req: Request, res: Response) => {

  console.log("Get transaction")

  const { account } = req.body as { account: string }

  if (!account) {
    res.status(400).send("No account")
    return
  }

  // TODO: ensure that pubkey is the one that created the tx

  if (!req.query['transaction_session_id']) {
    return res.status(400).send("No transaction session id")
  }

  const transaction_session_id = req.query['transaction_session_id'].toString()

  if (!(transaction_session_id in transaction_session_store)) {
    return res.status(400).send("Invalid session id")
  }

  console.log("Transaction session id:", transaction_session_id)
  console.log("Account:", account)

  const encodedTransaction = transaction_session_store[transaction_session_id]['transaction']

  return res.status(200).json({
    transaction: encodedTransaction,
    message: "Message" // TODO: make customizable
  })
})

export default router
