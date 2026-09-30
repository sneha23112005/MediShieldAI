
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5252/api";

function HealthcareDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    nurses: 0,
    records: 0,
  });

  const [loading, setLoading] = useState(true);

  async function loadHealthcareStats() {
    try {
      const [
        patientsResponse,
        doctorsResponse,
        nursesResponse,
        recordsResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`),
        fetch(`${API_BASE_URL}/doctors`),
        fetch(`${API_BASE_URL}/nurses`),
        fetch(`${API_BASE_URL}/medical-records`),
      ]);

      const patients = patientsResponse.ok
        ? await patientsResponse.json()
        : [];

      const doctors = doctorsResponse.ok
        ? await doctorsResponse.json()
        : [];

      const nurses = nursesResponse.ok
        ? await nursesResponse.json()
        : [];

      const records = recordsResponse.ok
        ? await recordsResponse.json()
        : [];

      setStats({
        patients: Array.isArray(patients) ? patients.length : 0,
        doctors: Array.isArray(doctors) ? doctors.length : 0,
        nurses: Array.isArray(nurses) ? nurses.length : 0,
        records: Array.isArray(records) ? records.length : 0,
      });
    } catch (error) {
      console.error("Healthcare dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadHealthcareStats();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  return (
    <div className="healthcare-dashboard">
      <div className="healthcare-header">
        <div>
          <p className="section-label">CLINICAL OPERATIONS STUDIO</p>
          <h1>Care, coordinated in context.</h1>
          <p>
            A unified operational view of people, care teams and clinical
            records—designed for confident decisions, not routine data entry.
          </p>
        </div>

        <div className="healthcare-status">
          <span className="status-dot"></span>
          CARE NETWORK ONLINE
        </div>
      </div>

      <div className="healthcare-stats-grid">
        <div className="healthcare-stat-card">
          <span className="stat-icon">👤</span>
          <div>
            <span className="stat-label">PATIENTS</span>
            <strong>
              {loading ? "..." : stats.patients}
            </strong>
          </div>
        </div>

        <div className="healthcare-stat-card">
          <span className="stat-icon">🩺</span>
          <div>
            <span className="stat-label">DOCTORS</span>
            <strong>
              {loading ? "..." : stats.doctors}
            </strong>
          </div>
        </div>

        <div className="healthcare-stat-card">
          <span className="stat-icon">👩‍⚕️</span>
          <div>
            <span className="stat-label">NURSES</span>
            <strong>
              {loading ? "..." : stats.nurses}
            </strong>
          </div>
        </div>

        <div className="healthcare-stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <span className="stat-label">MEDICAL RECORDS</span>
            <strong>
              {loading ? "..." : stats.records}
            </strong>
          </div>
        </div>
      </div>

      <div className="healthcare-info-grid">
        <div className="healthcare-panel">
          <div className="panel-heading">
            <h2>Care network</h2>
            <span>LIVE</span>
          </div>

          <div className="module-list">
            <div className="module-item">
              <div>
                <strong>People</strong>
                <p>Patient identity, profiles and continuity of care</p>
              </div>
              <span>READY</span>
            </div>

            <div className="module-item">
              <div>
                <strong>Clinical leads</strong>
                <p>Practitioners, specialties and accountable care</p>
              </div>
              <span>READY</span>
            </div>

            <div className="module-item">
              <div>
                <strong>Care teams</strong>
                <p>Nursing teams, departments and coordinated handoffs</p>
              </div>
              <span>READY</span>
            </div>

            <div className="module-item">
              <div>
                <strong>Clinical story</strong>
                <p>Diagnoses, prescriptions and longitudinal notes</p>
              </div>
              <span>READY</span>
            </div>
          </div>
        </div>

        <div className="healthcare-panel">
          <div className="panel-heading">
            <h2>System confidence</h2>
          </div>

          <div className="integration-item">
            <span>PostgreSQL Database</span>
            <strong>CONNECTED</strong>
          </div>

          <div className="integration-item">
            <span>ASP.NET Core API</span>
            <strong>ONLINE</strong>
          </div>

          <div className="integration-item">
            <span>JWT Authentication</span>
            <strong>ENABLED</strong>
          </div>

          <div className="integration-item">
            <span>Medical Records API</span>
            <strong>ACTIVE</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthcareDashboard;
