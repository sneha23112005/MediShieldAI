
import { useEffect, useRef, useState } from "react";
import "./Login.css";
import MediShieldLogo from "./MediShieldLogo";

function Login({ onLogin }) {
  const sceneRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return;

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;

      scene.style.setProperty("--mouse-x", x);
      scene.style.setProperty("--mouse-y", y);

      scene.querySelectorAll("[data-depth]").forEach((element) => {
        const depth = Number(element.dataset.depth);

        element.style.setProperty("--move-x", `${x * depth}px`);
        element.style.setProperty("--move-y", `${y * depth}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // =========================================
  // LOGIN
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5252/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      if (!data.token || !data.user) {
        throw new Error(
          "Login succeeded, but user information was not returned by the server."
        );
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save current logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log("Logged-in user:", data.user);
      console.log("User role:", data.user.role);

      // Send user information to App.jsx
      onLogin(data.user);
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =========================================
          3D CYBER ENVIRONMENT
      ========================================== */}

      <div className="cyber-scene" ref={sceneRef}>

        <div
          className="ambient-glow glow-one"
          data-depth="18"
        />

        <div
          className="ambient-glow glow-two"
          data-depth="-15"
        />

        <div
          className="ambient-glow glow-three"
          data-depth="25"
        />

        <div className="cyber-grid" />

        {/* Rotating Rings */}

        <div
          className="orbit orbit-one"
          data-depth="18"
        />

        <div
          className="orbit orbit-two"
          data-depth="-15"
        />

        <div
          className="orbit orbit-three"
          data-depth="12"
        />

        {/* =====================================
            3D MEDICAL SHIELD
        ====================================== */}

        <div
          className="shield-3d"
          data-depth="40"
        >
          <div className="shield-glow" />

          <div className="shield-shape">
            <div className="shield-inner">

              <div className="medical-cross">
                <span />
                <span />
              </div>

              <div className="shield-ecg">
                ─▒▓▒▓▓▒▓─
              </div>

            </div>
          </div>

          <div className="pulse-ring" />
          <div className="pulse-ring pulse-ring-two" />
        </div>

        {/* =====================================
            PARTICLES
        ====================================== */}

        <div className="particle particle-1" data-depth="25" />
        <div className="particle particle-2" data-depth="-20" />
        <div className="particle particle-3" data-depth="35" />
        <div className="particle particle-4" data-depth="-30" />
        <div className="particle particle-5" data-depth="20" />
        <div className="particle particle-6" data-depth="40" />
        <div className="particle particle-7" data-depth="-25" />
        <div className="particle particle-8" data-depth="30" />
        <div className="particle particle-9" data-depth="-35" />
        <div className="particle particle-10" data-depth="20" />

        {/* =====================================
            SECURITY NODES
        ====================================== */}

        <div
          className="data-node node-one"
          data-depth="20"
        >
          <span />
          <small>NODE_01</small>
        </div>

        <div
          className="data-node node-two"
          data-depth="-18"
        >
          <span />
          <small>NODE_02</small>
        </div>

        <div
          className="data-node node-three"
          data-depth="25"
        >
          <span />
          <small>SECURE</small>
        </div>

        {/* =====================================
            SECURITY HUD
        ====================================== */}

        <div
          className="floating-hud hud-left"
          data-depth="18"
        >
          <span>SECURITY NETWORK</span>
          <strong>ACTIVE</strong>
        </div>

        <div
          className="floating-hud hud-right"
          data-depth="-18"
        >
          <span>THREAT MONITOR</span>
          <strong>ONLINE</strong>
        </div>

        <div
          className="floating-hud hud-bottom"
          data-depth="22"
        >
          <span>ENCRYPTION</span>
          <strong>AES-256</strong>
        </div>

        {/* ECG */}

        <div
          className="medical-pulse"
          data-depth="20"
        >
          ──▒▓──▒▓▒▓──▒▓──
        </div>

        {/* System Status */}

        <div
          className="system-status"
          data-depth="15"
        >
          <span className="status-dot" />
          SYSTEM PROTECTED
        </div>

        <div className="scan-line" />
      </div>

      {/* =========================================
          BRANDING
      ========================================== */}

      <div className="auth-visual">
        <div className="visual-brand">
          <MediShieldLogo />
        </div>
      </div>

      {/* =========================================
          LOGIN
      ========================================== */}

      <div className="auth-container">

        <div className="auth-card">

          <div className="card-security">
            <span className="card-security-dot" />
            SECURE CHANNEL ESTABLISHED
          </div>

          <div className="auth-header">

            <div className="login-brand">
              <MediShieldLogo compact />
            </div>

            <div className="login-heading">

              <span className="system-label">
                MEDISHIELD // SECURE ACCESS
              </span>

              <h2>Welcome Back</h2>

              <p>
                Access your secure healthcare portal
              </p>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 80, 80, 0.4)",
                background: "rgba(255, 50, 50, 0.08)",
                color: "#ff7b7b",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="input-group">

              <label htmlFor="email">
                EMAIL ADDRESS
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="security@hospital.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* Password */}

            <div className="input-group">

              <label htmlFor="password">
                PASSWORD
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔐
                </span>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* Form Options */}

            <div className="form-options">

              <label className="remember">

                <input
                  type="checkbox"
                  name="remember"
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot"
              >
                Forgot password?
              </button>

            </div>

            {/* Login Button */}

            <button
              className="auth-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "AUTHENTICATING..."
                  : "ENTER SECURE PORTAL"}
              </span>

              <b>→</b>
            </button>

          </form>

          {/* Divider */}

          <div className="divider">
            <span>
              SECURE CHANNEL
            </span>
          </div>

          {/* Security Footer */}

          <div className="security-footer">

            <span>
              ● ENCRYPTED
            </span>

            <span>
              ● JWT SECURED
            </span>

            <span>
              ● HIPAA READY
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;