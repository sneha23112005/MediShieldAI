import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import MediShieldLogo from "./MediShieldLogo";
import HealthcareDashboard from "./healthcare/HealthcareDashboard";

const API_BASE_URL = "http://localhost:5252/api";

// ============================================================
// API HELPER
// ============================================================

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.title ||
      (typeof data === "string" ? data : null) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

// ============================================================
// MODAL
// ============================================================

function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal-card ${wide ? "modal-wide" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({ label, value, icon, tone = "cyan", subtext }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-card-top">
        <div className="metric-icon">{icon}</div>
        <div className="metric-label">{label}</div>
      </div>

      <div className="metric-value">{value ?? 0}</div>

      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let className = "status-badge";

  if (
    normalized.includes("active") ||
    normalized.includes("secure") ||
    normalized.includes("healthy") ||
    normalized.includes("resolved")
  ) {
    className += " status-green";
  } else if (
    normalized.includes("critical") ||
    normalized.includes("inactive") ||
    normalized.includes("blocked")
  ) {
    className += " status-red";
  } else if (
    normalized.includes("warning") ||
    normalized.includes("pending")
  ) {
    className += " status-yellow";
  } else {
    className += " status-blue";
  }

  return <span className={className}>{status || "Unknown"}</span>;
}

// ============================================================
// MAIN APP
// ============================================================

function App() {
  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const [activePage, setActivePage] = useState("Dashboard");

  // ==========================================================
  // SECURITY DATA
  // ==========================================================

  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);

  // ==========================================================
  // USER MODAL
  // ==========================================================

  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "SOC Analyst",
    department: "Security Operations",
    status: "Active",
  });

  // ==========================================================
  // PATIENTS
  // ==========================================================

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSaving, setPatientSaving] = useState(false);
  const [patientError, setPatientError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  const emptyPatient = {
    name: "",
    age: "",
    gender: "Female",
    bloodGroup: "O+",
    phone: "",
    email: "",
    address: "",
  };

  const [patientForm, setPatientForm] = useState(emptyPatient);

  // ==========================================================
  // DOCTORS
  // ==========================================================

  const [doctors, setDoctors] = useState([]);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorError, setDoctorError] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const emptyDoctor = {
    name: "",
    specialization: "",
    phone: "",
    email: "",
  };

  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  // ==========================================================
  // NURSES
  // ==========================================================

  const [nurses, setNurses] = useState([]);
  const [editingNurse, setEditingNurse] = useState(null);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [nurseSaving, setNurseSaving] = useState(false);
  const [nurseError, setNurseError] = useState("");
  const [nurseSearch, setNurseSearch] = useState("");

  const emptyNurse = {
    name: "",
    department: "",
    phone: "",
    email: "",
  };

  const [nurseForm, setNurseForm] = useState(emptyNurse);

  // ==========================================================
  // MEDICAL RECORDS
  // ==========================================================

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordSaving, setRecordSaving] = useState(false);
  const [recordError, setRecordError] = useState("");

  const emptyRecord = {
    patientId: "",
    doctorId: "",
    nurseId: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  };

  const [recordForm, setRecordForm] = useState(emptyRecord);

  // ==========================================================
  // ROLE HELPERS
  // ==========================================================

  const userRole = currentUser?.role || "";

  const securityRoles = [
    "Security Admin",
    "SOC Analyst",
    "Security Analyst",
    "Forensic Analyst",
    "Administrator",
    "Admin",
  ];

  const isSecurityUser = securityRoles.includes(userRole);
  const isDoctor = userRole === "Doctor";
  const isNurse = userRole === "Nurse";
  const isPatient = userRole === "Patient";

  // ==========================================================
  // NAVIGATION MENUS
  // ==========================================================

  const securityMenu = [
    "Dashboard",
    "Vulnerabilities",
    "Threat Intelligence",
    "Security Events",
    "Users",
    "Audit Logs",
    "Healthcare Dashboard",
    "Patients",
    "Doctors",
    "Nurses",
    "Medical Records",
  ];

  const doctorMenu = [
    "Dashboard",
    "My Patients",
    "Medical History",
    "Medications",
    "Appointments",
  ];

  const nurseMenu = [
    "Dashboard",
    "Today's Appointments",
    "Patients",
    "Book Appointment",
  ];

  const patientMenu = [
    "Dashboard",
    "My Medical History",
    "My Medications",
    "Appointment History",
    "Book Appointment",
  ];

  const menuItems = isSecurityUser
    ? securityMenu
    : isDoctor
    ? doctorMenu
    : isNurse
    ? nurseMenu
    : patientMenu;

  // ==========================================================
  // AUTH
  // ==========================================================

  function handleLoginSuccess(user, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setCurrentUser(user);
    setAuthenticated(true);
    setActivePage("Dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setAuthenticated(false);
    setActivePage("Dashboard");
  }

  // ==========================================================
  // FETCH DASHBOARD
  // ==========================================================

  async function fetchDashboard() {
    setDashboardLoading(true);

    try {
      const data = await apiFetch("/dashboard");
      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setDashboardLoading(false);
    }
  }

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  async function fetchUsers() {
    setUsersLoading(true);
    setUserError("");

    try {
      const data = await apiFetch("/users");

      const list = Array.isArray(data)
        ? data
        : data?.users || data?.data || [];

      setUsers(list);
    } catch (error) {
      console.error("Users error:", error);
      setUserError(error.message);
    } finally {
      setUsersLoading(false);
    }
  }

  // ==========================================================
  // FETCH HEALTHCARE DATA
  // ==========================================================

  async function fetchHealthcareData() {
    try {
      const [patientData, doctorData, nurseData, recordData] =
        await Promise.all([
          apiFetch("/patients"),
          apiFetch("/doctors"),
          apiFetch("/nurses"),
          apiFetch("/medical-records"),
        ]);

      setPatients(
        Array.isArray(patientData)
          ? patientData
          : patientData?.patients || patientData?.data || []
      );

      setDoctors(
        Array.isArray(doctorData)
          ? doctorData
          : doctorData?.doctors || doctorData?.data || []
      );

      setNurses(
        Array.isArray(nurseData)
          ? nurseData
          : nurseData?.nurses || nurseData?.data || []
      );

      setMedicalRecords(
        Array.isArray(recordData)
          ? recordData
          : recordData?.medicalRecords || recordData?.records || recordData?.data || []
      );
    } catch (error) {
      console.error("Healthcare data error:", error);
    }
  }

  // ==========================================================
  // FETCH SECURITY MODULES
  // ==========================================================

  async function fetchSecurityModules() {
    try {
      const vulnerabilityData = await apiFetch("/Vulnerability");

      setVulnerabilities(
        Array.isArray(vulnerabilityData)
          ? vulnerabilityData
          : vulnerabilityData?.vulnerabilities ||
              vulnerabilityData?.data ||
              []
      );
    } catch (error) {
      console.warn("Vulnerability endpoint:", error.message);
      setVulnerabilities([]);
    }

    try {
      const eventData = await apiFetch("/SecurityEvents");

      setSecurityEvents(
        Array.isArray(eventData)
          ? eventData
          : eventData?.events || eventData?.securityEvents || eventData?.data || []
      );
    } catch (error) {
      console.warn("Security events endpoint:", error.message);
      setSecurityEvents([]);
    }
  }

  // ==========================================================
  // INITIAL DATA LOAD
  // ==========================================================

  useEffect(() => {
    if (!authenticated) return;

    fetchDashboard();
    fetchHealthcareData();

    if (isSecurityUser) {
      fetchUsers();
      fetchSecurityModules();
    }
  }, [authenticated, isSecurityUser]);

  // ==========================================================
  // USER CRUD
  // ==========================================================

  function resetUserForm() {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "SOC Analyst",
      department: "Security Operations",
      status: "Active",
    });

    setEditingUserId(null);
  }

  function openAddUser() {
    resetUserForm();
    setShowAddUser(true);
  }

  function openEditUser(user) {
    setEditingUserId(user.id);

    setNewUser({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "SOC Analyst",
      department: user.department || "",
      status: user.status || "Active",
    });

    setShowAddUser(true);
  }

  async function handleSaveUser(event) {
    event.preventDefault();

    setUserError("");

    try {
      if (editingUserId) {
        await apiFetch(`/users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...newUser,
          }),
        });
      } else {
        await apiFetch("/users", {
          method: "POST",
          body: JSON.stringify(newUser),
        });
      }

      setShowAddUser(false);
      resetUserForm();
      await fetchUsers();
      await fetchDashboard();
    } catch (error) {
      setUserError(error.message);
    }
  }

  async function handleDeleteUser(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/users/${id}`, {
        method: "DELETE",
      });

      await fetchUsers();
      await fetchDashboard();
    } catch (error) {
      setUserError(error.message);
    }
  }

  // ==========================================================
  // PATIENT CRUD
  // ==========================================================

  function resetPatientForm() {
    setPatientForm(emptyPatient);
    setEditingPatient(null);
    setPatientError("");
  }

  function openAddPatient() {
    resetPatientForm();
    setShowPatientModal(true);
  }

  function openEditPatient(patient) {
    setEditingPatient(patient);

    setPatientForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "Female",
      bloodGroup: patient.bloodGroup || "O+",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
    });

    setPatientError("");
    setShowPatientModal(true);
  }

  async function savePatient(event) {
    event.preventDefault();

    setPatientSaving(true);
    setPatientError("");

    try {
      if (editingPatient) {
        await apiFetch(`/patients/${editingPatient.patientId || editingPatient.id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...patientForm,
            age: Number(patientForm.age),
          }),
        });
      } else {
        await apiFetch("/patients/register", {
          method: "POST",
          body: JSON.stringify({
            ...patientForm,
            age: Number(patientForm.age),
            password: "Patient@123",
          }),
        });
      }

      setShowPatientModal(false);
      resetPatientForm();
      await fetchHealthcareData();
    } catch (error) {
      setPatientError(error.message);
    } finally {
      setPatientSaving(false);
    }
  }

  async function deletePatient(patient) {
    const id = patient.patientId || patient.id;

    const confirmed = window.confirm(
      `Delete patient "${patient.name || "this patient"}"?`
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/patients/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
    } catch (error) {
      setPatientError(error.message);
    }
  }

  // ==========================================================
  // DOCTOR CRUD
  // ==========================================================

  function resetDoctorForm() {
    setDoctorForm(emptyDoctor);
    setEditingDoctor(null);
    setDoctorError("");
  }

  function openAddDoctor() {
    resetDoctorForm();
    setShowDoctorModal(true);
  }

  function openEditDoctor(doctor) {
    setEditingDoctor(doctor);

    setDoctorForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
    });

    setDoctorError("");
    setShowDoctorModal(true);
  }

  async function saveDoctor(event) {
    event.preventDefault();

    setDoctorSaving(true);
    setDoctorError("");

    try {
      const id = editingDoctor
        ? editingDoctor.doctorId || editingDoctor.id
        : null;

      if (id) {
        await apiFetch(`/doctors/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...doctorForm,
          }),
        });
      } else {
        await apiFetch("/doctors/register", {
          method: "POST",
          body: JSON.stringify({
            ...doctorForm,
            password: "Doctor@123",
          }),
        });
      }

      setShowDoctorModal(false);
      resetDoctorForm();
      await fetchHealthcareData();
    } catch (error) {
      setDoctorError(error.message);
    } finally {
      setDoctorSaving(false);
    }
  }

  async function deleteDoctor(doctor) {
    const id = doctor.doctorId || doctor.id;

    const confirmed = window.confirm(
      `Delete doctor "${doctor.name || "this doctor"}"?`
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/doctors/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
    } catch (error) {
      setDoctorError(error.message);
    }
  }

  // ==========================================================
  // NURSE CRUD
  // ==========================================================

  function resetNurseForm() {
    setNurseForm(emptyNurse);
    setEditingNurse(null);
    setNurseError("");
  }

  function openAddNurse() {
    resetNurseForm();
    setShowNurseModal(true);
  }

  function openEditNurse(nurse) {
    setEditingNurse(nurse);

    setNurseForm({
      name: nurse.name || "",
      department: nurse.department || "",
      phone: nurse.phone || "",
      email: nurse.email || "",
    });

    setNurseError("");
    setShowNurseModal(true);
  }

  async function saveNurse(event) {
    event.preventDefault();

    setNurseSaving(true);
    setNurseError("");

    try {
      const id = editingNurse
        ? editingNurse.nurseId || editingNurse.id
        : null;

      if (id) {
        await apiFetch(`/nurses/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...nurseForm,
          }),
        });
      } else {
        await apiFetch("/nurses/register", {
          method: "POST",
          body: JSON.stringify({
            ...nurseForm,
            password: "Nurse@123",
          }),
        });
      }

      setShowNurseModal(false);
      resetNurseForm();
      await fetchHealthcareData();
    } catch (error) {
      setNurseError(error.message);
    } finally {
      setNurseSaving(false);
    }
  }

  async function deleteNurse(nurse) {
    const id = nurse.nurseId || nurse.id;

    const confirmed = window.confirm(
      `Delete nurse "${nurse.name || "this nurse"}"?`
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/nurses/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
    } catch (error) {
      setNurseError(error.message);
    }
  }

  // ==========================================================
  // MEDICAL RECORD CRUD
  // ==========================================================

  function resetRecordForm() {
    setRecordForm(emptyRecord);
    setEditingRecord(null);
    setRecordError("");
  }

  function openAddRecord() {
    resetRecordForm();
    setShowRecordModal(true);
  }

  function openEditRecord(record) {
    setEditingRecord(record);

    setRecordForm({
      patientId:
        record.patientId ??
        record.PatientId ??
        record.patient?.id ??
        "",
      doctorId:
        record.doctorId ??
        record.DoctorId ??
        record.doctor?.id ??
        "",
      nurseId:
        record.nurseId ??
        record.NurseId ??
        record.nurse?.id ??
        "",
      diagnosis: record.diagnosis || "",
      prescription: record.prescription || "",
      notes: record.notes || "",
    });

    setRecordError("");
    setShowRecordModal(true);
  }

  async function saveMedicalRecord(event) {
    event.preventDefault();

    setRecordSaving(true);
    setRecordError("");

    try {
      const payload = {
        patientId: Number(recordForm.patientId),
        doctorId: Number(recordForm.doctorId),
        nurseId: recordForm.nurseId
          ? Number(recordForm.nurseId)
          : null,
        diagnosis: recordForm.diagnosis,
        prescription: recordForm.prescription,
        notes: recordForm.notes,
      };

      const id =
        editingRecord?.id ||
        editingRecord?.recordId ||
        editingRecord?.medicalRecordId;

      if (id) {
        await apiFetch(`/medical-records/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/medical-records", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setShowRecordModal(false);
      resetRecordForm();
      await fetchHealthcareData();
    } catch (error) {
      setRecordError(error.message);
    } finally {
      setRecordSaving(false);
    }
  }

  async function deleteMedicalRecord(record) {
    const id =
      record.id ||
      record.recordId ||
      record.medicalRecordId;

    if (!id) {
      window.alert("Record ID not found.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this medical record?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/medical-records/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
    } catch (error) {
      setRecordError(error.message);
    }
  }

  // ==========================================================
  // LOOKUP HELPERS
  // ==========================================================

  function getPatientName(id) {
    const patient = patients.find(
      (item) =>
        Number(item.id) === Number(id) ||
        Number(item.patientId) === Number(id)
    );

    return patient?.name || "Unknown Patient";
  }

  function getDoctorName(id) {
    const doctor = doctors.find(
      (item) =>
        Number(item.id) === Number(id) ||
        Number(item.doctorId) === Number(id)
    );

    return doctor?.name || "Unknown Doctor";
  }

  function getNurseName(id) {
    const nurse = nurses.find(
      (item) =>
        Number(item.id) === Number(id) ||
        Number(item.nurseId) === Number(id)
    );

    return nurse?.name || "Unknown Nurse";
  }

  // ==========================================================
  // SECURITY DASHBOARD
  // ==========================================================

  function renderSecurityDashboard() {
    const securityScore = dashboard?.securityScore ?? 100;
    const criticalThreats = dashboard?.criticalThreats ?? 0;
    const vulnerabilityCount =
      dashboard?.vulnerabilities ?? vulnerabilities.length;
    const securityEventCount =
      dashboard?.securityEvents ?? securityEvents.length;
    const totalUsers = dashboard?.totalUsers ?? users.length;
    const activeUsers =
      dashboard?.activeUsers ??
      users.filter(
        (user) =>
          String(user.status || "").toLowerCase() === "active"
      ).length;

    return (
      <div className="dashboard-page">
        <div className="page-heading">
          <div>
            <div className="eyebrow">SECURITY OPERATIONS CENTER</div>
            <h1>Security Command Center</h1>
            <p>
              Real-time healthcare infrastructure security monitoring.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            API CONNECTED
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="Security Score"
            value={`${securityScore}%`}
            icon="◈"
            tone="green"
            subtext="Overall protection status"
          />

          <MetricCard
            label="Critical Threats"
            value={criticalThreats}
            icon="⚠"
            tone="red"
            subtext="Requires immediate attention"
          />

          <MetricCard
            label="Vulnerabilities"
            value={vulnerabilityCount}
            icon="△"
            tone="yellow"
            subtext="Detected security issues"
          />

          <MetricCard
            label="Security Events"
            value={securityEventCount}
            icon="◉"
            tone="cyan"
            subtext="Events monitored"
          />
        </div>

        <div className="dashboard-grid">
          <div className="content-card">
            <div className="card-header">
              <div>
                <h2>System Protection</h2>
                <p>Current infrastructure security posture</p>
              </div>

              <StatusBadge status="Healthy" />
            </div>

            <div className="security-score-large">
              <div className="security-score-number">
                {securityScore}%
              </div>

              <div className="security-score-ring">
                <div>{securityScore}</div>
              </div>
            </div>

            <div className="protection-list">
              <div className="protection-row">
                <span>Authentication</span>
                <StatusBadge status="Secure" />
              </div>

              <div className="protection-row">
                <span>API Protection</span>
                <StatusBadge status="Secure" />
              </div>

              <div className="protection-row">
                <span>Database</span>
                <StatusBadge status="Secure" />
              </div>

              <div className="protection-row">
                <span>Threat Monitoring</span>
                <StatusBadge status="Active" />
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <div>
                <h2>Security Overview</h2>
                <p>Current platform statistics</p>
              </div>
            </div>

            <div className="overview-list">
              <div className="overview-item">
                <span>Total Users</span>
                <strong>{totalUsers}</strong>
              </div>

              <div className="overview-item">
                <span>Active Users</span>
                <strong>{activeUsers}</strong>
              </div>

              <div className="overview-item">
                <span>Administrators</span>
                <strong>
                  {dashboard?.administrators ??
                    users.filter(
                      (u) =>
                        u.role === "Security Admin" ||
                        u.role === "Administrator" ||
                        u.role === "Admin"
                    ).length}
                </strong>
              </div>

              <div className="overview-item">
                <span>Last Updated</span>
                <strong>
                  {dashboard?.lastUpdated
                    ? new Date(
                        dashboard.lastUpdated
                      ).toLocaleString()
                    : "Just now"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Security Modules</h2>
              <p>Active MediShield AI protection services</p>
            </div>
          </div>

          <div className="module-grid">
            <div className="module-card">
              <div className="module-icon">⚠</div>
              <div>
                <h3>Application Security</h3>
                <p>Vulnerability detection and monitoring</p>
              </div>
              <StatusBadge status="Active" />
            </div>

            <div className="module-card">
              <div className="module-icon">◈</div>
              <div>
                <h3>Threat Intelligence</h3>
                <p>Threat indicators and intelligence analysis</p>
              </div>
              <StatusBadge status="Active" />
            </div>

            <div className="module-card">
              <div className="module-icon">▣</div>
              <div>
                <h3>Digital Forensics</h3>
                <p>Evidence and incident investigation</p>
              </div>
              <StatusBadge status="Ready" />
            </div>

            <div className="module-card">
              <div className="module-icon">◉</div>
              <div>
                <h3>Event Monitoring</h3>
                <p>Continuous security event monitoring</p>
              </div>
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // USERS
  // ==========================================================

  function renderUsers() {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">IDENTITY & ACCESS</div>
            <h1>User Management</h1>
            <p>Manage MediShield AI platform users and permissions.</p>
          </div>

          <button className="primary-button" onClick={openAddUser}>
            + ADD USER
          </button>
        </div>

        {userError && (
          <div className="error-banner">
            {userError}
          </div>
        )}

        <div className="content-card table-card">
          <div className="card-header">
            <div>
              <h2>Registered Users</h2>
              <p>{users.length} users in the system</p>
            </div>

            <button
              className="secondary-button"
              onClick={fetchUsers}
            >
              ↻ Refresh
            </button>
          </div>

          {usersLoading ? (
            <div className="loading-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♙</div>
              <h3>No users found</h3>
              <p>Create the first platform user.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>

                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {(user.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{user.name}</strong>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className="role-badge">
                          {user.role}
                        </span>
                      </td>

                      <td>{user.department || "—"}</td>

                      <td>
                        <StatusBadge
                          status={user.status || "Active"}
                        />
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => openEditUser(user)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteUser(user.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // PATIENTS
  // ==========================================================

  const filteredPatients = useMemo(() => {
    const search = patientSearch.trim().toLowerCase();

    if (!search) return patients;

    return patients.filter((patient) =>
      [
        patient.name,
        patient.email,
        patient.phone,
        patient.patientId,
        patient.gender,
        patient.bloodGroup,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [patients, patientSearch]);

  function renderPatients() {
    const maleCount = patients.filter(
      (p) => String(p.gender).toLowerCase() === "male"
    ).length;

    const femaleCount = patients.filter(
      (p) => String(p.gender).toLowerCase() === "female"
    ).length;

    const averageAge =
      patients.length > 0
        ? Math.round(
            patients.reduce(
              (sum, p) => sum + Number(p.age || 0),
              0
            ) / patients.length
          )
        : 0;

    return (
      <div className="patients-page">
        <div className="patients-heading">
          <div>
            <div className="eyebrow">HEALTHCARE MANAGEMENT</div>
            <h1>Patient Management</h1>
            <p>
              Secure patient registration, records and healthcare
              information.
            </p>
          </div>

          <div className="patient-header-actions">
            <div className="patient-api-status">
              <span className="patient-sync-dot"></span>
              API CONNECTED
            </div>

            {isSecurityUser && (
              <button
                className="patient-add-button"
                onClick={openAddPatient}
              >
                + ADD PATIENT
              </button>
            )}
          </div>
        </div>

        {patientError && (
          <div className="error-banner">
            {patientError}
          </div>
        )}

        <div className="patient-stats-grid">
          <div className="patient-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">♙</div>
              <span className="patient-stat-code">
                PT-001
              </span>
            </div>
            <div className="patient-stat-value">
              {patients.length}
            </div>
            <div className="patient-stat-label">
              Total Patients
            </div>
            <div className="patient-stat-subtext">
              Registered in system
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">♀</div>
              <span className="patient-stat-code">
                GEN-F
              </span>
            </div>
            <div className="patient-stat-value">
              {femaleCount}
            </div>
            <div className="patient-stat-label">
              Female Patients
            </div>
            <div className="patient-stat-subtext">
              Current records
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">♂</div>
              <span className="patient-stat-code">
                GEN-M
              </span>
            </div>
            <div className="patient-stat-value">
              {maleCount}
            </div>
            <div className="patient-stat-label">
              Male Patients
            </div>
            <div className="patient-stat-subtext">
              Current records
            </div>
          </div>

          <div className="patient-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">⌁</div>
              <span className="patient-stat-code">
                AGE-AVG
              </span>
            </div>
            <div className="patient-stat-value">
              {averageAge}
            </div>
            <div className="patient-stat-label">
              Average Age
            </div>
            <div className="patient-stat-subtext">
              Across patient population
            </div>
          </div>
        </div>

        <div className="patient-directory-card">
          <div className="patient-directory-header">
            <div>
              <h2>Patient Directory</h2>
              <p>
                Secure healthcare records currently stored in
                MediShield AI.
              </p>
            </div>

            <div className="patient-directory-count">
              {filteredPatients.length} RECORDS
            </div>
          </div>

          <div className="patient-toolbar">
            <div className="patient-search">
              <span className="patient-search-icon">⌕</span>

              <input
                value={patientSearch}
                onChange={(event) =>
                  setPatientSearch(event.target.value)
                }
                placeholder="Search patients..."
              />

              {patientSearch && (
                <button
                  className="patient-search-clear"
                  onClick={() => setPatientSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="patient-toolbar-status">
              <span className="patient-sync-dot"></span>
              LIVE DATABASE
              <span className="patient-sync-divider"></span>
              SECURE
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="patient-empty-state">
              <div className="patient-empty-icon">♙</div>
              <h3>No patients found</h3>
              <p>
                {patientSearch
                  ? "Try another search term."
                  : "No patient records are available yet."}
              </p>
            </div>
          ) : (
            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Gender</th>
                    <th>Blood Group</th>
                    <th>Contact</th>
                    <th>Email</th>
                    {isSecurityUser && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredPatients.map((patient, index) => {
                    const patientId =
                      patient.patientId ||
                      patient.id ||
                      `PAT-${index + 1}`;

                    const gender =
                      String(patient.gender || "Other").toLowerCase();

                    return (
                      <tr key={patientId}>
                        <td>
                          <div className="patient-identity">
                            <div className="patient-avatar">
                              {(patient.name || "P")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="patient-name-block">
                              <strong>
                                {patient.name || "Unnamed Patient"}
                              </strong>

                              <span>
                                {patientId} · Age{" "}
                                {patient.age ?? "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`gender-badge ${
                              gender === "male"
                                ? "male"
                                : gender === "female"
                                ? "female"
                                : "other"
                            }`}
                          >
                            {patient.gender || "Other"}
                          </span>
                        </td>

                        <td>
                          <span className="blood-badge">
                            <span className="blood-symbol">
                              +
                            </span>
                            {patient.bloodGroup || "—"}
                          </span>
                        </td>

                        <td>
                          <div className="patient-contact">
                            <span className="patient-contact-icon">
                              ☎
                            </span>
                            {patient.phone || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="patient-email">
                            {patient.email || "—"}
                          </span>
                        </td>

                        {isSecurityUser && (
                          <td>
                            <div className="patient-actions">
                              <button
                                className="patient-edit-button"
                                onClick={() =>
                                  openEditPatient(patient)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="patient-delete-button"
                                onClick={() =>
                                  deletePatient(patient)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="patient-directory-footer">
            <span className="patient-footer-security">
              ◈ PATIENT DATA PROTECTED
            </span>

            <span>
              MediShield AI Healthcare Management
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DOCTORS
  // ==========================================================

  const filteredDoctors = useMemo(() => {
    const search = doctorSearch.trim().toLowerCase();

    if (!search) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.name,
        doctor.email,
        doctor.phone,
        doctor.specialization,
        doctor.doctorId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [doctors, doctorSearch]);

  function renderDoctors() {
    const specializations = new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ).size;

    return (
      <div className="staff-page">
        <div className="staff-heading">
          <div>
            <div className="eyebrow">HEALTHCARE MANAGEMENT</div>
            <h1>Doctor Management</h1>
            <p>
              Manage registered doctors and clinical
              specializations.
            </p>
          </div>

          <div className="staff-header-actions">
            <div className="staff-api-status">
              <span className="patient-sync-dot"></span>
              API CONNECTED
            </div>

            {isSecurityUser && (
              <button
                className="staff-add-button"
                onClick={openAddDoctor}
              >
                + ADD DOCTOR
              </button>
            )}
          </div>
        </div>

        {doctorError && (
          <div className="error-banner">
            {doctorError}
          </div>
        )}

        <div className="staff-stats-grid">
          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">⚕</div>
              <span className="patient-stat-code">
                DOC-001
              </span>
            </div>

            <div className="patient-stat-value">
              {doctors.length}
            </div>

            <div className="patient-stat-label">
              Total Doctors
            </div>

            <div className="patient-stat-subtext">
              Registered clinicians
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">◈</div>
              <span className="patient-stat-code">
                SPEC
              </span>
            </div>

            <div className="patient-stat-value">
              {specializations}
            </div>

            <div className="patient-stat-label">
              Specializations
            </div>

            <div className="patient-stat-subtext">
              Clinical departments
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">✚</div>
              <span className="patient-stat-code">
                STATUS
              </span>
            </div>

            <div className="patient-stat-value">
              {doctors.length}
            </div>

            <div className="patient-stat-label">
              Active Doctors
            </div>

            <div className="patient-stat-subtext">
              Available in directory
            </div>
          </div>
        </div>

        <div className="staff-directory-card">
          <div className="patient-directory-header">
            <div>
              <h2>Doctor Directory</h2>
              <p>
                Secure clinical staff records.
              </p>
            </div>

            <div className="patient-directory-count">
              {filteredDoctors.length} RECORDS
            </div>
          </div>

          <div className="staff-toolbar">
            <div className="patient-search">
              <span className="patient-search-icon">⌕</span>

              <input
                value={doctorSearch}
                onChange={(event) =>
                  setDoctorSearch(event.target.value)
                }
                placeholder="Search doctors..."
              />

              {doctorSearch && (
                <button
                  className="patient-search-clear"
                  onClick={() => setDoctorSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="patient-toolbar-status">
              <span className="patient-sync-dot"></span>
              LIVE DATABASE
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="staff-empty-state">
              <div className="patient-empty-icon">⚕</div>
              <h3>No doctors found</h3>
              <p>
                {doctorSearch
                  ? "Try another search term."
                  : "No doctors are registered yet."}
              </p>
            </div>
          ) : (
            <div className="patient-table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Phone</th>
                    <th>Email</th>
                    {isSecurityUser && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map((doctor, index) => {
                    const id =
                      doctor.doctorId ||
                      doctor.id ||
                      `DOC-${index + 1}`;

                    return (
                      <tr key={id}>
                        <td>
                          <div className="staff-identity">
                            <div className="staff-avatar">
                              {(doctor.name || "D")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="patient-name-block">
                              <strong>
                                {doctor.name || "Unnamed Doctor"}
                              </strong>

                              <span>{id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="specialization-badge">
                            {doctor.specialization || "General"}
                          </span>
                        </td>

                        <td>
                          <div className="staff-contact">
                            ☎ {doctor.phone || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="staff-email">
                            {doctor.email || "—"}
                          </span>
                        </td>

                        {isSecurityUser && (
                          <td>
                            <div className="staff-actions">
                              <button
                                className="staff-edit-button"
                                onClick={() =>
                                  openEditDoctor(doctor)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="staff-delete-button"
                                onClick={() =>
                                  deleteDoctor(doctor)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="staff-directory-footer">
            <span>
              ◈ CLINICAL STAFF DATA PROTECTED
            </span>

            <span>
              MediShield AI Healthcare Management
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NURSES
  // ==========================================================

  const filteredNurses = useMemo(() => {
    const search = nurseSearch.trim().toLowerCase();

    if (!search) return nurses;

    return nurses.filter((nurse) =>
      [
        nurse.name,
        nurse.email,
        nurse.phone,
        nurse.department,
        nurse.nurseId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search)
        )
    );
  }, [nurses, nurseSearch]);

  function renderNurses() {
    const departments = new Set(
      nurses
        .map((nurse) => nurse.department)
        .filter(Boolean)
    ).size;

    return (
      <div className="staff-page">
        <div className="staff-heading">
          <div>
            <div className="eyebrow">HEALTHCARE MANAGEMENT</div>
            <h1>Nurse Management</h1>
            <p>
              Manage nursing staff and hospital departments.
            </p>
          </div>

          <div className="staff-header-actions">
            <div className="staff-api-status">
              <span className="patient-sync-dot"></span>
              API CONNECTED
            </div>

            {isSecurityUser && (
              <button
                className="staff-add-button"
                onClick={openAddNurse}
              >
                + ADD NURSE
              </button>
            )}
          </div>
        </div>

        {nurseError && (
          <div className="error-banner">
            {nurseError}
          </div>
        )}

        <div className="staff-stats-grid">
          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">✚</div>
              <span className="patient-stat-code">
                NUR-001
              </span>
            </div>

            <div className="patient-stat-value">
              {nurses.length}
            </div>

            <div className="patient-stat-label">
              Total Nurses
            </div>

            <div className="patient-stat-subtext">
              Registered nursing staff
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">▣</div>
              <span className="patient-stat-code">
                DEPT
              </span>
            </div>

            <div className="patient-stat-value">
              {departments}
            </div>

            <div className="patient-stat-label">
              Departments
            </div>

            <div className="patient-stat-subtext">
              Active hospital units
            </div>
          </div>

          <div className="staff-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">◉</div>
              <span className="patient-stat-code">
                LIVE
              </span>
            </div>

            <div className="patient-stat-value">
              {nurses.length}
            </div>

            <div className="patient-stat-label">
              Staff Records
            </div>

            <div className="patient-stat-subtext">
              Synced with database
            </div>
          </div>
        </div>

        <div className="staff-directory-card">
          <div className="patient-directory-header">
            <div>
              <h2>Nursing Staff Directory</h2>
              <p>
                Secure nursing personnel records.
              </p>
            </div>

            <div className="patient-directory-count">
              {filteredNurses.length} RECORDS
            </div>
          </div>

          <div className="staff-toolbar">
            <div className="patient-search">
              <span className="patient-search-icon">⌕</span>

              <input
                value={nurseSearch}
                onChange={(event) =>
                  setNurseSearch(event.target.value)
                }
                placeholder="Search nurses..."
              />

              {nurseSearch && (
                <button
                  className="patient-search-clear"
                  onClick={() => setNurseSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <div className="patient-toolbar-status">
              <span className="patient-sync-dot"></span>
              LIVE DATABASE
            </div>
          </div>

          {filteredNurses.length === 0 ? (
            <div className="staff-empty-state">
              <div className="patient-empty-icon">✚</div>
              <h3>No nurses found</h3>
              <p>
                {nurseSearch
                  ? "Try another search term."
                  : "No nurses are registered yet."}
              </p>
            </div>
          ) : (
            <div className="patient-table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Nurse</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Email</th>
                    {isSecurityUser && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredNurses.map((nurse, index) => {
                    const id =
                      nurse.nurseId ||
                      nurse.id ||
                      `NUR-${index + 1}`;

                    return (
                      <tr key={id}>
                        <td>
                          <div className="staff-identity">
                            <div className="staff-avatar">
                              {(nurse.name || "N")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="patient-name-block">
                              <strong>
                                {nurse.name || "Unnamed Nurse"}
                              </strong>

                              <span>{id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="department-badge">
                            {nurse.department || "General Ward"}
                          </span>
                        </td>

                        <td>
                          <div className="staff-contact">
                            ☎ {nurse.phone || "—"}
                          </div>
                        </td>

                        <td>
                          <span className="staff-email">
                            {nurse.email || "—"}
                          </span>
                        </td>

                        {isSecurityUser && (
                          <td>
                            <div className="staff-actions">
                              <button
                                className="staff-edit-button"
                                onClick={() =>
                                  openEditNurse(nurse)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="staff-delete-button"
                                onClick={() =>
                                  deleteNurse(nurse)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="staff-directory-footer">
            <span>
              ◈ NURSING STAFF DATA PROTECTED
            </span>

            <span>
              MediShield AI Healthcare Management
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MEDICAL RECORDS
  // ==========================================================

  function renderMedicalRecords() {
    const recordCount = medicalRecords.length;

    const uniquePatients = new Set(
      medicalRecords
        .map(
          (record) =>
            record.patientId ||
            record.PatientId ||
            record.patient?.id
        )
        .filter(Boolean)
    ).size;

    const uniqueDoctors = new Set(
      medicalRecords
        .map(
          (record) =>
            record.doctorId ||
            record.DoctorId ||
            record.doctor?.id
        )
        .filter(Boolean)
    ).size;

    return (
      <div className="records-page">
        <div className="records-heading">
          <div>
            <div className="eyebrow">
              HEALTHCARE MANAGEMENT
            </div>

            <h1>Medical Records</h1>

            <p>
              Secure clinical records and patient medical
              history.
            </p>
          </div>

          <div className="records-header-actions">
            <div className="records-api-status">
              <span className="patient-sync-dot"></span>
              API CONNECTED
            </div>

            {isSecurityUser && (
              <button
                className="records-add-button"
                onClick={openAddRecord}
              >
                + ADD RECORD
              </button>
            )}
          </div>
        </div>

        {recordError && (
          <div className="error-banner">
            {recordError}
          </div>
        )}

        <div className="records-stats-grid">
          <div className="records-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">▣</div>
              <span className="patient-stat-code">
                REC-001
              </span>
            </div>

            <div className="patient-stat-value">
              {recordCount}
            </div>

            <div className="patient-stat-label">
              Total Records
            </div>

            <div className="patient-stat-subtext">
              Clinical records stored
            </div>
          </div>

          <div className="records-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">♙</div>
              <span className="patient-stat-code">
                PAT
              </span>
            </div>

            <div className="patient-stat-value">
              {uniquePatients}
            </div>

            <div className="patient-stat-label">
              Patients Covered
            </div>

            <div className="patient-stat-subtext">
              With medical records
            </div>
          </div>

          <div className="records-stat-card">
            <div className="patient-stat-top">
              <div className="patient-stat-icon">⚕</div>
              <span className="patient-stat-code">
                DOC
              </span>
            </div>

            <div className="patient-stat-value">
              {uniqueDoctors}
            </div>

            <div className="patient-stat-label">
              Doctors Involved
            </div>

            <div className="patient-stat-subtext">
              Clinical contributors
            </div>
          </div>
        </div>

        <div className="records-directory-card">
          <div className="patient-directory-header">
            <div>
              <h2>Clinical Records</h2>
              <p>
                Protected healthcare information managed by
                MediShield AI.
              </p>
            </div>

            <div className="patient-directory-count">
              {recordCount} RECORDS
            </div>
          </div>

          {medicalRecords.length === 0 ? (
            <div className="records-empty-state">
              <div className="patient-empty-icon">▣</div>

              <h3>No medical records found</h3>

              <p>
                Add a medical record to begin building patient
                history.
              </p>
            </div>
          ) : (
            <div className="patient-table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Nurse</th>
                    <th>Diagnosis</th>
                    <th>Prescription</th>
                    <th>Notes</th>
                    {isSecurityUser && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {medicalRecords.map((record, index) => {
                    const recordId =
                      record.id ||
                      record.recordId ||
                      record.medicalRecordId ||
                      index + 1;

                    const patientId =
                      record.patientId ||
                      record.PatientId ||
                      record.patient?.id;

                    const doctorId =
                      record.doctorId ||
                      record.DoctorId ||
                      record.doctor?.id;

                    const nurseId =
                      record.nurseId ||
                      record.NurseId ||
                      record.nurse?.id;

                    return (
                      <tr key={recordId}>
                        <td>
                          <div className="record-identity">
                            <div className="record-avatar">
                              ▣
                            </div>

                            <div className="patient-name-block">
                              <strong>
                                REC-{recordId}
                              </strong>

                              <span>
                                Clinical Record
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="record-person-badge">
                            {getPatientName(patientId)}
                          </span>
                        </td>

                        <td>
                          <span className="record-person-badge">
                            {getDoctorName(doctorId)}
                          </span>
                        </td>

                        <td>
                          <span className="record-person-badge">
                            {nurseId
                              ? getNurseName(nurseId)
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <div className="record-diagnosis">
                            {record.diagnosis || "—"}
                          </div>
                        </td>

                        <td>
                          <div className="record-prescription">
                            {record.prescription || "—"}
                          </div>
                        </td>

                        <td>
                          <div className="record-notes">
                            {record.notes || "—"}
                          </div>
                        </td>

                        {isSecurityUser && (
                          <td>
                            <div className="staff-actions">
                              <button
                                className="staff-edit-button"
                                onClick={() =>
                                  openEditRecord(record)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="staff-delete-button"
                                onClick={() =>
                                  deleteMedicalRecord(record)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="records-directory-footer">
            <span>
              ◈ MEDICAL DATA PROTECTED
            </span>

            <span>
              MediShield AI Healthcare Management
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SECURITY MODULE
  // ==========================================================

  function renderSecurityModule(type) {
    const isVulnerability = type === "Vulnerabilities";

    const data = isVulnerability
      ? vulnerabilities
      : securityEvents;

    const title = isVulnerability
      ? "Vulnerability Management"
      : "Security Events";

    const description = isVulnerability
      ? "Application and infrastructure vulnerability monitoring."
      : "Security events detected by the MediShield AI platform.";

    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              SECURITY OPERATIONS
            </div>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            MONITORING ACTIVE
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="Total"
            value={data.length}
            icon={isVulnerability ? "⚠" : "◉"}
            tone="cyan"
          />

          <MetricCard
            label="Critical"
            value={
              data.filter(
                (item) =>
                  String(
                    item.severity || item.level || ""
                  ).toLowerCase() === "critical"
              ).length
            }
            icon="!"
            tone="red"
          />

          <MetricCard
            label="High"
            value={
              data.filter(
                (item) =>
                  String(
                    item.severity || item.level || ""
                  ).toLowerCase() === "high"
              ).length
            }
            icon="▲"
            tone="yellow"
          />
        </div>

        <div className="content-card table-card">
          <div className="card-header">
            <div>
              <h2>{title}</h2>
              <p>
                {data.length} records retrieved from API
              </p>
            </div>
          </div>

          {data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {isVulnerability ? "⚠" : "◉"}
              </div>

              <h3>No records available</h3>

              <p>
                The API returned no {type.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name / Event</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        #{item.id || index + 1}
                      </td>

                      <td>
                        {item.name ||
                          item.title ||
                          item.eventType ||
                          item.event ||
                          "Security Event"}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            item.severity ||
                            item.level ||
                            "Normal"
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            item.status ||
                            "Active"
                          }
                        />
                      </td>

                      <td>
                        {item.description ||
                          item.message ||
                          item.details ||
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // THREAT INTELLIGENCE
  // ==========================================================

  function renderThreatIntelligence() {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              THREAT INTELLIGENCE
            </div>

            <h1>Threat Intelligence</h1>

            <p>
              Monitor indicators, attack patterns and emerging
              healthcare threats.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            INTELLIGENCE ONLINE
          </div>
        </div>

        <div className="module-grid">
          <div className="module-card">
            <div className="module-icon">◈</div>

            <div>
              <h3>Threat Feed</h3>
              <p>
                External and internal threat intelligence
                sources.
              </p>
            </div>

            <StatusBadge status="Active" />
          </div>

          <div className="module-card">
            <div className="module-icon">⌁</div>

            <div>
              <h3>IOC Monitoring</h3>
              <p>
                Indicators of compromise monitoring.
              </p>
            </div>

            <StatusBadge status="Ready" />
          </div>

          <div className="module-card">
            <div className="module-icon">⚠</div>

            <div>
              <h3>Threat Detection</h3>
              <p>
                Detection rules for suspicious activity.
              </p>
            </div>

            <StatusBadge status="Active" />
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Threat Intelligence Status</h2>
              <p>
                MediShield AI threat intelligence subsystem
              </p>
            </div>
          </div>

          <div className="overview-list">
            <div className="overview-item">
              <span>Threat Feed</span>
              <StatusBadge status="Active" />
            </div>

            <div className="overview-item">
              <span>IOC Database</span>
              <StatusBadge status="Ready" />
            </div>

            <div className="overview-item">
              <span>Detection Engine</span>
              <StatusBadge status="Active" />
            </div>

            <div className="overview-item">
              <span>Analysis Engine</span>
              <StatusBadge status="Online" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // AUDIT LOGS
  // ==========================================================

  function renderAuditLogs() {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              SECURITY OPERATIONS
            </div>

            <h1>Audit Logs</h1>

            <p>
              Track security-sensitive activity across the
              platform.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            LOGGING ACTIVE
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>
                Platform activity and security operations.
              </p>
            </div>
          </div>

          <div className="audit-list">
            <div className="audit-item">
              <div className="audit-icon">✓</div>

              <div className="audit-content">
                <strong>Authentication service active</strong>
                <span>
                  MediShield AI authentication subsystem
                </span>
              </div>

              <StatusBadge status="Secure" />
            </div>

            <div className="audit-item">
              <div className="audit-icon">◉</div>

              <div className="audit-content">
                <strong>Security monitoring active</strong>
                <span>
                  Security event monitoring operational
                </span>
              </div>

              <StatusBadge status="Active" />
            </div>

            <div className="audit-item">
              <div className="audit-icon">▣</div>

              <div className="audit-content">
                <strong>Healthcare database connected</strong>
                <span>
                  PostgreSQL data layer operational
                </span>
              </div>

              <StatusBadge status="Healthy" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // HEALTHCARE DASHBOARD
  // ==========================================================

  function renderHealthcareDashboard() {
    return (
      <div className="healthcare-dashboard-wrapper">
        <HealthcareDashboard
          patients={patients}
          doctors={doctors}
          nurses={nurses}
          medicalRecords={medicalRecords}
        />
      </div>
    );
  }

  // ==========================================================
  // DOCTOR PORTAL
  // ==========================================================

  function renderDoctorDashboard() {
    const doctorName =
      currentUser?.name || "Doctor";

    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              DOCTOR PORTAL
            </div>

            <h1>Welcome, {doctorName}</h1>

            <p>
              Manage patients, medical history and clinical
              activities.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            DOCTOR ACCESS
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="Patients"
            value={patients.length}
            icon="♙"
            tone="cyan"
          />

          <MetricCard
            label="Medical Records"
            value={medicalRecords.length}
            icon="▣"
            tone="green"
          />

          <MetricCard
            label="Doctors"
            value={doctors.length}
            icon="⚕"
            tone="blue"
          />

          <MetricCard
            label="Appointments"
            value="0"
            icon="◷"
            tone="yellow"
          />
        </div>

        <div className="dashboard-grid">
          <div className="content-card">
            <div className="card-header">
              <div>
                <h2>Clinical Workspace</h2>
                <p>Your healthcare management modules.</p>
              </div>
            </div>

            <div className="module-grid">
              <div
                className="module-card clickable-card"
                onClick={() =>
                  setActivePage("My Patients")
                }
              >
                <div className="module-icon">♙</div>

                <div>
                  <h3>My Patients</h3>
                  <p>View registered patients.</p>
                </div>
              </div>

              <div
                className="module-card clickable-card"
                onClick={() =>
                  setActivePage("Medical History")
                }
              >
                <div className="module-icon">▣</div>

                <div>
                  <h3>Medical History</h3>
                  <p>Review clinical records.</p>
                </div>
              </div>

              <div
                className="module-card clickable-card"
                onClick={() =>
                  setActivePage("Medications")
                }
              >
                <div className="module-icon">▥</div>

                <div>
                  <h3>Medications</h3>
                  <p>Manage medication information.</p>
                </div>
              </div>

              <div
                className="module-card clickable-card"
                onClick={() =>
                  setActivePage("Appointments")
                }
              >
                <div className="module-icon">◷</div>

                <div>
                  <h3>Appointments</h3>
                  <p>View clinical appointments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDoctorPortal() {
    switch (activePage) {
      case "Dashboard":
        return renderDoctorDashboard();

      case "My Patients":
        return renderPatients();

      case "Medical History":
        return renderMedicalRecords();

      case "Medications":
        return renderMedications("Doctor");

      case "Appointments":
        return renderAppointments("Doctor");

      default:
        return renderDoctorDashboard();
    }
  }

  // ==========================================================
  // NURSE PORTAL
  // ==========================================================

  function renderNurseDashboard() {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              NURSE PORTAL
            </div>

            <h1>
              Welcome, {currentUser?.name || "Nurse"}
            </h1>

            <p>
              Manage patient care and daily nursing
              activities.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            NURSE ACCESS
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="Patients"
            value={patients.length}
            icon="♙"
            tone="cyan"
          />

          <MetricCard
            label="Nurses"
            value={nurses.length}
            icon="✚"
            tone="green"
          />

          <MetricCard
            label="Medical Records"
            value={medicalRecords.length}
            icon="▣"
            tone="blue"
          />

          <MetricCard
            label="Today's Appointments"
            value="0"
            icon="◷"
            tone="yellow"
          />
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>Nursing Workspace</h2>
              <p>
                Access daily patient care functions.
              </p>
            </div>
          </div>

          <div className="module-grid">
            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("Today's Appointments")
              }
            >
              <div className="module-icon">◷</div>

              <div>
                <h3>Today's Appointments</h3>
                <p>Review today's patient schedule.</p>
              </div>
            </div>

            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("Patients")
              }
            >
              <div className="module-icon">♙</div>

              <div>
                <h3>Patients</h3>
                <p>View patient information.</p>
              </div>
            </div>

            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("Book Appointment")
              }
            >
              <div className="module-icon">+</div>

              <div>
                <h3>Book Appointment</h3>
                <p>Create a new appointment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderNursePortal() {
    switch (activePage) {
      case "Dashboard":
        return renderNurseDashboard();

      case "Today's Appointments":
        return renderAppointments("Nurse");

      case "Patients":
        return renderPatients();

      case "Book Appointment":
        return renderAppointments("Nurse", true);

      default:
        return renderNurseDashboard();
    }
  }

  // ==========================================================
  // PATIENT PORTAL
  // ==========================================================

  function renderPatientDashboard() {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              PATIENT PORTAL
            </div>

            <h1>
              Welcome, {currentUser?.name || "Patient"}
            </h1>

            <p>
              Access your healthcare information securely.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            PATIENT ACCESS
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="My Records"
            value={medicalRecords.length}
            icon="▣"
            tone="cyan"
          />

          <MetricCard
            label="Medications"
            value="0"
            icon="▥"
            tone="green"
          />

          <MetricCard
            label="Appointments"
            value="0"
            icon="◷"
            tone="blue"
          />

          <MetricCard
            label="Account"
            value="Active"
            icon="✓"
            tone="green"
          />
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <h2>My Healthcare</h2>
              <p>
                Secure access to your healthcare services.
              </p>
            </div>
          </div>

          <div className="module-grid">
            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("My Medical History")
              }
            >
              <div className="module-icon">▣</div>

              <div>
                <h3>My Medical History</h3>
                <p>View your clinical records.</p>
              </div>
            </div>

            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("My Medications")
              }
            >
              <div className="module-icon">▥</div>

              <div>
                <h3>My Medications</h3>
                <p>View medication information.</p>
              </div>
            </div>

            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("Appointment History")
              }
            >
              <div className="module-icon">◷</div>

              <div>
                <h3>Appointment History</h3>
                <p>View appointment information.</p>
              </div>
            </div>

            <div
              className="module-card clickable-card"
              onClick={() =>
                setActivePage("Book Appointment")
              }
            >
              <div className="module-icon">+</div>

              <div>
                <h3>Book Appointment</h3>
                <p>Request a healthcare appointment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPatientPortal() {
    switch (activePage) {
      case "Dashboard":
        return renderPatientDashboard();

      case "My Medical History":
        return renderMedicalRecords();

      case "My Medications":
        return renderMedications("Patient");

      case "Appointment History":
        return renderAppointments("Patient");

      case "Book Appointment":
        return renderAppointments("Patient", true);

      default:
        return renderPatientDashboard();
    }
  }

  // ==========================================================
  // MEDICATIONS
  // ==========================================================

  function renderMedications(role) {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              HEALTHCARE MANAGEMENT
            </div>

            <h1>
              {role === "Patient"
                ? "My Medications"
                : "Medications"}
            </h1>

            <p>
              Secure medication management module.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            MODULE READY
          </div>
        </div>

        <div className="content-card">
          <div className="empty-state">
            <div className="empty-icon">▥</div>

            <h3>Medication Module</h3>

            <p>
              Medication records can be connected to the
              healthcare database as a future enhancement.
            </p>

            <StatusBadge status="Ready" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // APPOINTMENTS
  // ==========================================================

  function renderAppointments(role, booking = false) {
    if (booking) {
      return (
        <div className="page-container">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                APPOINTMENT MANAGEMENT
              </div>

              <h1>Book Appointment</h1>

              <p>
                Request a healthcare appointment securely.
              </p>
            </div>

            <div className="dashboard-live">
              <span className="live-dot"></span>
              BOOKING READY
            </div>
          </div>

          <div className="content-card">
            <div className="appointment-booking-card">
              <div className="appointment-icon">◷</div>

              <h2>Appointment Booking</h2>

              <p>
                The appointment interface is ready for
                integration with the appointment API.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  window.alert(
                    "Appointment booking module is ready. Connect this button to the appointment API."
                  )
                }
              >
                REQUEST APPOINTMENT
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              APPOINTMENT MANAGEMENT
            </div>

            <h1>
              {role === "Nurse"
                ? "Today's Appointments"
                : role === "Patient"
                ? "Appointment History"
                : "Appointments"}
            </h1>

            <p>
              Healthcare appointment scheduling and history.
            </p>
          </div>

          <div className="dashboard-live">
            <span className="live-dot"></span>
            APPOINTMENT SYSTEM
          </div>
        </div>

        <div className="content-card">
          <div className="empty-state">
            <div className="empty-icon">◷</div>

            <h3>No appointments available</h3>

            <p>
              Appointment records will appear here when the
              appointment API is connected.
            </p>

            <StatusBadge status="Ready" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ACTIVE PAGE
  // ==========================================================

  function renderActivePage() {
    if (isSecurityUser) {
      switch (activePage) {
        case "Dashboard":
          return renderSecurityDashboard();

        case "Vulnerabilities":
          return renderSecurityModule(
            "Vulnerabilities"
          );

        case "Threat Intelligence":
          return renderThreatIntelligence();

        case "Security Events":
          return renderSecurityModule(
            "Security Events"
          );

        case "Users":
          return renderUsers();

        case "Audit Logs":
          return renderAuditLogs();

        case "Healthcare Dashboard":
          return renderHealthcareDashboard();

        case "Patients":
          return renderPatients();

        case "Doctors":
          return renderDoctors();

        case "Nurses":
          return renderNurses();

        case "Medical Records":
          return renderMedicalRecords();

        default:
          return renderSecurityDashboard();
      }
    }

    if (isDoctor) {
      return renderDoctorPortal();
    }

    if (isNurse) {
      return renderNursePortal();
    }

    if (isPatient) {
      return renderPatientPortal();
    }

    return renderSecurityDashboard();
  }

  // ==========================================================
  // NAVIGATION ICONS
  // ==========================================================

  function getNavIcon(item) {
    const icons = {
      Dashboard: "⌂",
      Vulnerabilities: "⚠",
      "Threat Intelligence": "◈",
      "Security Events": "◉",
      Users: "♙",
      "Audit Logs": "▤",
      "Healthcare Dashboard": "✚",
      Patients: "♙",
      Doctors: "⚕",
      Nurses: "✚",
      "Medical Records": "▣",

      "My Patients": "♙",
      "Medical History": "▤",
      Medications: "▥",
      Appointments: "◷",

      "Today's Appointments": "◷",
      "Book Appointment": "+",

      "My Medical History": "▤",
      "My Medications": "▥",
      "Appointment History": "◷",
    };

    return icons[item] || "•";
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="app-shell">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <MediShieldLogo />

          <div className="brand-text">
            <div className="brand-name">
              MEDISHIELD AI
            </div>

            <div className="brand-subtitle">
              SECURITY OPERATIONS
            </div>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="sidebar-status-dot"></span>
          SYSTEM ONLINE
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isSecurityUser
              ? "SECURITY"
              : "HEALTHCARE"}
          </div>

          {menuItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${
                activePage === item
                  ? "nav-item-active"
                  : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              <span className="nav-icon">
                {getNavIcon(item)}
              </span>

              <span className="nav-label">
                {item}
              </span>

              {item === "Security Events" &&
                securityEvents.length > 0 && (
                  <span className="nav-count">
                    {securityEvents.length}
                  </span>
                )}

              {item === "Patients" &&
                patients.length > 0 && (
                  <span className="nav-count">
                    {patients.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="encryption-status">
            <span>◈</span>

            <div>
              <strong>AES-256</strong>
              <small>Encrypted Session</small>
            </div>
          </div>

          <div className="sidebar-version">
            MEDISHIELD AI v1.0.0
          </div>
        </div>
      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-area">
        {/* TOPBAR */}

        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumb">
              <span>MEDISHIELD</span>
              <span>/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-connection">
              <span className="connection-dot"></span>
              API CONNECTED
            </div>

            <div className="topbar-divider"></div>

            <div className="user-profile">
              <div className="user-avatar">
                {(currentUser?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-profile-info">
                <strong>
                  {currentUser?.name || "User"}
                </strong>

                <span>
                  {currentUser?.role || "User"}
                </span>
              </div>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              ⇥
            </button>
          </div>
        </header>

        {/* PAGE */}

        <section className="content-area">
          {dashboardLoading && activePage === "Dashboard" ? (
            <div className="page-loading">
              <div className="loading-spinner"></div>
              <span>Loading MediShield AI...</span>
            </div>
          ) : (
            renderActivePage()
          )}
        </section>

        {/* FOOTER */}

        <footer className="app-footer">
          <span>
            MEDISHIELD AI // HEALTHCARE SECURITY PLATFORM
          </span>

          <span>
            JWT AUTHENTICATED · POSTGRESQL · API v1.0.0
          </span>
        </footer>
      </main>

      {/* ======================================================
          USER MODAL
      ====================================================== */}

      {showAddUser && (
        <Modal
          title={
            editingUserId
              ? "Edit User"
              : "Add New User"
          }
          subtitle="Manage platform identity and access"
          onClose={() => {
            setShowAddUser(false);
            resetUserForm();
          }}
        >
          <form
            className="modal-form"
            onSubmit={handleSaveUser}
          >
            <div className="form-grid">
              <label className="form-field">
                <span>Name</span>

                <input
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      name: event.target.value,
                    })
                  }
                  required
                  placeholder="Full name"
                />
              </label>

              <label className="form-field">
                <span>Email</span>

                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      email: event.target.value,
                    })
                  }
                  required
                  placeholder="user@medishield.com"
                />
              </label>

              <label className="form-field">
                <span>Password</span>

                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      password: event.target.value,
                    })
                  }
                  placeholder={
                    editingUserId
                      ? "Leave blank to keep current password"
                      : "Password"
                  }
                  required={!editingUserId}
                />
              </label>

              <label className="form-field">
                <span>Role</span>

                <select
                  value={newUser.role}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      role: event.target.value,
                    })
                  }
                >
                  <option>Security Admin</option>
                  <option>SOC Analyst</option>
                  <option>Security Analyst</option>
                  <option>Forensic Analyst</option>
                  <option>Administrator</option>
                  <option>Doctor</option>
                  <option>Nurse</option>
                  <option>Patient</option>
                </select>
              </label>

              <label className="form-field">
                <span>Department</span>

                <input
                  value={newUser.department}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      department: event.target.value,
                    })
                  }
                  placeholder="Department"
                />
              </label>

              <label className="form-field">
                <span>Status</span>

                <select
                  value={newUser.status}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      status: event.target.value,
                    })
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </label>
            </div>

            {userError && (
              <div className="form-error">
                {userError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowAddUser(false);
                  resetUserForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingUserId
                  ? "UPDATE USER"
                  : "CREATE USER"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================
          PATIENT MODAL
      ====================================================== */}

      {showPatientModal && (
        <Modal
          title={
            editingPatient
              ? "Edit Patient"
              : "Add New Patient"
          }
          subtitle="Secure patient registration"
          onClose={() => {
            setShowPatientModal(false);
            resetPatientForm();
          }}
        >
          <form
            className="modal-form"
            onSubmit={savePatient}
          >
            <div className="form-grid">
              <label className="form-field">
                <span>Full Name</span>

                <input
                  value={patientForm.name}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      name: event.target.value,
                    })
                  }
                  required
                  placeholder="Patient name"
                />
              </label>

              <label className="form-field">
                <span>Age</span>

                <input
                  type="number"
                  min="0"
                  value={patientForm.age}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      age: event.target.value,
                    })
                  }
                  required
                  placeholder="Age"
                />
              </label>

              <label className="form-field">
                <span>Gender</span>

                <select
                  value={patientForm.gender}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      gender: event.target.value,
                    })
                  }
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="form-field">
                <span>Blood Group</span>

                <select
                  value={patientForm.bloodGroup}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      bloodGroup: event.target.value,
                    })
                  }
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </label>

              <label className="form-field">
                <span>Phone</span>

                <input
                  value={patientForm.phone}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      phone: event.target.value,
                    })
                  }
                  placeholder="Phone number"
                />
              </label>

              <label className="form-field">
                <span>Email</span>

                <input
                  type="email"
                  value={patientForm.email}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="Email"
                />
              </label>

              <label className="form-field form-field-full">
                <span>Address</span>

                <textarea
                  value={patientForm.address}
                  onChange={(event) =>
                    setPatientForm({
                      ...patientForm,
                      address: event.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Patient address"
                />
              </label>
            </div>

            {patientError && (
              <div className="form-error">
                {patientError}
              </div>
            )}

            {!editingPatient && (
              <div className="form-info">
                Default patient login password:
                <strong> Patient@123</strong>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowPatientModal(false);
                  resetPatientForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={patientSaving}
              >
                {patientSaving
                  ? "SAVING..."
                  : editingPatient
                  ? "UPDATE PATIENT"
                  : "CREATE PATIENT"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================
          DOCTOR MODAL
      ====================================================== */}

      {showDoctorModal && (
        <Modal
          title={
            editingDoctor
              ? "Edit Doctor"
              : "Add New Doctor"
          }
          subtitle="Secure clinical staff registration"
          onClose={() => {
            setShowDoctorModal(false);
            resetDoctorForm();
          }}
        >
          <form
            className="modal-form"
            onSubmit={saveDoctor}
          >
            <div className="form-grid">
              <label className="form-field">
                <span>Full Name</span>

                <input
                  value={doctorForm.name}
                  onChange={(event) =>
                    setDoctorForm({
                      ...doctorForm,
                      name: event.target.value,
                    })
                  }
                  required
                  placeholder="Doctor name"
                />
              </label>

              <label className="form-field">
                <span>Specialization</span>

                <input
                  value={doctorForm.specialization}
                  onChange={(event) =>
                    setDoctorForm({
                      ...doctorForm,
                      specialization:
                        event.target.value,
                    })
                  }
                  required
                  placeholder="e.g. Cardiology"
                />
              </label>

              <label className="form-field">
                <span>Phone</span>

                <input
                  value={doctorForm.phone}
                  onChange={(event) =>
                    setDoctorForm({
                      ...doctorForm,
                      phone: event.target.value,
                    })
                  }
                  placeholder="Phone number"
                />
              </label>

              <label className="form-field">
                <span>Email</span>

                <input
                  type="email"
                  value={doctorForm.email}
                  onChange={(event) =>
                    setDoctorForm({
                      ...doctorForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="Email"
                />
              </label>
            </div>

            {doctorError && (
              <div className="form-error">
                {doctorError}
              </div>
            )}

            {!editingDoctor && (
              <div className="form-info">
                Default doctor login password:
                <strong> Doctor@123</strong>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowDoctorModal(false);
                  resetDoctorForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={doctorSaving}
              >
                {doctorSaving
                  ? "SAVING..."
                  : editingDoctor
                  ? "UPDATE DOCTOR"
                  : "CREATE DOCTOR"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================
          NURSE MODAL
      ====================================================== */}

      {showNurseModal && (
        <Modal
          title={
            editingNurse
              ? "Edit Nurse"
              : "Add New Nurse"
          }
          subtitle="Secure nursing staff registration"
          onClose={() => {
            setShowNurseModal(false);
            resetNurseForm();
          }}
        >
          <form
            className="modal-form"
            onSubmit={saveNurse}
          >
            <div className="form-grid">
              <label className="form-field">
                <span>Full Name</span>

                <input
                  value={nurseForm.name}
                  onChange={(event) =>
                    setNurseForm({
                      ...nurseForm,
                      name: event.target.value,
                    })
                  }
                  required
                  placeholder="Nurse name"
                />
              </label>

              <label className="form-field">
                <span>Department</span>

                <input
                  value={nurseForm.department}
                  onChange={(event) =>
                    setNurseForm({
                      ...nurseForm,
                      department:
                        event.target.value,
                    })
                  }
                  required
                  placeholder="e.g. General Ward"
                />
              </label>

              <label className="form-field">
                <span>Phone</span>

                <input
                  value={nurseForm.phone}
                  onChange={(event) =>
                    setNurseForm({
                      ...nurseForm,
                      phone: event.target.value,
                    })
                  }
                  placeholder="Phone number"
                />
              </label>

              <label className="form-field">
                <span>Email</span>

                <input
                  type="email"
                  value={nurseForm.email}
                  onChange={(event) =>
                    setNurseForm({
                      ...nurseForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="Email"
                />
              </label>
            </div>

            {nurseError && (
              <div className="form-error">
                {nurseError}
              </div>
            )}

            {!editingNurse && (
              <div className="form-info">
                Default nurse login password:
                <strong> Nurse@123</strong>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowNurseModal(false);
                  resetNurseForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={nurseSaving}
              >
                {nurseSaving
                  ? "SAVING..."
                  : editingNurse
                  ? "UPDATE NURSE"
                  : "CREATE NURSE"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================
          MEDICAL RECORD MODAL
      ====================================================== */}

      {showRecordModal && (
        <Modal
          title={
            editingRecord
              ? "Edit Medical Record"
              : "Add Medical Record"
          }
          subtitle="Secure clinical information"
          onClose={() => {
            setShowRecordModal(false);
            resetRecordForm();
          }}
          wide
        >
          <form
            className="modal-form"
            onSubmit={saveMedicalRecord}
          >
            <div className="form-grid">
              <label className="form-field">
                <span>Patient</span>

                <select
                  value={recordForm.patientId}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      patientId:
                        event.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select patient
                  </option>

                  {patients.map((patient) => {
                    const id =
                      patient.patientId ||
                      patient.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {patient.name} — {id}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>Doctor</span>

                <select
                  value={recordForm.doctorId}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      doctorId:
                        event.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select doctor
                  </option>

                  {doctors.map((doctor) => {
                    const id =
                      doctor.doctorId ||
                      doctor.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {doctor.name} —{" "}
                        {doctor.specialization ||
                          "General"}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>Nurse</span>

                <select
                  value={recordForm.nurseId}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      nurseId:
                        event.target.value,
                    })
                  }
                >
                  <option value="">
                    Select nurse
                  </option>

                  {nurses.map((nurse) => {
                    const id =
                      nurse.nurseId ||
                      nurse.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {nurse.name} —{" "}
                        {nurse.department ||
                          "General"}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="form-field">
                <span>Diagnosis</span>

                <input
                  value={recordForm.diagnosis}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      diagnosis:
                        event.target.value,
                    })
                  }
                  required
                  placeholder="Diagnosis"
                />
              </label>

              <label className="form-field form-field-full">
                <span>Prescription</span>

                <textarea
                  value={recordForm.prescription}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      prescription:
                        event.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Medication and dosage"
                />
              </label>

              <label className="form-field form-field-full">
                <span>Notes</span>

                <textarea
                  value={recordForm.notes}
                  onChange={(event) =>
                    setRecordForm({
                      ...recordForm,
                      notes: event.target.value,
                    })
                  }
                  rows="4"
                  placeholder="Additional clinical notes"
                />
              </label>
            </div>

            {recordError && (
              <div className="form-error">
                {recordError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setShowRecordModal(false);
                  resetRecordForm();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={recordSaving}
              >
                {recordSaving
                  ? "SAVING..."
                  : editingRecord
                  ? "UPDATE RECORD"
                  : "CREATE RECORD"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;