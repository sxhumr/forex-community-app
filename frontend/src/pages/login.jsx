import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const handleLogin = (e) => {
    e.preventDefault(); 

    setError("");

        if (!email) 
        {
            setError("Email is required");
        return; 
        }

        if (!password) 
        {
            setError("Password is required");
        return; 
        }


    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1217]">
      <div className="bg-[#13161c] p-8 rounded-xl w-full max-w-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-6">
          The CR Matrix Login
        </h1>
    {error && 
        (
          <p className="text-red-500 text-sm text-center mb-4">
          {error}
          </p>
        )

    }



        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              onChange={(e) => 
                {
                setPassword(e.target.value);
                setError("");
                }}
            className="w-full p-3 rounded-md bg-[#0f1217] text-white border border-gray-700 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition"
          >
            Login
          </button>
        </form>
 

      </div>
    </div>
  );
}
