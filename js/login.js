const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const loginbtn = document.querySelector('.btn-login');
const iconclose = document.querySelector('.icon-close');

registerLink.addEventListener('click', ()=> {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', ()=> {
    wrapper.classList.remove('active');
});

loginbtn.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
});

iconclose.addEventListener('click', ()=> {
    wrapper.classList.remove('active-popup');
});

// login.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register form');
    const loginForm = document.querySelector('.login form');
  
    // التسجيل
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userData = {
        username: e.target.querySelector('input[type="text"]').value,
        email: e.target.querySelector('input[type="email"]').value,
        password: e.target.querySelector('input[type="password"]').value,
        avatar: 'assets/default-avatar.png'
      };
      
      const result = auth.register(userData);
      if (result.success) {
        showToast('تم التسجيل بنجاح!');
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        showToast(result.message, 'error');
      }
    });
  
    // تسجيل الدخول
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      const password = e.target.querySelector('input[type="password"]').value;
      
      const result = auth.login(email, password);
      if (result.success) {
        showToast('تم تسجيل الدخول بنجاح!');
        setTimeout(() => window.location.href = 'index.html', 1500);
      } else {
        showToast(result.message, 'error');
      }
    });
  });
