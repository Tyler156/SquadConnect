// script.js

    // Check if user is logged in
    function checkAuth() {
      const currentUser = localStorage.getItem('squadconnect_current_user');
      if (!currentUser) {
        window.location.href = 'login.html';
        return false;
      }
      //document.getElementById('current-user').textContent = currentUser;
      return true;
    }

    function logout() {
      localStorage.removeItem('squadconnect_current_user');
      window.location.href = 'login.html';
    }

    // Display recent groups on home page
    function displayHomeRecentGroups() {
      try {
        const stored = localStorage.getItem('squadconnect_recent_chats');
        const recentChats = stored ? JSON.parse(stored) : [];
        const recentList = document.getElementById('home-recent-list');
        
        if (recentChats.length === 0) {
          recentList.innerHTML = '<p>You are not in a team. <br> <a href="groupchats.html">Create or join one now!</a></p>';
          return;
        }
        
        recentList.innerHTML = '';
        recentChats.slice(0, 3).forEach(chat => {
          const groupDiv = document.createElement('div');
          groupDiv.className = 'recent-group-item';
          groupDiv.onclick = () => window.location.href = `chat.html?group=${chat.code}`;
          
          groupDiv.innerHTML = `
            <div class="recent-group-name">${chat.name}</div>
            <div class="recent-group-code">Joining Code: ${chat.code}</div>
          `;
          
          recentList.appendChild(groupDiv);
        });
      } catch (error) {
        console.error('Error displaying recent groups:', error);
      }
    }

    // Load recent groups when page loads
    document.addEventListener('DOMContentLoaded', function() {
      if (checkAuth()) {
        displayHomeRecentGroups();
      }
    });
