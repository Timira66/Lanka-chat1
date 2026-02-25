import { useState, useEffect } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("lanka_chat_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lanka_chat_user");
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-[#111b21]">
      {user ? (
        <Chat currentUser={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

