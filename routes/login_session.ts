import express, { Router, Request, Response } from 'express';

const router: Router = express.Router()

let a = 1

router.get('/login_session', (req: Request, res: Response) => {
  res.send({counter: a})
})

router.post('/login_session', (req: Request, res: Response) => {
  a += 1
  res.send({counter: a})
})

export default router
