// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Form handling
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show success message
    alert('Form submitted successfully!');
    
    // Reset form
    this.reset();
  });
});

// Dynamic greeting based on time of day
function updateGreeting() {
  const greetingElement = document.getElementById('greeting');
  if (!greetingElement) return;

  const hour = new Date().getHours();
  let greeting;

  if (hour < 12) {
    greeting = 'Good Morning!';
  } else if (hour < 18) {
    greeting = 'Good Afternoon!';
  } else {
    greeting = 'Good Evening!';
  }

  greetingElement.textContent = `${greeting} Welcome to DASS`;
}

// Password strength checker
function checkPasswordStrength() {
  const passwordInput = document.getElementById('password');
  if (!passwordInput) return;

  const strengthMeter = document.getElementById('password-strength');
  if (!strengthMeter) return;

  const password = passwordInput.value;
  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  // Uppercase check
  if (/[A-Z]/.test(password)) strength++;
  // Lowercase check
  if (/[a-z]/.test(password)) strength++;
  // Number check
  if (/[0-9]/.test(password)) strength++;
  // Special char check
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  if (strength <= 2) {
    strengthMeter.textContent = 'Weak Password';
    strengthMeter.style.color = 'red';
  } else if (strength <= 4) {
    strengthMeter.textContent = 'Medium Password';
    strengthMeter.style.color = 'orange';
  } else {
    strengthMeter.textContent = 'Strong Password';
    strengthMeter.style.color = 'green';
  }
}

// Initialize functions when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  updateGreeting();
  
  // Add event listener for password input if exists
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', checkPasswordStrength);
  }
  
  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('header nav a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});
