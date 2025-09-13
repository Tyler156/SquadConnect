class GroupManager {
  constructor() {
    // Use browser storage to save group data
    this.storage = localStorage;
  }

  addToRecentChats(groupCode, groupName) {
    try {
      let recentChats = this.getRecentChats();
      
      // Removes any existing chat with the same group code to prevent duplicates
      recentChats = recentChats.filter(chat => chat.code !== groupCode);
      
      // Add to beginning of arrangement 
      recentChats.unshift({
        code: groupCode,
        name: groupName,
        lastJoined: new Date().toISOString()
      });
      
      // Keep only last 5 chats
      recentChats = recentChats.slice(0, 5);
      
      this.storage.setItem('squadconnect_recent_chats', JSON.stringify(recentChats));
    } catch (error) {
      console.error('Error saving recent chat:', error);
    }
  }
    // gets the recent chats from the storage
  getRecentChats() {
    try {
      const stored = this.storage.getItem('squadconnect_recent_chats');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  }

  displayRecentChats() {
    const recentChats = this.getRecentChats();
    const recentChatsSection = document.getElementById('recent-chats');
    const recentChatsList = document.getElementById('recent-chats-list');
    
    if (recentChats.length === 0) {
      recentChatsSection.style.display = 'none';
      return;
    }
    
    recentChatsSection.style.display = 'block';
    recentChatsList.innerHTML = '';
    
    recentChats.forEach(chat => {
      const chatDiv = document.createElement('div');
      chatDiv.className = 'recent-chat';
      chatDiv.style.position = 'relative';
      chatDiv.onclick = () => this.joinRecentChat(chat.code);
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'chat-name';
      nameDiv.textContent = chat.name;
      
      const codeDiv = document.createElement('div');
      codeDiv.className = 'chat-code';
      codeDiv.textContent = `Code: ${chat.code}`;
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'chat-date';
      dateDiv.textContent = `Last joined: ${new Date(chat.lastJoined).toLocaleDateString()}`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'remove-chat-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: #f44336; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 14px; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        this.removeFromRecentChats(chat.code);
        this.displayRecentChats();
      };
      
      chatDiv.appendChild(nameDiv);
      chatDiv.appendChild(codeDiv);
      chatDiv.appendChild(dateDiv);
      chatDiv.appendChild(deleteBtn);
      
      recentChatsList.appendChild(chatDiv);
    });
  }

  joinRecentChat(groupCode) {
    window.location.href = `chat.html?group=${groupCode}`;
  }

  async saveGroupCode(groupName, groupCode, creatorName) {
    try {
      const groups = this.getStoredGroups();
      // Always use the signed-in user as leader
      const leaderName = localStorage.getItem('squadconnect_current_user') || creatorName || 'Anonymous';
      groups[groupCode] = {
        name: groupName,
        created: new Date().toISOString(),
        members: [],
        leader: leaderName
      };
      this.storage.setItem('squadconnect_groups', JSON.stringify(groups));
      return true;
    } catch (error) {
      console.error('Error saving group:', error);
      return false;
    }
  }

  getUserName() {
    let userName = this.storage.getItem('squadconnect_username');
    if (!userName) {
      userName = prompt('Enter your name:') || 'Anonymous';
      this.storage.setItem('squadconnect_username', userName);
    }
    return userName;
  }

  async joinGroup(groupCode) {
    try {
      const groups = this.getStoredGroups();
      if (groups[groupCode]) {
        return groups[groupCode];
      }
      return null;
    } catch (error) {
      console.error('Error joining group:', error);
      return null;
    }
  }

  getStoredGroups() {
    try {
      const stored = this.storage.getItem('squadconnect_groups');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting stored groups:', error);
      return {};
    }
  }

  generateGroupCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  removeFromRecentChats(groupCode) {
    try {
      let recentChats = this.getRecentChats();
      recentChats = recentChats.filter(chat => chat.code !== groupCode);
      this.storage.setItem('squadconnect_recent_chats', JSON.stringify(recentChats));
    } catch (error) {
      console.error('Error removing from recent chats:', error);
    }
  }
}

// Group manager
// Check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem('squadconnect_current_user');
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  if (document.getElementById('current-user')) {
    document.getElementById('current-user').textContent = currentUser;
  }
  return true;
}

function logout() {
  localStorage.removeItem('squadconnect_current_user');
  window.location.href = 'login.html';
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
});

const groupManager = new GroupManager();

// This function runs when user clicks create group button
function handleCreateGroup() {
  // Find the text box where user typed the group name
  const groupNameInput = document.querySelector('input[placeholder="Enter new team name"]');
  // Get the group name and remove extra spaces
  const groupName = groupNameInput.value.trim();
  
  // If no name was entered, show an error message
  if (!groupName) {
    alert('Please enter a group name');
    return;
  }

  // Make a random code for this group
  const groupCode = groupManager.generateGroupCode();
  // Get the user's name
  const userName = groupManager.getUserName();
  
  // Try to save the new group
  groupManager.saveGroupCode(groupName, groupCode, userName).then(success => {
    if (success) {
      // Add this group to recent chats list
      groupManager.addToRecentChats(groupCode, groupName);
      
      // Show success message with group info
      //alert(`Group "${groupName}" created!\nGroup Code: ${groupCode}\nYou are the group leader.\nRedirecting to chat...`);
      // Clear the text box
      groupNameInput.value = '';
      // Go to the chat page for this group
      window.location.href = `chat.html?group=${groupCode}`;
    } else {
      // Show error if saving failed
      alert('Error creating group. Please try again.');
    }
  });
}

// This function runs when user clicks join group button
function handleJoinGroup() {
  // Find the text box where user typed the group code
  const groupCodeInput = document.querySelector('input[placeholder="Enter team code"]');
  // Get the group code, remove spaces, and make it uppercase
  const groupCode = groupCodeInput.value.trim().toUpperCase();
  
  // If no code was entered, show error message
  if (!groupCode) {
    alert('Please enter a group code');
    return;
  }

  // Try to find and join the group with this code
  groupManager.joinGroup(groupCode).then(group => {
    if (group) {
      // Add this group to recent chats list
      groupManager.addToRecentChats(groupCode, group.name);
      
      // Show success message
      //alert(`Successfully joined "${group.name}"!\nRedirecting to chat...`);
      // Clear the text box
      groupCodeInput.value = '';
      // Go to the chat page for this group
      window.location.href = `chat.html?group=${groupCode}`;
    } else {
      // Show error if group code doesn't exist
      alert('Invalid group code. Please check and try again.');
    }
  });
}

// This runs when the webpage finishes loading
document.addEventListener('DOMContentLoaded', function() {
  // Show the list of recent chats on the page
  groupManager.displayRecentChats();
  
  // Find all buttons on the page
  const buttons = document.querySelectorAll('button');
  // Go through each button and add click events
  buttons.forEach(button => {
    // If this button says "Create Group" or "Create Team", make it run the create function
    if (button.textContent.includes('Create Group') || button.textContent.includes('Create Team')) {
      button.addEventListener('click', handleCreateGroup);
    // If this button says "Join Group" or "Join Team", make it run the join function
    } else if (button.textContent.includes('Join Group') || button.textContent.includes('Join Team')) {
      button.addEventListener('click', handleJoinGroup);
    }
  });
});
