import dotenv from 'dotenv'
dotenv.config()

export const getRPCUrl = (cluster: string) => {

  if(cluster == 'devnet') {

    return 'https://api.devnet.solana.com'

  } else if(cluster == 'mainnet-beta') { 

    if(!process.env.ALCHEMY_API_KEY) throw Error("No API Key")

    return 'https://solana-mainnet.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY;

  } else {

    throw new Error("Invalid cluster")
  }
}
