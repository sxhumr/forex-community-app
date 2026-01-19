import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);
    localStorage.setItem("otpEmail", email);

    await fetch ("http://localhost:5000/api/auth/request-otp", 
    {
      method: "POST" , 
      headers: {"Content-Type": "application/json"}, 
      body: JSON.stringify({email}),
    }
  );


  };


  



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#020d08] to-black">
      <div className="relative bg-[#050f0a]/90 border border-[#00ff9c]/30 p-8 rounded-xl w-full max-w-sm shadow-[0_0_40px_rgba(0,255,156,0.15)]">

        {/* Title */}
        <h1 className="text-[#00ff9c] text-2xl font-mono tracking-widest text-center mb-2 select-none caret-transparent">
          THE CR MATRIX
        </h1>

        <p className="text-green-400/70 text-xs text-center mb-6  select-none caret-transparent">
          Secure Access Portal
        </p>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4  select-none caret-transparent">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-black text-green-400 font-mono border border-green-500/30 placeholder-green-700 focus:border-[#00ff9c] outline-none  select-none caret-transparent"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-black text-green-400 font-mono border border-green-500/30 placeholder-green-700 focus:border-[#00ff9c] outline-none"
          />

          <button
            type="submit"
            className="mt-2 w-full bg-[#00ff9c]/90 hover:bg-[#00ff9c] text-black py-3 rounded-md font-mono tracking-wider transition shadow-[0_0_20px_rgba(0,255,156,0.4)]"
          >
            ENTER MATRIX
          </button>
        </form>

        {/* Footer */}
        <p className="text-green-500/60 text-xs text-center mt-6  select-none caret-transparent">
          Unauthorized access prohibited
        </p>
      </div>
    </div>
  );
}
