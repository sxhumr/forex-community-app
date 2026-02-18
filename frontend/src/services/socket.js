import { io } from "socket.io-client";

const socket = io("https://forex-community-app.onrender.com", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default socket;