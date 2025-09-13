// nav.js


// Load navigation from the nav.html
fetch('nav.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;

    // show the current logged in user on the logout button
    const currentUser = localStorage.getItem('squadconnect_current_user');
    document.getElementById('current-user').textContent = currentUser;
    

    // Highlight the current page
    let currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('#main-nav a');
    if (currentPage === 'chat.html') {
        currentPage = 'groupchats.html'; // Highlight Group Chats for chat page
    }
    links.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });

    // Toggle hamburger menu
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  });

