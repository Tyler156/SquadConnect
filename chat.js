class ChatManager {
  constructor() {
    // Using the browser storage to save data
    this.storage = localStorage;
    // This will keep the current group chat info
    this.currentGroup = null;
    // Get the user's name when they start
    this.userName = this.getUserName();
    // Load the group from the web link 
    this.loadGroupFromURL();
    // Load old messages from storage
    this.loadMessages();
    // Set up buttons and keyboard events 
    this.setupEventListeners();
  }

  getUserName() {
    // Always use the signed-in username if available
    let userName = localStorage.getItem('squadconnect_current_user');
    if (!userName) {
      // fallback for legacy, but should not happen
      userName = this.storage.getItem('squadconnect_username');
      if (!userName) {
        userName = 'Anonymous';
      }
    }
    return userName;
  }

  loadGroupFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    // Get the group code from the web address
    const groupCode = urlParams.get('group');
    
    // Check if there is a group code 
    if (groupCode) {
      // Get all saved groups from storage
      const groups = this.getStoredGroups();
      // Find the group with this code
      this.currentGroup = groups[groupCode];
      
      // If we found the group
      if (this.currentGroup) {
        // Put the group name on the page
        document.getElementById('group-name').textContent = this.currentGroup.name;
        // Put the group code on the page
        document.getElementById('group-code').textContent = groupCode;
        // Put the leader name on the page
        document.getElementById('leader-name').textContent = this.currentGroup.leader || 'Unknown';
        // Remember this group code
        this.currentGroupCode = groupCode;
        // Check if this user is the leader
        this.isLeader = this.currentGroup.leader === this.userName;
        
        // Change the delete button text based on if user is leader
        const deleteBtn = document.getElementById('delete-btn-text');
        if (this.isLeader) {
          deleteBtn.textContent = 'Delete Group';
        } else {
          deleteBtn.textContent = 'Leave Chat';
        }
        
        // Add this chat to the recent chats list
        this.addToRecentChats(groupCode, this.currentGroup.name);
      } else {
        // Group doesn't exist so show error and go back
        alert('Group not found!');
        window.location.href = 'Group Chats.html';
      }
    } else {
      // No group code in web address so go back
      alert('No group specified!');
      window.location.href = 'Group Chats.html';
    }
  }

  getStoredGroups() {
    try {
      // Get the saved groups from browser storage
      const stored = this.storage.getItem('squadconnect_groups');
      // If groups exist, turn them back into objects, if not make empty object
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      // If something goes wrong, show error and return empty object
      console.error('Error getting stored groups:', error);
      return {};
    }
  }

  addToRecentChats(groupCode, groupName) {
    try {
      // Get the list of recent chats
      let recentChats = this.getRecentChats();
      
      // Remove this chat if it's already in the list to avoid duplicates
      recentChats = recentChats.filter(chat => chat.code !== groupCode);
      
      // Add this chat to the top of the list
      recentChats.unshift({
        code: groupCode,
        name: groupName,
        lastJoined: new Date().toISOString()
      });
      
      // Only keep the last 5 chats
      recentChats = recentChats.slice(0, 5);
      
      // Save the updated list back to storage
      this.storage.setItem('squadconnect_recent_chats', JSON.stringify(recentChats));
    } catch (error) {
      // If something goes wrong, show error
      console.error('Error saving recent chat:', error);
    }
  }

  getRecentChats() {
    try {
      const stored = this.storage.getItem('squadconnect_recent_chats');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  }

  getStoredMessages(groupCode) {
    try {
      const stored = this.storage.getItem(`squadconnect_messages_${groupCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored messages:', error);
      return [];
    }
  }

  saveMessage(groupCode, message) {
    try {
      const messages = this.getStoredMessages(groupCode);
      messages.push(message);
      this.storage.setItem(`squadconnect_messages_${groupCode}`, JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  }

  loadMessages() {
    if (!this.currentGroupCode) return;
    
    const messages = this.getStoredMessages(this.currentGroupCode);
    const messagesContainer = document.getElementById('messages');
    
    // Clear existing messages except system message
    messagesContainer.innerHTML = '<div class="message"><div class="message-header">System</div>Welcome to the group chat! Start by sending a message below.</div>';
    
    messages.forEach(message => {
      this.displayMessage(message);
    });
  }

  displayMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = `${message.userName} - ${new Date(message.timestamp).toLocaleString()}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.textContent = message.content;
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll height
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendMessage() {
    // Get the text box where user types messages
    const messageInput = document.getElementById('message-input');
    // Get the message text and remove extra spaces
    const content = messageInput.value.trim();
    
    // If message is empty, don't send it
    if (!content) return;
    
    // Create a message object with all needed info
    const message = {
      userName: this.userName,
      content: content,
      timestamp: new Date().toISOString()
    };
    
    // Try to save the message
    if (this.saveMessage(this.currentGroupCode, message)) {
      // If saved successfully, show the message on screen
      this.displayMessage(message);
      // Clear the text box
      messageInput.value = '';
    } else {
      // If saving failed, show error
      alert('Error sending message. Please try again.');
    }
  }

  setupEventListeners() {
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Calendar modal functionality
    const calendarBtn = document.getElementById('calendar-btn');
    const modal = document.getElementById('calendar-modal');
    const closeBtn = document.querySelector('.close');
    
    calendarBtn.addEventListener('click', () => {
      this.openCalendar();
    });
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
      this.changeMonth(-1);
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
      this.changeMonth(1);
    });

    // Add event functionality
    const addEventBtn = document.getElementById('add-event-btn');
    addEventBtn.addEventListener('click', () => {
      this.addEvent();
    });

    // Delete/Leave chat functionality
    const deleteChatBtn = document.getElementById('delete-chat-btn');
    deleteChatBtn.addEventListener('click', () => {
      this.handleDeleteChat();
    });
  }

  openCalendar() {
    // Get the calendar popup window
    const modal = document.getElementById('calendar-modal');
    // Make the calendar popup visible
    modal.style.display = 'block';
    
    // Show the add event controls only if user is the group leader
    const leaderControls = document.getElementById('leader-controls');
    if (this.isLeader) {
      leaderControls.style.display = 'block';
    }
    
    // Set current date to today
    this.currentDate = new Date();
    // Draw the calendar on screen
    this.renderCalendar();
  }

  changeMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.renderCalendar();
  }

  renderCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    const currentMonthElement = document.getElementById('current-month');
    currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';
    daysContainer.style.display = 'contents';
    
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const events = this.getGroupEvents(this.currentGroupCode);
    
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      dayElement.textContent = cellDate.getDate();
      
      if (cellDate.getMonth() !== this.currentDate.getMonth()) {
        dayElement.classList.add('other-month');
      }
      
      const dateString = cellDate.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateString);
      
      if (dayEvents.length > 0) {
        dayElement.classList.add('has-event');
        dayEvents.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.className = 'event';
          eventDiv.textContent = event.title;
          dayElement.appendChild(eventDiv);
        });
      }
      
      daysContainer.appendChild(dayElement);
    }
  }

  addEvent() {
    if (!this.isLeader) {
      alert('Only the group leader can add events');
      return;
    }
    
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    
    if (!title || !date) {
      alert('Please enter both title and date');
      return;
    }
    
    // Fix date offset by using local date format
    const selectedDate = new Date(date + 'T00:00:00');
    const localDateString = selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');
    
    const event = {
      title: title,
      date: localDateString,
      createdBy: this.userName,
      createdAt: new Date().toISOString()
    };
    
    this.saveGroupEvent(this.currentGroupCode, event);
    this.renderCalendar();
    
    // Clear inputs
    document.getElementById('event-title').value = '';
    document.getElementById('event-date').value = '';
    
    alert('Event added successfully!');
  }

  getGroupEvents(groupCode) {
    try {
      const stored = this.storage.getItem(`squadconnect_events_${groupCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting group events:', error);
      return [];
    }
  }

  saveGroupEvent(groupCode, event) {
    try {
      const events = this.getGroupEvents(groupCode);
      events.push(event);
      this.storage.setItem(`squadconnect_events_${groupCode}`, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Error saving group event:', error);
      return false;
    }
  }

  handleDeleteChat() {
    if (this.isLeader) {
      // Leader can delete the entire group
      const confirmDelete = confirm('Are you sure you want to delete this entire group? This will remove all messages, events, and data for all members. This action cannot be undone.');
      
      if (confirmDelete) {
        this.deleteEntireGroup();
      }
    } else {
      // Regular member just leaves the chat
      const confirmLeave = confirm('Are you sure you want to leave this chat? It will be removed from your recent chats.');
      
      if (confirmLeave) {
        this.leaveChat();
      }
    }
  }

  deleteEntireGroup() {
    try {
      // Remove group from groups storage
      const groups = this.getStoredGroups();
      delete groups[this.currentGroupCode];
      this.storage.setItem('squadconnect_groups', JSON.stringify(groups));
      
      // Remove all messages for this group
      this.storage.removeItem(`squadconnect_messages_${this.currentGroupCode}`);
      
      // Remove all events for this group
      this.storage.removeItem(`squadconnect_events_${this.currentGroupCode}`);
      
      // Remove from recent chats for current user
      this.removeFromRecentChats(this.currentGroupCode);
      
      alert('Group deleted successfully!');
      window.location.href = 'Group Chats.html';
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error deleting group. Please try again.');
    }
  }

  leaveChat() {
    try {
      // Remove from recent chats
      this.removeFromRecentChats(this.currentGroupCode);
      
      alert('You have left the chat!');
      window.location.href = 'Group Chats.html';
    } catch (error) {
      console.error('Error leaving chat:', error);
      alert('Error leaving chat. Please try again.');
    }
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

// Initialize chat manager
const chatManager = new ChatManager();

// Global function for button onclick
function sendMessage() {
  chatManager.sendMessage();
}