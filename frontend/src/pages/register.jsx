import { useState } from "react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName) {
      setError("Full name is required");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Backend will be added

    console.log("Registering user:", {
      fullName,
      email,
      password,
    });

    localStorage.setItem("otpEmail", email);

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1217]">
      <div className="bg-[#13161c] p-8 rounded-xl w-full max-w-sm shadow-lg">
        <h1 className="text-white text-2xl font-semibold text-center mb-6">
          Create Account
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-[#0f1217] text-white border border-gray-700 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-[#0f1217] text-white border border-gray-700 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-[#0f1217] text-white border border-gray-700 outline-none"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-md bg-[#0f1217] text-white border border-gray-700 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition"
          >
            Register
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <span className="text-blue-500 hover:underline cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
