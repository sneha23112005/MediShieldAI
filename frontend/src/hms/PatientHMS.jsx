import { useState } from "react";
import "./HMS.css";

function PatientHMS({ currentUser, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const patientName = currentUser?.name || "Patient";

  const menu = [
    "Dashboard",
    "My Medical History",
    "My Medications",
    "My Appointments",
    "Book Appointment",
  ];

  const renderDashboard = () => (
    <>
      <div className="hms-welcome">
        <div>
          <span>MEDISHIELD HMS</span>
          <h1>Hello, {patientName}</h1>
          <p>Your personal healthcare portal</p>
        </div>
      </div>

      <div className="hms-cards">
        <div className="hms-card">
          <span>MEDICAL RECORDS</span>
          <strong>4</strong>
          <small>Your medical records</small>
        </div>

        <div className="hms-card">
          <span>MEDICATIONS</span>
          <strong>3</strong>
          <small>Current medications</small>
        </div>

        <div className="hms-card">
          <span>APPOINTMENTS</span>
          <strong>2</strong>
          <small>Upcoming appointments</small>
        </div>
      </div>

      <div className="hms-panel">
        <div className="hms-panel-header">
          <div>
            <h2>Upcoming Appointment</h2>
            <p>Your next scheduled hospital visit</p>
          </div>
        </div>

        <div className="patient-appointment">
          <div className="appointment-date">
            <strong>28</strong>
            <span>SEP</span>
          </div>

          <div className="appointment-info">
            <strong>Dr. Rahul Sharma</strong>
            <span>Cardiology</span>
            <small>10:30 AM • MediShield Hospital</small>
          </div>

          <span className="appointment-status">
            CONFIRMED
          </span>
        </div>
      </div>

      <div className="hms-panel">
        <div className="hms-panel-header">
          <div>
            <h2>Quick Services</h2>
            <p>Access your healthcare services</p>
          </div>
        </div>

        <div className="patient-services">
          <button onClick={() => setActivePage("My Medical History")}>
            <span>▤</span>
            <strong>Medical History</strong>
            <small>View your records</small>
          </button>

          <button onClick={() => setActivePage("My Medications")}>
            <span>✚</span>
            <strong>Medications</strong>
            <small>View your medicines</small>
          </button>

          <button onClick={() => setActivePage("Book Appointment")}>
            <span>＋</span>
            <strong>Book Appointment</strong>
            <small>Schedule a visit</small>
          </button>
        </div>
      </div>
    </>
  );

  const renderMedicalHistory = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>My Medical History</h1>
        <p>Your medical records and diagnosis history</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>24 Sep 2026</td>
                <td>Dr. Rahul Sharma</td>
                <td>Hypertension</td>
                <td>Amlodipine 5mg</td>
              </tr>

              <tr>
                <td>15 Aug 2026</td>
                <td>Dr. Priya Sharma</td>
                <td>Routine Check-up</td>
                <td>None</td>
              </tr>

              <tr>
                <td>12 Jul 2026</td>
                <td>Dr. Rahul Sharma</td>
                <td>Blood Pressure</td>
                <td>Continue medication</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderMedications = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>My Medications</h1>
        <p>Current medications prescribed by your doctors</p>
      </div>

      <div className="medication-grid">
        <div className="medication-card">
          <div className="medication-icon">+</div>

          <div>
            <strong>Amlodipine 5mg</strong>
            <span>Once daily</span>
            <small>Prescribed by Dr. Rahul Sharma</small>
          </div>

          <b>ACTIVE</b>
        </div>

        <div className="medication-card">
          <div className="medication-icon">+</div>

          <div>
            <strong>Metformin 500mg</strong>
            <span>Twice daily</span>
            <small>Take after meals</small>
          </div>

          <b>ACTIVE</b>
        </div>

        <div className="medication-card">
          <div className="medication-icon">+</div>

          <div>
            <strong>Vitamin D</strong>
            <span>Once weekly</span>
            <small>Prescribed during check-up</small>
          </div>

          <b>ACTIVE</b>
        </div>
      </div>
    </>
  );

  const renderAppointments = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>My Appointments</h1>
        <p>Your upcoming and previous appointments</p>
      </div>

      <div className="hms-panel">
        <div className="hms-table-wrapper">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>28 Sep 2026</td>
                <td>Dr. Rahul Sharma</td>
                <td>Cardiology</td>
                <td>10:30 AM</td>
                <td>
                  <span className="hms-status">
                    Confirmed
                  </span>
                </td>
              </tr>

              <tr>
                <td>15 Aug 2026</td>
                <td>Dr. Priya Sharma</td>
                <td>General Medicine</td>
                <td>11:00 AM</td>
                <td>Completed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderBooking = () => (
    <>
      <div className="hms-page-title">
        <span>MEDISHIELD HMS</span>
        <h1>Book Appointment</h1>
        <p>Schedule an appointment with a doctor</p>
      </div>

      <div className="hms-form-panel">
        <div className="hms-form-grid">
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
            <label>Department</label>

            <select defaultValue="">
              <option value="" disabled>
                Select department
              </option>

              <option>Cardiology</option>
              <option>General Medicine</option>
              <option>Neurology</option>
              <option>Pediatrics</option>
            </select>
          </div>

          <div className="hms-field">
            <label>Appointment Date</label>

            <input type="date" />
          </div>

          <div className="hms-field">
            <label>Preferred Time</label>

            <input type="time" />
          </div>

          <div className="hms-field hms-field-full">
            <label>Reason for Visit</label>

            <textarea
              placeholder="Briefly describe the reason for your appointment"
              rows="4"
            />
          </div>
        </div>

        <button className="hms-primary-button">
          Request Appointment
        </button>
      </div>
    </>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return renderDashboard();

      case "My Medical History":
        return renderMedicalHistory();

      case "My Medications":
        return renderMedications();

      case "My Appointments":
        return renderAppointments();

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
          <strong>PATIENT</strong>
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
                {item === "My Medical History" && "▤"}
                {item === "My Medications" && "✚"}
                {item === "My Appointments" && "◷"}
                {item === "Book Appointment" && "＋"}
              </span>

              {item}
            </button>
          ))}
        </nav>

        <div className="hms-sidebar-bottom">
          <div className="hms-user">
            <div className="hms-avatar">
              {patientName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{patientName}</strong>
              <small>Patient</small>
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

export default PatientHMS;