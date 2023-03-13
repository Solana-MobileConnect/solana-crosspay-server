import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import login_session from './routes/login_session'
import user_login from './routes/user_login'

const cors = require('cors');
const bodyParser = require('body-parser')

import transaction_session from './routes/transaction_session'
//import get_transaction from './routes/get_transaction'

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors({ origin: '*' }));

app.get('/', (req: Request, res: Response) => {
  res.send('CrossPay server');
});

app.use(login_session)
app.use(user_login)

app.use(transaction_session)
//app.use(get_transaction)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
