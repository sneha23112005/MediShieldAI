import { useState } from "react";
import "./HMS.css";

function NurseHMS({ currentUser, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const nurseName = currentUser?.name || "Nurse";

  const menu = [
    "Dashboard",
    "Patients",
    "Today's Appointments",
    "Patient Care",
    "Book Appointment",
  ];

  const patients = [
    {
      id: "PAT001",
      name: "Amit Patel",
      room: "Room 204",
      status: "Stable",
    },
    {
      id: "PAT002",
      name: "Rahul Shah",
      room: "Room 208",
      status: "Under Observation",
    },
    {
      id: "PAT003",
      name: "Neha Joshi",
      room: "Room 112",
      status: "Stable",
    },
  ];

  const renderDashboard = () => (
    <>
      <div className="hms-welcome">
        <div>
          <span>MEDISHIELD HMS</span>
          <h1>Welcome, {nurseName}</h1>
          <p>Nurse Hospital Management Portal</p>
        </div>
      </div>

      <div className="hms-cards">
        <div className="hms-card">
          <span>TODAY'S PATIENTS</span>
          <strong>18</strong>
          <small>Patients assigned</small>
        </div>

        <div className="hms-card">
          <span>APPOINTMENTS</span>
          <strong>8</strong>
          <small>Today's schedule</small>
        </div>

        <div className="hms-card">
          <span>PENDING CARE</span>
          <strong>5</strong>
          <small>Tasks requiring attention</small>
        </div>
      </div>

      <div className="hms-panel">
        <div className="hms-panel-header">
          <div>
            <h2>Today's Patient Schedule</h2>
            <p>Patients currently assigned to you</p>
          </div>
        </div>

        <div className="hms-list">
          <div className="hms-list-row">
            <strong>09:00 AM</strong>
            <span>Amit Patel</span>
            <small>Vitals Check</small>
          </div>

          <div className="hms-list-row">
            <strong>11:30 AM</strong>
            <span>Rahul Shah</span>
            <small>Medication</small>
          </div>

          <div className="hms-list-row">
            <strong>02:00 PM</strong>
            <span>Neha Joshi</span>
            <small>Patient Care</small>
          </div>
        </div>
      </div>
    </>
  );

  const renderPatients = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Patients</h1>
        <p>Patients currently under your care</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Room</th>
                <th>Status</th>
                <th>Patient ID</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <strong>{patient.name}</strong>
                  </td>

                  <td>{patient.room}</td>

                  <td>
                    <span className="hms-status">
                      {patient.status}
                    </span>
                  </td>

                  <td>{patient.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAppointments = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Today's Appointments</h1>
        <p>Patient appointments scheduled for today</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Purpose</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>09:30 AM</td>
                <td>Amit Patel</td>
                <td>Dr. Rahul Sharma</td>
                <td>Follow-up</td>
              </tr>

              <tr>
                <td>11:00 AM</td>
                <td>Rahul Shah</td>
                <td>Dr. Priya Sharma</td>
                <td>Consultation</td>
              </tr>

              <tr>
                <td>02:30 PM</td>
                <td>Neha Joshi</td>
                <td>Dr. Rahul Sharma</td>
                <td>Review</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderCare = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Patient Care</h1>
        <p>Manage routine patient care activities</p>
      </div>

      <div className="hms-cards">
        <div className="hms-card">
          <span>VITALS CHECK</span>
          <strong>8</strong>
          <small>Pending checks</small>
        </div>

        <div className="hms-card">
          <span>MEDICATION</span>
          <strong>4</strong>
          <small>Medication tasks</small>
        </div>

        <div className="hms-card">
          <span>FOLLOW-UP</span>
          <strong>3</strong>
          <small>Follow-up tasks</small>
        </div>
      </div>

      <div className="hms-panel">
        <div className="hms-panel-header">
          <div>
            <h2>Care Tasks</h2>
            <p>Tasks assigned for today's shift</p>
          </div>
        </div>

        <div className="hms-list">
          <div className="hms-list-row">
            <strong>Amit Patel</strong>
            <span>Check blood pressure</span>
            <small>Pending</small>
          </div>

          <div className="hms-list-row">
            <strong>Rahul Shah</strong>
            <span>Administer medication</span>
            <small>Pending</small>
          </div>

          <div className="hms-list-row">
            <strong>Neha Joshi</strong>
            <span>Record patient vitals</span>
            <small>Completed</small>
          </div>
        </div>
      </div>
    </>
  );

  const renderBooking = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Book Appointment</h1>
        <p>Create a patient appointment</p>
      </div>

      <div className="hms-form-panel">
        <div className="hms-form-grid">
          <div className="hms-field">
            <label>Patient Name</label>
            <input placeholder="Enter patient name" />
          </div>

          <div className="hms-field">
            <label>Doctor</label>
            <select defaultValue="">
              <option value="" disabled>
                Select doctor
              </option>
              <option>Dr. Rahul Sharma</option>
              <option>Dr. Priya Sharma</option>
            </select>
          </div>

          <div className="hms-field">
            <label>Appointment Date</label>
            <input type="date" />
          </div>

          <div className="hms-field">
            <label>Appointment Time</label>
            <input type="time" />
          </div>
        </div>

        <button className="hms-primary-button">
          Book Appointment
        </button>
      </div>
    </>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();

      case "Patients":
        return renderPatients();

      case "Today's Appointments":
        return renderAppointments();

      case "Patient Care":
        return renderCare();

      case "Book Appointment":
        return renderBooking();

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="hms-shell">
      <aside className="hms-sidebar">
        <div className="hms-logo">
          <div className="hms-logo-icon">+</div>

          <div>
            <strong>MEDISHIELD</strong>
            <small>HOSPITAL MANAGEMENT</small>
          </div>
        </div>

        <div className="hms-role">
          <span>LOGGED IN AS</span>
          <strong>NURSE</strong>
        </div>

        <nav className="hms-nav">
          {menu.map((item) => (
            <button
              key={item}
              className={activePage === item ? "active" : ""}
              onClick={() => setActivePage(item)}
            >
              <span>
                {item === "Dashboard" && "⌂"}
                {item === "Patients" && "♙"}
                {item === "Today's Appointments" && "◷"}
                {item === "Patient Care" && "✚"}
                {item === "Book Appointment" && "＋"}
              </span>

              {item}
            </button>
          ))}
        </nav>

        <div className="hms-sidebar-bottom">
          <div className="hms-user">
            <div className="hms-avatar">
              {nurseName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{nurseName}</strong>
              <small>Nurse</small>
            </div>
          </div>

          <button className="hms-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="hms-main">
        <header className="hms-topbar">
          <strong>{activePage}</strong>

          <div className="hms-online">
            <span></span>
            HMS ONLINE
          </div>
        </header>

        <section className="hms-content">
          {renderPage()}
        </section>
      </main>
    </div>
  );
}

export default NurseHMS;