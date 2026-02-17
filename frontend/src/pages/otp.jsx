import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("otpEmail");

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length < 6) {
      setError("Please enter the full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://forex-community-app.onrender.com",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            otp: code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "OTP verification failed");
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      localStorage.setItem("isVerified", "true");
      localStorage.removeItem("otpEmail");
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  // Redirect after success
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020d08] to-black">
      <div className="bg-[#050f0a]/90 border border-[#00ff9c]/30 p-8 rounded-xl w-full max-w-sm shadow-[0_0_40px_rgba(0,255,156,0.15)]">

        <h1 className="text-[#00ff9c] text-2xl font-mono tracking-widest text-center mb-2 select-none caret-transparent">
          VERIFY ACCESS
        </h1>

        <p className="text-green-400/70 text-xs text-center mb-4">
          Enter the 6-digit code sent to your email
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm text-center mb-4">
            OTP verified successfully ✔
          </p>
        )}

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                if (!value) return;

                const newOtp = [...otp];
                newOtp[index] = value;
                setOtp(newOtp);

                if (index < 5) {
                  inputsRef.current[index + 1].focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  const newOtp = [...otp];
                  newOtp[index] = "";
                  setOtp(newOtp);

                  if (index > 0) {
                    inputsRef.current[index - 1].focus();
                  }
                }
              }}
              className="w-10 h-12 text-center text-xl font-mono bg-black text-[#00ff9c] border border-[#00ff9c]/40 rounded-md outline-none focus:border-[#00ff9c]"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-3 rounded-md font-mono tracking-wider transition
            ${
              loading
                ? "bg-green-700 cursor-not-allowed"
                : "bg-[#00ff9c]/90 hover:bg-[#00ff9c] text-black shadow-[0_0_20px_rgba(0,255,156,0.4)]"
            }
          `}
        >
          {loading ? "VERIFYING..." : "VERIFY OTP"}
        </button>

      </div>
    </div>
  );
}
