const messagesContainer = document.querySelector('.chat-messages');
const messageInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.chat-input button');

sendButton.addEventListener('click', () => {
    const messageText = messageInput.value;
    if (messageText.trim() !== '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `
            <span class="chat-message-user">Você:</span>
            <span class="chat-message-text">${messageText}</span>
            <span class="chat-message-time">${new Date().toLocaleTimeString()}</span>
        `;
        messagesContainer.appendChild(messageElement);
        messageInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});