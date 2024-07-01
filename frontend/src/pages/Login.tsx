import { useState } from "react";

/* let user select any username they like
check if same username already exists in a cached array
if the same name exists user must choose another user id.
At a time let only 1000 users in the demo app */

function Login() {
  const [userID, setUserID] = useState("");

  return (
    <>
      <input type="text" name="user_id" id="user_id" value={userID} onChange={(e) => setUserID(e.target.value)} />
      <br />
      <button onClick={() => console.log(userID)}>Login</button>
    </>
  )
}

export default Login;
