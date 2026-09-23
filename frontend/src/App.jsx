import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import MediShieldLogo from "./MediShieldLogo";

const API_BASE_URL = "http://localhost:5252/api";

function App() {
  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const [authenticated, setAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  // ==========================================
  // CURRENT USER
  // ==========================================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error("Unable to restore logged-in user:", error);
    }

    return null;
  });

  // ==========================================
  // ROLE DEFINITIONS
  // ==========================================

  const userRole = currentUser?.role || "";

  const isSecurityUser =
    userRole === "Security Admin" ||
    userRole === "SOC Analyst" ||
    userRole === "Security Analyst" ||
    userRole === "Forensic Analyst" ||
    userRole === "Administrator" ||
    userRole === "Admin";

  const isDoctor = userRole === "Doctor";
  const isNurse = userRole === "Nurse";
  const isPatient = userRole === "Patient";

  // ==========================================
  // DASHBOARD DATA
  // ==========================================

  const [dashboard, setDashboard] = useState({
    securityScore: 0,
    criticalThreats: 0,
    vulnerabilities: 0,
    securityEvents: 0,
    totalUsers: 0,
    activeUsers: 0,
    administrators: 0,
    criticalVulnerabilities: 0,
    highVulnerabilities: 0,
    activeVulnerabilities: 0,
    lastUpdated: null,
  });

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  // ==========================================
  // NAVIGATION
  // ==========================================

  const [activePage, setActivePage] = useState("Dashboard");

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "SOC Analyst",
    department: "",
    status: "Active",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");

  // ==========================================
  // DASHBOARD FETCH
  // ==========================================

  const fetchDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError("");

      const response = await fetch(`${API_BASE_URL}/dashboard`);

      if (!response.ok) {
        throw new Error(`Dashboard API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("REAL DASHBOARD DATA:", data);

      setDashboard({
        securityScore: data.securityScore ?? 0,
        criticalThreats: data.criticalThreats ?? 0,
        vulnerabilities: data.vulnerabilities ?? 0,
        securityEvents: data.securityEvents ?? 0,
        totalUsers: data.totalUsers ?? 0,
        activeUsers: data.activeUsers ?? 0,
        administrators: data.administrators ?? 0,
        criticalVulnerabilities:
          data.criticalVulnerabilities ?? 0,
        highVulnerabilities:
          data.highVulnerabilities ?? 0,
        activeVulnerabilities:
          data.activeVulnerabilities ?? 0,
        lastUpdated: data.lastUpdated ?? null,
      });
    } catch (error) {
      console.error("Dashboard error:", error);

      setDashboardError(
        "Unable to load live dashboard data from MediShield API."
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ==========================================
  // USERS FETCH
  // ==========================================

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUserError("");

      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error(`Users API returned ${response.status}`);
      }

      const data = await response.json();

      console.log("REAL USERS DATA:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Users error:", error);

      setUserError(
        "Unable to load users from the MediShield API."
      );

      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // ==========================================
  // INITIAL DATA LOAD
  // ==========================================

  useEffect(() => {
    if (!authenticated) return;

    fetchDashboard();
    fetchUsers();
  }, [authenticated]);

  // ==========================================
  // USER FORM
  // ==========================================

  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      role: "SOC Analyst",
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
    setEditingUserId(user.id);

    setNewUser({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role || "SOC Analyst",
      department: user.department ?? "",
      status: user.status || "Active",
    });

    setUserError("");
    setShowAddUser(true);
  };

  // ==========================================
  // CREATE USER
  // ==========================================

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.department) {
      setUserError("Please complete all required fields.");
      return;
    }

    try {
      setUserError("");

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Failed to create user."
        );
      }

      const createdUser = await response.json();

      setUsers((previousUsers) => [
        ...previousUsers,
        createdUser,
      ]);

      resetUserForm();
      setShowAddUser(false);

      await fetchDashboard();
    } catch (error) {
      console.error("Create user error:", error);

      setUserError(
        error.message || "Unable to create user."
      );
    }
  };

  // ==========================================
  // UPDATE USER
  // ==========================================

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUserId) return;

    if (!newUser.name || !newUser.email || !newUser.department) {
      setUserError("Please complete all required fields.");
      return;
    }

    try {
      setUserError("");

      const response = await fetch(
        `${API_BASE_URL}/users/${editingUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to update user."
        );
      }

      const updatedUser = await response.json();

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === editingUserId
            ? updatedUser
            : user
        )
      );

      resetUserForm();
      setShowAddUser(false);

      await fetchDashboard();
    } catch (error) {
      console.error("Update user error:", error);

      setUserError(
        error.message || "Unable to update user."
      );
    }
  };

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm(
      "Remove this user from the MediShield access directory?"
    );

    if (!confirmed) return;

    try {
      setUserError("");

      const response = await fetch(
        `${API_BASE_URL}/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || "Failed to delete user."
        );
      }

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user.id !== id)
      );

      await fetchDashboard();
    } catch (error) {
      console.error("Delete user error:", error);

      setUserError(
        error.message || "Unable to delete user."
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuthenticated(false);
    setCurrentUser(null);
    setActivePage("Dashboard");

    resetUserForm();
    setShowAddUser(false);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  if (!authenticated) {
    return (
      <Login
        onLogin={(user) => {
          console.log("Authenticated user:", user);
          console.log("User role:", user?.role);

          setCurrentUser(user);
          setAuthenticated(true);
          setActivePage("Dashboard");
        }}
      />
    );
  }

  // ==========================================
  // NAVIGATION MENU
  // ==========================================

  let menuItems = [];

  if (isSecurityUser) {
    menuItems = [
      {
        name: "Dashboard",
        icon: "⌂",
      },
      {
        name: "Vulnerabilities",
        icon: "⚠",
        count: dashboard.vulnerabilities,
      },
      {
        name: "Threat Intelligence",
        icon: "◈",
      },
      {
        name: "Security Events",
        icon: "◉",
        count: dashboard.securityEvents,
      },
      {
        name: "Users",
        icon: "♙",
        count: dashboard.totalUsers,
      },
      {
        name: "Audit Logs",
        icon: "▤",
      },
    ];
  }

  if (isDoctor) {
    menuItems = [
      {
        name: "Dashboard",
        icon: "⌂",
      },
      {
        name: "My Patients",
        icon: "♙",
      },
      {
        name: "Medical History",
        icon: "▤",
      },
      {
        name: "Medications",
        icon: "✚",
      },
      {
        name: "Appointments",
        icon: "◷",
      },
    ];
  }

  if (isNurse) {
    menuItems = [
      {
        name: "Dashboard",
        icon: "⌂",
      },
      {
        name: "Today's Appointments",
        icon: "◷",
      },
      {
        name: "Patients",
        icon: "♙",
      },
      {
        name: "Book Appointment",
        icon: "＋",
      },
    ];
  }

  if (isPatient) {
    menuItems = [
      {
        name: "Dashboard",
        icon: "⌂",
      },
      {
        name: "My Medical History",
        icon: "▤",
      },
      {
        name: "My Medications",
        icon: "✚",
      },
      {
        name: "Appointment History",
        icon: "◷",
      },
      {
        name: "Book Appointment",
        icon: "＋",
      },
    ];
  }

  // ==========================================
  // USER STATS
  // ==========================================

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const disabledUsers = users.filter(
    (user) => user.status === "Disabled"
  ).length;

  const adminUsers = users.filter(
    (user) =>
      user.role === "Security Admin" ||
      user.role === "Administrator" ||
      user.role === "Admin"
  ).length;

  // ==========================================
  // SECURITY SCORE LABEL
  // ==========================================

  const getScoreStatus = (score) => {
    if (score >= 90) return "SECURE";
    if (score >= 75) return "GOOD";
    if (score >= 50) return "ATTENTION";

    return "AT RISK";
  };

  // ==========================================
  // SECURITY DASHBOARD
  // ==========================================

  const renderDashboard = () => {
    const score = Number(dashboard.securityScore) || 0;

    return (
      <>
        <div className="page-heading dashboard-heading">
          <div>
            <div className="page-kicker">
              MEDISHIELD AI // SECURITY OPERATIONS
            </div>

            <h1>Security Command Center</h1>

            <p>
              Real-time visibility into healthcare security
              posture, threats, vulnerabilities and operational
              activity.
            </p>
          </div>

          <div className="system-live">
            <span className="live-dot"></span>
            SYSTEM OPERATIONAL
          </div>
        </div>

        {dashboardError && (
          <div className="api-alert">
            <span className="api-alert-icon">!</span>

            <div>
              <strong>LIVE API CONNECTION ISSUE</strong>
              <small>{dashboardError}</small>
            </div>
          </div>
        )}

        {/* PRIMARY SECURITY METRICS */}

        <div className="dashboard-cards">

          <div className="security-card score-card">
            <div className="card-top">
              <div>
                <span className="card-label">
                  SECURITY POSTURE
                </span>

                <small>
                  Overall environment score
                </small>
              </div>

              <span className="card-icon">◈</span>
            </div>

            <div className="score-layout">
              <div
                className="score-ring"
                style={{
                  "--score": `${Math.min(score, 100) * 3.6}deg`,
                }}
              >
                <div className="score-ring-inner">
                  <strong>
                    {loadingDashboard ? "--" : score}
                  </strong>

                  {!loadingDashboard && (
                    <span>%</span>
                  )}
                </div>
              </div>

              <div className="score-details">
                <strong>
                  {getScoreStatus(score)}
                </strong>

                <span>
                  Healthcare infrastructure
                </span>

                <div className="mini-progress">
                  <div
                    style={{
                      width: `${Math.min(score, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="security-card danger-card">
            <div className="card-top">
              <div>
                <span className="card-label">
                  CRITICAL THREATS
                </span>

                <small>
                  Immediate investigation
                </small>
              </div>

              <span className="card-icon">⚠</span>
            </div>

            <div className="metric-value">
              {loadingDashboard
                ? "--"
                : dashboard.criticalThreats}
            </div>

            <div className="metric-footer danger">
              <span className="metric-status-dot"></span>
              ACTIVE SECURITY THREATS
            </div>
          </div>

          <div className="security-card warning-card">
            <div className="card-top">
              <div>
                <span className="card-label">
                  VULNERABILITIES
                </span>

                <small>
                  Across protected systems
                </small>
              </div>

              <span className="card-icon">△</span>
            </div>

            <div className="metric-value">
              {loadingDashboard
                ? "--"
                : dashboard.vulnerabilities}
            </div>

            <div className="metric-footer warning">
              <span className="metric-status-dot"></span>
              {dashboard.highVulnerabilities} HIGH PRIORITY
            </div>
          </div>

          <div className="security-card event-card">
            <div className="card-top">
              <div>
                <span className="card-label">
                  SECURITY EVENTS
                </span>

                <small>
                  Monitored by platform
                </small>
              </div>

              <span className="card-icon">◉</span>
            </div>

            <div className="metric-value">
              {loadingDashboard
                ? "--"
                : dashboard.securityEvents}
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              EVENTS MONITORED
            </div>
          </div>
        </div>

        {/* OPERATIONAL SNAPSHOT */}

        <div className="section-heading">
          <div>
            <span>OPERATIONAL SNAPSHOT</span>

            <small>
              Database-backed platform statistics
            </small>
          </div>
        </div>

        <div className="user-stats">

          <div className="user-stat">
            <div className="stat-symbol">♙</div>

            <div>
              <span>TOTAL USERS</span>

              <strong>
                {loadingDashboard
                  ? "--"
                  : dashboard.totalUsers}
              </strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol success">
              ●
            </div>

            <div>
              <span>ACTIVE USERS</span>

              <strong>
                {loadingDashboard
                  ? "--"
                  : dashboard.activeUsers}
              </strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol blue">
              ◆
            </div>

            <div>
              <span>ADMINISTRATORS</span>

              <strong>
                {loadingDashboard
                  ? "--"
                  : dashboard.administrators}
              </strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol warning">
              !
            </div>

            <div>
              <span>HIGH VULNERABILITIES</span>

              <strong>
                {loadingDashboard
                  ? "--"
                  : dashboard.highVulnerabilities}
              </strong>
            </div>
          </div>
        </div>

        {/* SOC MONITORING */}

        <div className="section-heading monitoring-heading">
          <div>
            <span>SECURITY OPERATIONS</span>

            <small>
              Current threat and infrastructure posture
            </small>
          </div>

          <div className="live-pill">
            <span></span>
            LIVE MONITORING
          </div>
        </div>

        <div className="dashboard-grid">

          {/* THREAT MONITOR */}

          <div className="dashboard-panel threat-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  THREAT MONITOR
                </span>

                <h2>Security Activity</h2>

                <p>
                  Live security indicators from the
                  MediShield platform
                </p>
              </div>

              <span className="panel-live">
                LIVE
              </span>
            </div>

            <div className="threat-list">

              <div className="threat-row">
                <div className="threat-indicator warning">
                  ◉
                </div>

                <div className="threat-content">
                  <strong>Security Events</strong>

                  <small>
                    {dashboard.securityEvents} event
                    {dashboard.securityEvents !== 1
                      ? "s"
                      : ""}{" "}
                    currently recorded
                  </small>
                </div>

                <div className="threat-value">
                  {dashboard.securityEvents}
                </div>
              </div>

              <div className="threat-row">
                <div className="threat-indicator danger">
                  ⚠
                </div>

                <div className="threat-content">
                  <strong>Critical Threats</strong>

                  <small>
                    Security incidents requiring
                    investigation
                  </small>
                </div>

                <div className="threat-value danger-text">
                  {dashboard.criticalThreats}
                </div>
              </div>

              <div className="threat-row">
                <div className="threat-indicator warning">
                  △
                </div>

                <div className="threat-content">
                  <strong>
                    Active Vulnerabilities
                  </strong>

                  <small>
                    Identified weaknesses across
                    protected systems
                  </small>
                </div>

                <div className="threat-value warning-text">
                  {dashboard.activeVulnerabilities}
                </div>
              </div>

              <div className="threat-row">
                <div className="threat-indicator blue">
                  ◈
                </div>

                <div className="threat-content">
                  <strong>
                    High Priority Vulnerabilities
                  </strong>

                  <small>
                    Issues requiring security team
                    attention
                  </small>
                </div>

                <div className="threat-value blue-text">
                  {dashboard.highVulnerabilities}
                </div>
              </div>

            </div>

            <div className="panel-footer">
              <span className="footer-dot"></span>
              Monitoring API telemetry
            </div>
          </div>

          {/* INFRASTRUCTURE */}

          <div className="dashboard-panel status-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  INFRASTRUCTURE
                </span>

                <h2>System Health</h2>

                <p>
                  Protected healthcare environment
                </p>
              </div>
            </div>

            <div className="system-health">

              <div className="health-item">
                <div className="health-icon">⌁</div>

                <div>
                  <strong>Hospital Network</strong>
                  <small>Core infrastructure</small>
                </div>

                <span className="health-online">
                  ONLINE
                </span>
              </div>

              <div className="health-item">
                <div className="health-icon">▣</div>

                <div>
                  <strong>Patient Database</strong>
                  <small>Protected storage</small>
                </div>

                <span className="health-online">
                  SECURE
                </span>
              </div>

              <div className="health-item">
                <div className="health-icon">◇</div>

                <div>
                  <strong>Endpoint Protection</strong>
                  <small>Managed devices</small>
                </div>

                <span className="health-online">
                  ACTIVE
                </span>
              </div>

              <div className="health-item">
                <div className="health-icon">◈</div>

                <div>
                  <strong>Threat Intelligence</strong>
                  <small>Security intelligence</small>
                </div>

                <span className="health-online">
                  SYNCED
                </span>
              </div>

            </div>

            <div className="infrastructure-footer">
              <span className="footer-dot"></span>
              Environment monitoring active
            </div>
          </div>
        </div>

        {dashboard.lastUpdated && (
          <div className="last-updated">
            <span>LAST API SYNCHRONIZATION</span>

            {new Date(
              dashboard.lastUpdated
            ).toLocaleString()}
          </div>
        )}
      </>
    );
  };

  // ==========================================
  // USERS PAGE
  // ==========================================

  const renderUsers = () => {
    return (
      <>
        <div className="page-heading">

          <div>
            <div className="page-kicker">
              MEDISHIELD AI // ACCESS CONTROL
            </div>

            <h1>User Management</h1>

            <p>
              Manage authorized personnel and security
              access across the healthcare environment.
            </p>
          </div>

          <button
            className="primary-action"
            onClick={openAddUser}
          >
            + ADD USER
          </button>
        </div>

        <div className="user-stats">

          <div className="user-stat">
            <div className="stat-symbol">♙</div>

            <div>
              <span>TOTAL USERS</span>

              <strong>
                {dashboard.totalUsers || users.length}
              </strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol success">
              ●
            </div>

            <div>
              <span>ACTIVE</span>

              <strong>
                {dashboard.activeUsers || activeUsers}
              </strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol danger">
              ×
            </div>

            <div>
              <span>DISABLED</span>

              <strong>{disabledUsers}</strong>
            </div>
          </div>

          <div className="user-stat">
            <div className="stat-symbol blue">
              ◆
            </div>

            <div>
              <span>ADMINISTRATORS</span>

              <strong>
                {dashboard.administrators || adminUsers}
              </strong>
            </div>
          </div>
        </div>

        <div className="dashboard-panel users-panel">

          <div className="panel-header users-header">

            <div>
              <span className="panel-label">
                AUTHORIZED PERSONNEL
              </span>

              <h2>Security Access Directory</h2>

              <p>
                Users currently registered in PostgreSQL
              </p>
            </div>

            <span className="user-count">
              {users.length} USERS
            </span>
          </div>

          {userError && (
            <div className="inline-error">
              <strong>USER OPERATION ERROR</strong>
              <span>{userError}</span>
            </div>
          )}

          {usersLoading && (
            <div className="loading-state">
              <span className="loading-ring"></span>
              Loading security directory...
            </div>
          )}

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-table">
                        <strong>
                          No users found
                        </strong>

                        <span>
                          No security users are currently
                          registered.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <div className="user-info">

                          <div className="user-avatar">
                            {(user.name || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.name}
                            </strong>

                            <small>
                              {user.email}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="role-badge">
                          {user.role || "Not Assigned"}
                        </span>
                      </td>

                      <td>
                        <span className="department-cell">
                          {user.department ||
                            "Not Assigned"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            user.status === "Active"
                              ? "active"
                              : user.status === "Disabled"
                                ? "disabled"
                                : "unknown"
                          }`}
                        >
                          <span></span>
                          {user.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">

                          <button
                            className="edit-button"
                            onClick={() =>
                              openEditUser(user)
                            }
                          >
                            EDIT
                          </button>

                          <button
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
        </div>
      </>
    );
  };

  // ==========================================
  // SECURITY MODULE PLACEHOLDER
  // ==========================================

  const renderModule = (title, description, icon) => {
    return (
      <>
        <div className="page-heading">

          <div>
            <div className="page-kicker">
              MEDISHIELD AI // SECURITY MODULE
            </div>

            <h1>{title}</h1>

            <p>{description}</p>
          </div>

          <div className="module-status">
            <span></span>
            MODULE ONLINE
          </div>
        </div>

        <div className="module-placeholder">

          <div className="module-icon">
            {icon}
          </div>

          <div>
            <span className="module-kicker">
              SECURITY OPERATIONS MODULE
            </span>

            <h2>{title}</h2>

            <p>
              This module is ready for backend integration.
              Data controls and operational workflows will be
              connected as the platform expands.
            </p>

            <div className="module-progress">
              <span>INTEGRATION STATUS</span>

              <div>
                <i></i>
              </div>

              <strong>IN DEVELOPMENT</strong>
            </div>
          </div>

        </div>
      </>
    );
  };

  // ==========================================
  // DOCTOR DASHBOARD
  // ==========================================

  const renderDoctorDashboard = () => {
    return (
      <>
        <div className="page-heading">

          <div>
            <div className="page-kicker">
              MEDISHIELD AI // CLINICAL OPERATIONS
            </div>

            <h1>Doctor Dashboard</h1>

            <p>
              Manage patients, medical records, medications
              and appointments.
            </p>
          </div>

          <div className="system-live">
            <span className="live-dot"></span>
            CLINICAL PORTAL ACTIVE
          </div>

        </div>

        <div className="dashboard-cards">

          <div className="security-card score-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  MY PATIENTS
                </span>

                <small>
                  Patients under your care
                </small>
              </div>

              <span className="card-icon">♙</span>
            </div>

            <div className="metric-value">
              24
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              ACTIVE PATIENTS
            </div>

          </div>

          <div className="security-card event-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  APPOINTMENTS
                </span>

                <small>
                  Today's schedule
                </small>
              </div>

              <span className="card-icon">◷</span>
            </div>

            <div className="metric-value">
              6
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              TODAY
            </div>

          </div>

          <div className="security-card warning-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  MEDICAL RECORDS
                </span>

                <small>
                  Available records
                </small>
              </div>

              <span className="card-icon">▤</span>
            </div>

            <div className="metric-value">
              24
            </div>

            <div className="metric-footer warning">
              <span className="metric-status-dot"></span>
              ACCESS CONTROLLED
            </div>

          </div>

        </div>

        <div className="section-heading">
          <div>
            <span>DOCTOR SERVICES</span>
            <small>Clinical management</small>
          </div>
        </div>

        <div className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  PATIENT MANAGEMENT
                </span>

                <h2>My Patients</h2>

                <p>
                  View and manage patients assigned to you.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("My Patients")
              }
            >
              VIEW PATIENTS
            </button>

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  APPOINTMENTS
                </span>

                <h2>Today's Appointments</h2>

                <p>
                  Review your upcoming consultations.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("Appointments")
              }
            >
              VIEW APPOINTMENTS
            </button>

          </div>

        </div>
      </>
    );
  };

  // ==========================================
  // NURSE DASHBOARD
  // ==========================================

  const renderNurseDashboard = () => {
    return (
      <>
        <div className="page-heading">

          <div>
            <div className="page-kicker">
              MEDISHIELD AI // NURSING OPERATIONS
            </div>

            <h1>Nurse Dashboard</h1>

            <p>
              Manage today's appointments, patients and
              clinical activities.
            </p>
          </div>

          <div className="system-live">
            <span className="live-dot"></span>
            NURSING PORTAL ACTIVE
          </div>

        </div>

        <div className="dashboard-cards">

          <div className="security-card event-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  TODAY'S APPOINTMENTS
                </span>

                <small>
                  Scheduled consultations
                </small>
              </div>

              <span className="card-icon">◷</span>
            </div>

            <div className="metric-value">
              8
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              TODAY
            </div>

          </div>

          <div className="security-card score-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  PATIENTS
                </span>

                <small>
                  Patients requiring attention
                </small>
              </div>

              <span className="card-icon">♙</span>
            </div>

            <div className="metric-value">
              18
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              ACTIVE
            </div>

          </div>

        </div>

        <div className="section-heading">
          <div>
            <span>NURSE SERVICES</span>

            <small>
              Patient and appointment management
            </small>
          </div>
        </div>

        <div className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  APPOINTMENTS
                </span>

                <h2>Today's Appointments</h2>

                <p>
                  View today's scheduled patient
                  appointments.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("Today's Appointments")
              }
            >
              VIEW APPOINTMENTS
            </button>

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  PATIENT CARE
                </span>

                <h2>Patients</h2>

                <p>
                  View patients and their assigned
                  information.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("Patients")
              }
            >
              VIEW PATIENTS
            </button>

          </div>

        </div>
      </>
    );
  };

  // ==========================================
  // PATIENT DASHBOARD
  // ==========================================

  const renderPatientDashboard = () => {
    return (
      <>
        <div className="page-heading">

          <div>
            <div className="page-kicker">
              MEDISHIELD AI // PATIENT PORTAL
            </div>

            <h1>
              Welcome, {currentUser?.name || "Patient"}
            </h1>

            <p>
              Access your medical information and manage
              your healthcare appointments.
            </p>
          </div>

          <div className="system-live">
            <span className="live-dot"></span>
            PATIENT PORTAL ACTIVE
          </div>

        </div>

        <div className="dashboard-cards">

          <div className="security-card score-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  MEDICAL HISTORY
                </span>

                <small>
                  Your medical records
                </small>
              </div>

              <span className="card-icon">▤</span>
            </div>

            <div className="metric-value">
              VIEW
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              PROTECTED
            </div>

          </div>

          <div className="security-card warning-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  MEDICATIONS
                </span>

                <small>
                  Current medications
                </small>
              </div>

              <span className="card-icon">✚</span>
            </div>

            <div className="metric-value">
              VIEW
            </div>

            <div className="metric-footer warning">
              <span className="metric-status-dot"></span>
              PROTECTED
            </div>

          </div>

          <div className="security-card event-card">

            <div className="card-top">
              <div>
                <span className="card-label">
                  APPOINTMENTS
                </span>

                <small>
                  Your appointment history
                </small>
              </div>

              <span className="card-icon">◷</span>
            </div>

            <div className="metric-value">
              VIEW
            </div>

            <div className="metric-footer blue">
              <span className="metric-status-dot"></span>
              MANAGE
            </div>

          </div>

        </div>

        <div className="section-heading">
          <div>
            <span>PATIENT SERVICES</span>
            <small>Healthcare access</small>
          </div>
        </div>

        <div className="dashboard-grid">

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  MEDICAL RECORDS
                </span>

                <h2>My Medical History</h2>

                <p>
                  View your medical history and clinical
                  records.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("My Medical History")
              }
            >
              VIEW HISTORY
            </button>

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <span className="panel-label">
                  APPOINTMENT
                </span>

                <h2>Book Appointment</h2>

                <p>
                  Schedule a new healthcare appointment.
                </p>
              </div>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                setActivePage("Book Appointment")
              }
            >
              BOOK APPOINTMENT
            </button>

          </div>

        </div>
      </>
    );
  };

  // ==========================================
  // ROUTER
  // ==========================================

  const renderPage = () => {

    // ==========================================
    // SECURITY USERS
    // ==========================================

    if (isSecurityUser) {
      switch (activePage) {

        case "Dashboard":
          return renderDashboard();

        case "Users":
          return renderUsers();

        case "Vulnerabilities":
          return renderModule(
            "Vulnerability Management",
            "Identify, prioritize and monitor security weaknesses across healthcare infrastructure.",
            "⚠"
          );

        case "Threat Intelligence":
          return renderModule(
            "Threat Intelligence",
            "Monitor indicators of compromise, malicious activity and emerging healthcare cyber threats.",
            "◈"
          );

        case "Security Events":
          return renderModule(
            "Security Events",
            "Monitor and investigate security events generated across the healthcare environment.",
            "◉"
          );

        case "Audit Logs":
          return renderModule(
            "Audit Logs",
            "Track administrative actions and security activity for compliance and investigation.",
            "▤"
          );

        default:
          return renderDashboard();
      }
    }

    // ==========================================
    // DOCTOR
    // ==========================================

    if (isDoctor) {
      switch (activePage) {

        case "Dashboard":
          return renderDoctorDashboard();

        case "My Patients":
          return renderModule(
            "My Patients",
            "View and manage patients assigned to your care.",
            "♙"
          );

        case "Medical History":
          return renderModule(
            "Medical History",
            "Review patient medical history and clinical records.",
            "▤"
          );

        case "Medications":
          return renderModule(
            "Medications",
            "Review and manage patient medications.",
            "✚"
          );

        case "Appointments":
          return renderModule(
            "Appointments",
            "View and manage your scheduled patient appointments.",
            "◷"
          );

        default:
          return renderDoctorDashboard();
      }
    }

    // ==========================================
    // NURSE
    // ==========================================

    if (isNurse) {
      switch (activePage) {

        case "Dashboard":
          return renderNurseDashboard();

        case "Today's Appointments":
          return renderModule(
            "Today's Appointments",
            "View today's scheduled patient appointments.",
            "◷"
          );

        case "Patients":
          return renderModule(
            "Patients",
            "View patients assigned to your nursing operations.",
            "♙"
          );

        case "Book Appointment":
          return renderModule(
            "Book Appointment",
            "Create and manage patient appointments.",
            "＋"
          );

        default:
          return renderNurseDashboard();
      }
    }

    // ==========================================
    // PATIENT
    // ==========================================

    if (isPatient) {
      switch (activePage) {

        case "Dashboard":
          return renderPatientDashboard();

        case "My Medical History":
          return renderModule(
            "My Medical History",
            "View your medical history and clinical records.",
            "▤"
          );

        case "My Medications":
          return renderModule(
            "My Medications",
            "View your current medications.",
            "✚"
          );

        case "Appointment History":
          return renderModule(
            "Appointment History",
            "View your previous and upcoming appointments.",
            "◷"
          );

        case "Book Appointment":
          return renderModule(
            "Book Appointment",
            "Schedule a new healthcare appointment.",
            "＋"
          );

        default:
          return renderPatientDashboard();
      }
    }

    // ==========================================
    // UNKNOWN ROLE
    // ==========================================

    return renderModule(
      "Access Restricted",
      "Your account does not currently have a supported MediShield role.",
      "⚠"
    );
  };

  // ==========================================
  // APPLICATION
  // ==========================================

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-top">

          <div className="sidebar-brand">
            <MediShieldLogo compact />
          </div>

          <div className="sidebar-system">
            <span className="system-dot"></span>

            <div>
              <strong>
                {isSecurityUser
                  ? "SECURITY OPERATIONS"
                  : isDoctor
                    ? "DOCTOR PORTAL"
                    : isNurse
                      ? "NURSING OPERATIONS"
                      : isPatient
                        ? "PATIENT PORTAL"
                        : "MEDISHIELD AI"}
              </strong>

              <small>
                {isSecurityUser
                  ? "HEALTHCARE SOC"
                  : isDoctor
                    ? "CLINICAL SERVICES"
                    : isNurse
                      ? "PATIENT CARE"
                      : isPatient
                        ? "HEALTHCARE SERVICES"
                        : "SECURE PORTAL"}
              </small>
            </div>
          </div>

          <nav className="sidebar-nav">

            <div className="nav-section-title">
              COMMAND CENTER
            </div>

            {menuItems.map((item) => (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(item.name)
                }
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.name}
                </span>

                {item.count !== undefined &&
                  item.count > 0 && (
                    <span className="nav-count">
                      {item.count}
                    </span>
                  )}

                {activePage === item.name && (
                  <span className="nav-active-line"></span>
                )}
              </button>
            ))}

          </nav>
        </div>

        <div className="sidebar-bottom">

          <div className="security-status">

            <span className="status-pulse"></span>

            <div>
              <strong>SECURITY ACTIVE</strong>

              <small>
                Environment monitored
              </small>
            </div>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            LOGOUT
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        <header className="topbar">

          <div className="breadcrumb">
            <span>MEDISHIELD</span>

            <b>/</b>

            <strong>
              {activePage.toUpperCase()}
            </strong>
          </div>

          <div className="topbar-right">

            <div className="connection-status">
              <span></span>
              API CONNECTED
            </div>

            <div className="topbar-divider"></div>

            <div className="admin-profile">

              <div className="admin-avatar">

                {(currentUser?.name || "User")
                  .split(" ")
                  .map((part) =>
                    part.charAt(0)
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}

              </div>

              <div>

                <strong>
                  {currentUser?.name || "User"}
                </strong>

                <small>
                  {currentUser?.role || "Unknown Role"}
                </small>

              </div>

            </div>

          </div>

        </header>

        <section className="content-area">
          {renderPage()}
        </section>

      </main>

      {/* USER MODAL */}

      {showAddUser && (
        <div
          className="modal-overlay"
          onClick={() => {
            resetUserForm();
            setShowAddUser(false);
          }}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <span className="panel-label">
                  ACCESS CONTROL
                </span>

                <h2>
                  {editingUserId
                    ? "Edit Security User"
                    : "Create Security User"}
                </h2>

                <p>
                  {editingUserId
                    ? "Update authorized personnel details."
                    : "Register an authorized MediShield security user."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  resetUserForm();
                  setShowAddUser(false);
                }}
              >
                ×
              </button>

            </div>

            {userError && (
              <div className="modal-error">
                <strong>OPERATION FAILED</strong>

                <span>{userError}</span>
              </div>
            )}

            <form
              onSubmit={
                editingUserId
                  ? handleUpdateUser
                  : handleAddUser
              }
            >

              <div className="modal-form-grid">

                <div className="modal-field">

                  <label>FULL NAME</label>

                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="modal-field">

                  <label>EMAIL ADDRESS</label>

                  <input
                    type="email"
                    placeholder="user@hospital.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="modal-field">

                  <label>SECURITY ROLE</label>

                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <option>SOC Analyst</option>
                    <option>Security Analyst</option>
                    <option>Forensic Analyst</option>
                    <option>Hospital Staff</option>
                    <option>Administrator</option>
                    <option>Security Admin</option>
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Patient</option>
                  </select>

                </div>

                <div className="modal-field">

                  <label>DEPARTMENT</label>

                  <input
                    type="text"
                    placeholder="Security Operations"
                    value={newUser.department}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        department: e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="modal-field">

                  <label>ACCOUNT STATUS</label>

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

                </div>

              </div>

              <div className="modal-security-note">

                <span>◆</span>

                <div>
                  <strong>SECURITY CONTROL</strong>

                  <p>
                    User access changes are synchronized
                    with the MediShield PostgreSQL database.
                  </p>
                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    resetUserForm();
                    setShowAddUser(false);
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
                    : "CREATE USER"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;