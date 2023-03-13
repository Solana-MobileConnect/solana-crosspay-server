TX_ID=006e5a6a-79dd-40a0-9d95-afb093c7311e

curl -X POST -d "account=X" http://localhost:3001/get_transaction?transaction_session_id=$TX_ID

#curl -X POST -d "account=X" https://crosspay-server.onrender.com/get_transaction?transaction_session_id=$TX_ID
