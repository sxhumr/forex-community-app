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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0,255,156,0.04), transparent 60%), #0b141a",
      }}
    >
      {/* Card – same language as Login */}
      <div className="w-full max-w-md bg-[#111b21] border border-white/10 rounded-2xl shadow-lg px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-base font-mono tracking-[0.35em] text-[#00ff9c]">
            VERIFY ACCESS
          </h1>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Enter the 6-digit code sent to
            <br />
            <span className="text-gray-200 font-medium">{email}</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="••••••"
            maxLength={6}
            className="
              w-full
              text-center
              text-lg
              tracking-[0.35em]
              bg-[#0b141a]
              text-gray-100
              border border-white/15
              rounded-xl
              px-4 py-4
              outline-none
              transition
              focus:border-[#00ff9c]
              focus:ring-1 focus:ring-[#00ff9c]/40
            "
          />

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-xl
              text-base font-medium tracking-wide
              transition
              ${
                loading
                  ? "bg-[#00a884]/60 cursor-not-allowed"
                  : "bg-[#00a884] hover:brightness-110 shadow-[0_0_16px_rgba(0,255,156,0.35)]"
              }
              text-black
            `}
          >
            {loading ? "VERIFYING…" : "VERIFY"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
         Resend OTP
        </p>
      </div>
    </div>
  );
}
