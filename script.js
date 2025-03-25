// Efficient JavaScript with modern practices
document.addEventListener('DOMContentLoaded', () => {
    // Dynamic greeting based on time of day
    updateGreeting();
    
    // Smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Form submission handling
    setupContactForm();
});

// Update greeting based on time of day
const updateGreeting = () => {
    const greetingElement = document.getElementById('greeting');
    const hour = new Date().getHours();
    
    let greeting = 'Welcome to DASS';
    
    if (hour < 12) {
        greeting = 'Good Morning! Welcome to DASS';
    } else if (hour < 18) {
        greeting = 'Good Afternoon! Welcome to DASS';
    } else {
        greeting = 'Good Evening! Welcome to DASS';
    }
    
    greetingElement.textContent = greeting;
};

// Setup smooth scrolling for navigation links
const setupSmoothScrolling = () => {
    document.querySelectorAll('header nav a').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Handle contact form submission
const setupContactForm = () => {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', event => {
            event.preventDefault();
            
            // Form validation logic would go here
            
            // Show success message
            alert('Thank you for reaching out. We will respond to your inquiry shortly.');
            contactForm.reset();
        });
    }
};
