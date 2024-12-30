import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoggedIn(false);
            navigate("/");
        } else {
            setIsLoggedIn(true);
        }
    }, [navigate]);

    return isLoggedIn ? children : null;
};
export default AuthGuard;