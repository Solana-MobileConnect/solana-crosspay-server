TX_ID=beb9aed6-902d-4202-b81f-b344c17ad792

curl -X POST -d "account=X" http://localhost:3001/get_transaction?transaction_session_id=$TX_ID

#curl -X POST -d "account=X" https://crosspay-server.onrender.com/get_transaction?transaction_session_id=$TX_ID
