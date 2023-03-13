import express, { Router, Request, Response } from 'express';
import { login_session_store } from '../store'
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"

const FUNDED_ACCOUNT = '77Dn6Xm3MjpUyyAh318WtHFvAcLSPrwUChLbpM2Ngnm3'

const router: Router = express.Router()

router.get('/user_login', (req: Request, res: Response) => {
  res.status(200).json({
    // TODO: Parametrize
    label: "User login",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
})

type InputData = {
  account: string,
}

router.post('/user_login', async (req: Request, res: Response) => {

  console.log("User login")

  const { account } = req.body as InputData

  if (!account) {
    res.status(400).send("No account")
    return
  }

  if (!req.query['login_session_id']) {
    return res.status(400).send("No session id")
  }

  const login_session_id = req.query['login_session_id'].toString()

  if (!(login_session_id in login_session_store)) {
    return res.status(400).send("Invalid session id")
  }

  console.log("Login session id:", login_session_id)
  console.log("Account:", account)

  // Update session

  const new_session = {
    state: "set" as "set",
    created_at: login_session_store[login_session_id].created_at,
    public_key: account
  }

  login_session_store[login_session_id] = new_session

  console.log("New session:", new_session)

  // Create dummy transaction

  const connection = new Connection(process.env.RPC_URL || "https://api.devnet.solana.com")

  const publicKey = new PublicKey(FUNDED_ACCOUNT)

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: 1
    })
  )

  transaction.feePayer = publicKey

  const latestBlockhash = await connection.getLatestBlockhash()
  transaction.recentBlockhash = latestBlockhash.blockhash

  // Don't sign the transaction; if the user tries to send it, it will fail

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false
  })
  const encodedTransaction = serializedTransaction.toString('base64')

  // Options for dummy transactions
  // '': crashes Phantom
  // self-transfer of account: user may mistakenly sign it
  // self-transfer of randomly generated account without funds: "Can't simulate it" message on Phantom
  // transfer from funded account to itself: works well!

  res.status(200).json({
    transaction: encodedTransaction,
    message: "Logged in!"
    //message: "Logged in! (Ignore this message)"
    //message: "Logged in! (Ignore this)"
    //message: "Ignore this transaction"
    //message: "Logged in!"
    //message: "Successfully logged in! (Ignore this transaction)"
  })

  return res.status(200)

})

export default router
