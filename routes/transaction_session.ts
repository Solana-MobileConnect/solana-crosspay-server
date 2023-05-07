import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, Message, Cluster, CompiledInstruction } from "@solana/web3.js"
import express, { Router, Request, Response } from 'express'
import { transaction_session_store } from '../store'

import { v4 as uuid } from "uuid"

import { getRPCUrl } from '../utils'

const util = require('util')

const router: Router = express.Router()

type GetResponseType = {
  state: string,
  err?: string | null,
  signature?: string
} 

// const TRANSACTION_TIMEOUT = 30000

function checkMessageEquality(message1: Message, message2: Message) {
  
  const checkHeader = message1.header.numRequiredSignatures === message2.header.numRequiredSignatures &&
    message1.header.numReadonlySignedAccounts === message2.header.numReadonlySignedAccounts &&
    message1.header.numReadonlyUnsignedAccounts === message2.header.numReadonlyUnsignedAccounts

  if (!checkHeader) return false

  const checkAccountKeys = message1.accountKeys.every((key, i) => key.equals(message2.accountKeys[i]))

  if (!checkAccountKeys) return false
  
  // ignore recentBlockhash (this may have been changed by the wallet)
  
  const checkInstructions =  message1.instructions.every((instruction, i) => {
      const instruction2: CompiledInstruction = message2.instructions[i]
      return instruction2.programIdIndex == instruction.programIdIndex &&
        instruction2.accounts.every((account, i) => account == instruction.accounts[i]) &&
        instruction2.data === instruction.data
    }) 
    
  if (!checkInstructions) return false

  return true
}

router.get('/transaction_session', async (req: Request, res: Response) => {

  console.log("Get transaction session")

  if (!req.query['transaction_session_id']) {
    res.status(400).send("No transaction session id")
    return
  }

  const transaction_session_id = req.query['transaction_session_id'].toString()

  if (!(transaction_session_id in transaction_session_store)) {
    res.status(400).send("Invalid session id")
    return
  }

  const session = transaction_session_store[transaction_session_id]

  console.log(session)

  // Timeout
  /*
  console.log(Date.now() - session['created_at'])
  if (Date.now() - session['created_at'] >= TRANSACTION_TIMEOUT) {
    session['state'] = 'timeout'
  }
  */

  try {

    if (!(session['state'] in ['timeout', 'finalized'])) {
      // Get state of tx on blockchain

      const connection = new Connection(getRPCUrl(session['cluster']))

      const referenceKey = new PublicKey(session['reference_key'])

      const signatureInfo = await connection.getSignaturesForAddress(referenceKey, {}, "confirmed")

      const signatures = signatureInfo.map(item => item.signature)

      //console.log("Signatures:", signatures.join(', '))
      
      // Only check at most the first two most recent signatures
      const checkedSignatures = signatures.filter(sig => !session['tested_signatures'].has(sig)).slice(0,2)
      
      if(checkedSignatures.length !== 0) {

        const originalTx = Transaction.from(Buffer.from(session['transaction'], 'base64'))

        const txs = await connection.getTransactions(checkedSignatures, "confirmed")

        for(const [i,tx] of txs.entries()) {

          if (tx == null) continue
          
          const { transaction: { message: tx_message, signatures: [tx_sig] } } = tx
          
          console.log("Current tx:", tx_sig)
          
          // Since the tx is on-chain, we can be sure that the signatures are correct
          // So, we can just compare the messages

          // We assume that the message is unique enough (e.g. contained a random memo)
          if (checkMessageEquality(tx_message, originalTx.compileMessage())) {
            console.log("TARGET FOUND!")
            
            const txSignatureInfo = signatureInfo[i]
            console.log(txSignatureInfo)
        
            console.log(util.inspect(tx,{depth:null}))

            session['state'] = txSignatureInfo.confirmationStatus as ("confirmed" | "finalized")
            session['err'] = tx.meta?.err as (string | null)
            session['signature'] = tx_sig
            break
          }
        }
      }
      
      // Only add if it was successful
      checkedSignatures.forEach(sig => session['tested_signatures'].add(sig))
    }
  } catch(error: any) {
    // Don't update the state of the transaction
    // Pretend that nothing happened
    console.error(error)
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

  console.log(transaction)

  if (!transaction) {
    res.status(400).send("No transaction")
    return
  }

  const cluster = req.body.cluster

  console.log(cluster)

  if (!cluster || (cluster !== "devnet" && cluster !== "mainnet-beta")) {
    res.status(400).send("Invalid cluster")
    return
  }

  // Ensure the tx can be deserialized
  
  let recoveredTx;

  try {
    recoveredTx = Transaction.from(Buffer.from(transaction, 'base64'))
  } catch(error: any) {
    res.status(400).send("Invalid transaction")
    return
  }

  // TODO: check that the only signer without signature is `account`

  // Try to serialize it
  // This will run `compile`, which will ensure that the tx is valid:
  // It ensures that that there's a feePayer set (so, that it has at least one signer)
  // It verifies its signatures

  let serializedTx;
  try {
    serializedTx = recoveredTx.serialize({requireAllSignatures: false})
  } catch(error: any) {
    res.status(400).send("Invalid transaction")
    return
  }

  // Serialize it again
  // This results in a tx with standard format (order of signers, for example)
  
  const recoveredTx2 = Transaction.from(serializedTx)

  const transaction_session_id = uuid()
  console.log("ID:", transaction_session_id)

  // Since `compile` checked for a feePayer, this transaction is ensured to have at least one signer (which we will use as reference key)
  const referenceKey = recoveredTx2.signatures[0].publicKey.toBase58()

  console.log("Reference Key:", referenceKey)

  const session = {
    state: "init" as "init",
    transaction: serializedTx.toString('base64'),
    created_at: Date.now(),
    reference_key: referenceKey,
    cluster: cluster,
    tested_signatures: new Set<string>()
  }

  console.log(session)

  transaction_session_store[transaction_session_id] = session

  res.send({transaction_session_id})
})

export default router
