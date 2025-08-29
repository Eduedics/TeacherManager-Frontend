import { Spinner,Container } from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"

const GlobalLoading = ()=>{
    const {loading} = useContext(AuthContext)
    if(!loading) return null
    return(
        <Container className="d-flex align-itens-center justify-content-center min-vh-100 mt-5" style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            botton:0,
            background:"rgba(255,255,255,0.8",
            zIndex:9999
        }}>

        <div className="text-center">
            <Spinner valiant="primart" role="status" animation="border">
                <span className="visually-hidden">loading...</span>
            </Spinner>
            <p className="mt-2">loading...</p>
        </div>
        </Container>
    )
}
export default GlobalLoading