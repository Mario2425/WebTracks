// Navigation between sections
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked button and target section
            button.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
    
    // AI Generation tabs
    const aiTabButtons = document.querySelectorAll('.ai-tab-btn');
    const aiTabContents = document.querySelectorAll('.ai-tab-content');
    
    aiTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all tab buttons and contents
            aiTabButtons.forEach(btn => btn.classList.remove('active'));
            aiTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and target content
            button.classList.add('active');
            const targetElement = document.getElementById(targetTab + '-tab');
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
});
