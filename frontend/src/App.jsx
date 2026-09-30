import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import MediShieldLogo from "./MediShieldLogo";
import HealthcareDashboard from "./healthcare/HealthcareDashboard";

const API_BASE_URL = "http://localhost:5252/api";

/* =========================================================
   API HELPER
========================================================= */

const apiFetch = async (endpoint, options = {}) => {
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

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.title ||
        data.detail ||
        data.error ||
        `API request failed (${response.status})`
    );
  }

  return data;
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Modal({ title, kicker, children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="section-kicker">{kicker}</div>
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const value = status || "Unknown";

  return (
    <span
      className={`status-badge ${
        String(value).toLowerCase().includes("active")
          ? "status-active"
          : "status-inactive"
      }`}
    >
      {value}
    </span>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  const [authenticated, setAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const userRole = currentUser?.role || "";

  const isSecurityUser = [
    "Security Admin",
    "SOC Analyst",
    "Security Analyst",
    "Forensic Analyst",
    "Administrator",
    "Admin",
  ].includes(userRole);

  const isDoctor = userRole === "Doctor";
  const isNurse = userRole === "Nurse";
  const isPatient = userRole === "Patient";

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const [dashboard, setDashboard] = useState({
    securityScore: 100,
    criticalThreats: 0,
    vulnerabilities: 0,
    securityEvents: 0,
    totalUsers: 0,
    activeUsers: 0,
    administrators: 0,
    lastUpdated: null,
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);

  /* =======================================================
     USERS
  ======================================================= */

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "User@123",
    role: "Security Admin",
    department: "",
    status: "Active",
  });

  /* =======================================================
     PATIENTS
  ======================================================= */

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSaving, setPatientSaving] = useState(false);
  const [patientError, setPatientError] = useState("");

  const emptyPatient = {
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "",
    phone: "",
    email: "",
    address: "",
  };

  const [patientForm, setPatientForm] = useState(emptyPatient);

  /* =======================================================
     DOCTORS
  ======================================================= */

  const [doctors, setDoctors] = useState([]);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorError, setDoctorError] = useState("");

  const emptyDoctor = {
    name: "",
    specialization: "",
    phone: "",
    email: "",
  };

  const [doctorForm, setDoctorForm] = useState(emptyDoctor);

  /* =======================================================
     NURSES
  ======================================================= */

  const [nurses, setNurses] = useState([]);
  const [editingNurse, setEditingNurse] = useState(null);
  const [showNurseModal, setShowNurseModal] = useState(false);
  const [nurseSaving, setNurseSaving] = useState(false);
  const [nurseError, setNurseError] = useState("");

  const emptyNurse = {
    name: "",
    department: "",
    phone: "",
    email: "",
  };

  const [nurseForm, setNurseForm] = useState(emptyNurse);

  /* =======================================================
     MEDICAL RECORDS
  ======================================================= */

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
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

  /* =======================================================
     SECURITY MODULE DATA
  ======================================================= */

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = async () => {
    try {
      setDashboardLoading(true);

      const data = await apiFetch("/dashboard");

      setDashboard({
        securityScore: data.securityScore ?? 100,
        criticalThreats: data.criticalThreats ?? 0,
        vulnerabilities: data.vulnerabilities ?? 0,
        securityEvents: data.securityEvents ?? 0,
        totalUsers: data.totalUsers ?? 0,
        activeUsers: data.activeUsers ?? 0,
        administrators: data.administrators ?? 0,
        lastUpdated: data.lastUpdated ?? null,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  /* =======================================================
     FETCH USERS
  ======================================================= */

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUserError("");

      const data = await apiFetch("/users");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setUsers(list);
    } catch (error) {
      console.error("Users error:", error);
      setUserError(error.message || "Unable to load users.");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  /* =======================================================
     FETCH HEALTHCARE DATA
  ======================================================= */

  const fetchHealthcareData = async () => {
    try {
      const results = await Promise.allSettled([
        apiFetch("/patients"),
        apiFetch("/doctors"),
        apiFetch("/nurses"),
        apiFetch("/medical-records"),
      ]);

      const [patientsResult, doctorsResult, nursesResult, recordsResult] =
        results;

      if (patientsResult.status === "fulfilled") {
        const data = patientsResult.value;

        setPatients(
          Array.isArray(data)
            ? data
            : Array.isArray(data.patients)
            ? data.patients
            : []
        );
      }

      if (doctorsResult.status === "fulfilled") {
        const data = doctorsResult.value;

        setDoctors(
          Array.isArray(data)
            ? data
            : Array.isArray(data.doctors)
            ? data.doctors
            : []
        );
      }

      if (nursesResult.status === "fulfilled") {
        const data = nursesResult.value;

        setNurses(
          Array.isArray(data)
            ? data
            : Array.isArray(data.nurses)
            ? data.nurses
            : []
        );
      }

      if (recordsResult.status === "fulfilled") {
        const data = recordsResult.value;

        setMedicalRecords(
          Array.isArray(data)
            ? data
            : Array.isArray(data.records)
            ? data.records
            : []
        );
      }
    } catch (error) {
      console.error("Healthcare data error:", error);
    }
  };

  /* =======================================================
     FETCH SECURITY MODULES
  ======================================================= */

  const fetchSecurityModules = async () => {
    try {
      const vulnerabilityResult = await apiFetch("/Vulnerability").catch(
        () => []
      );

      const eventResult = await apiFetch("/SecurityEvents").catch(() => []);

      setVulnerabilities(
        Array.isArray(vulnerabilityResult)
          ? vulnerabilityResult
          : vulnerabilityResult?.vulnerabilities || []
      );

      setSecurityEvents(
        Array.isArray(eventResult)
          ? eventResult
          : eventResult?.events || []
      );
    } catch (error) {
      console.error("Security module error:", error);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!authenticated) return;

    fetchDashboard();
    fetchHealthcareData();

    if (isSecurityUser) {
      fetchUsers();
      fetchSecurityModules();
    }
  }, [authenticated]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setCurrentUser(user);
    setAuthenticated(true);
    setActivePage("Dashboard");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuthenticated(false);
    setCurrentUser(null);
    setActivePage("Dashboard");
  };

  /* =======================================================
     USER CRUD
  ======================================================= */

  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "Security Admin",
      department: "",
      status: "Active",
    });

    setEditingUserId(null);
    setUserError("");
  };

  const openAddUser = () => {
    resetUserForm();
    setShowAddUser(true);
  };

  const openEditUser = (user) => {
    console.log("EDIT USER:", user);

    setEditingUserId(user.id);

    setNewUser({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "SOC Analyst",
      department: user.department || "",
      status: user.status || "Active",
    });

    setUserError("");
    setShowAddUser(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (
      !newUser.name.trim() ||
      !newUser.email.trim() ||
      !newUser.department.trim()
    ) {
      setUserError("Please complete all required fields.");
      return;
    }

    if (!editingUserId && !newUser.password.trim()) {
      setUserError("Password is required when creating a new user.");
      return;
    }

    try {
      setUserError("");

      const isEditing = !!editingUserId;

      const endpoint = isEditing
        ? `/users/${editingUserId}`
        : "/users";

      const payload = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        department: newUser.department.trim(),
        status: newUser.status,
      };

      if (!isEditing) {
        payload.password = newUser.password;
      }

      console.log("USER REQUEST:", {
        method: isEditing ? "PUT" : "POST",
        endpoint,
        payload,
      });

      await apiFetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      await fetchUsers();
      await fetchDashboard();

      setShowAddUser(false);
      resetUserForm();
    } catch (error) {
      console.error("USER SAVE ERROR:", error);

      setUserError(
        error.message || "Unable to save user."
      );
    }
  };

  const handleDeleteUser = async (id) => {
    if (!id) {
      setUserError("Invalid user ID.");
      return;
    }

    const confirmed = window.confirm(
      "Remove this user from the MediShield access directory?"
    );

    if (!confirmed) return;

    try {
      setUserError("");

      console.log("DELETE USER:", id);

      await apiFetch(`/users/${id}`, {
        method: "DELETE",
      });

      setUsers((previous) =>
        previous.filter((user) => user.id !== id)
      );

      await fetchUsers();
      await fetchDashboard();
    } catch (error) {
      console.error("USER DELETE ERROR:", error);

      setUserError(
        error.message || "Unable to delete user."
      );
    }
  };

  /* =======================================================
     PATIENT CRUD
  ======================================================= */

  const resetPatientForm = () => {
    setPatientForm(emptyPatient);
    setEditingPatient(null);
    setPatientError("");
  };

  const openAddPatient = () => {
    resetPatientForm();
    setShowPatientModal(true);
  };

  const openEditPatient = (patient) => {
    setEditingPatient(patient);

    setPatientForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "Male",
      bloodGroup: patient.bloodGroup || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
    });

    setPatientError("");
    setShowPatientModal(true);
  };

  const savePatient = async (e) => {
    e.preventDefault();

    setPatientSaving(true);
    setPatientError("");

    try {
      const payload = {
        ...patientForm,
        age: Number(patientForm.age),
      };

      const endpoint = editingPatient
        ? `/patients/${editingPatient.patientId}`
        : "/patients/register";

      const body = editingPatient
        ? payload
        : {
            ...payload,
            password: "Patient@123",
          };

      await apiFetch(endpoint, {
        method: editingPatient ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setShowPatientModal(false);
      resetPatientForm();

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      console.error("PATIENT SAVE ERROR:", error);
      setPatientError(error.message || "Unable to save patient.");
    } finally {
      setPatientSaving(false);
    }
  };

  const deletePatient = async (patient) => {
    const id = patient.patientId;

    if (!id) {
      alert("Patient ID is missing.");
      return;
    }

    if (!window.confirm(`Delete ${patient.name} (${id})?`)) {
      return;
    }

    try {
      await apiFetch(`/patients/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      alert(error.message || "Unable to delete patient.");
    }
  };

  /* =======================================================
     DOCTOR CRUD
  ======================================================= */

  const resetDoctorForm = () => {
    setDoctorForm(emptyDoctor);
    setEditingDoctor(null);
    setDoctorError("");
  };

  const openAddDoctor = () => {
    resetDoctorForm();
    setShowDoctorModal(true);
  };

  const openEditDoctor = (doctor) => {
    setEditingDoctor(doctor);

    setDoctorForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
    });

    setDoctorError("");
    setShowDoctorModal(true);
  };

  const saveDoctor = async (e) => {
    e.preventDefault();

    setDoctorSaving(true);
    setDoctorError("");

    try {
      const endpoint = editingDoctor
        ? `/doctors/${editingDoctor.doctorId}`
        : "/doctors/register";

      const body = editingDoctor
        ? doctorForm
        : {
            ...doctorForm,
            password: "Doctor@123",
          };

      await apiFetch(endpoint, {
        method: editingDoctor ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setShowDoctorModal(false);
      resetDoctorForm();

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      console.error("DOCTOR SAVE ERROR:", error);
      setDoctorError(error.message || "Unable to save doctor.");
    } finally {
      setDoctorSaving(false);
    }
  };

  const deleteDoctor = async (doctor) => {
    const id = doctor.doctorId;

    if (!id) {
      alert("Doctor ID is missing.");
      return;
    }

    if (!window.confirm(`Delete ${doctor.name} (${id})?`)) {
      return;
    }

    try {
      await apiFetch(`/doctors/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      alert(error.message || "Unable to delete doctor.");
    }
  };

  /* =======================================================
     NURSE CRUD
  ======================================================= */

  const resetNurseForm = () => {
    setNurseForm(emptyNurse);
    setEditingNurse(null);
    setNurseError("");
  };

  const openAddNurse = () => {
    resetNurseForm();
    setShowNurseModal(true);
  };

  const openEditNurse = (nurse) => {
    setEditingNurse(nurse);

    setNurseForm({
      name: nurse.name || "",
      department: nurse.department || "",
      phone: nurse.phone || "",
      email: nurse.email || "",
    });

    setNurseError("");
    setShowNurseModal(true);
  };

  const saveNurse = async (e) => {
    e.preventDefault();

    setNurseSaving(true);
    setNurseError("");

    try {
      const endpoint = editingNurse
        ? `/nurses/${editingNurse.nurseId}`
        : "/nurses/register";

      const body = editingNurse
        ? nurseForm
        : {
            ...nurseForm,
            password: "Nurse@123",
          };

      await apiFetch(endpoint, {
        method: editingNurse ? "PUT" : "POST",
        body: JSON.stringify(body),
      });

      setShowNurseModal(false);
      resetNurseForm();

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      console.error("NURSE SAVE ERROR:", error);
      setNurseError(error.message || "Unable to save nurse.");
    } finally {
      setNurseSaving(false);
    }
  };

  const deleteNurse = async (nurse) => {
    const id = nurse.nurseId;

    if (!id) {
      alert("Nurse ID is missing.");
      return;
    }

    if (!window.confirm(`Delete ${nurse.name} (${id})?`)) {
      return;
    }

    try {
      await apiFetch(`/nurses/${id}`, {
        method: "DELETE",
      });

      await fetchHealthcareData();
      await fetchDashboard();
    } catch (error) {
      alert(error.message || "Unable to delete nurse.");
    }
  };

  /* =======================================================
     MEDICAL RECORD CRUD
  ======================================================= */

  const resetRecordForm = () => {
    setRecordForm(emptyRecord);
    setRecordError("");
  };

  const saveMedicalRecord = async (e) => {
    e.preventDefault();

    setRecordSaving(true);
    setRecordError("");

    try {
      const payload = {
        patientId: Number(recordForm.patientId),
        doctorId: Number(recordForm.doctorId),
        nurseId: Number(recordForm.nurseId),
        diagnosis: recordForm.diagnosis,
        prescription: recordForm.prescription,
        notes: recordForm.notes,
      };

      await apiFetch("/medical-records", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowRecordModal(false);
      resetRecordForm();

      await fetchHealthcareData();
    } catch (error) {
      console.error("MEDICAL RECORD ERROR:", error);

      setRecordError(
        error.message || "Unable to create medical record."
      );
    } finally {
      setRecordSaving(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

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

  /* =======================================================
     SECURITY DASHBOARD
  ======================================================= */

  const renderSecurityDashboard = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              SECURITY OPERATIONS CENTER
            </div>

            <h1>MediShield Command Center</h1>

            <p>
              Healthcare infrastructure security monitoring and
              access control.
            </p>
          </div>

          <div className="connection-status">
            <span className="status-dot"></span>
            API CONNECTED
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="SECURITY SCORE"
            value={`${dashboard.securityScore}%`}
            subtext="Overall protection"
          />

          <MetricCard
            label="CRITICAL THREATS"
            value={dashboard.criticalThreats}
            subtext="Requires attention"
          />

          <MetricCard
            label="VULNERABILITIES"
            value={dashboard.vulnerabilities}
            subtext="Tracked findings"
          />

          <MetricCard
            label="SECURITY EVENTS"
            value={dashboard.securityEvents}
            subtext="Recent events"
          />

          <MetricCard
            label="TOTAL USERS"
            value={dashboard.totalUsers}
            subtext="Access directory"
          />

          <MetricCard
            label="ACTIVE USERS"
            value={dashboard.activeUsers}
            subtext="Currently active"
          />
        </div>

        <div className="dashboard-grid">
          <div className="content-card">
            <div className="card-header">
              <div>
                <div className="section-kicker">SYSTEM STATUS</div>
                <h2>Infrastructure Health</h2>
              </div>
            </div>

            <div className="system-list">
              <div className="system-row">
                <span>API Server</span>
                <StatusBadge status="Active" />
              </div>

              <div className="system-row">
                <span>PostgreSQL Database</span>
                <StatusBadge status="Active" />
              </div>

              <div className="system-row">
                <span>JWT Authentication</span>
                <StatusBadge status="Active" />
              </div>

              <div className="system-row">
                <span>Healthcare Module</span>
                <StatusBadge status="Active" />
              </div>

              <div className="system-row">
                <span>Threat Monitoring</span>
                <StatusBadge status="Active" />
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <div>
                <div className="section-kicker">SECURITY SUMMARY</div>
                <h2>Current Environment</h2>
              </div>
            </div>

            <div className="summary-list">
              <div>
                <strong>{patients.length}</strong>
                <span>Registered Patients</span>
              </div>

              <div>
                <strong>{doctors.length}</strong>
                <span>Doctors</span>
              </div>

              <div>
                <strong>{nurses.length}</strong>
                <span>Nurses</span>
              </div>

              <div>
                <strong>{medicalRecords.length}</strong>
                <span>Medical Records</span>
              </div>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <div>
              <div className="section-kicker">SECURITY CONTROLS</div>
              <h2>Protected Components</h2>
            </div>
          </div>

          <div className="protection-grid">
            <div>✓ JWT Authentication</div>
            <div>✓ Role-Based Access</div>
            <div>✓ PostgreSQL Database</div>
            <div>✓ Healthcare Access Control</div>
            <div>✓ User Audit Management</div>
            <div>✓ API Health Monitoring</div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     USERS PAGE
  ======================================================= */

  const renderUsers = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">ACCESS CONTROL</div>
            <h1>User Management</h1>
            <p>
              Manage authorized users and role-based access.
            </p>
          </div>

          <button
            type="button"
            className="primary-action"
            onClick={openAddUser}
          >
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
              <div className="section-kicker">
                AUTHORIZED DIRECTORY
              </div>
              <h2>System Users</h2>
            </div>

            <span className="record-count">
              {users.length} USERS
            </span>
          </div>

          {usersLoading ? (
            <div className="loading-state">
              Loading users...
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>USER</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>DEPARTMENT</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7">
                        <div className="empty-table">
                          No users found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>

                        <td>
                          <strong>{user.name}</strong>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span className="role-badge">
                            {user.role}
                          </span>
                        </td>

                        <td>
                          {user.department || "—"}
                        </td>

                        <td>
                          <StatusBadge status={user.status} />
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                openEditUser(user)
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDeleteUser(user.id)
                              }
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* =======================================================
     PATIENT PAGE
  ======================================================= */

  const renderPatients = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              HEALTHCARE MANAGEMENT
            </div>
            <h1>Patients</h1>
            <p>Manage registered hospital patients.</p>
          </div>

          {isSecurityUser && (
            <button
              type="button"
              className="primary-action"
              onClick={openAddPatient}
            >
              + ADD PATIENT
            </button>
          )}
        </div>

        <div className="content-card table-card">
          <div className="card-header">
            <h2>Patient Directory</h2>

            <span className="record-count">
              {patients.length} PATIENTS
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>AGE</th>
                  <th>GENDER</th>
                  <th>BLOOD</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  {isSecurityUser && <th>ACTIONS</th>}
                </tr>
              </thead>

              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-table">
                        No patients found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.patientId}>
                      <td>{patient.patientId}</td>
                      <td>
                        <strong>{patient.name}</strong>
                      </td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.bloodGroup || "—"}</td>
                      <td>{patient.phone || "—"}</td>
                      <td>{patient.email || "—"}</td>

                      {isSecurityUser && (
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                openEditPatient(patient)
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                deletePatient(patient)
                              }
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     DOCTORS PAGE
  ======================================================= */

  const renderDoctors = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              HEALTHCARE MANAGEMENT
            </div>

            <h1>Doctors</h1>

            <p>
              Manage doctors and medical specializations.
            </p>
          </div>

          {isSecurityUser && (
            <button
              type="button"
              className="primary-action"
              onClick={openAddDoctor}
            >
              + ADD DOCTOR
            </button>
          )}
        </div>

        {doctorError && (
          <div className="error-banner">
            {doctorError}
          </div>
        )}

        <div className="content-card table-card">
          <div className="card-header">
            <h2>Doctor Directory</h2>

            <span className="record-count">
              {doctors.length} DOCTORS
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>SPECIALIZATION</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  {isSecurityUser && <th>ACTIONS</th>}
                </tr>
              </thead>

              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-table">
                        No doctors found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.doctorId}>
                      <td>{doctor.doctorId}</td>

                      <td>
                        <strong>{doctor.name}</strong>
                      </td>

                      <td>{doctor.specialization || "—"}</td>

                      <td>{doctor.phone || "—"}</td>

                      <td>{doctor.email || "—"}</td>

                      {isSecurityUser && (
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                openEditDoctor(doctor)
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                deleteDoctor(doctor)
                              }
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     NURSES PAGE
  ======================================================= */

  const renderNurses = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              HEALTHCARE MANAGEMENT
            </div>

            <h1>Nurses</h1>

            <p>
              Manage nursing staff and departments.
            </p>
          </div>

          {isSecurityUser && (
            <button
              type="button"
              className="primary-action"
              onClick={openAddNurse}
            >
              + ADD NURSE
            </button>
          )}
        </div>

        {nurseError && (
          <div className="error-banner">
            {nurseError}
          </div>
        )}

        <div className="content-card table-card">
          <div className="card-header">
            <h2>Nursing Directory</h2>

            <span className="record-count">
              {nurses.length} NURSES
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>DEPARTMENT</th>
                  <th>PHONE</th>
                  <th>EMAIL</th>
                  {isSecurityUser && <th>ACTIONS</th>}
                </tr>
              </thead>

              <tbody>
                {nurses.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-table">
                        No nurses found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  nurses.map((nurse) => (
                    <tr key={nurse.nurseId}>
                      <td>{nurse.nurseId}</td>

                      <td>
                        <strong>{nurse.name}</strong>
                      </td>

                      <td>{nurse.department || "—"}</td>

                      <td>{nurse.phone || "—"}</td>

                      <td>{nurse.email || "—"}</td>

                      {isSecurityUser && (
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                openEditNurse(nurse)
                              }
                            >
                              EDIT
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                deleteNurse(nurse)
                              }
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     MEDICAL RECORDS
  ======================================================= */

  const getPatientName = (id) => {
    const patient = patients.find(
      (p) => Number(p.patientId) === Number(id)
    );

    return patient?.name || `Patient #${id}`;
  };

  const getDoctorName = (id) => {
    const doctor = doctors.find(
      (d) => Number(d.doctorId) === Number(id)
    );

    return doctor?.name || `Doctor #${id}`;
  };

  const getNurseName = (id) => {
    const nurse = nurses.find(
      (n) => Number(n.nurseId) === Number(id)
    );

    return nurse?.name || `Nurse #${id}`;
  };

  const renderMedicalRecords = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              CLINICAL SECURITY
            </div>

            <h1>Medical Records</h1>

            <p>
              Controlled access to patient medical information.
            </p>
          </div>

          {isSecurityUser && (
            <button
              type="button"
              className="primary-action"
              onClick={() => {
                resetRecordForm();
                setShowRecordModal(true);
              }}
            >
              + ADD RECORD
            </button>
          )}
        </div>

        <div className="content-card table-card">
          <div className="card-header">
            <h2>Medical Record Directory</h2>

            <span className="record-count">
              {medicalRecords.length} RECORDS
            </span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PATIENT</th>
                  <th>DOCTOR</th>
                  <th>NURSE</th>
                  <th>DIAGNOSIS</th>
                  <th>PRESCRIPTION</th>
                  <th>NOTES</th>
                </tr>
              </thead>

              <tbody>
                {medicalRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-table">
                        No medical records found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  medicalRecords.map((record, index) => (
                    <tr
                      key={
                        record.id ||
                        record.recordId ||
                        index
                      }
                    >
                      <td>
                        {record.id ||
                          record.recordId ||
                          index + 1}
                      </td>

                      <td>
                        {getPatientName(record.patientId)}
                      </td>

                      <td>
                        {getDoctorName(record.doctorId)}
                      </td>

                      <td>
                        {getNurseName(record.nurseId)}
                      </td>

                      <td>
                        {record.diagnosis || "—"}
                      </td>

                      <td>
                        {record.prescription || "—"}
                      </td>

                      <td>
                        {record.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     SECURITY MODULE
  ======================================================= */

  const renderSecurityModule = (title, kicker, description, items) => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">{kicker}</div>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>

          <div className="connection-status">
            <span className="status-dot"></span>
            MONITORING ONLINE
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="TOTAL ITEMS"
            value={items.length}
            subtext="Tracked records"
          />

          <MetricCard
            label="CRITICAL"
            value={
              items.filter(
                (item) =>
                  String(
                    item.severity ||
                      item.priority ||
                      item.level ||
                      ""
                  ).toLowerCase() === "critical"
              ).length
            }
            subtext="Critical findings"
          />

          <MetricCard
            label="ACTIVE"
            value={items.length}
            subtext="Currently monitored"
          />
        </div>

        <div className="content-card table-card">
          <div className="card-header">
            <h2>{title} Records</h2>
          </div>

          {items.length === 0 ? (
            <div className="empty-table">
              No records currently available.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME / TITLE</th>
                    <th>SEVERITY</th>
                    <th>STATUS</th>
                    <th>DESCRIPTION</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.id || index + 1}</td>

                      <td>
                        <strong>
                          {item.title ||
                            item.name ||
                            item.vulnerability ||
                            item.event ||
                            "Security Record"}
                        </strong>
                      </td>

                      <td>
                        {item.severity ||
                          item.priority ||
                          item.level ||
                          "Normal"}
                      </td>

                      <td>
                        {item.status || "Active"}
                      </td>

                      <td>
                        {item.description ||
                          item.details ||
                          item.message ||
                          "No description available."}
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
  };

  /* =======================================================
     HEALTHCARE DASHBOARD
  ======================================================= */

  const renderHealthcareDashboard = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              HEALTHCARE OPERATIONS
            </div>

            <h1>Healthcare Dashboard</h1>

            <p>
              Hospital management and clinical operations.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="PATIENTS"
            value={patients.length}
            subtext="Registered patients"
          />

          <MetricCard
            label="DOCTORS"
            value={doctors.length}
            subtext="Medical staff"
          />

          <MetricCard
            label="NURSES"
            value={nurses.length}
            subtext="Nursing staff"
          />

          <MetricCard
            label="MEDICAL RECORDS"
            value={medicalRecords.length}
            subtext="Clinical records"
          />
        </div>

        <div className="content-card">
          <HealthcareDashboard />
        </div>
      </div>
    );
  };

  /* =======================================================
     DOCTOR PORTAL
  ======================================================= */

  const renderDoctorPortal = () => {
    if (activePage === "My Patients") {
      return renderPatients();
    }

    if (activePage === "Medical History") {
      return renderMedicalRecords();
    }

    if (activePage === "Medications") {
      return (
        <div className="page-container">
          <div className="page-heading">
            <div>
              <div className="section-kicker">
                DOCTOR PORTAL
              </div>
              <h1>Medications</h1>
              <p>Patient medication information.</p>
            </div>
          </div>

          <div className="content-card">
            <div className="empty-table">
              Medication management is available through
              medical records.
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "Appointments") {
      return renderAppointments("Doctor");
    }

    return renderDoctorDashboard();
  };

  const renderDoctorDashboard = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              DOCTOR PORTAL
            </div>

            <h1>Doctor Dashboard</h1>

            <p>
              Welcome, {currentUser?.name || "Doctor"}.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="MY PATIENTS"
            value={patients.length}
            subtext="Patient directory"
          />

          <MetricCard
            label="MEDICAL RECORDS"
            value={medicalRecords.length}
            subtext="Clinical records"
          />

          <MetricCard
            label="APPOINTMENTS"
            value="0"
            subtext="Scheduled"
          />
        </div>

        <div className="content-card">
          <h2>Doctor Operations</h2>

          <div className="protection-grid">
            <div>✓ View Patients</div>
            <div>✓ Medical History</div>
            <div>✓ Medication Information</div>
            <div>✓ Appointment Management</div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     NURSE PORTAL
  ======================================================= */

  const renderNursePortal = () => {
    if (activePage === "Patients") {
      return renderPatients();
    }

    if (activePage === "Today's Appointments") {
      return renderAppointments("Nurse");
    }

    if (activePage === "Book Appointment") {
      return renderAppointments("Nurse", true);
    }

    return renderNurseDashboard();
  };

  const renderNurseDashboard = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              NURSE PORTAL
            </div>

            <h1>Nurse Dashboard</h1>

            <p>
              Welcome, {currentUser?.name || "Nurse"}.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="PATIENTS"
            value={patients.length}
            subtext="Patient directory"
          />

          <MetricCard
            label="TODAY'S APPOINTMENTS"
            value="0"
            subtext="Scheduled"
          />

          <MetricCard
            label="ACTIVE TASKS"
            value="0"
            subtext="Pending tasks"
          />
        </div>

        <div className="content-card">
          <h2>Nursing Operations</h2>

          <div className="protection-grid">
            <div>✓ View Patients</div>
            <div>✓ Today's Appointments</div>
            <div>✓ Patient Information</div>
            <div>✓ Book Appointment</div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     PATIENT PORTAL
  ======================================================= */

  const renderPatientPortal = () => {
    if (activePage === "My Medical History") {
      return renderMedicalRecords();
    }

    if (activePage === "My Medications") {
      return (
        <div className="page-container">
          <div className="page-heading">
            <div>
              <div className="section-kicker">
                PATIENT PORTAL
              </div>

              <h1>My Medications</h1>

              <p>Your prescribed medication information.</p>
            </div>
          </div>

          <div className="content-card">
            <div className="empty-table">
              Medication information will appear here
              when prescribed by a doctor.
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "Appointment History") {
      return renderAppointments("Patient");
    }

    if (activePage === "Book Appointment") {
      return renderAppointments("Patient", true);
    }

    return renderPatientDashboard();
  };

  const renderPatientDashboard = () => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              PATIENT PORTAL
            </div>

            <h1>Patient Dashboard</h1>

            <p>
              Welcome, {currentUser?.name || "Patient"}.
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <MetricCard
            label="MEDICAL HISTORY"
            value={medicalRecords.length}
            subtext="Available records"
          />

          <MetricCard
            label="MEDICATIONS"
            value="0"
            subtext="Current prescriptions"
          />

          <MetricCard
            label="APPOINTMENTS"
            value="0"
            subtext="Scheduled"
          />
        </div>

        <div className="content-card">
          <h2>Patient Services</h2>

          <div className="protection-grid">
            <div>✓ Medical History</div>
            <div>✓ Medications</div>
            <div>✓ Appointment History</div>
            <div>✓ Book Appointment</div>
          </div>
        </div>
      </div>
    );
  };

  /* =======================================================
     APPOINTMENTS
  ======================================================= */

  const renderAppointments = (role, booking = false) => {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <div className="section-kicker">
              {role.toUpperCase()} PORTAL
            </div>

            <h1>
              {booking
                ? "Book Appointment"
                : "Appointments"}
            </h1>

            <p>
              Appointment management module.
            </p>
          </div>
        </div>

        {booking ? (
          <div className="content-card">
            <h2>Create Appointment</h2>

            <form
              className="app-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  "Appointment booking module is ready for backend appointment endpoint integration."
                );
              }}
            >
              <select required defaultValue="">
                <option value="" disabled>
                  Select Doctor
                </option>

                {doctors.map((doctor) => (
                  <option
                    key={doctor.doctorId}
                    value={doctor.doctorId}
                  >
                    {doctor.name} —{" "}
                    {doctor.specialization}
                  </option>
                ))}
              </select>

              <input
                type="date"
                required
              />

              <input
                type="time"
                required
              />

              <textarea
                placeholder="Reason for appointment"
                rows="4"
                required
              />

              <button
                type="submit"
                className="primary-action"
              >
                BOOK APPOINTMENT
              </button>
            </form>
          </div>
        ) : (
          <div className="content-card">
            <div className="empty-table">
              No appointments currently available.
            </div>
          </div>
        )}
      </div>
    );
  };

  /* =======================================================
     ACTIVE PAGE RENDERER
  ======================================================= */

  const renderActivePage = () => {
    if (isSecurityUser) {
      switch (activePage) {
        case "Dashboard":
          return renderSecurityDashboard();

        case "Users":
          return renderUsers();

        case "Patients":
          return renderPatients();

        case "Doctors":
          return renderDoctors();

        case "Nurses":
          return renderNurses();

        case "Medical Records":
          return renderMedicalRecords();

        case "Healthcare Dashboard":
          return renderHealthcareDashboard();

        case "Vulnerabilities":
          return renderSecurityModule(
            "Vulnerabilities",
            "APPLICATION SECURITY",
            "Track vulnerabilities affecting healthcare infrastructure.",
            vulnerabilities
          );

        case "Security Events":
          return renderSecurityModule(
            "Security Events",
            "THREAT MONITORING",
            "Monitor security events generated by the platform.",
            securityEvents
          );

        case "Threat Intelligence":
          return renderSecurityModule(
            "Threat Intelligence",
            "THREAT INTELLIGENCE",
            "Monitor indicators and threat intelligence data.",
            []
          );

        case "Audit Logs":
          return renderSecurityModule(
            "Audit Logs",
            "COMPLIANCE",
            "Track administrative and security activity.",
            []
          );

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
  };

  /* =======================================================
     AUTH SCREEN
  ======================================================= */

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div
      className={`app-shell ${
        sidebarOpen ? "sidebar-visible" : "sidebar-hidden"
      }`}
    >
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <MediShieldLogo />

          <div className="brand-text">
            <strong>MEDISHIELD AI</strong>
            <span>SECURITY OPERATIONS</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {(currentUser?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {currentUser?.name || "User"}
            </strong>

            <span>
              {currentUser?.role || "User"}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item}
              className={
                activePage === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => {
                setActivePage(item);
                setSidebarOpen(true);
              }}
            >
              <span className="nav-icon">
                {getNavIcon(item)}
              </span>

              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="secure-indicator">
            <span className="status-dot"></span>
            SECURE CONNECTION
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            onClick={() =>
              setSidebarOpen((value) => !value)
            }
          >
            ☰
          </button>

          <div className="topbar-title">
            <span>MEDISHIELD AI</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <div className="api-status">
              <span className="status-dot"></span>
              API CONNECTED
            </div>

            <div className="profile">
              <strong>
                {currentUser?.name || "User"}
              </strong>

              <span>
                {currentUser?.role || "User"}
              </span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderActivePage()}
        </div>
      </main>

      {/* ===================================================
          USER MODAL
      =================================================== */}

      {showAddUser && (
        <Modal
          title={
            editingUserId
              ? "Edit User"
              : "Add User"
          }
          kicker="ACCESS CONTROL"
          onClose={() => {
            setShowAddUser(false);
            resetUserForm();
          }}
        >
          <form
            className="app-form"
            onSubmit={handleSaveUser}
          >
            <label>
              Name
            </label>

            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  name: e.target.value,
                })
              }
              required
            />

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="user@medishield.com"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  email: e.target.value,
                })
              }
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder={
                editingUserId
                  ? "New password (optional)"
                  : "Password"
              }
              value={newUser.password}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  password: e.target.value,
                })
              }
              required={!editingUserId}
              minLength="6"
              autoComplete="new-password"
            />

            <label>
              Role
            </label>

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  role: e.target.value,
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

            <label>
              Department
            </label>

            <input
              type="text"
              placeholder="Department"
              value={newUser.department}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  department: e.target.value,
                })
              }
              required
            />

            <label>
              Status
            </label>

            <select
              value={newUser.status}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  status: e.target.value,
                })
              }
            >
              <option>Active</option>
              <option>Disabled</option>
            </select>

            {userError && (
              <div className="inline-error">
                {userError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setShowAddUser(false);
                  resetUserForm();
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action"
              >
                {editingUserId
                  ? "UPDATE USER"
                  : "SAVE USER"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================
          PATIENT MODAL
      =================================================== */}

      {showPatientModal && (
        <Modal
          title={
            editingPatient
              ? "Edit Patient"
              : "Add Patient"
          }
          kicker="PATIENT MANAGEMENT"
          onClose={() => {
            setShowPatientModal(false);
            resetPatientForm();
          }}
        >
          <form
            className="app-form"
            onSubmit={savePatient}
          >
            <label>Name</label>

            <input
              type="text"
              value={patientForm.name}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Age</label>

            <input
              type="number"
              min="0"
              max="120"
              value={patientForm.age}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  age: e.target.value,
                })
              }
              required
            />

            <label>Gender</label>

            <select
              value={patientForm.gender}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  gender: e.target.value,
                })
              }
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label>Blood Group</label>

            <input
              type="text"
              placeholder="O+"
              value={patientForm.bloodGroup}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  bloodGroup: e.target.value,
                })
              }
            />

            <label>Phone</label>

            <input
              type="text"
              value={patientForm.phone}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  phone: e.target.value,
                })
              }
            />

            <label>Email</label>

            <input
              type="email"
              value={patientForm.email}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  email: e.target.value,
                })
              }
            />

            <label>Address</label>

            <textarea
              rows="3"
              value={patientForm.address}
              onChange={(e) =>
                setPatientForm({
                  ...patientForm,
                  address: e.target.value,
                })
              }
            />

            {patientError && (
              <div className="inline-error">
                {patientError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setShowPatientModal(false);
                  resetPatientForm();
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={patientSaving}
              >
                {patientSaving
                  ? "SAVING..."
                  : editingPatient
                  ? "UPDATE PATIENT"
                  : "SAVE PATIENT"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================
          DOCTOR MODAL
      =================================================== */}

      {showDoctorModal && (
        <Modal
          title={
            editingDoctor
              ? "Edit Doctor"
              : "Add Doctor"
          }
          kicker="DOCTOR MANAGEMENT"
          onClose={() => {
            setShowDoctorModal(false);
            resetDoctorForm();
          }}
        >
          <form
            className="app-form"
            onSubmit={saveDoctor}
          >
            <label>Name</label>

            <input
              type="text"
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Specialization</label>

            <input
              type="text"
              placeholder="Cardiology"
              value={doctorForm.specialization}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  specialization:
                    e.target.value,
                })
              }
              required
            />

            <label>Phone</label>

            <input
              type="text"
              value={doctorForm.phone}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  phone: e.target.value,
                })
              }
            />

            <label>Email</label>

            <input
              type="email"
              value={doctorForm.email}
              onChange={(e) =>
                setDoctorForm({
                  ...doctorForm,
                  email: e.target.value,
                })
              }
            />

            {doctorError && (
              <div className="inline-error">
                {doctorError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setShowDoctorModal(false);
                  resetDoctorForm();
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={doctorSaving}
              >
                {doctorSaving
                  ? "SAVING..."
                  : editingDoctor
                  ? "UPDATE DOCTOR"
                  : "SAVE DOCTOR"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================
          NURSE MODAL
      =================================================== */}

      {showNurseModal && (
        <Modal
          title={
            editingNurse
              ? "Edit Nurse"
              : "Add Nurse"
          }
          kicker="NURSE MANAGEMENT"
          onClose={() => {
            setShowNurseModal(false);
            resetNurseForm();
          }}
        >
          <form
            className="app-form"
            onSubmit={saveNurse}
          >
            <label>Name</label>

            <input
              type="text"
              value={nurseForm.name}
              onChange={(e) =>
                setNurseForm({
                  ...nurseForm,
                  name: e.target.value,
                })
              }
              required
            />

            <label>Department</label>

            <input
              type="text"
              placeholder="General Ward"
              value={nurseForm.department}
              onChange={(e) =>
                setNurseForm({
                  ...nurseForm,
                  department: e.target.value,
                })
              }
              required
            />

            <label>Phone</label>

            <input
              type="text"
              value={nurseForm.phone}
              onChange={(e) =>
                setNurseForm({
                  ...nurseForm,
                  phone: e.target.value,
                })
              }
            />

            <label>Email</label>

            <input
              type="email"
              value={nurseForm.email}
              onChange={(e) =>
                setNurseForm({
                  ...nurseForm,
                  email: e.target.value,
                })
              }
            />

            {nurseError && (
              <div className="inline-error">
                {nurseError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setShowNurseModal(false);
                  resetNurseForm();
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={nurseSaving}
              >
                {nurseSaving
                  ? "SAVING..."
                  : editingNurse
                  ? "UPDATE NURSE"
                  : "SAVE NURSE"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================
          MEDICAL RECORD MODAL
      =================================================== */}

      {showRecordModal && (
        <Modal
          title="Add Medical Record"
          kicker="CLINICAL DATA"
          onClose={() => {
            setShowRecordModal(false);
            resetRecordForm();
          }}
        >
          <form
            className="app-form"
            onSubmit={saveMedicalRecord}
          >
            <label>Patient</label>

            <select
              value={recordForm.patientId}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  patientId: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Patient
              </option>

              {patients.map((patient) => (
                <option
                  key={patient.patientId}
                  value={patient.patientId}
                >
                  {patient.name} — #{patient.patientId}
                </option>
              ))}
            </select>

            <label>Doctor</label>

            <select
              value={recordForm.doctorId}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  doctorId: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Doctor
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.doctorId}
                  value={doctor.doctorId}
                >
                  {doctor.name}
                </option>
              ))}
            </select>

            <label>Nurse</label>

            <select
              value={recordForm.nurseId}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  nurseId: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Nurse
              </option>

              {nurses.map((nurse) => (
                <option
                  key={nurse.nurseId}
                  value={nurse.nurseId}
                >
                  {nurse.name}
                </option>
              ))}
            </select>

            <label>Diagnosis</label>

            <input
              type="text"
              value={recordForm.diagnosis}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  diagnosis: e.target.value,
                })
              }
              required
            />

            <label>Prescription</label>

            <textarea
              rows="3"
              value={recordForm.prescription}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  prescription: e.target.value,
                })
              }
              required
            />

            <label>Notes</label>

            <textarea
              rows="3"
              value={recordForm.notes}
              onChange={(e) =>
                setRecordForm({
                  ...recordForm,
                  notes: e.target.value,
                })
              }
            />

            {recordError && (
              <div className="inline-error">
                {recordError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={() => {
                  setShowRecordModal(false);
                  resetRecordForm();
                }}
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="primary-action"
                disabled={recordSaving}
              >
                {recordSaving
                  ? "SAVING..."
                  : "SAVE RECORD"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   NAVIGATION ICONS
========================================================= */

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

export default App;