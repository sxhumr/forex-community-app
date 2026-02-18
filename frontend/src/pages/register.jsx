import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      return setError("All fields are required");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      await api.post("/api/auth/register", {
        username,
        email,
        password,
      });

      // Save email for OTP verification step
      localStorage.setItem("otpEmail", email);

      window.location.href = "/verify";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>CR MATRIX</h1>
          <p style={styles.subtitle}>Secure Registration Portal</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <Input
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="EMAIL"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="PASSWORD"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="CONFIRM PASSWORD"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "INITIALIZING…" : "ENTER MATRIX"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already inside?</span>
          <span
            style={styles.link}
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function Input(props) {
  return <input {...props} style={styles.input} autoComplete="off" />;
}

/* ---------- Styles ---------- */
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,255,156,0.05), transparent 60%), #0b141a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#e5e7eb",
  },

  card: {
    width: 440,
    padding: "40px 36px",
    background: "rgba(17, 27, 33, 0.92)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 40px rgba(0,255,156,0.15)",
    backdropFilter: "blur(8px)",
  },

  header: {
    textAlign: "center",
    marginBottom: 30,
  },

  title: {
    margin: 0,
    fontSize: 20,
    letterSpacing: 4,
    color: "#00ff9c",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "rgba(229,231,235,0.6)",
  },

  error: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 18,
    textAlign: "center",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  input: {
    background: "#0b141a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "14px 16px",
    color: "#e5e7eb",
    outline: "none",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  button: {
    marginTop: 20,
    padding: "14px",
    background:
      "linear-gradient(135deg, #00a884 0%, #00ff9c 100%)",
    color: "#001b12",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: 2,
    boxShadow: "0 0 18px rgba(0,255,156,0.35)",
  },

  footer: {
    marginTop: 26,
    display: "flex",
    justifyContent: "center",
    gap: 8,
    fontSize: 12,
    color: "rgba(229,231,235,0.6)",
  },

  link: {
    cursor: "pointer",
    color: "#00ff9c",
    textDecoration: "underline",
  },
};

