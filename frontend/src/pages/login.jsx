import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const { data } = await api.post("auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      window.location.href = "/home";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-gray-200"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0,255,156,0.05), transparent 60%), #0b141a",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-md bg-[#111b21] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,255,156,0.15)] p-8 relative">
        {/* Subtle scanline */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,156,0.03)_1px,transparent_1px)] bg-[length:100%_3px] opacity-10 rounded-2xl" />

        {/* Header */}
        <div className="relative mb-8 text-center">
          <h1 className="text-lg font-mono tracking-[0.35em] text-[#00ff9c]">
            CR MATRIX
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Secure system access
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2">
              EMAIL
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0b141a] border border-white/10 rounded-lg px-4 py-3 text-base outline-none
                         focus:border-[#00ff9c] focus:ring-1 focus:ring-[#00ff9c]/40"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest text-gray-400 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b141a] border border-white/10 rounded-lg px-4 py-3 text-base outline-none
                         focus:border-[#00ff9c] focus:ring-1 focus:ring-[#00ff9c]/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-lg text-base font-medium tracking-wide transition
              ${
                loading
                  ? "bg-[#00a884]/70 cursor-not-allowed"
                  : "bg-[#00a884] hover:brightness-110 shadow-[0_0_16px_rgba(0,255,156,0.35)]"
              }
              text-black`}
          >
            {loading ? "AUTHORIZING…" : "LOGIN"}
          </button>
        </form>

        {/* Footer */}
        <p className="relative text-center text-xs text-gray-500 mt-8">
          Encrypted • Authenticated • Secure
        </p>
      </div>
    </div>
  );
}
