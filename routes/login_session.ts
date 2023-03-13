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

  res.send(login_session_store[login_session_id])
})

router.post('/login_session', (req: Request, res: Response) => {

  console.log("Create new login session")

  const login_session_id = uuid()
  console.log("ID:", login_session_id)

  login_session_store[login_session_id] = {
    state: "init",
    created_at: Date.now()
  }

  //console.log(login_session_store[login_session_id])

  res.send({login_session_id})
})

export default router

/*
function get(req: NextApiRequest, res: NextApiResponse<GetResponse>) {

  if (!('login_id' in req.query)) {
    return res.status(400)
  }

  const login_id = req.query['login_id'] as string
  const account = login_sessions[login_id]

  return res.status(200).json({
    login_id: login_id,
    account: account
  })
}
*/
