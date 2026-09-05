// Initialize Lucide Icons
lucide.createIcons();

// Scroll-triggered fade-in-up reveal (fires as each element enters the viewport,
// so it works correctly even when the page loads already scrolled to a mid-section)
const revealEls = document.querySelectorAll('.fade-in-up');
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile Menu Toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Sticky Header backdrop effect on scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        header.classList.add('shadow-lg', 'shadow-black/20');
    } else {
        header.classList.remove('shadow-lg', 'shadow-black/20');
    }
});

// Contact Form: native submission to our /api/contact proxy (keeps the email
// service's API key server-side)
const redirectBaseInput = document.getElementById('redirect-base');
redirectBaseInput.value = window.location.origin + window.location.pathname;

// Confirmation Modal
const modal = document.getElementById('confirmation-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');

function openModal(state) {
    if (state === 'success') {
        modalIcon.className = 'mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center border border-gold/30 bg-gold/10';
        modalIcon.innerHTML = '<i data-lucide="check" class="w-7 h-7 text-gold"></i>';
        modalTitle.textContent = 'Message Sent';
        modalMessage.textContent = 'Thank you for reaching out — I will respond to your inquiry as soon as possible.';
    } else {
        modalIcon.className = 'mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center border border-red-400/30 bg-red-400/10';
        modalIcon.innerHTML = '<i data-lucide="alert-triangle" class="w-7 h-7 text-red-400"></i>';
        modalTitle.textContent = 'Something Went Wrong';
        modalMessage.textContent = 'Your message could not be sent. Please try again or email me directly.';
    }
    lucide.createIcons();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
});

// Show a confirmation modal if we've just been redirected back after a submission
const submittedState = new URLSearchParams(window.location.search).get('submitted');
if (submittedState === 'true') {
    openModal('success');
} else if (submittedState === 'false') {
    openModal('error');
}

if (submittedState !== null) {
    const cleanUrl = window.location.origin + window.location.pathname + '#contact';
    window.history.replaceState({}, document.title, cleanUrl);
}
