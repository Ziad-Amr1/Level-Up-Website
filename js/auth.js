// auth.js
class AuthSystem {
    constructor() {
      this.users = JSON.parse(localStorage.getItem('users')) || [];
      this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }
  
    // تسجيل مستخدم جديد مع تشفير كلمة المرور
    register(userData) {
      if (this.users.some(user => user.email === userData.email)) {
        return { success: false, message: 'البريد الإلكتروني موجود مسبقًا' };
      }
  
      // التحقق من صحة الحقول
      if (!this.validateFields(userData)) {
        return { success: false, message: 'جميع الحقول مطلوبة' };
      }
  
      // تشفير كلمة المرور
      bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
        if (err) throw err;
        userData.password = hashedPassword;
        this.users.push(userData);
        localStorage.setItem('users', JSON.stringify(this.users));
        return { success: true };
      });
    }
  
    // تسجيل الدخول مع التحقق من كلمة المرور المشفرة
    login(email, password) {
      const user = this.users.find(u => u.email === email);
      if (user) {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();
            return { success: true };
          } else {
            return { success: false, message: 'بيانات الاعتماد غير صحيحة' };
          }
        });
      } else {
        return { success: false, message: 'بيانات الاعتماد غير صحيحة' };
      }
    }
  
    // تسجيل الخروج
    logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      this.updateUI();
    }
  
    // التحقق من صحة الحقول
    validateFields(userData) {
      return userData.email && userData.password && userData.username;
    }
  
    // تحديث واجهة المستخدم
    updateUI() {
      const loginBtn = document.querySelector('.btn-login');
      const signupBtn = document.querySelector('.btn-signup');
      const userProfile = document.querySelector('.user-profile');
  
      if (this.currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userProfile) {
          userProfile.innerHTML = `
            <div class="profile-dropdown">
              <img src="${this.currentUser.avatar || 'assets/default-avatar.png'}" class="user-avatar">
              <span>${this.currentUser.username}</span>
              <div class="dropdown-menu">
                <button class="dropdown-item" onclick="auth.logout()">تسجيل الخروج</button>
              </div>
            </div>
          `;
        }
      } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        if (userProfile) userProfile.innerHTML = '';
      }
    }
  
    // تحديث الصورة الشخصية
    updateProfilePicture(newAvatar) {
      if (this.currentUser) {
        this.currentUser.avatar = newAvatar;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUI();
      }
    }
  }
  
  const auth = new AuthSystem();
  