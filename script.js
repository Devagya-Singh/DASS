// JavaScript for smooth scrolling and dynamic features
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
document.getElementById('contact-form').addEventListener('submit', event => {
    event.preventDefault();
    alert('Thank you for reaching out. We will respond to your inquiry shortly.');
});

// Dynamic hero greeting based on time of day
window.onload = function() {
    const greetingText = document.querySelector('.hero h1');
    const hour = new Date().getHours();

    if (hour < 12) {
        greetingText.textContent = 'Good Morning! Welcome to DASS';
    } else if (hour < 18) {
        greetingText.textContent = 'Good Afternoon! Welcome to DASS';
    } else {
        greetingText.textContent = 'Good Evening! Welcome to DASS';
    }
};
