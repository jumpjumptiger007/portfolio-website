const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const contactForm = document.getElementById('contactForm');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        updateActiveNavLink();
    });
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            const scrollPosition = targetSection.offsetTop - header.offsetHeight;
            
            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
        });
    });
    
// Contact Form
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); 

        const formData = new FormData(contactForm);
        const formAction = contactForm.getAttribute('action');

        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Oops! There was a problem submitting your form');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Oops! There was a problem submitting your form');
        });
    });
}

// Navigation Link
    updateActiveNavLink();
    setupRevealAnimations();
});

function updateActiveNavLink() {
    const scrollPosition = window.scrollY + header.offsetHeight + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinksItems.forEach(link => {
                link.classList.remove('active');
            });
            
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

function setupRevealAnimations() {
    const elements = document.querySelectorAll('.fadeIn');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        if (element.classList.contains('delay-1')) {
            element.style.transitionDelay = '0.2s';
        } else if (element.classList.contains('delay-2')) {
            element.style.transitionDelay = '0.4s';
        } else if (element.classList.contains('delay-3')) {
            element.style.transitionDelay = '0.6s';
        }
        
        observer.observe(element);
    });
}

// Multilingual Feature for EN/DE
const translations = {
    en: {
        home: 'Home',
        about: 'About',
        projects: 'Projects',
        contact: 'Contact',
        projectsTitle: 'My Projects',

        heroIntro: 'WELCOME TO MY WEBSITE',
        heroLead: 'A passionate developer who loves creating elegant solutions and exploring innovative technologies.',
        heroBtnProjects: 'View My Projects',
        heroBtnContact: 'Contact Me',

        aboutTitle: 'About Me',
        aboutSubtitle: 'Software Developer & Technology Enthusiast',
        aboutDescription1: 'I\'m a passionate developer who loves exploring new technologies and building innovative applications. My journey in software development has equipped me with a diverse skill set and problem-solving abilities that I apply to every project I undertake.',
        aboutDescription2: 'I\'m always excited to experiment with new technologies and contribute to meaningful projects that solve real-world problems. My approach combines technical expertise with creative thinking to develop elegant solutions.',

        contactTitle: 'Contact Me',
        contactDescription: 'I\'m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.',
        contactFormName: 'Name',
        contactFormEmail: 'Email',
        contactFormSubject: 'Subject',
        contactFormMessage: 'Message',
        contactFormSend: 'Send Message'
    },
    de: {
        home: 'Startseite',
        about: 'Über mich',
        projects: 'Projekte',
        contact: 'Kontakt',
        projectsTitle: 'Meine Projekte',

        heroIntro: 'WILLKOMMEN AUF MEINER WEBSITE',
        heroLead: 'Ein leidenschaftlicher Entwickler, der es liebt, elegante Lösungen zu erstellen und innovative Technologien zu erkunden.',
        heroBtnProjects: 'Meine Projekte ansehen',
        heroBtnContact: 'Kontaktieren Sie mich',

        aboutTitle: 'Über mich',
        aboutSubtitle: 'Softwareentwickler & Technologie-Enthusiast',
        aboutDescription1: 'Ich bin ein leidenschaftlicher Entwickler, der neue Technologien erforscht und innovative Anwendungen entwickelt. Meine Reise in der Softwareentwicklung hat mich mit vielfältigen Fähigkeiten und Problemlösungskompetenz ausgestattet, die ich bei jedem Projekt einsetze.',
        aboutDescription2: 'Ich bin immer begeistert davon, neue Technologien zu experimentieren und zu Projekten beizutragen, die reale Probleme lösen. Mein Ansatz kombiniert technische Expertise mit kreativem Denken, um elegante Lösungen zu entwickeln.',

        contactTitle: 'Kontaktieren Sie mich',
        contactDescription: 'Ich bin immer offen für neue Projekte, kreative Ideen oder Möglichkeiten, Teil Ihrer Vision zu werden.',
        contactFormName: 'Name',
        contactFormEmail: 'E-Mail',
        contactFormSubject: 'Betreff',
        contactFormMessage: 'Nachricht',
        contactFormSend: 'Nachricht senden'
    }
};

let currentLanguage = 'en';

function changeLanguage(lang) {
    const projectsTitle = document.querySelector('#projects .section-title');
    if (projectsTitle) {
        projectsTitle.textContent = translations[lang].projectsTitle;
    }

    currentLanguage = lang;
    const navLinks = document.querySelectorAll('.nav-link');
    const heroIntro = document.querySelector('.hero-site-intro');
    const heroLead = document.querySelector('.hero-lead');
    const heroBtns = document.querySelectorAll('.hero-btns .btn');

    navLinks[0].textContent = translations[lang].home;
    navLinks[1].textContent = translations[lang].about;
    navLinks[2].textContent = translations[lang].projects;
    navLinks[3].textContent = translations[lang].contact;

    heroIntro.textContent = translations[lang].heroIntro;
    heroLead.textContent = translations[lang].heroLead;
    heroBtns[0].textContent = translations[lang].heroBtnProjects;
    heroBtns[1].textContent = translations[lang].heroBtnContact;

    const aboutTitle = document.querySelector('#about .section-title');
    const aboutSubtitle = document.querySelector('.about-text h3');
    const aboutDescriptions = document.querySelectorAll('.about-text p');

    if (aboutTitle) aboutTitle.textContent = translations[lang].aboutTitle;
    if (aboutSubtitle) aboutSubtitle.textContent = translations[lang].aboutSubtitle;
    if (aboutDescriptions[0]) aboutDescriptions[0].textContent = translations[lang].aboutDescription1;
    if (aboutDescriptions[1]) aboutDescriptions[1].textContent = translations[lang].aboutDescription2;

    const contactTitle = document.querySelector('#contact .section-title');
    const contactDescription = document.querySelector('.contact-info p');
    const contactFormLabels = document.querySelectorAll('.form-label');
    const contactFormSendBtn = document.querySelector('#contactForm button');

    if (contactTitle) contactTitle.textContent = translations[lang].contactTitle;
    if (contactDescription) contactDescription.textContent = translations[lang].contactDescription;
    
    if (contactFormLabels[0]) contactFormLabels[0].textContent = translations[lang].contactFormName;
    if (contactFormLabels[1]) contactFormLabels[1].textContent = translations[lang].contactFormEmail;
    if (contactFormLabels[2]) contactFormLabels[2].textContent = translations[lang].contactFormSubject;
    if (contactFormLabels[3]) contactFormLabels[3].textContent = translations[lang].contactFormMessage;
    
    if (contactFormSendBtn) contactFormSendBtn.textContent = translations[lang].contactFormSend;

    localStorage.setItem('language', lang);
}

document.querySelectorAll('.language-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        changeLanguage(lang);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        changeLanguage(savedLang);
    }
});