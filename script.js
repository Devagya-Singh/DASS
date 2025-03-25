// JavaScript for smooth scrolling and dynamic features
document.addEventListener('DOMContentLoaded', function() {
  // Setup navigation links
  document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Contact form submission alert
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      alert('Thank you for reaching out. We will respond to your inquiry shortly.');
    });
  }

  // Login form handling
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      alert('Login functionality will be implemented soon.');
    });
  }

  // Dynamic hero greeting based on time of day
  const greetingText = document.querySelector('.hero h1');
  if (greetingText) {
    const hour = new Date().getHours();
    if (hour < 12) {
      greetingText.textContent = 'Good Morning! Welcome to DASS';
    } else if (hour < 18) {
      greetingText.textContent = 'Good Afternoon! Welcome to DASS';
    } else {
      greetingText.textContent = 'Good Evening! Welcome to DASS';
    }
  }
});
