TX_ID=e0fdb176-57d4-4062-b008-03402131cb72

curl -X POST -d "account=X" http://localhost:3001/get_transaction?transaction_session_id=$TX_ID

#curl -X POST -d "account=X" https://crosspay-server.onrender.com/get_transaction?transaction_session_id=$TX_ID
