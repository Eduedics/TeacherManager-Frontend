import React,{useEffect} from 'react'
import { AuthContext } from '../context/AuthContext';
import { useContext,useState } from 'react';
import { Form, Card, Button, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Login() {
  const {login,user}= useContext(AuthContext)
  const navigate= useNavigate()
  const [password,setPassword]= useState('')
  const [username,setUsername] =useState('')
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      if (storedUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/teacher");
      }
    }
  }, [navigate]);
  const handleSubmit = async(e)=>{
    e.preventDefault()
    setIsLoading(true)
    const success = await login(username,password)
    if (success) {
      toast.success('Login successful!', {
        position: "top-center",
        autoClose: 2000,
      })
      
      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/teacher");
        }
      }, 1000)
    } else {
      toast.error('Invalid credentials!', {
        position: "top-center",
        autoClose: 3000,
      })
    }
    setIsLoading(false)

  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card className="p-4 shadow border-0" style={{ width: "90%", maxWidth: "400px" }}>
        <fieldset className="border-0">
          <legend className="text-center w-100 mb-4">
            <FaSignInAlt className="text-primary mb-2" size={20} />
            <h3 className="mb-0">Login</h3>
            <small className="text-muted">Access your account</small>
          </legend>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <FaUser className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-light border-start-0"
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text className="bg-light border-end-0">
                  <FaLock className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-light border-start-0"
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </InputGroup>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </Form>
        </fieldset>
      </Card>
    </div>
  )
}

export default Login





