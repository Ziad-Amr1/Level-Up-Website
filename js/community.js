document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".message-input form");
    const messageThread = document.querySelector(".message-thread");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const input = form.querySelector("input");
        const messageText = input.value;

        if (messageText) {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            messageDiv.innerHTML = `
                <img src="assets/user1.jpg" alt="User" class="avatar">
                <div class="message-content">
                    <p class="username">You</p>
                    <p class="text-muted">${messageText}</p>
                    <p class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            `;
            messageThread.appendChild(messageDiv);
            input.value = ""; // Clear the input
            messageThread.scrollTop = messageThread.scrollHeight; // Scroll to the bottom
        }
    });
});