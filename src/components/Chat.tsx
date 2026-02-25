import { useState, useEffect, useRef, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import { Send, LogOut, User as UserIcon, MoreVertical, Search } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface ChatUser {
  _id: string;
  name: string;
  status: string;
}

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
}

export default function Chat({ currentUser, onLogout }: { currentUser: User; onLogout: () => void }) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.emit("join", currentUser._id);

    newSocket.on("receiveMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    // Fetch messages when a user is selected
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await fetch(`/api/messages/${currentUser._id}/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const messageData = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      message: newMessage,
      type: "text",
    };

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-[#111b21] text-[#e9edef] overflow-hidden">
      {/* Sidebar */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-[30%] lg:w-[25%] border-r border-[#222d34] flex-col`}>
        {/* Header */}
        <div className="bg-[#202c33] p-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6b7c85] rounded-full flex items-center justify-center">
              <UserIcon size={24} className="text-[#d1d7db]" />
            </div>
            <span className="font-medium">{currentUser.name}</span>
          </div>
          <div className="flex gap-4 text-[#aebac1]">
            <button onClick={onLogout} className="hover:text-[#e9edef] transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#222d34]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-1.5">
            <Search size={18} className="text-[#8696a0]" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="bg-transparent border-none outline-none w-full ml-4 text-sm text-[#e9edef] placeholder-[#8696a0]"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-[#222d34] ${
                selectedUser?._id === user._id ? "bg-[#2a3942]" : ""
              }`}
            >
              <div className="w-12 h-12 bg-[#6b7c85] rounded-full flex items-center justify-center mr-4 shrink-0">
                <UserIcon size={28} className="text-[#d1d7db]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[17px] text-[#e9edef] truncate">{user.name}</h3>
                </div>
                <p className="text-sm text-[#8696a0] truncate">Click to start chatting</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-[#0b141a] relative`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#202c33] p-3 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <button 
                  className="md:hidden text-[#aebac1] mr-2"
                  onClick={() => setSelectedUser(null)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div className="w-10 h-10 bg-[#6b7c85] rounded-full flex items-center justify-center">
                  <UserIcon size={24} className="text-[#d1d7db]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-medium">{selectedUser.name}</h2>
                  <p className="text-xs text-[#8696a0]">Online</p>
                </div>
              </div>
              <div className="text-[#aebac1]">
                <MoreVertical size={20} />
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 custom-scrollbar"
              style={{
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                backgroundRepeat: 'repeat',
                backgroundSize: '400px',
                opacity: 0.8
              }}
            >
              {messages.map((msg, index) => {
                const isMine = msg.sender === currentUser._id;
                return (
                  <div
                    key={index}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] rounded-lg px-3 py-1.5 relative shadow-sm ${
                        isMine ? "bg-[#005c4b] text-[#e9edef]" : "bg-[#202c33] text-[#e9edef]"
                      }`}
                    >
                      <p className="text-[15px] leading-snug pr-12">{msg.message}</p>
                      <span className="text-[11px] text-[#8696a0] absolute bottom-1 right-2">
                        {msg.createdAt ? formatTime(msg.createdAt) : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#202c33] p-3 flex items-center gap-4 z-10">
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 bg-[#2a3942] text-[#e9edef] rounded-lg px-4 py-2.5 outline-none focus:bg-[#2a3942]"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] transition-colors disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-b-[6px] border-[#00a884]">
            <div className="max-w-md text-center">
              <h1 className="text-3xl font-light text-[#e9edef] mb-4">Lanka Chat for Web</h1>
              <p className="text-[#8696a0] text-sm">
                Send and receive messages without keeping your phone online.<br/>
                Use Lanka Chat on up to 4 linked devices and 1 phone at the same time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
