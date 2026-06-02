// ==========================================================================
// Navigation
// ==========================================================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link, .nav-btn');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (link) {
            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
});

// ==========================================================================
// Testimonial Slider
// ==========================================================================
const track = document.getElementById('testimonialTrack');
const dotsContainer = document.getElementById('sliderDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track && dotsContainer) {
    const slides = track.children;
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoplayTimer;

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    const dots = dotsContainer.children;

    function goToSlide(index) {
        currentIndex = (index + totalSlides) % totalSlides;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        Array.from(dots).forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        resetAutoplay();
    }

    function resetAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), 6000);
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    resetAutoplay();
}

// ==========================================================================
// FAQ Accordion
// ==========================================================================
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// ==========================================================================
// Booking Form
// ==========================================================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const whatsappBtn = document.getElementById('whatsappBtn');
const phoneNumber = '919902728717';
const clinicEmail = 'susmadhakl@gmail.com';
// FormSubmit AJAX endpoint — bookings POST here and FormSubmit forwards them
// to the clinic inbox. The very first submission will trigger an activation
// email to susmadhakl@gmail.com; click the link in that email once to enable
// all future submissions.
const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/susmadhakl@gmail.com';

function getFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        service: document.getElementById('service').value,
        concern: document.getElementById('concern').value.trim(),
    };
}

function showFormMessage(msg, type) {
    formMessage.textContent = msg;
    formMessage.className = `form-message ${type}`;
}

if (contactForm) {
    // set min date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = getFormData();
        const phoneRegex = /^[6-9]\d{9}$/;
        const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);

        if (!phoneRegex.test(cleanPhone)) {
            showFormMessage('Please enter a valid 10-digit Indian mobile number.', 'error');
            return;
        }

        const subject = `New Booking Request — ${data.name} (${data.service || 'Physio'})`;
        const bodyLines = [
            `Name: ${data.name}`,
            `Phone: ${data.phone}`,
            data.email ? `Email: ${data.email}` : null,
            data.date ? `Preferred Date: ${data.date}` : null,
            data.time ? `Time Slot: ${data.time}` : null,
            data.service ? `Service: ${data.service}` : null,
            '',
            'Concern:',
            data.concern || '(not provided)'
        ].filter(Boolean);
        const body = bodyLines.join('\n');

        if (EMAIL_ENDPOINT) {
            try {
                showFormMessage('Sending your booking request…', 'info');
                const res = await fetch(EMAIL_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name: data.name,
                        phone: data.phone,
                        email: data.email || 'Not provided',
                        preferred_date: data.date,
                        time_slot: data.time,
                        service: data.service,
                        concern: data.concern,
                        _subject: subject,
                        _template: 'table',
                        _captcha: 'false',
                        message: body
                    })
                });
                if (!res.ok) throw new Error('Network response was not ok');
                showFormMessage(`Thank you, ${data.name}! Your request has been emailed to Dr. Susma. We'll confirm your slot on ${data.date} at ${data.time} shortly.`, 'success');
                contactForm.reset();
            } catch (err) {
                openMailto(subject, body);
                showFormMessage('Opened your email app to complete the booking. If nothing happened, please WhatsApp us.', 'info');
            }
        } else {
            openMailto(subject, body);
            showFormMessage(`Thanks ${data.name}! Your mail app should now open with the booking details addressed to Dr. Susma. Hit send to confirm.`, 'success');
            contactForm.reset();
        }

        setTimeout(() => {
            formMessage.className = 'form-message';
            formMessage.textContent = '';
        }, 10000);
    });
}

function openMailto(subject, body) {
    const url = `mailto:${clinicEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
}

if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        const d = getFormData();
        if (!d.name || !d.phone) {
            showFormMessage('Please fill in your name and phone number first.', 'error');
            return;
        }
        const message = `Hello Dr. Susma! I would like to book an appointment.\n\n*Name:* ${d.name}\n*Phone:* ${d.phone}${d.email ? '\n*Email:* ' + d.email : ''}${d.date ? '\n*Preferred Date:* ' + d.date : ''}${d.time ? '\n*Time Slot:* ' + d.time : ''}${d.service ? '\n*Service:* ' + d.service : ''}${d.concern ? '\n*Concern:* ' + d.concern : ''}`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    });
}

// ==========================================================================
// Back to Top
// ==========================================================================
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ==========================================================================
// Scroll Animations
// ==========================================================================
const animatedElements = document.querySelectorAll(
    '.service-card, .pricing-card, .process-card, .why-card, .team-card, .testimonial-slider, .about-content, .about-image-wrapper, .contact-info, .contact-form, .faq-item, .condition-chip'
);

animatedElements.forEach(el => el.classList.add('fade-in'));

const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 60);
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

animatedElements.forEach(el => fadeObserver.observe(el));

// ==========================================================================
// Ratings & Reviews
// ==========================================================================
const STORAGE_KEY = 'physio_susma_reviews_v1';
const SEED_REVIEWS = [
    { name: 'Rajesh Kumar', email: '', rating: 5, text: 'After my knee surgery I could barely walk. Six weeks with Dr. Susma and I am back on my feet — pain free.', date: '2026-04-12T10:00:00Z' },
    { name: 'Priya Menon', email: '', rating: 5, text: 'Years of chronic back pain gone in 8 sessions. She listens, explains and her techniques actually work.', date: '2026-04-28T10:00:00Z' },
    { name: 'Vikram Reddy', email: '', rating: 5, text: 'Sidelined by a hamstring tear before a marathon. Her sports rehab plan got me racing in 4 weeks.', date: '2026-05-08T10:00:00Z' },
    { name: 'Anita Sharma', email: '', rating: 5, text: 'Patient, gentle and incredibly skilled with my son who has cerebral palsy. We are so grateful.', date: '2026-05-15T10:00:00Z' }
];

const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const starInput = document.getElementById('starInput');
const avgRatingEl = document.getElementById('avgRating');
const bigStarsEl = document.getElementById('bigStars');
const reviewCountEl = document.getElementById('reviewCount');
const ratingBarsEl = document.getElementById('ratingBars');
const reviewMessage = document.getElementById('reviewMessage');

function loadReviews() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (_) {}
    return [...SEED_REVIEWS];
}

function saveReviews(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
}

function starString(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }

function initials(name) {
    return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function fmtDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (_) { return ''; }
}

function renderReviews() {
    const reviews = loadReviews();
    if (!reviewsList) return;

    reviewsList.innerHTML = reviews.slice().reverse().map(r => `
        <article class="review-item">
            <div class="review-stars">${starString(r.rating)}</div>
            <p class="review-text">"${escapeHtml(r.text)}"</p>
            <div class="review-meta">
                <div class="review-avatar">${initials(r.name)}</div>
                <div class="review-meta-text">
                    <h5>${escapeHtml(r.name)}</h5>
                    <span>${fmtDate(r.date)}</span>
                </div>
            </div>
        </article>
    `).join('');

    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    if (avgRatingEl) avgRatingEl.textContent = avg.toFixed(1);
    if (reviewCountEl) reviewCountEl.textContent = total;
    if (bigStarsEl) bigStarsEl.textContent = starString(Math.round(avg));

    if (ratingBarsEl) {
        const buckets = [5, 4, 3, 2, 1].map(n => ({
            n,
            count: reviews.filter(r => r.rating === n).length
        }));
        const max = Math.max(1, ...buckets.map(b => b.count));
        ratingBarsEl.innerHTML = buckets.map(b => `
            <div class="rating-bar">
                <span>${b.n}★</span>
                <div class="bar-track"><div class="bar-fill" style="width:${(b.count / max) * 100}%"></div></div>
                <span>${b.count}</span>
            </div>
        `).join('');
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

let selectedRating = 0;
if (starInput) {
    const stars = Array.from(starInput.querySelectorAll('.star'));
    const paint = (n, cls) => stars.forEach((s, i) => s.classList.toggle(cls, i < n));

    stars.forEach((star, idx) => {
        star.addEventListener('mouseenter', () => paint(idx + 1, 'hover'));
        star.addEventListener('mouseleave', () => paint(0, 'hover'));
        star.addEventListener('click', () => {
            selectedRating = idx + 1;
            stars.forEach((s, i) => {
                s.classList.toggle('selected', i < selectedRating);
                s.setAttribute('aria-checked', i + 1 === selectedRating ? 'true' : 'false');
            });
        });
        star.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); star.click(); }
        });
    });
}

function showReviewMessage(msg, type) {
    if (!reviewMessage) return;
    reviewMessage.textContent = msg;
    reviewMessage.className = `form-message ${type}`;
    setTimeout(() => {
        reviewMessage.className = 'form-message';
        reviewMessage.textContent = '';
    }, 6000);
}

if (reviewForm) {
    reviewForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value.trim();
        const email = document.getElementById('reviewEmail').value.trim();
        const text = document.getElementById('reviewText').value.trim();

        if (!name) return showReviewMessage('Please enter your name.', 'error');
        if (!selectedRating) return showReviewMessage('Please select a star rating.', 'error');
        if (text.length < 10) return showReviewMessage('Please write at least 10 characters.', 'error');

        const reviews = loadReviews();
        reviews.push({
            name, email,
            rating: selectedRating,
            text,
            date: new Date().toISOString()
        });
        saveReviews(reviews);
        renderReviews();

        reviewForm.reset();
        selectedRating = 0;
        document.querySelectorAll('#starInput .star').forEach(s => {
            s.classList.remove('selected');
            s.setAttribute('aria-checked', 'false');
        });
        showReviewMessage('Thank you! Your review has been posted.', 'success');
    });
}

renderReviews();
