import React,{useEffect} from 'react'
import { Link } from 'react-router-dom'
import {Container} from 'react-bootstrap'
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';

function Unauthorized() {
    useEffect(() => {
    // Add interactive tilt effect
    const container = document.querySelector('.glass-container');
    
    const handleMouseMove = (e) => {
      const x = (window.innerWidth - e.pageX) / 25;
      const y = (window.innerHeight - e.pageY) / 25;
      container.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg)`;
    };
    
    const handleMouseLeave = () => {
      container.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  return (
    <div style={styles.pageContainer}>
      {/* Animated background */}
      <div style={styles.background}></div>
      
      {/* Glassmorphic container */}
      <Container 
        className="glass-container mt-5 p-4 p-md-5" 
        style={styles.glassContainer}
      >
        {/* Lock icon link */}
        <Link 
          to="/" 
          className="d-inline-flex align-items-center justify-content-center text-decoration-none mb-4"
          style={styles.iconLink}
        >
          <FaLock size={36} />
        </Link>
        
        <h2 className="text-danger fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
          Unauthorized
        </h2>
        <p className="mb-4" style={styles.message}>
          You are not authorized to view this page. Please contact your administrator if you believe this is an error.
        </p>
        
        {/* Action buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <Link 
            to="/" 
            className="btn d-inline-flex align-items-center justify-content-center gap-2 py-2 px-4"
            style={styles.button}
          >
            <FaHome /> Return to Home
          </Link>
          
          <Link 
            to="/" 
            className="btn d-inline-flex align-items-center justify-content-center gap-2 py-2 px-4"
            style={{ ...styles.button, background: 'rgba(255, 255, 255, 0.25)' }}
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </Container>
      
    
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: 'hidden',
    position: 'relative'
  },
  background: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
    animation: 'rotate 20s linear infinite',
    zIndex: 0
  },
  glassContainer: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    zIndex: 1
  },
  iconLink: {
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    animation: 'pulse 2s infinite',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white'
  },
  message: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.6'
  },
  button: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    borderRadius: '50px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    textDecoration: 'none'
  },
  footer: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    zIndex: 1,
    marginTop: '20px'
  },
  globalStyles: `
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    
    .glass-container:hover {
      transform: perspective(1000px) rotateY(0) rotateX(0) translateY(-5px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
    }
    
    .glass-container a:hover {
      background: rgba(255, 255, 255, 0.25) !important;
      transform: translateY(-2px) !important;
    }
    
    .glass-container .icon-link:hover {
      transform: scale(1.1) !important;
      animation: none !important;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
    }
  `
};

// Add global styles to the page
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles.globalStyles;
document.head.appendChild(styleSheet);



export default Unauthorized