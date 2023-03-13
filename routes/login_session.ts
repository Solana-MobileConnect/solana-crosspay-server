import express, { Router, Request, Response } from 'express'
import { login_session_store } from '../store'

const router: Router = express.Router()

router.get('/login_session', (req: Request, res: Response) => {
  res.send({})
})

router.post('/login_session', (req: Request, res: Response) => {
  res.send({counter: 1})
})

export default router
