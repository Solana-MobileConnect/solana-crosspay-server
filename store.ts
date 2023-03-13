type SessionID = string; // UUID
type Timestamp = number;

type LoginSessionState = "init" | "set";

type LoginSessionStore = {
  
  // init: the session has been created
  // set: the public key was set
  
  [index: SessionID]: {
    state: "init",
    created_at: Timestamp
  } |
  {
    state: "set",
    created_at: Timestamp,
    public_key: string
  }
}

export const login_session_store: LoginSessionStore = {}

type TransactionSessionStore = {
  [index: SessionID]: {
    
    // init: the transaction has been stored
    // requested: the user requested it at least once using get_transaction
    // timeout: the tx has not been found on the blockchain after some period of time (it presumably failed)
    // confirmed / finalized: the tx was added to the blockchain
    
    state: "init" | "requested" | "timeout",
    created_at: Timestamp

    // The data we use to look for the tx
    
    public_key: string,
    message_hash: string

  } |
  {

    state: "confirmed" | "finalized",
    created_at: Timestamp

    public_key: string,
    message_hash: string

    // We now know the main attributes of the tx on the blockchain

    err: string | null,
    signature: string
  }
}

export const transaction_session_store: TransactionSessionStore = {}
