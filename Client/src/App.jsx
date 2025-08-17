import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import MessageDetails from "./components/MessageDetails";
import NotificationDetails from "./components/NotificationDetails";

const socket = io("http://localhost:8080/chat");

function App() {
  const [message, setMessage] = useState("");
  const [messageReceived, setReceivedMessage] = useState(null);
  const [room, setRoom] = useState("general");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const handleMessage = (msg) => setReceivedMessage(msg);
    const handleNotification = (notif) => setNotification(notif.message);

    socket.on("message", handleMessage);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("message", handleMessage);
      socket.off("notification", handleNotification);
    };
  }, []);

  const handleJoin = () => {
    socket.emit("joinRoom", room);
  };

  const handleLeave = () => {
    socket.emit("leaveRoom", room);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("send_message", { text: message, room });
    setMessage("");
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-md bg-white w-80">
        <h2 className="text-xl font-semibold">Select a Room</h2>
        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="general">General</option>
          <option value="random">Random</option>
          <option value="help">Help</option>
        </select>

        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            className="px-4 py-2 rounded-2xl bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition"
          >
            Join Room
          </button>
          <button
            onClick={handleLeave}
            className="px-4 py-2 rounded-2xl bg-red-500 text-white font-medium shadow hover:bg-red-600 transition"
          >
            Leave Room
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Enter Your Message
        </h2>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type something..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Submit
        </button>
      </form>

      <p className="text-center mt-4">
        Currently in room: <strong>{room}</strong>
      </p>

      <MessageDetails message={messageReceived} />
      <NotificationDetails message={notification} />
    </>
  );
}

export default App;
