import { useState, FormEvent } from "react";
import { MessageSquare } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const url = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("lanka_chat_user", JSON.stringify(data));
        onLogin(data);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4">
      <div className="bg-[#202c33] p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#00a884] p-3 rounded-full mb-4">
            <MessageSquare size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#e9edef]">
            Welcome to Lanka Chat
          </h1>
          <p className="text-[#8696a0] mt-2">
            {isLogin ? "Sign in to continue" : "Create an account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[#8696a0] text-sm mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#2a3942] text-[#e9edef] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-[#8696a0] text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2a3942] text-[#e9edef] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-[#8696a0] text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2a3942] text-[#e9edef] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-semibold py-3 rounded-lg transition-colors mt-6"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00a884] hover:underline text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
