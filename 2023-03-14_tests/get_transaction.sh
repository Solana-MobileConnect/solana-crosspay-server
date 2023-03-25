TX_ID=7e08645c-f1f3-45f0-8417-4934ea3efebf

curl -X POST -d "account=X" http://localhost:3001/get_transaction?transaction_session_id=$TX_ID

#curl -X POST -d "account=X" https://crosspay-server.onrender.com/get_transaction?transaction_session_id=$TX_ID
