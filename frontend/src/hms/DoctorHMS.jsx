import { useState } from "react";
import "./HMS.css";
function DoctorHMS({ currentUser, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const doctorName = currentUser?.name || "Doctor";

  const menu = [
    "Dashboard",
    "My Patients",
    "Medical Records",
    "Prescriptions",
    "Appointments",
  ];

  const patients = [
    {
      id: "PAT001",
      name: "Amit Patel",
      age: 45,
      condition: "Hypertension",
    },
    {
      id: "PAT002",
      name: "Rahul Shah",
      age: 52,
      condition: "Diabetes",
    },
    {
      id: "PAT003",
      name: "Neha Joshi",
      age: 31,
      condition: "Migraine",
    },
  ];

  const renderDashboard = () => (
    <>
      <div className="hms-welcome">
        <div>
          <span>MEDISHIELD HMS</span>
          <h1>Welcome, {doctorName}</h1>
          <p>Doctor Hospital Management Portal</p>
        </div>
      </div>

      <div className="hms-cards">
        <div className="hms-card">
          <span>MY PATIENTS</span>
          <strong>24</strong>
          <small>Active patients</small>
        </div>

        <div className="hms-card">
          <span>APPOINTMENTS</span>
          <strong>6</strong>
          <small>Today's appointments</small>
        </div>

        <div className="hms-card">
          <span>MEDICAL RECORDS</span>
          <strong>24</strong>
          <small>Patient records</small>
        </div>
      </div>

      <div className="hms-panel">
        <div className="hms-panel-header">
          <div>
            <h2>Today's Appointments</h2>
            <p>Your scheduled patients for today</p>
          </div>
        </div>

        <div className="hms-list">
          <div className="hms-list-row">
            <strong>09:30 AM</strong>
            <span>Amit Patel</span>
            <small>Follow-up</small>
          </div>

          <div className="hms-list-row">
            <strong>11:00 AM</strong>
            <span>Rahul Shah</span>
            <small>Diabetes Review</small>
          </div>

          <div className="hms-list-row">
            <strong>02:30 PM</strong>
            <span>Neha Joshi</span>
            <small>Consultation</small>
          </div>
        </div>
      </div>
    </>
  );

  const renderPatients = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>My Patients</h1>
        <p>Patients assigned to you</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Condition</th>
                <th>Patient ID</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <strong>{patient.name}</strong>
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.condition}</td>
                  <td>{patient.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderRecords = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Medical Records</h1>
        <p>Patient medical information</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Amit Patel</td>
                <td>Hypertension</td>
                <td>Amlodipine 5mg</td>
                <td>24 Sep 2026</td>
              </tr>

              <tr>
                <td>Rahul Shah</td>
                <td>Diabetes</td>
                <td>Metformin 500mg</td>
                <td>23 Sep 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderPlaceholder = (title) => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>{title}</h1>
        <p>{title} management will appear here.</p>
      </div>

      <div className="hms-empty">
        <div>+</div>
        <h2>{title}</h2>
        <p>This section is ready for integration.</p>
      </div>
    </>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();

      case "My Patients":
        return renderPatients();

      case "Medical Records":
        return renderRecords();

      case "Prescriptions":
        return renderPlaceholder("Prescriptions");

      case "Appointments":
        return renderPlaceholder("Appointments");

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
          <strong>DOCTOR</strong>
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
                {item === "My Patients" && "♙"}
                {item === "Medical Records" && "▤"}
                {item === "Prescriptions" && "✚"}
                {item === "Appointments" && "◷"}
              </span>

              {item}
            </button>
          ))}
        </nav>

        <div className="hms-sidebar-bottom">
          <div className="hms-user">
            <div className="hms-avatar">
              {doctorName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{doctorName}</strong>
              <small>Doctor</small>
            </div>
          </div>

          <button className="hms-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="hms-main">
        <header className="hms-topbar">
          <div>
            <strong>{activePage}</strong>
          </div>

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

export default DoctorHMS;