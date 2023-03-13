import express, { Router, Request, Response } from 'express';
import { login_session_store } from '../store'

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

router.post('/user_login', (req: Request, res: Response) => {

  const { account } = req.body as InputData

  console.log(req.body)

  if (!account) {
    res.status(400)
    return
  }

  if (!req.query['login_session_id']) {
    return res.status(400)
  }

  const login_session_id = req.query['login_session_id'].toString()

  if (!(login_session_id in login_session_store)) {
    return res.status(400)
  }

  console.log("Login session id:", login_session_id)
  console.log("Set public key to:", account)

  // Update session

  const new_session = {
    state: "set" as "set",
    created_at: login_session_store[login_session_id].created_at,
    public_key: account
  }

  login_session_store[login_session_id] = new_session

  console.log("New session:", new_session)

})

export default router


/*

type InputData = {
  account: string,
}

type GetResponse = {
  label: string,
  icon: string,
}

export type PostResponse = {
  transaction: string,
  message: string,
}

export type PostError = {
  error: string
}

function get(res: NextApiResponse<GetResponse>) {
  res.status(200).json({
    label: "My Store",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}


async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {

  // Ensure valid Solana Pay request
  
  const { account } = req.body as InputData
  console.log(req.body)
  if (!account) {
    res.status(400).json({ error: "No account provided" })
    return
  }

  console.log("Account:", account)
  
  // Get login_id from query string
  
  if (!('login_id' in req.query)) {
    return res.status(400)
  }

  const login_id = req.query['login_id'] as string
  
  // Associate account with login_id
  
  login_sessions[login_id] = account

  saveSessionData()
  
  // Create dummy transaction

  const connection = new Connection(clusterApiUrl('devnet'))

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

  // Don't sign the transaction

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
    message: "Logged in! (Ignore this transaction)"
    //message: "Ignore this transaction"
    //message: "Logged in!"
    //message: "Successfully logged in! (Ignore this transaction)"
  })
}
*/
