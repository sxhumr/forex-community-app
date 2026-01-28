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

      await api.post("/auth/register", {
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
      "radial-gradient(circle at top, #001b12 0%, #000a06 40%, #000000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#00ff9c",
  },
  card: {
    width: 420,
    padding: "36px 32px",
    background: "rgba(0, 15, 10, 0.85)",
    borderRadius: 14,
    border: "1px solid rgba(0,255,156,0.25)",
    boxShadow: "0 0 40px rgba(0,255,156,0.15)",
    backdropFilter: "blur(6px)",
  },
  header: {
    textAlign: "center",
    marginBottom: 28,
  },
  title: {
    margin: 0,
    letterSpacing: 4,
    fontSize: 22,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(0,255,156,0.6)",
  },
  error: {
    background: "rgba(255,80,80,0.15)",
    border: "1px solid rgba(255,80,80,0.4)",
    color: "#ff6b6b",
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    background: "#000",
    border: "1px solid rgba(0,255,156,0.35)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#00ff9c",
    outline: "none",
    fontSize: 13,
    letterSpacing: 1,
  },
  button: {
    marginTop: 18,
    padding: 14,
    background:
      "linear-gradient(135deg, #00ff9c 0%, #00cc7a 100%)",
    color: "#001b12",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    letterSpacing: 2,
    boxShadow: "0 0 20px rgba(0,255,156,0.4)",
  },
  footer: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    gap: 8,
    fontSize: 12,
    color: "rgba(0,255,156,0.6)",
  },
  link: {
    cursor: "pointer",
    color: "#00ff9c",
    textDecoration: "underline",
  },
};
