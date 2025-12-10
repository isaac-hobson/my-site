const AuthManager = {
  user: null,
  
  async init() {
    await this.checkAuth();
    this.setupEventListeners();
    this.updateUI();
  },
  
  async checkAuth() {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (res.ok) {
        this.user = await res.json();
      }
    } catch (err) {
      console.log('Not authenticated');
    }
  },
  
  setupEventListeners() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const modalClose = document.getElementById('modal-close');
    const authForm = document.getElementById('auth-form');
    const switchLink = document.getElementById('switch-link');
    
    if (loginBtn) loginBtn.addEventListener('click', () => this.showModal('login'));
    if (registerBtn) registerBtn.addEventListener('click', () => this.showModal('register'));
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
    if (dashboardBtn) dashboardBtn.addEventListener('click', () => window.location.href = '/dashboard.html');
    if (modalClose) modalClose.addEventListener('click', () => this.hideModal());
    if (authForm) authForm.addEventListener('submit', (e) => this.handleSubmit(e));
    if (switchLink) switchLink.addEventListener('click', (e) => this.switchMode(e));
    
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.hideModal();
      });
    }
  },
  
  updateUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const userInfo = document.getElementById('user-info');
    
    if (this.user) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (registerBtn) registerBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (dashboardBtn) dashboardBtn.classList.remove('hidden');
      if (userInfo) userInfo.textContent = `> ${this.user.displayName || this.user.username}`;
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (registerBtn) registerBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (dashboardBtn) dashboardBtn.classList.add('hidden');
      if (userInfo) userInfo.textContent = '';
    }
  },
  
  showModal(mode) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const emailGroup = document.getElementById('email-group');
    const displaynameGroup = document.getElementById('displayname-group');
    const switchText = document.getElementById('modal-switch');
    const switchLink = document.getElementById('switch-link');
    
    this.mode = mode;
    
    if (mode === 'login') {
      title.textContent = '> LOGIN';
      submitBtn.textContent = '[ AUTHENTICATE ]';
      emailGroup.classList.add('hidden');
      displaynameGroup.classList.add('hidden');
      switchText.innerHTML = "Don't have an account? <a href='#' id='switch-link'>Register</a>";
    } else {
      title.textContent = '> REGISTER';
      submitBtn.textContent = '[ CREATE ACCOUNT ]';
      emailGroup.classList.remove('hidden');
      displaynameGroup.classList.remove('hidden');
      switchText.innerHTML = "Already have an account? <a href='#' id='switch-link'>Login</a>";
    }
    
    document.getElementById('switch-link').addEventListener('click', (e) => this.switchMode(e));
    modal.classList.remove('hidden');
    document.getElementById('username').focus();
  },
  
  hideModal() {
    const modal = document.getElementById('auth-modal');
    const form = document.getElementById('auth-form');
    const error = document.getElementById('form-error');
    
    modal.classList.add('hidden');
    form.reset();
    error.classList.add('hidden');
  },
  
  switchMode(e) {
    e.preventDefault();
    this.hideModal();
    this.showModal(this.mode === 'login' ? 'register' : 'login');
  },
  
  async handleSubmit(e) {
    e.preventDefault();
    const error = document.getElementById('form-error');
    error.classList.add('hidden');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      let res;
      if (this.mode === 'login') {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });
      } else {
        const email = document.getElementById('email').value;
        const displayName = document.getElementById('displayname').value;
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password, email, displayName })
        });
      }
      
      const data = await res.json();
      
      if (res.ok) {
        this.user = data;
        this.hideModal();
        this.updateUI();
      } else {
        error.textContent = data.error || 'Authentication failed';
        error.classList.remove('hidden');
      }
    } catch (err) {
      error.textContent = 'Connection error. Please try again.';
      error.classList.remove('hidden');
    }
  },
  
  async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      this.user = null;
      this.updateUI();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => AuthManager.init());
