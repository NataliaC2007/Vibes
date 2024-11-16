const socket = new WebSocket("ws://localhost:3002");
const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const userList = document.getElementById("userList");

socket.onopen = () => {
  let nomeUsuario;
  do {
    nomeUsuario = prompt("Digite seu nome de usuário:");
  } while (!nomeUsuario); 
  socket.send(nomeUsuario);
};

socket.onmessage = (event) => {
  const message = document.createElement("div");
  message.classList.add("message");
  message.textContent = event.data;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight; 
  
  
  if (event.data.startsWith("Usuários conectados:")) {
    userList.textContent = event.data;
  }
};

sendButton.addEventListener("click", () => {
  const message = messageInput.value;
  if (message) {
    socket.send(message);
    messageInput.value = "";
  }
});

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendButton.click(); 
  }
});
