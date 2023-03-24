function create_login_session() {
  curl -X POST http://localhost:3001/login_session
}

function get_login_session() {
  LOGIN_SESSION=74e6e078-8ff1-4fcf-83fd-f4663d6fc5d5
  curl http://localhost:3001/login_session?login_session_id=$LOGIN_SESSION
}

function user_login() {
  LOGIN_SESSION_ID=74e6e078-8ff1-4fcf-83fd-f4663d6fc5d5
  ACCOUNT=1fad7676-534b-446f-a350-3a51ec8025be

  curl -X POST -d "account=$ACCOUNT" http://localhost:3001/user_login?login_session_id=$LOGIN_SESSION_ID
}

#create_login_session
#user_login
get_login_session
