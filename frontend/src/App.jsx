
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import MediShieldLogo from "./MediShieldLogo";

const API_BASE_URL = "http://localhost:5252/api";

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "SOC Analyst",
  department: "Security Operations",
  status: "Active",
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  {
    id: "vulnerabilities",
    label: "Vulnerabilities",
    icon: "◈",
    count: 27,
  },
  {
    id: "threat-intelligence",
    label: "Threat Intelligence",
    icon: "◎",
  },
  {
    id: "security-events",
    label: "Security Events",
    icon: "⌁",
    count: 18,
  },
  { id: "users", label: "Users", icon: "♙" },
  { id: "audit-logs", label: "Audit Logs", icon: "☷" },
];

function App() {
  const [authenticated, setAuthenticated] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [apiError, setApiError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    securityScore: 0,
    criticalThreats: 0,
    vulnerabilities: 0,
    securityEvents: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchDashboard();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    setApiError("");

    try {
      const response = await fetch(`${API_BASE_URL}/users`);

      if (!response.ok) {
        throw new Error("Failed to load users.");
      }

      const data = await response.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Users API error:", error);

      setApiError(
        "Unable to connect to the Users API. Make sure the backend is running on port 5252."
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchDashboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setDashboardData((current) => ({
        securityScore:
          data.securityScore ??
          data.SecurityScore ??
          current.securityScore,

        criticalThreats:
          data.criticalThreats ??
          data.CriticalThreats ??
          current.criticalThreats,

        vulnerabilities:
          data.vulnerabilities ??
          data.Vulnerabilities ??
          current.vulnerabilities,

        securityEvents:
          data.securityEvents ??
          data.SecurityEvents ??
          current.securityEvents,
      }));
    } catch {
      console.log(
        "Dashboard API unavailable. Using dashboard defaults."
      );
    }
  }

  function handleLogin() {
    setAuthenticated(true);
  }

  function handleLogout() {
    setAuthenticated(false);
  }

  function handleNavigation(page) {
    setActivePage(page);
    setApiError("");
  }

  function openAddUserModal() {
    setUserForm(emptyUserForm);
    setSelectedUser(null);
    setShowAddModal(true);
  }

  function openEditUserModal(user) {
    setSelectedUser(user);

    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "SOC Analyst",
      department: user.department || "Security Operations",
      status: user.status || "Active",
    });

    setShowEditModal(true);
  }

  function closeModals() {
    if (savingUser) return;

    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setUserForm(emptyUserForm);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setUserForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAddUser(event) {
    event.preventDefault();

    if (!userForm.name.trim() || !userForm.email.trim()) {
      return;
    }

    setSavingUser(true);
    setApiError("");

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          role: userForm.role,
          department: userForm.department,
          status: userForm.status,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Failed to create user.";

        try {
          const errorData = JSON.parse(responseText);

          message =
            errorData.message ||
            errorData.title ||
            errorData.detail ||
            message;
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      closeModals();
      await fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);
      setApiError(error.message || "Failed to create user.");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleEditUser(event) {
    event.preventDefault();

    if (!selectedUser) return;

    setSavingUser(true);
    setApiError("");

    try {
      const updatePayload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        department: userForm.department,
        status: userForm.status,
      };

      if (userForm.password.trim()) {
        updatePayload.password = userForm.password;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Failed to update user.";

        try {
          const errorData = JSON.parse(responseText);

          message =
            errorData.message ||
            errorData.title ||
            errorData.detail ||
            message;
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      closeModals();
      await fetchUsers();
    } catch (error) {
      console.error("Update user error:", error);
      setApiError(error.message || "Failed to update user.");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    setDeletingUserId(user.id);
    setApiError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        let message = "Failed to delete user.";

        try {
          const errorData = JSON.parse(responseText);

          message =
            errorData.message ||
            errorData.title ||
            errorData.detail ||
            message;
        } catch {
          if (responseText) {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      await fetchUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      setApiError(error.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  }

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status?.toLowerCase() === "active"
  ).length;

  const disabledUsers = users.filter(
    (user) => user.status?.toLowerCase() === "disabled"
  ).length;

  const administrators = users.filter(
    (user) => user.role?.toLowerCase() === "security admin"
  ).length;

  const currentPageLabel =
    navItems.find((item) => item.id === activePage)?.label ||
    "Dashboard";

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <div className="sidebar-top">

          <div className="sidebar-brand">
            <MediShieldLogo size={44} />

            <div className="brand-text">
              <div className="brand-name">
                MEDISHIELD{" "}
                <span className="brand-ai">AI</span>
              </div>

              <div className="brand-subtitle">
                SECURITY OPERATIONS
              </div>
            </div>
          </div>

          <div className="command-center-label">
            <span>SECURITY OPERATIONS</span>
            <strong>COMMAND CENTER</strong>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${
                  activePage === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                <span className="nav-label">
                  {item.label}
                </span>

                {item.count && (
                  <span
                    className={`nav-count ${
                      item.id === "vulnerabilities"
                        ? "danger"
                        : ""
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">

          <div className="security-status">
            <span className="status-dot"></span>

            <div>
              <strong>Security Active</strong>
              <small>All systems monitored</small>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">

        <header className="topbar">

          <div className="breadcrumb">
            <span>MEDISHIELD</span>

            <span className="breadcrumb-separator">
              /
            </span>

            <strong>
              {currentPageLabel.toUpperCase()}
            </strong>
          </div>

          <div className="topbar-right">

            {activePage === "users" && (
              <div className="api-indicator">
                <span className="status-dot"></span>
                API CONNECTED
              </div>
            )}

            <div className="user-profile">

              <div className="profile-avatar">
                SA
              </div>

              <div className="profile-info">
                <strong>Security Admin</strong>
                <span>Administrator</span>
              </div>

            </div>

          </div>

        </header>

        <div className="page-content">

          {/* DASHBOARD */}

          {activePage === "dashboard" && (
            <DashboardPage
              dashboardData={dashboardData}
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              administrators={administrators}
            />
          )}

          {/* USERS */}

          {activePage === "users" && (
            <UsersPage
              users={users}
              loadingUsers={loadingUsers}
              apiError={apiError}
              totalUsers={totalUsers}
              activeUsers={activeUsers}
              disabledUsers={disabledUsers}
              administrators={administrators}
              onAddUser={openAddUserModal}
              onEditUser={openEditUserModal}
              onDeleteUser={handleDeleteUser}
              deletingUserId={deletingUserId}
              onRefresh={fetchUsers}
            />
          )}

          {/* VULNERABILITIES */}

          {activePage === "vulnerabilities" && (
            <PlaceholderPage
              title="Vulnerabilities"
              subtitle="Identify, prioritize and track healthcare security weaknesses."
              icon="◈"
              stats={[
                ["Critical", "8"],
                ["High", "12"],
                ["Medium", "7"],
              ]}
            />
          )}

          {/* THREAT INTELLIGENCE */}

          {activePage === "threat-intelligence" && (
            <PlaceholderPage
              title="Threat Intelligence"
              subtitle="Monitor indicators, adversary activity and emerging cyber threats."
              icon="◎"
              stats={[
                ["Active Threats", "14"],
                ["Indicators", "238"],
                ["Sources", "31"],
              ]}
            />
          )}

          {/* SECURITY EVENTS */}

          {activePage === "security-events" && (
            <SecurityEventsPage />
          )}

          {/* AUDIT LOGS */}

          {activePage === "audit-logs" && (
            <PlaceholderPage
              title="Audit Logs"
              subtitle="Track administrative actions and security activity."
              icon="☷"
              stats={[
                ["Events", "1,284"],
                ["Administrators", "1"],
                ["Retention", "90 Days"],
              ]}
            />
          )}

        </div>
      </main>

      {/* ================= ADD USER MODAL ================= */}

      {showAddModal && (
        <UserModal
          mode="add"
          form={userForm}
          saving={savingUser}
          onChange={handleInputChange}
          onSubmit={handleAddUser}
          onClose={closeModals}
        />
      )}

      {/* ================= EDIT USER MODAL ================= */}

      {showEditModal && selectedUser && (
        <UserModal
          mode="edit"
          form={userForm}
          saving={savingUser}
          selectedUser={selectedUser}
          onChange={handleInputChange}
          onSubmit={handleEditUser}
          onClose={closeModals}
        />
      )}

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage({
  dashboardData,
  totalUsers,
  activeUsers,
  administrators,
}) {
  return (
    <>
      <section className="page-header">

        <div>
          <div className="eyebrow">
            SECURITY OPERATIONS
          </div>

          <h1>
            Healthcare Cybersecurity Command Center
          </h1>

          <p>
            Centralized monitoring, threat detection and
            security administration.
          </p>
        </div>

        <div className="header-status">
          <span className="status-dot"></span>
          SYSTEM OPERATIONAL
        </div>

      </section>

      {/* METRICS */}

      <section className="metrics-grid">

        <MetricCard
          label="SECURITY SCORE"
          value={`${dashboardData.securityScore}%`}
          change="+4.8%"
          icon="◉"
          type="success"
        />

        <MetricCard
          label="CRITICAL THREATS"
          value={dashboardData.criticalThreats}
          change="2 require action"
          icon="⚠"
          type="danger"
        />

        <MetricCard
          label="VULNERABILITIES"
          value={dashboardData.vulnerabilities}
          change="7 critical"
          icon="◈"
          type="warning"
        />

        <MetricCard
          label="SECURITY EVENTS"
          value={dashboardData.securityEvents}
          change="+12.4% today"
          icon="⌁"
          type="blue"
        />

      </section>

      {/* THREAT + SYSTEM */}

      <section className="dashboard-grid">

        <div className="panel threat-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                LIVE MONITORING
              </span>

              <h2>Threat Overview</h2>
            </div>

            <span className="live-badge">
              <span className="status-dot"></span>
              LIVE
            </span>

          </div>

          <div className="threat-list">

            <ThreatItem
              name="Ransomware"
              count="2"
              severity="Critical"
              type="danger"
              description="Malware activity detected"
            />

            <ThreatItem
              name="Suspicious Login Attempts"
              count="18"
              severity="High"
              type="warning"
              description="Unusual authentication activity"
            />

            <ThreatItem
              name="Phishing Indicators"
              count="31"
              severity="Medium"
              type="blue"
              description="Potential phishing activity"
            />

          </div>

        </div>

        <div className="panel system-panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                INFRASTRUCTURE
              </span>

              <h2>System Status</h2>
            </div>

            <span className="all-good">
              ALL SYSTEMS NORMAL
            </span>

          </div>

          <div className="system-list">

            <SystemStatus
              name="API Gateway"
              detail="Backend service"
              status="ONLINE"
            />

            <SystemStatus
              name="PostgreSQL"
              detail="Database connection"
              status="CONNECTED"
            />

            <SystemStatus
              name="Threat Monitor"
              detail="Continuous monitoring"
              status="ACTIVE"
            />

            <SystemStatus
              name="Authentication"
              detail="Access control"
              status="SECURED"
            />

          </div>

        </div>

      </section>

      {/* ADMINISTRATION */}

      <section className="panel overview-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              ACCESS MANAGEMENT
            </span>

            <h2>Security Administration</h2>
          </div>

        </div>

        <div className="admin-overview">

          <div className="overview-item">
            <span className="overview-icon">
              ♙
            </span>

            <div>
              <strong>{totalUsers}</strong>
              <span>Total Users</span>
            </div>
          </div>

          <div className="overview-item">
            <span className="overview-icon success">
              ●
            </span>

            <div>
              <strong>{activeUsers}</strong>
              <span>Active Users</span>
            </div>
          </div>

          <div className="overview-item">
            <span className="overview-icon blue">
              ◆
            </span>

            <div>
              <strong>{administrators}</strong>
              <span>Security Administrators</span>
            </div>
          </div>

          <div className="overview-item">
            <span className="overview-icon warning">
              ◌
            </span>

            <div>
              <strong>24/7</strong>
              <span>Monitoring</span>
            </div>
          </div>

        </div>

      </section>
    </>
  );
}


/* =========================================================
   USERS PAGE
========================================================= */

function UsersPage({
  users,
  loadingUsers,
  apiError,
  totalUsers,
  activeUsers,
  disabledUsers,
  administrators,
  onAddUser,
  onEditUser,
  onDeleteUser,
  deletingUserId,
  onRefresh,
}) {
  return (
    <>
      <section className="page-header users-header">

        <div>
          <div className="eyebrow">
            ACCESS MANAGEMENT
          </div>

          <h1>Users</h1>

          <p>
            Manage security personnel and system access
            across the MediShield environment.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onAddUser}
        >
          <span>＋</span>
          Add User
        </button>

      </section>

      {apiError && (
        <div className="api-error">

          <span>!</span>

          <div>
            <strong>API Error</strong>
            <p>{apiError}</p>
          </div>

        </div>
      )}

      <section className="user-stats-grid">

        <MiniStat
          label="TOTAL USERS"
          value={totalUsers}
          icon="♙"
        />

        <MiniStat
          label="ACTIVE"
          value={activeUsers}
          icon="●"
          type="success"
        />

        <MiniStat
          label="DISABLED"
          value={disabledUsers}
          icon="○"
          type="danger"
        />

        <MiniStat
          label="ADMINISTRATORS"
          value={administrators}
          icon="◆"
          type="blue"
        />

      </section>

      <section className="panel users-panel">

        <div className="panel-header users-panel-header">

          <div>
            <span className="panel-label">
              IDENTITY MANAGEMENT
            </span>

            <h2>Security Personnel</h2>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={onRefresh}
            disabled={loadingUsers}
          >
            <span
              className={
                loadingUsers ? "spinning" : ""
              }
            >
              ↻
            </span>

            {loadingUsers
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        <div className="table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {loadingUsers && users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    <div className="loading-spinner"></div>
                    Loading security personnel...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    <div className="empty-icon">
                      ♙
                    </div>

                    <strong>
                      No users found
                    </strong>

                    <span>
                      Add your first security user.
                    </span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={onEditUser}
                    onDelete={onDeleteUser}
                    deleting={
                      deletingUserId === user.id
                    }
                  />
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>
    </>
  );
}


/* =========================================================
   USER ROW
========================================================= */

function UserRow({
  user,
  onEdit,
  onDelete,
  deleting,
}) {
  const initials = getInitials(user.name);

  const status = user.status || "Unknown";

  const statusClass =
    status.toLowerCase() === "active"
      ? "active"
      : status.toLowerCase() === "disabled"
      ? "disabled"
      : "unknown";

  return (
    <tr>

      <td>

        <div className="user-cell">

          <div className="user-avatar">
            {initials}
          </div>

          <div className="user-details">

            <strong>
              {user.name || "Unnamed User"}
            </strong>

            <span>
              {user.email || "No email"}
            </span>

          </div>

        </div>

      </td>

      <td>
        <span className="role-badge">
          {user.role || "Not Assigned"}
        </span>
      </td>

      <td>
        <span className="department-text">
          {user.department || "—"}
        </span>
      </td>

      <td>

        <span
          className={`status-badge ${statusClass}`}
        >
          <span className="status-dot"></span>
          {status}
        </span>

      </td>

      <td>

        <span className="date-text">
          {formatDate(user.createdAt)}
        </span>

      </td>

      <td>

        <div className="action-buttons">

          <button
            type="button"
            className="table-action edit"
            onClick={() => onEdit(user)}
            title="Edit user"
          >
            ✎
          </button>

          <button
            type="button"
            className="table-action delete"
            onClick={() => onDelete(user)}
            disabled={deleting}
            title="Delete user"
          >
            {deleting ? "…" : "⌫"}
          </button>

        </div>

      </td>

    </tr>
  );
}


/* =========================================================
   USER MODAL
========================================================= */

function UserModal({
  mode,
  form,
  saving,
  selectedUser,
  onChange,
  onSubmit,
  onClose,
}) {
  const isEdit = mode === "edit";

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >

      <div
        className="modal-card"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>

            <span className="panel-label">
              {isEdit
                ? "IDENTITY MANAGEMENT"
                : "NEW IDENTITY"}
            </span>

            <h2>
              {isEdit
                ? "Edit User"
                : "Add User"}
            </h2>

            <p>
              {isEdit
                ? `Update access details for ${
                    selectedUser?.name || "user"
                  }.`
                : "Create a new security personnel account."}
            </p>

          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>

        </div>

        <form onSubmit={onSubmit}>

          <div className="form-grid">

            <div className="form-group">

              <label htmlFor="name">
                FULL NAME <span>*</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                value={form.name}
                onChange={onChange}
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="email">
                EMAIL ADDRESS <span>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@medishield.com"
                value={form.email}
                onChange={onChange}
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                {isEdit
                  ? "NEW PASSWORD"
                  : "PASSWORD"}

                {!isEdit && <span>*</span>}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder={
                  isEdit
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                value={form.password}
                onChange={onChange}
                required={!isEdit}
              />

            </div>

            <div className="form-group">

              <label htmlFor="role">
                SECURITY ROLE <span>*</span>
              </label>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={onChange}
                required
              >

                <option value="SOC Analyst">
                  SOC Analyst
                </option>

                <option value="Security Analyst">
                  Security Analyst
                </option>

                <option value="Forensic Analyst">
                  Forensic Analyst
                </option>

                <option value="Security Admin">
                  Security Admin
                </option>

                <option value="Hospital Staff">
                  Hospital Staff
                </option>

              </select>

            </div>

            <div className="form-group">

              <label htmlFor="department">
                DEPARTMENT
              </label>

              <input
                id="department"
                name="department"
                type="text"
                placeholder="Security Operations"
                value={form.department}
                onChange={onChange}
              />

            </div>

            <div className="form-group">

              <label htmlFor="status">
                ACCOUNT STATUS
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={onChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Disabled">
                  Disabled
                </option>

              </select>

            </div>

          </div>

          <div className="modal-security-note">

            <span>✓</span>

            <div>

              <strong>
                Security Notice
              </strong>

              <p>
                Account activity is monitored and
                recorded in the security audit trail.
              </p>

            </div>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Changes"
                : "Create User"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  change,
  icon,
  type = "",
}) {
  return (
    <div className={`metric-card ${type}`}>

      <div className="metric-card-top">

        <span className="metric-card-label">
          {label}
        </span>

        <span className="metric-card-icon">
          {icon}
        </span>

      </div>

      <div className="metric-card-value">
        {value}
      </div>

      <div className="metric-card-change">
        {change}
      </div>

    </div>
  );
}


/* =========================================================
   THREAT ITEM
========================================================= */

function ThreatItem({
  name,
  count,
  severity,
  type = "",
  description,
}) {
  return (
    <div className="threat-item">

      <div className={`threat-icon ${type}`}>
        {type === "danger"
          ? "!"
          : type === "warning"
          ? "⚠"
          : "◎"}
      </div>

      <div className="threat-info">

        <strong>{name}</strong>

        <span>{description}</span>

      </div>

      <div className="threat-meta">

        <strong>{count}</strong>

        <span
          className={`severity-badge ${type}`}
        >
          {severity}
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   SYSTEM STATUS
========================================================= */

function SystemStatus({
  name,
  detail,
  status,
}) {
  return (
    <div className="system-status-row">

      <div className="system-status-indicator">
        <span className="status-dot"></span>
      </div>

      <div className="system-status-info">

        <strong>{name}</strong>

        <span>{detail}</span>

      </div>

      <span className="system-status-value">
        {status}
      </span>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
  icon,
  type = "",
}) {
  return (
    <div className={`mini-stat ${type}`}>

      <div className="mini-stat-icon">
        {icon}
      </div>

      <div className="mini-stat-content">

        <span>{label}</span>

        <strong>{value}</strong>

      </div>

    </div>
  );
}


/* =========================================================
   PLACEHOLDER PAGE
========================================================= */

function PlaceholderPage({
  title,
  subtitle,
  icon,
  stats = [],
}) {
  return (
    <>
      <section className="page-header">

        <div>

          <div className="eyebrow">
            SECURITY OPERATIONS
          </div>

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>

        <div className="header-status">

          <span className="status-dot"></span>

          SYSTEM OPERATIONAL

        </div>

      </section>

      <section className="user-stats-grid">

        {stats.map(([label, value], index) => (
          <MiniStat
            key={index}
            label={label}
            value={value}
            icon={icon}
          />
        ))}

      </section>

      <section className="panel">

        <div className="panel-header">

          <div>

            <span className="panel-label">
              MEDISHIELD SECURITY PLATFORM
            </span>

            <h2>
              {title} Module
            </h2>

          </div>

          <span className="all-good">
            MODULE ACTIVE
          </span>

        </div>

        <div className="empty-state">

          <div className="empty-icon">
            {icon}
          </div>

          <strong>
            {title} monitoring is ready
          </strong>

          <span>
            This module is connected to the
            MediShield AI command center and
            can be expanded with live security
            data.
          </span>

        </div>

      </section>
    </>
  );
}


/* =========================================================
   SECURITY EVENTS
========================================================= */

function SecurityEventsPage() {
  const events = [
    {
      time: "09:42:18",
      event: "Suspicious login attempt",
      source: "Authentication",
      severity: "High",
    },
    {
      time: "09:38:04",
      event: "Multiple failed login attempts",
      source: "API Gateway",
      severity: "Medium",
    },
    {
      time: "09:31:47",
      event: "Threat intelligence indicator received",
      source: "Threat Monitor",
      severity: "Medium",
    },
    {
      time: "09:24:11",
      event: "Security policy updated",
      source: "Security Admin",
      severity: "Low",
    },
  ];

  return (
    <>
      <section className="page-header">

        <div>

          <div className="eyebrow">
            SECURITY MONITORING
          </div>

          <h1>Security Events</h1>

          <p>
            Monitor authentication, infrastructure
            and security activity across the
            MediShield environment.
          </p>

        </div>

        <div className="header-status">

          <span className="status-dot"></span>

          LIVE MONITORING

        </div>

      </section>

      <section className="panel">

        <div className="panel-header">

          <div>

            <span className="panel-label">
              EVENT STREAM
            </span>

            <h2>
              Recent Security Events
            </h2>

          </div>

          <span className="live-badge">

            <span className="status-dot"></span>

            LIVE

          </span>

        </div>

        <div className="table-wrapper">

          <table className="users-table">

            <thead>

              <tr>
                <th>TIME</th>
                <th>EVENT</th>
                <th>SOURCE</th>
                <th>SEVERITY</th>
              </tr>

            </thead>

            <tbody>

              {events.map((event, index) => (
                <tr key={index}>

                  <td>
                    <span className="date-text">
                      {event.time}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {event.event}
                    </strong>
                  </td>

                  <td>
                    <span className="department-text">
                      {event.source}
                    </span>
                  </td>

                  <td>

                    <span
                      className={`severity-badge ${
                        event.severity === "High"
                          ? "danger"
                          : event.severity === "Medium"
                          ? "warning"
                          : "blue"
                      }`}
                    >
                      {event.severity}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </section>
    </>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name = "") {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


/* =========================================================
   EXPORT
========================================================= */

export default App;

