/*
Integrated Dashboard: Combines check-in/out functionality with attendance and duty displays
Duty Assignments: Shows all duty assignments in a clean table format with details
Attendance Records: Displays all attendance history with calculated hours worked
Real-time Updates: Attendance data refreshes after check-in/check-out actions
Visual Status Indicators: Uses badges to clearly show attendance status
Loading States: Shows loading spinners while data is being fetched
Error Handling: Proper error messages for failed API calls
Responsive Design: Works well on all screen sizes
The attendance display calculates hours worked based on check-in and check-out times
The component uses React Bootstrap for styling
This implementation provides teachers with a comprehensive view of their schedule, attendance history, and the ability to check in/out, all in one convenient dashboard

*/
import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../util/Axios'
import { 
  Button, Card, Alert, Table, Badge, Spinner, 
  Container, Row, Col, ButtonGroup, Modal 
} from "react-bootstrap"
import { toast } from 'react-toastify'
import { FaEye,FaSignOutAlt,FaWifi ,FaSyncAlt} from "react-icons/fa";

function TeachersDashboard() {
  const { user, logout,loading:authLoading } = useContext(AuthContext)
  const [isonline,setIsOnline] = useState(navigator.onLine)
  const [message, setMessage] = useState("")
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])
  const [dutyData, setDutyData] = useState([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingDuty, setLoadingDuty] = useState(false)

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // show if online or offline
  useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
  
  const fetchAttendance = async () => {
    try {
      setLoadingAttendance(true)
      const res = await api.get("attendance/my/")
      setAttendanceData(res.data)
    } catch (err) {
      console.error("Attendance fetch error", err)
      setErr('Failed to fetch attendance records')
    } finally {
      setLoadingAttendance(false)
    }
  }
  
  const fetchDutyAssignments = async () => {
    try {
      setLoadingDuty(true)
      const res = await api.get("duties/my/")
      setDutyData(res.data)
    } catch (err) {
      setErr("Failed to fetch duty assignments")
      console.error("Duty fetch error", err)
    } finally {
      setLoadingDuty(false)
    }
  }
  
  const handleCheckin = async () => {
    try {
      setLoading(true)
      const res = await api.post("attendance/check-in/")
      setMessage(res.data.message)
      setErr("")
      fetchAttendance()
    } catch (err) {
      setErr(`Already checked in or error occurred: ${err.response?.data?.error || err.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage("");
      setErr("");
      
      const res = await api.post(`attendance/check-out/`);
      
      if (res.status === 200) {
        setMessage(res.data.message || "Checked out successfully!");
   
        toast.success(`Checked out successfully!`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      
      fetchAttendance(); 
      
    } catch (err) {
      let errorMessage = "An unexpected error occurred during checkout";
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 404:
            errorMessage = data.error || "No active session found for checkout";
            break;
          case 400:
            errorMessage = data.error || "Invalid checkout request";
            break;
          default:
            errorMessage = data.error || `Server error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = "Network error: Please check your connection";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      setErr(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateHoursWorked = (checkInTime, checkOutTime) => {
    if (!checkInTime || !checkOutTime) return 'N/A';
    
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut - checkIn;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getStatus = (checkInTime, checkOutTime) => {
    if (!checkInTime) return 'Absent';
    if (!checkOutTime) return 'Checked In';
    return 'Completed';
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Checked In': return 'warning';
      case 'Absent': return 'secondary';
      default: return 'secondary';
    }
  };
  
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };
  
  useEffect(() => {
    fetchAttendance()
    fetchDutyAssignments()
  }, [])
  
  if(authLoading){
    return(
      <Container className='d-flex align-items-center justify-content-center min-vh-100'>
        <Spinner animation='border' variant='primary' role='status'>
          <span className='ms-2'>loading dashboard...</span>
        </Spinner>
      </Container>
    )
  }
  return (
    <Container fluid className="mt-4">
      {!isonline && (
        <Alert variant="warning" className="mb-2 d-flex align-items-center">
          <FaWifi className="me-2" />
          You are currently offline
        </Alert>
      )}
      <Row>
        <Col>
          <Card className="p-4 shadow mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Welcome {user?.username}</h3>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
            
            <p>
              <strong>Role:</strong> {user?.role}
            </p>
            
            {message && <Alert variant="success">{message}</Alert>}
            {err && <Alert variant="danger">{err}</Alert>}
            
            <div className="d-flex gap-3 mb-4">
              <Button variant="success" onClick={handleCheckin} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Check In"}
              </Button>
              <Button variant="danger" onClick={handleCheckOut} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Check Out"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Duty Assignments Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">My Duty Assignments</h5>
            </Card.Header>
            <Card.Body>
              {loadingDuty ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading duty assignments...</p>
                </div>
              ) : dutyData.length > 0 ? (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dutyData.map((duty) => (
                      <tr key={duty.id}>
                        
                        <td>
                          {duty.duty_period?.start_date 
                            ? formatDateTime(duty.duty_period.start_date) 
                            : 'N/A'
                          }
                        </td>
                        <td>
                          {duty.duty_period?.end_date 
                            ? formatDateTime(duty.duty_period.end_date) 
                            : 'N/A'
                          }
                        </td>
                        <td>
                          <Badge bg="info">Assigned</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="mb-0">
                  No duty assignments found.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Attendance Records Section */}
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Attendance Records</h5>
              <Button variant="light" size="sm" onClick={fetchAttendance}>
                <FaSyncAlt /> Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {loadingAttendance ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="info" />
                  <p className="mt-2">Loading attendance records...</p>
                </div>
              ) : attendanceData.length > 0 ? (
                <>
                  <div className="mb-3">
                    <strong>Total Records:</strong> {attendanceData.length} | 
                    <strong> Completed Sessions:</strong> {attendanceData.filter(r => r.check_out).length} |
                    <strong> Active Sessions:</strong> {attendanceData.filter(r => r.check_in && !r.check_out).length}
                  </div>
                  
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record) => {
                        const status = getStatus(record.check_in, record.check_out);
                        const hoursWorked = calculateHoursWorked(record.check_in, record.check_out);
                        
                        return (
                          <tr key={record.id} className={status === 'Checked In' ? 'table-warning' : ''}>
                            <td>
                              <strong>{record.check_in ? formatDate(record.check_in) : 'N/A'}</strong>
                            </td>
                            <td>
                              {record.check_in ? (
                                <>
                                  {formatTime(record.check_in)}
                                  <br />
                                  <small className="text-muted">
                                    {formatDate(record.check_in)}
                                  </small>
                                </>
                              ) : 'N/A'}
                            </td>
                            <td>
                              {record.check_out ? (
                                <>
                                  {formatTime(record.check_out)}
                                  <br />
                                  <small className="text-muted">
                                    {formatDate(record.check_out)}
                                  </small>
                                </>
                              ) : status === 'Checked In' ? (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={handleCheckOut}
                                  disabled={loading}
                                >
                                  {loading ? 'Processing...' : 'Check Out'}
                                </Button>
                              ) : 'N/A'}
                            </td>
                            <td>
                              {hoursWorked}
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(status)}>
                                {status}
                              </Badge>
                            </td>
                            <td>
                              <ButtonGroup size="sm">
                                <Button 
                                  variant="outline-info" 
                                  onClick={() => handleViewDetails(record)}
                                  title="View Details"
                                >
                                  <FaEye size={18}/>  
                                </Button>
                                {!record.check_out && (
                                  <Button 
                                    variant="outline-success" 
                                    onClick={handleCheckOut}
                                    disabled={loading}
                                    title="Check Out"
                                  >
                                    <FaSignOutAlt size={18}/>
                                  </Button>
                                )}
                              </ButtonGroup>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  <Alert.Heading>No Attendance Records</Alert.Heading>
                  <p>You don't have any attendance records yet. Check in to start tracking your time.</p>
                  <Button variant="info" onClick={handleCheckin}>
                    Check In Now
                  </Button>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Attendance Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6>Check-In Information</h6>
                <p>
                  <strong>Date:</strong> {formatDate(selectedRecord.check_in)}<br />
                  <strong>Time:</strong> {formatTime(selectedRecord.check_in)}<br />
                  <strong>Full DateTime:</strong> {formatDateTime(selectedRecord.check_in)}
                </p>
              </Col>
              <Col md={6}>
                <h6>Check-Out Information</h6>
                <p>
                  <strong>Date:</strong> {selectedRecord.check_out ? formatDate(selectedRecord.check_out) : 'N/A'}<br />
                  <strong>Time:</strong> {selectedRecord.check_out ? formatTime(selectedRecord.check_out) : 'N/A'}<br />
                  <strong>Full DateTime:</strong> {selectedRecord.check_out ? formatDateTime(selectedRecord.check_out) : 'N/A'}
                </p>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md={6}>
                <h6>Duration</h6>
                <p>
                  <strong>Total Hours:</strong> {calculateHoursWorked(selectedRecord.check_in, selectedRecord.check_out)}<br />
                  <strong>Status:</strong> <Badge bg={getStatusVariant(getStatus(selectedRecord.check_in, selectedRecord.check_out))}>
                    {getStatus(selectedRecord.check_in, selectedRecord.check_out)}
                  </Badge>
                </p>
              </Col>
              <Col md={6}>
                <h6>Record Information</h6>
                <p>
                  <strong>Record ID:</strong> {selectedRecord.id}<br />
                  <strong>Created:</strong> {selectedRecord.created_at ? formatDateTime(selectedRecord.created_at) : 'N/A'}<br />
                  <strong>Last Updated:</strong> {selectedRecord.updated_at ? formatDateTime(selectedRecord.updated_at) : 'N/A'}
                </p>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  )
}

export default TeachersDashboard