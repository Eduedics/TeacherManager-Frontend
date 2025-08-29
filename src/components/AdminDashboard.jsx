/*
provides comprehensive management of teachers, duty periods, assignments, and reporting functionality.
Duty Period Management: Create new duty periods with name, time, and location
Duty Assignment: Automatically assign duties to eligible teachers with a single click
PDF Report Generation: Generate weekly attendance reports for any teacher
Date Selection: UI for selecting report date ranges
Assignment Tracking: View all current duty assignments
Enhanced UI: Better organization of different functionality sections
*/
import api from "../util/Axios";
import { useState, useEffect ,useContext} from "react";
import "./adminDashboard.css";
import { FaWifi,FaUser, FaEdit } from "react-icons/fa";
import { Button,Modal,Badge,ListGroup,Container,Row,Col,Table,Pagination } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import './pagination.css'

const AdminDashboard = () => {
  const [isOnline,setIsOnline] =useState(navigator.onLine)
  const [teachers, setTeachers] = useState([]);
  const [dutyPeriods, setDutyPeriods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDutyForm, setShowDutyForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportDates, setReportDates] = useState({
    start_date: "",
    end_date: ""
  });
  
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [teacherData, setTeacherData] = useState({
    staff_id: '',
    department: '',
    subject: '',
    status: 'active',
    duty_eligibility: true
  });
  const [dutyPeriodData, setDutyPeriodData] = useState({
    start_date: '',
    end_date: '',
  });

  const {user,logout}=useContext(AuthContext)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAssignmentsPage, setCurrentAssignmentsPage] = useState(1);
  const itemsPerPage = 5;
  

  // Reset pagination when data changes
  useEffect(() => setCurrentPage(1), [searchTerm]);
  useEffect(() => setCurrentAssignmentsPage(1), [assignments])

  // show is online/offline
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

  const fetchTeachers = async () => {
    try {
      const res = await api.get("teachers/");
      setTeachers(res.data);
      console.log('teachers',teachers)
      setErr(null);
    } catch (err) {
      setErr(`${err} Failed to fetch teachers`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchDutyPeriods = async () => {
    try {
      const res = await api.get('duties/periods/');
      setDutyPeriods(res.data);
    } catch (err) {
      setErr(`failed to fetch duty periods,${err}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAssignments = async () => {
    try {
      const res = await api.get("duties/assignments/");
      console.log("API Response:", res.data);
      console.log("Type of response:", typeof res.data);
      console.log("Is array:", Array.isArray(res.data));
      
      if (Array.isArray(res.data)) {
        setAssignments(res.data);
      } else if (res.data && Array.isArray(res.data.assignments)) {
        setAssignments(res.data.assignments);
      } else if (res.data && typeof res.data === 'object') {
        // Convert object to array
        const assignmentsArray = Object.values(res.data);
        setAssignments(assignmentsArray);
        console.log("Converted object to array:", assignmentsArray);
      } else {
        setAssignments([]);
        console.warn("Unexpected assignments format:", res.data);
      }
    } catch (err) {
      setErr(`Failed to fetch assignments: ${err}`);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTeachers(), fetchDutyPeriods(), fetchAssignments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('teachers/create/', {
        user: userData,
        teacher: teacherData
      });
      setUserData({ username: "", email: "", password: "" });
      setTeacherData({ staff_id: '', department: '', subject: '', status: 'active', duty_eligibility: true });
      setShowForm(false);
      fetchTeachers();
    } catch (err) {
      setErr("Failed to create a new teacher");
      console.log('err', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handlUpdateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`teachers/${editingTeacher.id}/update/`, teacherData);
      setEditingTeacher(null);
      setTeacherData({ staff_id: '', department: '', subject: '', status: 'active', duty_eligibility: true });
      setShowForm(false);
      fetchTeachers();
    } catch (err) {
      setErr('Failed to Update Teacher');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTeacher = async (id) => {
    setLoading(true);
    if (!window.confirm(`Are you sure you want to delete teacher ${id}`)) return;
    try {
      await api.delete(`teachers/${id}/delete/`);
      fetchTeachers();
    } catch (err) {
      setErr("Failed to delete the teacher");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTeacherDetails = async (id) => {
    try {
      const res = await api.get(`teachers/${id}/`);
      setSelectedTeacher(res.data);
      setShowDetailModal(true);
      console.log('modal',res.data)
    } catch (err) {
      setErr('Failed to fetch teacher details');
      console.error(err);
    }
  };
  
  const startEditing = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherData({
      staff_id: teacher.staff_id,
      department: teacher.department,
      subject: teacher.subject,
      status: teacher.status,
      duty_eligibility: teacher.duty_eligibility
    });
    setShowForm(true);
  };
  
  const handleCreateDutyPeriod = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (dutyPeriodData.end_date <= dutyPeriodData.start_date) {
        setErr("End date must be after start date");
        return;
      }
      
      await api.post("duties/periods/create/", dutyPeriodData);
      setDutyPeriodData({start_date: "", end_date: ""});
      setShowDutyForm(false);
      console.log("Duty period created successfully!");
      fetchDutyPeriods();
    } catch (err) {
      if (err.response?.status === 400) {
        const errors = err.response.data;
        let errorMessage = "Validation errors: ";
        
        if (typeof errors === 'object') {
          Object.keys(errors).forEach(key => {
            errorMessage += `${key}: ${errors[key].join(', ')}. `;
          });
        } else {
          errorMessage = errors || "Invalid data format";
        }
        
        setErr(errorMessage);
      } else {
        setErr("Failed to create duty period");
      }
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const handleAssignDuty = async (periodId) => {
    try {
      setLoading(true);
      const res = await api.post(`duties/assign/${periodId}/`)
      if(res.data.success){
        console.log(`success creating duty`)
      }
      setErr(null);
      fetchAssignments();
      fetchTeachers();
    } catch (err) {
      setErr(err.response?.data?.error || 'Failed to assign duty');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReport = async (teacherId) => {
    if (!reportDates.start_date || !reportDates.end_date) {
      setErr('Please select both start date and end date');
      return;
    }
    try {
      const params = new URLSearchParams({
        start_date: reportDates.start_date,
        end_date: reportDates.end_date
      });

      const res = await api.get(`report/teacher/${teacherId}/pdf/?${params.toString()}`, {
        responseType: 'blob', // ensures  downloading raw PDF data and not JSON error.
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `report_${teacherId}_${reportDates.start_date}_${reportDates.end_date}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErr('Failed to generate report');
      console.error(err);
    }
  };
  //filterteachers by search
  const filteredTeachers = teachers.filter(teacher => 
    teacher.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log('filtered',filteredTeachers)
  if (loading) return <div className="loading">Loading...</div>;
  
  
  //pagination function for teachers
  const getCurrentTeachers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeachers.slice(startIndex, endIndex);
  };
    // Pagination functions for assignments
  const getCurrentAssignments = () => {
    const startIndex = (currentAssignmentsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return assignments.slice(startIndex, endIndex);
  };
  console.log('dutyassignments',assignments)
  // Calculate total pages
  const totalTeacherPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const totalAssignmentPages = Math.ceil(assignments.length / itemsPerPage);

  
  return (
    <div className="teacher-management">
      {!isOnline && (
        <Alert variant="warning" className="mb-2 d-flex align-items-center">
          <FaWifi className="me-2" />
          You are currently offline
        </Alert>
      )}
      <h1 className="d-flex align-items-center justify-content-center text-light bg-dark p-2">Admin Dashboard</h1>

      {err && <div className="error">{err}</div>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary text-decoration-underline">Welcome {user?.username}</h3>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>
        
      <p className="text-dark text-uppercase">
        <strong className="text-danger ">Role:</strong> {user?.role}
      </p>
      

      <div className="controls">
        <div className="button-group">
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingTeacher(null);
            }}
          >
            {showForm ? 'Cancel' : 'Add New Teacher'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowDutyForm(!showDutyForm)}
          >
            {showDutyForm ? 'Cancel' : 'Create Duty Period'}
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Staff ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Report Date Selection */}
      <div className="report-date-selector">
        <h3>Generate Weekly Reports</h3>
        <div className="date-inputs">
          <input
            type="date"
            value={reportDates.start_date}
            onChange={(e) => setReportDates({ ...reportDates, start_date: e.target.value })}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={reportDates.end_date}
            onChange={(e) => setReportDates({ ...reportDates, end_date: e.target.value })}
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Duty Period Form */}
      {showDutyForm && (
        <div className="duty-form">
          <h2>Create New Duty Period</h2>
          <form onSubmit={handleCreateDutyPeriod}>
            <div className="form-group">
              <label>Start Date:</label>  
              <input
                type="date"  
                value={dutyPeriodData.start_date}
                onChange={(e) => setDutyPeriodData({ ...dutyPeriodData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>  
              <input
                type="date" 
                value={dutyPeriodData.end_date}
                onChange={(e) => setDutyPeriodData({ ...dutyPeriodData, end_date: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Create Duty Period</button>
          </form>
        </div>
      )}
      
      {/* Form for creating and editing teacher */}
      {showForm && (
        <div className="teacher-form">
          <h2>{editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}</h2>
          <form onSubmit={editingTeacher ? handlUpdateTeacher : handleCreateTeacher}>
            {!editingTeacher && (
              <div className="form-section">
                <h3>User Account</h3>
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={userData.username}
                    onChange={(e) => setUserData({...userData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({...userData, password: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form-section">
              <h3>Teacher Information</h3>
              <div className="form-group">
                <label>Staff ID:</label>
                <input
                  type="text"
                  value={teacherData.staff_id}
                  onChange={(e) => setTeacherData({...teacherData, staff_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department:</label>
                <input
                  type="text"
                  value={teacherData.department}
                  onChange={(e) => setTeacherData({...teacherData, department: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Subject:</label>
                <input
                  type="text"
                  value={teacherData.subject}
                  onChange={(e) => setTeacherData({...teacherData, subject: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  value={teacherData.status}
                  onChange={(e) => setTeacherData({...teacherData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="onLeave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={teacherData.duty_eligibility}
                    onChange={(e) => setTeacherData({...teacherData, duty_eligibility: e.target.checked})}
                  />
                  Duty Eligibility
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn-primary">
              {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
            </button>
          </form>
        </div>
      )}
      {/* Duty Periods List */}
      <div className="duty-periods-section">
        <h2>Duty Periods</h2>
        <div className="duty-periods-list">
          {dutyPeriods.map(period => (
            <div key={period.id} className="duty-period-card">
              <p><strong>Time:</strong> {new Date(period.start_date).toLocaleString()} - {new Date(period.end_date).toLocaleString()}</p>
              <button
                className="btn-assign"
                onClick={() => handleAssignDuty(period.id)}
                disabled={loading}
              >
                Assign Duty
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Teachers list table */}
      <div className="teachers-table">
        <table>
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Department</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Duty Eligibility</th>
              <th>Last assigned</th>
              <th>Actions</th>
              <th>Report</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentTeachers().length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No teachers found</td>
              </tr>
            ) : (
              getCurrentTeachers().map(teacher => (
                <tr key={teacher.id}>
                  <td>{teacher.staff_id}</td>
                  <td>{teacher.username}</td>
                  <td>{teacher.email || '-'}</td>
                  <td>{teacher.department || '-'}</td>
                  <td>{teacher.subject || '-'}</td>
                  <td>
                    <span className={`status ${teacher.status}`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td>
                    {teacher.duty_eligibility ? 
                      <Button variant="success" size="sm">Yes</Button> : 
                      <Button variant="danger" size="sm">No</Button>
                    }
                  </td>
                  <td>{teacher.last_assigned_at || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn-info"
                      onClick={() => fetchTeacherDetails(teacher.id)}
                    >
                      Info
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => startEditing(teacher)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-report"
                      onClick={() => handleGenerateReport(teacher.id)}
                      disabled={!reportDates.start_date || !reportDates.end_date}
                    >
                      Generate PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {filteredTeachers.length > itemsPerPage && (
          <div className="pagination-controls mt-3">
            <Button
              variant="outline-primary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="me-2"
            >
              Previous
            </Button>
            
            <span className="mx-2">
              Page {currentPage} of {totalTeacherPages}
            </span>
            
            <Button
              variant="outline-primary"
              size="sm"
              disabled={currentPage === totalTeacherPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalTeacherPages))}
              className="ms-2"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      {/* Assignments Table */}
      <div className="assignments-section">
        <h2>Duty Assignments</h2>
        {!assignments || assignments.length === 0 ? (
          <p className="no-data">No duty assignments found</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Staff ID</th>
                  <th>Duty Period</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentAssignments().map(assignment => (
                  <tr key={assignment.id}>
                    <td>
                      {assignment.teacher?.username || 
                      assignment.teacher_username || 
                      'N/A'}
                    </td>
                    <td>
                      {assignment.teacher?.staff_id || 
                      assignment.teacher_staff_id || 
                      'N/A'}
                    </td>
                    <td style={{color:'red'}}>
                      {assignment.duty_period ? 
                        `Duty Period #${assignment.duty_period.id} assignment#${assignment.id}` : 'N/A'
                      }
                    </td>
                    <td>
                      {assignment.duty_period?.start_date ? 
                        new Date(assignment.duty_period.start_date).toLocaleDateString() : 'N/A'
                      }
                    </td>
                    <td>
                      {assignment.duty_period?.end_date ? 
                        new Date(assignment.duty_period.end_date).toLocaleDateString() : 'N/A'
                      }
                    </td>
                    <td>
                      {assignment.duty_period?.start_date && assignment.duty_period?.end_date ? 
                        (() => {
                          const start = new Date(assignment.duty_period.start_date);
                          const end = new Date(assignment.duty_period.end_date);
                          const diffTime = Math.abs(end - start);
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return `${diffDays} days`;
                        })() : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Assignments Pagination Controls */}
            {assignments.length > itemsPerPage && (
              <div className="pagination-controls mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentAssignmentsPage === 1}
                  onClick={() => setCurrentAssignmentsPage(prev => Math.max(prev - 1, 1))}
                  className="me-2"
                >
                  Previous
                </Button>
                
                <span className="mx-2">
                  Page {currentAssignmentsPage} of {totalAssignmentPages}
                </span>
                
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentAssignmentsPage === totalAssignmentPages}
                  onClick={() => setCurrentAssignmentsPage(prev => Math.min(prev + 1, totalAssignmentPages))}
                  className="ms-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {/* {showDetailModal && selectedTeacher && (
        <div style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            width: "400px",
            maxWidth: "90%"
          }}>
            <h2>Teacher Details</h2>
            <p><strong>Staff ID:</strong> {selectedTeacher.staff_id}</p>
            <p><strong>Username:</strong> {selectedTeacher.username}</p>
            <p><strong>Email:</strong> {selectedTeacher.email}</p>
            <p><strong>Department:</strong> {selectedTeacher.department}</p>
            <p><strong>Subject:</strong> {selectedTeacher.subject}</p>
            <p><strong>Status:</strong> {selectedTeacher.status}</p>
            <p><strong>Duty Eligibility:</strong> {selectedTeacher.duty_eligibility ? "Yes" : "No"}</p>
            <p><strong>Last Duty Assigned:</strong> {new Date(selectedTeacher.last_assigned_at).toLocaleString()}</p>

            <button onClick={() => setShowDetailModal(false)}>Close</button>
          </div>
        </div>
      )} */}
      {showDetailModal && selectedTeacher && (
        <Modal 
          show={showDetailModal} 
          onHide={() => setShowDetailModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUser className="me-2" />
              Teacher Details
            </Modal.Title>
          </Modal.Header>
          
          <Modal.Body>
            <Table striped bordered size="sm">
              <tbody>
                <tr>
                  <td><strong>Staff ID</strong></td>
                  <td>{selectedTeacher.staff_id || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Username</strong></td>
                  <td>{selectedTeacher.user?.username || selectedTeacher.username || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Email</strong></td>
                  <td>{selectedTeacher.user?.email || selectedTeacher.email || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Department</strong></td>
                  <td>{selectedTeacher.department || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Subject</strong></td>
                  <td>{selectedTeacher.subject || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Status</strong></td>
                  <td>
                    <Badge 
                      bg={
                        selectedTeacher.status === 'active' ? 'success' : 
                        selectedTeacher.status === 'onLeave' ? 'warning' : 'secondary'
                      }
                    >
                      {selectedTeacher.status || 'N/A'}
                    </Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Duty Eligibility</strong></td>
                  <td>
                    {selectedTeacher.duty_eligibility ? (
                      <Badge bg="success">Yes</Badge>
                    ) : (
                      <Badge bg="secondary">No</Badge>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Last Assigned</strong></td>
                  <td>
                    {selectedTeacher.last_assigned_at ? (
                      new Date(selectedTeacher.last_assigned_at).toLocaleString()
                    ) : (
                      'Never assigned'
                    )}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
