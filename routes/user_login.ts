import express, { Router, Request, Response } from 'express';
import { login_session_store } from '../store'
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"

import base58 from 'bs58'

import dotenv from 'dotenv'
dotenv.config()

//const FUNDED_ACCOUNT = '8g6wuqy2mzprgnb1ZG9GvcQQsC2vXZBAn5NtQR5bR9MV'

const router: Router = express.Router()

router.get('/user_login', (req: Request, res: Response) => {
  res.status(200).json({
    label: "My Store" ,// TODO: Parametrize
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
})

type InputData = {
  account: string,
}

const FUNDED_ACCOUNT_SECRET = process.env.FUNDED_ACCOUNT_SECRET

if(!FUNDED_ACCOUNT_SECRET) throw new Error("No funded account")

router.post('/user_login', async (req: Request, res: Response) => {

  console.log("User login")

  const { account } = req.body as InputData

  const accountPublicKey = new PublicKey(account)
  const fundedKeypair = Keypair.fromSecretKey(base58.decode(FUNDED_ACCOUNT_SECRET))
  const fundedPublicKey = fundedKeypair.publicKey

  if (!account) {
    res.status(400).send("No account")
    return
  }

  if (!req.query['login_session_id']) {
    return res.status(400).send("No session id")
  }

  // TODO: prevent multiple logins

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

  // Options for dummy transactions
  // no instructions: crashes Phantom
  // invalid transaction: user gets error message (not acceptable)
  // self-transfer of account: user may mistakenly sign it and pay tx fees (we accept this), user gets a notification that they received 0 SOL (this is annoying), it's part of the user's tx history now (annoying), issue: user may not have funds (leading to "Can't simulate it" error)
  // self-transfer of randomly generated account without funds: "Can't simulate it" message on Phantom
  // Transfer from funded account to itself: works well! (we accept that the user will sign it); users without funds will be excluded, which is normal

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fundedPublicKey,
      toPubkey: fundedPublicKey,
      lamports: 0
    })
  )
  
  // If the user approves the transaction, they pay the fee
  // We should not be the feePayer as this allows for the account to be drained
  transaction.feePayer = accountPublicKey

  const latestBlockhash = await connection.getLatestBlockhash()
  transaction.recentBlockhash = latestBlockhash.blockhash

  transaction.sign(fundedKeypair)

  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false
  })
  const encodedTransaction = serializedTransaction.toString('base64')

  res.status(200).json({
    transaction: encodedTransaction,
    //message: "Ignore this transaction"
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
