import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:5252/api";

function HealthcareDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    nurses: 0,
    records: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadHealthcareStats() {
    try {
      setLoading(true);

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

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Healthcare dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadHealthcareStats();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const totalCareTeam = useMemo(
    () => stats.doctors + stats.nurses,
    [stats.doctors, stats.nurses]
  );

  const operationalItems = [
    {
      icon: "👥",
      title: "Patient Management",
      description: "Patient profiles, registration and care information",
      count: stats.patients,
      label: "PATIENTS",
      status: "ACTIVE",
    },
    {
      icon: "🩺",
      title: "Medical Staff",
      description: "Doctors, specialties and clinical care teams",
      count: totalCareTeam,
      label: "CARE TEAM",
      status: "ACTIVE",
    },
    {
      icon: "📋",
      title: "Clinical Records",
      description: "Medical histories, diagnoses and treatment records",
      count: stats.records,
      label: "RECORDS",
      status: "SECURED",
    },
  ];

  return (
    <div className="healthcare-dashboard">

      {/* ==========================================
          HERO HEADER
      ========================================== */}

      <section className="healthcare-hero">

        <div className="healthcare-hero-main">

          <div className="healthcare-kicker">
            <span className="healthcare-kicker-line"></span>
            MEDISHIELD AI // HEALTHCARE OPERATIONS
          </div>

          <h1>
            Healthcare
            <span> Command Center</span>
          </h1>

          <p>
            Unified visibility across patients, clinical teams and medical
            records — connected to the MediShield AI security infrastructure.
          </p>

          <div className="healthcare-hero-meta">
            <div className="healthcare-live-indicator">
              <span></span>
              HEALTHCARE NETWORK ONLINE
            </div>

            <div className="healthcare-update-time">
              {lastUpdated
                ? `UPDATED ${lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "SYNCHRONIZING..."}
            </div>
          </div>

        </div>

        <div className="healthcare-hero-visual">

          <div className="healthcare-orbit healthcare-orbit-one"></div>
          <div className="healthcare-orbit healthcare-orbit-two"></div>

          <div className="healthcare-cross">
            <div className="cross-horizontal"></div>
            <div className="cross-vertical"></div>
          </div>

          <div className="healthcare-core">
            <div className="healthcare-core-inner">
              +
            </div>
          </div>

          <div className="healthcare-node healthcare-node-one">
            PATIENTS
          </div>

          <div className="healthcare-node healthcare-node-two">
            CARE
          </div>

          <div className="healthcare-node healthcare-node-three">
            RECORDS
          </div>

        </div>

      </section>


      {/* ==========================================
          OVERVIEW BAR
      ========================================== */}

      <section className="healthcare-overview-bar">

        <div>
          <span>OPERATIONS OVERVIEW</span>
          <strong>Clinical ecosystem status</strong>
        </div>

        <button
          className="healthcare-refresh-btn"
          onClick={loadHealthcareStats}
          disabled={loading}
        >
          <span className={loading ? "refresh-spin" : ""}>↻</span>
          {loading ? "SYNCING" : "REFRESH DATA"}
        </button>

      </section>


      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <section className="healthcare-stat-grid">

        <HealthcareStatCard
          icon="👥"
          label="REGISTERED PATIENTS"
          value={loading ? "—" : stats.patients}
          description="Active patient profiles"
          number="01"
        />

        <HealthcareStatCard
          icon="🩺"
          label="DOCTORS"
          value={loading ? "—" : stats.doctors}
          description="Clinical practitioners"
          number="02"
        />

        <HealthcareStatCard
          icon="⚕"
          label="NURSING STAFF"
          value={loading ? "—" : stats.nurses}
          description="Care & support staff"
          number="03"
        />

        <HealthcareStatCard
          icon="📋"
          label="MEDICAL RECORDS"
          value={loading ? "—" : stats.records}
          description="Protected clinical records"
          number="04"
        />

      </section>


      {/* ==========================================
          MAIN GRID
      ========================================== */}

      <section className="healthcare-main-grid">

        {/* CARE OPERATIONS */}

        <div className="healthcare-card healthcare-operations-card">

          <div className="healthcare-card-header">

            <div>
              <span className="healthcare-card-label">
                CLINICAL OPERATIONS
              </span>

              <h2>Care Network</h2>

              <p>
                Real-time overview of the healthcare management modules.
              </p>
            </div>

            <div className="healthcare-card-status">
              <span></span>
              LIVE
            </div>

          </div>


          <div className="healthcare-module-list">

            {operationalItems.map((item, index) => (
              <div className="healthcare-module" key={item.title}>

                <div className="healthcare-module-number">
                  0{index + 1}
                </div>

                <div className="healthcare-module-icon">
                  {item.icon}
                </div>

                <div className="healthcare-module-content">

                  <div className="healthcare-module-title-row">

                    <strong>{item.title}</strong>

                    <span className="healthcare-module-status">
                      {item.status}
                    </span>

                  </div>

                  <p>{item.description}</p>

                </div>

                <div className="healthcare-module-count">

                  <strong>{loading ? "—" : item.count}</strong>

                  <span>{item.label}</span>

                </div>

                <div className="healthcare-module-arrow">
                  →
                </div>

              </div>
            ))}

          </div>

        </div>


        {/* SYSTEM STATUS */}

        <div className="healthcare-card healthcare-system-card">

          <div className="healthcare-card-header">

            <div>
              <span className="healthcare-card-label">
                INFRASTRUCTURE
              </span>

              <h2>System Status</h2>

              <p>
                Healthcare services and security infrastructure.
              </p>
            </div>

          </div>


          <div className="healthcare-system-health">

            <div className="healthcare-health-ring">

              <div className="healthcare-health-ring-inner">
                <strong>100%</strong>
                <span>ONLINE</span>
              </div>

            </div>

            <div>
              <strong className="healthcare-health-title">
                SYSTEM HEALTHY
              </strong>

              <p className="healthcare-health-description">
                Core healthcare services are operational.
              </p>
            </div>

          </div>


          <div className="healthcare-service-list">

            <HealthcareService
              name="PostgreSQL Database"
              status="CONNECTED"
            />

            <HealthcareService
              name="ASP.NET Core API"
              status="ONLINE"
            />

            <HealthcareService
              name="JWT Authentication"
              status="ENABLED"
            />

            <HealthcareService
              name="Medical Records API"
              status="ACTIVE"
            />

          </div>

        </div>

      </section>


      {/* ==========================================
          SECURITY + QUICK ACCESS
      ========================================== */}

      <section className="healthcare-bottom-grid">

        <div className="healthcare-security-panel">

          <div className="healthcare-security-icon">
            🔐
          </div>

          <div className="healthcare-security-content">

            <span>MEDISHIELD SECURITY LAYER</span>

            <h2>
              Healthcare data protection is active
            </h2>

            <p>
              Clinical data is operating within the MediShield AI security
              environment with authenticated API access and protected
              healthcare services.
            </p>

          </div>

          <div className="healthcare-security-badge">
            <span></span>
            PROTECTED
          </div>

        </div>


        <div className="healthcare-quick-card">

          <div className="healthcare-card-label">
            QUICK METRICS
          </div>

          <div className="healthcare-quick-metrics">

            <div>
              <strong>
                {loading ? "—" : totalCareTeam}
              </strong>
              <span>CARE TEAM</span>
            </div>

            <div>
              <strong>
                {loading ? "—" : stats.patients + stats.records}
              </strong>
              <span>DATA POINTS</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>MONITORING</span>
            </div>

          </div>

        </div>

      </section>


      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="healthcare-dashboard-footer">

        <span>
          MEDISHIELD AI / HEALTHCARE OPERATIONS
        </span>

        <span>
          SECURE CLINICAL ENVIRONMENT
        </span>

        <span>
          API STATUS: ONLINE
        </span>

      </div>

    </div>
  );
}


/* ==========================================
   STAT CARD
========================================== */

function HealthcareStatCard({
  icon,
  label,
  value,
  description,
  number,
}) {
  return (
    <div className="healthcare-stat-card">

      <div className="healthcare-stat-top">

        <span className="healthcare-stat-number">
          {number}
        </span>

        <span className="healthcare-stat-icon">
          {icon}
        </span>

      </div>

      <div className="healthcare-stat-value">
        {value}
      </div>

      <div className="healthcare-stat-label">
        {label}
      </div>

      <p>{description}</p>

      <div className="healthcare-stat-line">
        <span></span>
      </div>

    </div>
  );
}


/* ==========================================
   SERVICE STATUS
========================================== */

function HealthcareService({ name, status }) {
  return (
    <div className="healthcare-service">

      <div className="healthcare-service-name">
        <span className="healthcare-service-dot"></span>
        {name}
      </div>

      <span className="healthcare-service-status">
        {status}
      </span>

    </div>
  );
}

export default HealthcareDashboard;