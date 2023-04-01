import express, { Router, Request, Response } from 'express'
import { login_session_store } from '../store'

import { v4 as uuid } from "uuid"

const router: Router = express.Router()

router.get('/login_session', (req: Request, res: Response) => {

  console.log("Get login session")

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

router.post('/login_session', (req: Request, res: Response) => {

  console.log("Create new login session")
  
  const cluster = req.body.cluster

  console.log(cluster)

  if (!cluster || (cluster !== "devnet" && cluster !== "mainnet-beta")) {
    res.status(400).send("Invalid cluster")
    return
  }

  const login_session_id = uuid()
  console.log("ID:", login_session_id)

  login_session_store[login_session_id] = {
    state: "init",
    created_at: Date.now(),
    cluster: cluster
  }

  //console.log(login_session_store[login_session_id])

  res.send({login_session_id})
})

export default router
