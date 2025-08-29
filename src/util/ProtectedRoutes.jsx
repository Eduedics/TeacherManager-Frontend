import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Spinner,Container } from "react-bootstrap";

const ProtectedRoute =({children,role})=>{
    const{user,loading}=useContext(AuthContext)
    console.log("User in ProtectedRoute:", user);
    console.log("Loading state:", loading);
    if(loading){
        return(
            <Container className="d-flex justify-content-center align-item-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading.....</span>
                    </Spinner>
                    <p className="mt-2">Verifying authentication...</p>
                </div>
            </Container>
        )
    }
    if(!user){
        return <Navigate to="/" replace />
    }
    if (user.role === "admin" && role !== "admin") {
        return <Navigate to="/admin" replace />;
    }

    if (user.role === "teacher" && role !== "teacher") {
        return <Navigate to="/teacher" replace />;
    }
    if(role &&user.role !==role){
        return <Navigate to="/unauthorized" replace />
    }
    return children

}
export default ProtectedRoute