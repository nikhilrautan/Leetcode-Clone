import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/authSlice";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
      </h1>
      <button className="btn btn-primary" onClick={() => dispatch(logoutUser())}>
        Logout
      </button>
    </div>
  );
}

export default Homepage;