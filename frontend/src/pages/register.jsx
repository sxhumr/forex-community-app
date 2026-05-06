import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("otpEmail", formData.email);
      navigate("/verify");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-200 bg-[#0b141a] p-4">
      <div className="w-full max-w-md bg-[#111b21] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,255,156,0.15)] p-8 relative overflow-hidden">
        {/* Subtle scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,156,0.03)_1px,transparent_1px)] bg-[length:100%_3px] opacity-10" />

        <div className="relative mb-8 text-center">
          <h1 className="text-lg font-mono tracking-[0.35em] text-[#00ff9c]">CR MATRIX</h1>
          <p className="text-sm text-gray-400 mt-2">Secure Registration Portal</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-lg text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative">
          {["username", "email", "password", "confirmPassword"].map((field) => (
            <div key={field}>
              <label className="block text-xs font-mono tracking-widest text-gray-400 mb-1 uppercase">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                name={field}
                type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                required
                value={formData[field]}
                onChange={handleChange}
                className="w-full bg-[#0b141a] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-[#00ff9c] focus:ring-1 focus:ring-[#00ff9c]/40 transition"
                placeholder={field === "username" ? "e.g. Neo" : "••••••••"}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3 rounded-lg text-base font-medium tracking-wide transition ${
              loading 
                ? "opacity-70 cursor-wait" 
                : "bg-[#00a884] hover:brightness-110 shadow-[0_0_16px_rgba(0,255,156,0.35)]"
            } text-black`}
          >
            {loading ? "INITIALIZING…" : "ENTER MATRIX"}
          </button>
        </form>

        <p className="relative text-center text-xs text-gray-500 mt-8">
          Already inside?{" "}
          <span 
            className="text-[#00ff9c] cursor-pointer hover:underline" 
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}