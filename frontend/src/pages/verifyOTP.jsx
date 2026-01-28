import { useState, useEffect } from "react";
import api from "../services/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("otpEmail");
    if (!savedEmail) {
      window.location.href = "/";
    } else {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) return setError("OTP required");

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      localStorage.removeItem("otpEmail");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>VERIFY ACCESS</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to<br />
          <strong>{email}</strong>
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleVerify} style={styles.form}>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP CODE"
            maxLength={6}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "VERIFYING…" : "VERIFY"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #001b12 0%, #000a06 40%, #000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#00ff9c",
  },
  card: {
    width: 400,
    padding: 32,
    background: "rgba(0,15,10,0.85)",
    borderRadius: 12,
    border: "1px solid rgba(0,255,156,0.25)",
    boxShadow: "0 0 30px rgba(0,255,156,0.15)",
    textAlign: "center",
  },
  title: {
    letterSpacing: 3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(0,255,156,0.7)",
    marginBottom: 20,
  },
  error: {
    background: "rgba(255,80,80,0.15)",
    color: "#ff6b6b",
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
    marginBottom: 16,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  input: {
    padding: 14,
    background: "#000",
    border: "1px solid rgba(0,255,156,0.35)",
    borderRadius: 8,
    color: "#00ff9c",
    textAlign: "center",
    fontSize: 18,
    letterSpacing: 4,
    outline: "none",
  },
  button: {
    padding: 14,
    background:
      "linear-gradient(135deg, #00ff9c 0%, #00cc7a 100%)",
    border: "none",
    borderRadius: 8,
    color: "#001b12",
    fontWeight: "bold",
    letterSpacing: 2,
    cursor: "pointer",
  },
};
