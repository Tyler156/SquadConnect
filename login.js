
// login.js

    function showLogin() {
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('signup-form').style.display = 'none';
      clearErrors();
    }

    function showSignup() {
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('signup-form').style.display = 'block';
      clearErrors();
    }

    function clearErrors() {
      document.getElementById('login-error').textContent = '';
      document.getElementById('signup-error').textContent = '';
    }

    function loginUser() {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      if (!username || !password) {
        document.getElementById('login-error').textContent = 'Please fill in all fields';
        return;
      }
      const users = JSON.parse(localStorage.getItem('squadconnect_users') || '{}');
      if (users[username] && users[username] === password) {
        localStorage.setItem('squadconnect_current_user', username);
        window.location.href = 'index.html';
      } else {
        document.getElementById('login-error').textContent = 'Invalid username or password';
      }
    }

    function signupUser() {
      const username = document.getElementById('signup-username').value;
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm').value;
      if (!username || !password || !confirm) {
        document.getElementById('signup-error').textContent = 'Please fill in all fields';
        return;
      }
      if (password !== confirm) {
        document.getElementById('signup-error').textContent = 'Passwords do not match';
        return;
      }
      if (username.length < 3) {
        document.getElementById('signup-error').textContent = 'Username must be at least 3 characters';
        return;
      }
      if (password.length < 4) {
        document.getElementById('signup-error').textContent = 'Password must be at least 4 characters';
        return;
      }
      const users = JSON.parse(localStorage.getItem('squadconnect_users') || '{}');
      if (users[username]) {
        document.getElementById('signup-error').textContent = 'Username already exists';
        return;
      }
      users[username] = password;
      localStorage.setItem('squadconnect_users', JSON.stringify(users));
      localStorage.setItem('squadconnect_current_user', username);
      window.location.href = 'index.html';
    }

    // Check if already logged in
    if (localStorage.getItem('squadconnect_current_user')) {
      window.location.href = 'index.html';
    }
