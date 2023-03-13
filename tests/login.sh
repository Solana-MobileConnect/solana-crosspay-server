function create_login_session() {
  curl -X POST http://localhost:3001/login_session
}

function user_login() {
  LOGIN_SESSION_ID="9d20e102-2b38-46bf-bec0-bc82201e8661"
  ACCOUNT=1fad7676-534b-446f-a350-3a51ec8025be

  curl -X POST -d "account=$ACCOUNT" http://localhost:3001/user_login?login_session_id=$LOGIN_SESSION_ID
}

#create_login_session
user_login
