document.addEventListener('DOMContentLoaded', () => {
  // ------ Global Constants ------
  const USER_SESSION = {
    username: "Kayda",
    avatar: "assets/user2.jpg",
    isLoggedIn: false
  };
  
  // ------ Loading Screen ------
  const handleLoadingScreen = () => {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = '<div class="spinner"></div>';
    document.body.prepend(loadingScreen);

    window.addEventListener('load', () => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 500);
    });
  };

  // ------ Toast System ------
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // ------ Scroll Animations ------
  const initScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.style.opacity = entry.isIntersecting ? '1' : '0';
        entry.target.style.transform = entry.isIntersecting 
          ? 'translateY(0)' 
          : 'translateY(20px)';
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.style.transition = 'all 0.6s ease';
      observer.observe(el);
    });
  };

  // ------ Chat System ------
  const initChatSystem = () => {
    const chatElements = {
      form: document.querySelector('.message-form'),
      input: document.querySelector('.message-input'),
      thread: document.querySelector('.message-thread'),
      channels: document.querySelectorAll('.channel-list li')
    };

    let currentChannel = 'general';

    // Initialize chat
    displaySystemMessage(`Welcome to ${currentChannel}!`);

    // Message submission
    chatElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleMessageSubmission(chatElements.input.value.trim());
    });

    // Channel switching
    chatElements.channels.forEach(channel => {
      channel.addEventListener('click', () => {
        currentChannel = channel.dataset.channel;
        chatElements.thread.innerHTML = '';
        displaySystemMessage(`Switched to ${currentChannel}`);
        channel.classList.add('active');
      });
    });
  };

  const handleMessageSubmission = (content) => {
    if (!USER_SESSION.isLoggedIn) {
      showToast('Please login to send messages', 'error');
      return;
    }

    if (content === '') return;

    const messageElement = createMessageElement({
      user: USER_SESSION,
      content: content
    });

    document.querySelector('.message-thread').appendChild(messageElement);
    scrollToBottom();
  };

  const createMessageElement = ({user, content}) => {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    messageEl.innerHTML = `
      <img src="${user.avatar}" alt="${user.username}">
      <div class="message-content">
        <div class="message-header">
          <strong>${user.username}</strong>
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>
        <p>${sanitizeHTML(content)}</p>
      </div>
    `;
    
    return messageEl;
  };

  const displaySystemMessage = (text) => {
    const systemMsg = document.createElement('div');
    systemMsg.className = 'system-message';
    systemMsg.innerHTML = `<em>${sanitizeHTML(text)}</em>`;
    document.querySelector('.message-thread').appendChild(systemMsg);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    const thread = document.querySelector('.message-thread');
    thread.scrollTop = thread.scrollHeight;
  };

  const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  };

  // ------ Copyright Year ------
  document.querySelector('.copyright').textContent = 
    `© ${new Date().getFullYear()} Level Up. All rights reserved.`;

  // ------ Initialize All Features ------
  handleLoadingScreen();
  initScrollAnimations();
  initChatSystem();
});

// members bar
const membersBar = document.querySelector('.members-bar');
const msgthread = document.querySelector('.message-thread');
const msginput = document.querySelector('.message-input');
const membersBtn = document.querySelector('#members-btn');

membersBtn.addEventListener('click', () => {
  if (membersBar.classList.contains('active')) {
      membersBar.classList.remove('active');
      msginput.style.width = '100%';
      msgthread.style.width = '100%';
  } else {
      membersBar.classList.add('active');
      msginput.style.width = 'calc(100% - 300px)';
      msgthread.style.width = 'calc(100% - 300px)';
  }
});

// Function to fetch and load members from JSON file
// Function to extract the numeric part of the username
const extractNumber = (username) => {
  const numberMatch = username.match(/\d+/);
  return numberMatch ? parseInt(numberMatch[0], 10) : 0;
};

// Function to fetch and load members
async function loadMembers() {
  const response = await fetch('../JSON/members.json');
  const members = await response.json();

  // Sort the members by name (numerically)
  members.sort((a, b) => extractNumber(a.name) - extractNumber(b.name));

  let onlineCount = 0;
  let offlineCount = 0;

  let onlineMembersHTML = '';
  let offlineMembersHTML = '';

  members.forEach(member => {
      // Generate HTML for each member
      const memberHTML = `
          <li class="member ${member.status}">
              <div class="member-info">
                  <div class="avatar-container">
                      <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                      <span class="${member.status === 'online' ? 'online-status' : 'offline-status'}"></span>
                  </div>
                  <div class="member-details">
                      <span class="username">${member.name}</span>
                      ${member.role ? `<span class="user-role">${member.role}</span>` : ''}
                  </div>
              </div>
              ${member.status === 'online' ? `<i class="fas ${member.status === 'online' ? 'fa-headphones' : ''} activity-icon"></i>` : ''}
          </li>
      `;

      if (member.status === 'online') {
          onlineCount++;
          onlineMembersHTML += memberHTML;
      } else {
          offlineCount++;
          offlineMembersHTML += memberHTML;
      }
  });

  // Insert the HTML into the respective lists
  document.getElementById('online-members').innerHTML = onlineMembersHTML;
  document.getElementById('offline-members').innerHTML = offlineMembersHTML;

  // Update the counts
  document.getElementById('online-count').textContent = onlineCount;
  document.getElementById('offline-count').textContent = offlineCount;
}

// Call the loadMembers function when the page is ready
window.onload = loadMembers;
