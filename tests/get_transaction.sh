#TX_ID=fdafc614-2140-4531-a42d-03c36999937f
#
#curl -X POST -d "account=X" http://localhost:3001/get_transaction?transaction_session_id=$TX_ID

TX_ID=b0ebe227-6b88-4e90-93cf-17766a2113a4

curl -X POST -d "account=X" https://crosspay-server.onrender.com/get_transaction?transaction_session_id=$TX_ID
