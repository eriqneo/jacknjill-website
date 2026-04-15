import AOS from 'aos';
import 'aos/dist/aos.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupPencilCursor } from './src/cursor.js';
import { fetchNews, fetchUpcomingEvents, fetchTestimonials, fetchPartners, fetchStaff, buildImageUrl } from './src/sanity.js';

gsap.registerPlugin(ScrollTrigger);

// Initialize AOS
AOS.init({
    duration: 1200,
    easing: 'ease-in-out-cubic',
    once: true,
});

// --- Refined Institutional Menu Logic ---
const hbTrigger = document.getElementById('hamburger-trigger');
const overlayClose = document.getElementById('overlay-close-btn');
const institutionalOverlay = document.getElementById('institutional-overlay');
const megaItems = document.querySelectorAll('.mega-item');
const submenuPlaceholder = document.querySelector('.submenu-placeholder');
const subLists = document.querySelectorAll('.sub-list');

if (hbTrigger && institutionalOverlay) {
    const toggleMenu = (active) => {
        if (active) {
            institutionalOverlay.classList.add('active');
            hbTrigger.classList.add('is-active');
            document.body.style.overflow = 'hidden';
            // Flagship Stagger Animation
            gsap.fromTo(megaItems,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.08,
                    duration: 0.6,
                    ease: "power2.out",
                    delay: 0.45
                }
            );
        } else {
            institutionalOverlay.classList.remove('active');
            hbTrigger.classList.remove('is-active');
            document.body.style.overflow = '';
            // Reset items for next opening
            gsap.set(megaItems, { opacity: 0, y: 20 });
        }
    };

    hbTrigger.addEventListener('click', () => {
        const isOpen = institutionalOverlay.classList.contains('active');
        toggleMenu(!isOpen);
    });

    // Wire up the ✕ close button inside the overlay
    if (overlayClose) {
        overlayClose.addEventListener('click', () => toggleMenu(false));
    }

    megaItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const menuId = item.getAttribute('data-menu');
            if (submenuPlaceholder) submenuPlaceholder.style.display = 'none';
            subLists.forEach(list => list.style.display = 'none');
            if (menuId) {
                const targetSub = document.getElementById("submenu-" + menuId);
                if (targetSub) {
                    targetSub.style.display = 'flex';
                    gsap.fromTo(targetSub.querySelectorAll('a'),
                        { opacity: 0, x: -10 },
                        { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
                    );
                }
            } else {
                if (submenuPlaceholder) submenuPlaceholder.style.display = 'block';
            }
        });
    });

    institutionalOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || link.id === 'search-trigger') return;
            e.preventDefault();
            toggleMenu(false);
            setTimeout(() => { window.location.href = href; }, 450);
        });
    });
}

const searchTrigger = document.getElementById('search-trigger');
const searchPanel = document.getElementById('search-panel');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');

if (searchTrigger && searchPanel) {
    searchTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        searchPanel.style.display = 'flex';
        gsap.fromTo(searchPanel, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3 });
        if (searchInput) setTimeout(() => searchInput.focus(), 150);
    });
    if (searchClose) {
        searchClose.addEventListener('click', () => {
            gsap.to(searchPanel, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => { searchPanel.style.display = 'none'; } });
        });
    }
}

window.addEventListener('load', () => {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 600);
        }
    }
});

// --- Header Scroll States ---
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (header) {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// --- Unified Hero Staggered Entrance (GSAP) ---
const animateHero = () => {
    // 1. Eyebrow: delay 0.5s
    gsap.to('.hero-eyebrow', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out"
    });

    // 2. H1 Lines: 0.15s stagger
    gsap.to('.h1-line', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.65, // Starts just after eyebrow
        ease: "power2.out"
    });

    // 3. Subheadline: delay 1.1s
    gsap.to('.hero-subheadline', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 1.1,
        ease: "power2.out"
    });
};

// --- Scroll Indicator & Header States ---
window.addEventListener('scroll', () => {
    const indicator = document.querySelector('.hero-scroll-indicator');
    if (indicator) {
        if (window.scrollY > 100) {
            indicator.style.opacity = '0';
        } else {
            indicator.style.opacity = '1';
        }
    }
});

// --- Academics Interactive Tabs ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Toggle active buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active panels
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === target) {
                    panel.classList.add('active');
                }
            });

            // Scroll slightly to header if on mobile
            if (window.innerWidth < 768) {
                const nav = document.querySelector('.sticky-tab-nav');
                window.scrollTo({ top: nav.offsetTop - 50, behavior: 'smooth' });
            }
        });
    });

    // Auto-trigger tab if URL contains hash (Deep Linking for Premium Apply Routing)
    window.addEventListener('load', () => {
        if (window.location.hash) {
            const hashTarget = window.location.hash.substring(1); // remove '#'
            const matchedBtn = Array.from(tabButtons).find(btn => btn.getAttribute('data-tab') === hashTarget);
            if (matchedBtn) {
                matchedBtn.click();
            }
        }
    });
}

// --- Multi-Step Application Form ---
const formSteps = document.querySelectorAll('.form-step');
const nextBtns = document.querySelectorAll('.form-next-btn');
const prevBtns = document.querySelectorAll('.form-prev-btn');
const progressFill = document.querySelector('.progress-bar-fill');
const pSteps = document.querySelectorAll('.p-step');

let currentStep = 1;
const totalSteps = formSteps.length;

const updateFormUI = () => {
    // Update steps visibility
    formSteps.forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.getAttribute('data-step')) === currentStep) {
            step.classList.add('active');
        }
    });

    // Update progress bar
    if (progressFill) {
        const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${percentage}%`;
    }

    // Update step circles
    pSteps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active');
        if (stepNum <= currentStep) {
            step.classList.add('active');
        }
    });
};

if (nextBtns.length > 0) {
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFormUI();
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateFormUI();
            }
        });
    });
}

// --- Gallery Filter Logic ---
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            galleryItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    item.style.display = 'inline-block';
                    gsap.fromTo(item, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// --- Institutional Lightbox Logic ---
const lightbox = document.getElementById('institutional-lightbox');
const lightboxImg = document.getElementById('lightbox-main-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeLightbox = document.querySelector('.lightbox-close-btn');
const lbOverlay = document.querySelector('.lightbox-overlay-bg');
const prevBtn = document.querySelector('.lightbox-nav-btn.prev');
const nextBtn = document.querySelector('.lightbox-nav-btn.next');

let activeGallery = [];
let currentIndex = 0;

const updateLightbox = () => {
    if (activeGallery.length > 0) {
        const item = activeGallery[currentIndex];
        lightboxImg.src = item.img;
        lightboxCaption.textContent = item.caption;
    }
};

const openLightbox = (idx) => {
    // Collect currently visible items for navigation
    activeGallery = Array.from(galleryItems)
        .filter(item => item.style.display !== 'none')
        .map(item => ({
            img: item.querySelector('img').src,
            caption: item.getAttribute('data-caption')
        }));

    currentIndex = idx;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeLB = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
};

if (lightbox) {
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Find its index in the VISIBLE subset
            const visibleItems = Array.from(galleryItems).filter(i => i.style.display !== 'none');
            const vIdx = visibleItems.indexOf(item);
            openLightbox(vIdx);
        });
    });

    closeLightbox.addEventListener('click', closeLB);
    lbOverlay.addEventListener('click', closeLB);

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % activeGallery.length;
        updateLightbox();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + activeGallery.length) % activeGallery.length;
        updateLightbox();
    });

    window.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLB();
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn.click();
    });
}

// --- Governance Scroll Animations ---
if (document.querySelector('.gov-director-card')) {
    gsap.fromTo('.gov-director-card',
        { x: -50, opacity: 0 },
        {
            x: 0, opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: {
                trigger: '.gov-director-card',
                start: "top 80%",
                toggleActions: "play none none none"
            }
        }
    );

    gsap.fromTo('.gov-leader-card',
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out",
            scrollTrigger: {
                trigger: '.gov-leadership-row',
                start: "top 85%",
            }
        }
    );

    gsap.fromTo('.gov-faculty-card',
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out",
            scrollTrigger: {
                trigger: '.gov-faculty-carousel-wrap',
                start: "top 85%",
            }
        }
    );

    // Faculty Carousel Navigation
    const facTrackWrap = document.querySelector('.gov-faculty-carousel-wrap');
    const facPrev = document.getElementById('fac-prev');
    const facNext = document.getElementById('fac-next');

    if (facTrackWrap && facPrev && facNext) {
        facPrev.addEventListener('click', () => {
            const scrollAmount = facTrackWrap.querySelector('.gov-faculty-card').offsetWidth + 32; // card + 2rem gap
            facTrackWrap.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        facNext.addEventListener('click', () => {
            const scrollAmount = facTrackWrap.querySelector('.gov-faculty-card').offsetWidth + 32; // card + 2rem gap
            facTrackWrap.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

// --- Contact Form Logic ---
const contactForm = document.getElementById('jj-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('contact-submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.btn-spinner');
        const successMsg = document.getElementById('contact-success');

        // Loading State
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        spinner.style.display = 'inline-block';

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://formspree.io/f/jacknjill593@gmail.com', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                spinner.style.display = 'none';
                btnText.textContent = 'Send Message';
                submitBtn.style.display = 'none';
                successMsg.style.display = 'flex';
                contactForm.reset();
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            btnText.textContent = 'Error! Try Again';
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });
}
// --- Active Menu State Logic ---
const syncNavigationState = () => {
    let currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    
    const menuLinksDOM = document.querySelectorAll('.mega-link-list a, .nav-main-link');
    menuLinksDOM.forEach(link => {
        let href = link.getAttribute('href');
        if (!href) return;
        
        let linkPath = href.split('#')[0].replace(/\/$/, '') || '/';
        
        // Match if paths are identical
        if (linkPath === currentPath) {
            link.classList.add('active-nav');
            link.classList.add('nav-active');
            link.setAttribute('aria-current', 'page');
        }
    });
};

syncNavigationState();

// --- Overlay Menu Scroll Hint Logic ---
const overlayMenuElement = document.querySelector('.institutional-mega-menu');
const scrollHintElement = document.getElementById('overlay-scroll-hint');

if (overlayMenuElement && scrollHintElement) {
    overlayMenuElement.addEventListener('scroll', () => {
        if (overlayMenuElement.scrollTop > 50) {
            scrollHintElement.classList.add('hidden');
        } else {
            scrollHintElement.classList.remove('hidden');
        }
    });

    // Reset hint visibility when the menu opens
    const menuTrigger = document.getElementById('hamburger-trigger');
    if (menuTrigger) {
        menuTrigger.addEventListener('click', () => {
            // Slight delay to allow display to paint
            setTimeout(() => {
                if (overlayMenuElement.scrollTop <= 50) {
                    scrollHintElement.classList.remove('hidden');
                }
            }, 100);
        });
    }
}

// --- Experience Cards Entrance Animation (IntersectionObserver) ---
const expCards = document.querySelectorAll('.exp-anim');
if (expCards.length > 0) {
    const expObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                expObserver.unobserve(entry.target); // fire once
            }
        });
    }, { threshold: 0.15 });

    expCards.forEach(card => expObserver.observe(card));
}

// --- Unified Elements Reveal Animation (IntersectionObserver) ---
const unifiedRevealElements = document.querySelectorAll('.reveal');
if (unifiedRevealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    unifiedRevealElements.forEach(el => revealObserver.observe(el));
}

// --- Experience Section Carousel Logic ---
const expTrack = document.querySelector('.jj-exp-track-container');
const expBtnPrev = document.getElementById('exp-prev');
const expBtnNext = document.getElementById('exp-next');

if (expTrack && expBtnPrev && expBtnNext) {
    const scrollAmount = 404; // Card width (380) + gap (24)

    expBtnNext.addEventListener('click', () => {
        // If at the end, cycle back to the beginning
        if (expTrack.scrollLeft + expTrack.clientWidth >= expTrack.scrollWidth - 10) {
            expTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            expTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    expBtnPrev.addEventListener('click', () => {
        // If at the beginning, cycle to the end
        if (expTrack.scrollLeft <= 10) {
            expTrack.scrollTo({ left: expTrack.scrollWidth, behavior: 'smooth' });
        } else {
            expTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });
}

// --- News Section Carousel Logic ---
const newsTrack = document.getElementById('news-track');
const newsBtnPrev = document.getElementById('news-prev');
const newsBtnNext = document.getElementById('news-next');

if (newsTrack && newsBtnPrev && newsBtnNext) {

    newsBtnNext.addEventListener('click', () => {
        // dynamic calc: scroll by one whole card width approx ~50%
        const scrollAmount = newsTrack.clientWidth / 2;
        if (newsTrack.scrollLeft + newsTrack.clientWidth >= newsTrack.scrollWidth - 10) {
            newsTrack.scrollTo({ left: 0, behavior: 'smooth' }); // Loop to start
        } else {
            newsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    newsBtnPrev.addEventListener('click', () => {
        const scrollAmount = newsTrack.clientWidth / 2;
        if (newsTrack.scrollLeft <= 10) {
            newsTrack.scrollTo({ left: newsTrack.scrollWidth, behavior: 'smooth' }); // Loop to end
        } else {
            newsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });
}

// --- Students Testimonial Carousel Logic ---
const studentsTrack = document.getElementById('students-track');
const studentsBtnPrev = document.getElementById('students-prev');
const studentsBtnNext = document.getElementById('students-next');

if (studentsTrack && studentsBtnPrev && studentsBtnNext) {

    studentsBtnNext.addEventListener('click', () => {
        // dynamic calc: scroll by exactly one whole card width which is 100% of container width
        const scrollAmount = studentsTrack.clientWidth;
        if (studentsTrack.scrollLeft + studentsTrack.clientWidth >= studentsTrack.scrollWidth - 10) {
            studentsTrack.scrollTo({ left: 0, behavior: 'smooth' }); // Loop to start
        } else {
            studentsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    studentsBtnPrev.addEventListener('click', () => {
        const scrollAmount = studentsTrack.clientWidth;
        if (studentsTrack.scrollLeft <= 10) {
            studentsTrack.scrollTo({ left: studentsTrack.scrollWidth, behavior: 'smooth' }); // Loop to end
        } else {
            studentsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });
}

// --- Intro Screen Typewriter ---
function handleIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    const typewriterTextElement = document.getElementById('typewriter-text');

    if (!introScreen || !typewriterTextElement) return;

    let hasPlayed = false;
    try {
        hasPlayed = sessionStorage.getItem('jj_intro_played');
    } catch (e) {
        console.warn("Storage access denied:", e);
    }

    if (hasPlayed) {
        // Already played this session, hide immediately
        introScreen.style.display = 'none';
        document.body.style.overflow = '';
    } else {
        const textToType = "Excellence isn't a destination—it's a lifelong journey. From first steps into our classrooms to bold strides into the world, we ignite a passion for learning that burns eternally.";
        let currentIndex = 0;

        // Prevent scrolling while intro is active
        document.body.style.overflow = 'hidden';

        const typeChar = () => {
            if (currentIndex < textToType.length) {
                typewriterTextElement.textContent += textToType.charAt(currentIndex);
                currentIndex++;
                setTimeout(typeChar, 25); // Type speed
            } else {
                // Finished typing. Now act as a premium preloader for the heavy cinematic hero.
                const liftCurtain = () => {
                    // Add a tiny aesthetic pause after load
                    setTimeout(() => {
                        introScreen.classList.add('lift-curtain');
                        document.body.style.overflow = ''; // Restore scroll
                        try {
                            sessionStorage.setItem('jj_intro_played', 'true');
                        } catch (e) {}
                        
                        setTimeout(() => {
                            introScreen.style.display = 'none';
                        }, 1000);
                    }, 800);
                };

                // Preload the specific heavy asset.
                const heroPreload = new Image();
                heroPreload.onload = liftCurtain;
                heroPreload.onerror = liftCurtain; // Fallback so it doesn't hang
                heroPreload.src = 'assets/hero.jpg';

                // If it happened to load instantly from cache
                if (heroPreload.complete && heroPreload.naturalWidth !== 0) {
                    liftCurtain();
                } else {
                    // Optional: show a subtle pulsing cursor while waiting for the heavy image
                    document.querySelector('.cursor').classList.add('loading-pulse');
                }
            }
        };

        // Start typing after a short delay
        setTimeout(typeChar, 500);
    }
}

// --- CMS Calendar Modal Logic (Live Sanity Events) ---
const openCalBtn = document.getElementById('open-calendar-modal');
const closeCalBtn = document.getElementById('close-calendar-modal');
const calendarModal = document.getElementById('calendar-modal');
const cmsEventsContainer = document.getElementById('cms-mock-events');

/** Format a Sanity datetime string into a human-readable date */
function formatEventDate(isoString) {
    if (!isoString) return 'TBC';
    return new Date(isoString).toLocaleDateString('en-KE', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });
}

/** Render events from Sanity into the calendar modal */
async function populateCMSEvents() {
    if (!cmsEventsContainer) return;
    cmsEventsContainer.innerHTML = '<li class="cms-event-item cms-loading"><p>Loading events...</p></li>';

    const events = await fetchUpcomingEvents();

    cmsEventsContainer.innerHTML = '';

    if (!events.length) {
        cmsEventsContainer.innerHTML = '<li class="cms-event-item"><p>No upcoming events scheduled. Check back soon!</p></li>';
        return;
    }

    events.forEach(evt => {
        const li = document.createElement('li');
        li.className = 'cms-event-item';
        const dateStr = formatEventDate(evt.startDate);
        const endStr  = evt.endDate ? ` — ${formatEventDate(evt.endDate)}` : '';
        li.innerHTML = `
            <h3>${evt.eventName}</h3>
            <div class="cms-event-date-loc">
                <span class="cms-event-date-text">${dateStr}${endStr}</span>
                ${evt.location ? `<span class="cms-event-loc"> · ${evt.location}</span>` : ''}
            </div>
            ${evt.description ? `<p class="cms-event-desc">${evt.description}</p>` : ''}
        `;
        cmsEventsContainer.appendChild(li);
    });
}

/** Render upcoming events in the homepage 'See What's On' list */
async function populateHomepageEvents() {
    const eventsList = document.querySelector('.events-list');
    if (!eventsList) return;

    const events = await fetchUpcomingEvents();
    if (!events.length) return; // Keep static fallback if CMS is empty

    eventsList.innerHTML = '';
    const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    events.slice(0, 3).forEach((evt, i) => {
        const d = new Date(evt.startDate);
        const day   = d.getDate();
        const month = monthNames[d.getMonth()];

        // Show "All Day" when time is midnight (UTC), otherwise show local time
        const hours   = d.getHours();
        const minutes = d.getMinutes();
        const timeStr = (hours === 0 && minutes === 0)
            ? 'All Day'
            : d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

        const row = document.createElement('div');
        // Add reveal-active immediately — IntersectionObserver already fired before async resolved
        row.className = 'ue-row reveal reveal-active';
        row.style.transitionDelay = `${i * 0.12}s`;
        row.innerHTML = `
            <div class="ue-date">
                <div class="ue-day">${day}</div>
                <div class="ue-month">${month}</div>
            </div>
            <div class="ue-divider"></div>
            <div class="ue-info">
                <h3 class="ue-name">${evt.eventName}</h3>
                <p class="ue-loc">${evt.location || ''}</p>
            </div>
            <div class="ue-time">${timeStr}</div>
        `;
        eventsList.appendChild(row);
    });
}


if (openCalBtn && calendarModal && closeCalBtn) {
    let eventsLoaded = false;

    const toggleModal = (show) => {
        if (show) {
            calendarModal.classList.add('modal-active');
            document.body.style.overflow = 'hidden';
            if (!eventsLoaded) {
                eventsLoaded = true;
                populateCMSEvents();
            }
        } else {
            calendarModal.classList.remove('modal-active');
            document.body.style.overflow = '';
        }
    };

    openCalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(true);
    });

    closeCalBtn.addEventListener('click', () => toggleModal(false));

    calendarModal.addEventListener('click', (e) => {
        if (e.target === calendarModal) toggleModal(false);
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && calendarModal.classList.contains('modal-active')) {
            toggleModal(false);
        }
    });
}

// --- CMS Partners API Integration (Live Sanity) ---
async function populateCMSPartners() {
    const partnersGrid = document.getElementById('cms-partners-grid');
    if (!partnersGrid) return;

    partnersGrid.innerHTML = '<div class="cms-loading-state"><span>Loading partners...</span></div>';

    const partners = await fetchPartners();

    partnersGrid.innerHTML = '';

    if (!partners.length) {
        // Keep the grid empty — static content still visible
        return;
    }

    partners.forEach((partner, index) => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Prefer uploaded logo image; fall back to FontAwesome icon class
        const mediaHtml = partner.logoImage
            ? `<div class="pc-icon pc-icon--img"><img src="${buildImageUrl(partner.logoImage, 120, 80)}" alt="${partner.partnerName} logo" loading="lazy"></div>`
            : `<div class="pc-icon"><i class="fa-solid ${partner.logoIcon || 'fa-handshake'}"></i></div>`;

        const websiteHtml = partner.website
            ? `<a href="${partner.website}" class="pc-link" target="_blank" rel="noopener noreferrer">Visit Website →</a>`
            : '';

        card.innerHTML = `
            ${mediaHtml}
            <h3 class="pc-title">${partner.partnerName}</h3>
            <p class="pc-desc">${partner.description}</p>
            ${websiteHtml}
        `;

        partnersGrid.appendChild(card);

        setTimeout(() => {
            gsap.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: index * 0.1 });
        }, 100);
    });
}

// --- CMS News Cards (Live Sanity) ---
let newsArticles = []; // Global store for modal access

/**
 * Simple Sanity Portable Text to HTML converter
 */
function portableTextToHtml(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks.map(block => {
        if (block._type !== 'block' || !block.children) {
            // Handle inline images within body
            if (block._type === 'image') {
                return `<div class="body-inline-image"><img src="${buildImageUrl(block, 1000, 600)}" alt="Article image" loading="lazy"></div>`;
            }
            return '';
        }

        const text = block.children.map(child => {
            let html = child.text;
            if (child.marks && child.marks.length > 0) {
                if (child.marks.includes('strong')) html = `<strong>${html}</strong>`;
                if (child.marks.includes('em')) html = `<em>${html}</em>`;
                if (child.marks.includes('underline')) html = `<span style="text-decoration: underline;">${html}</span>`;
            }
            return html;
        }).join('');

        switch (block.style) {
            case 'h2': return `<h2>${text}</h2>`;
            case 'h3': return `<h3>${text}</h3>`;
            case 'blockquote': return `<blockquote>${text}</blockquote>`;
            default: return `<p>${text}</p>`;
        }
    }).join('');
}

function openNewsModal(id) {
    const article = newsArticles.find(a => a._id === id);
    if (!article) return;

    const modal = document.getElementById('news-modal');
    const titleEl = document.getElementById('news-modal-title');
    const catEl = document.getElementById('news-modal-cat');
    const dateEl = document.getElementById('news-modal-date');
    const imageContainer = document.getElementById('news-modal-image-container');
    const bodyEl = document.getElementById('news-modal-body');

    if (!modal || !titleEl) return;

    titleEl.textContent = article.title;
    catEl.textContent = article.category?.toUpperCase() || 'NEWS';
    dateEl.textContent = article.publishedAt 
        ? new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';
    
    imageContainer.innerHTML = article.mainImage 
        ? `<img src="${buildImageUrl(article.mainImage, 1200, 700)}" alt="${article.title}">`
        : '';
    
    bodyEl.innerHTML = portableTextToHtml(article.body);

    modal.classList.add('modal-active');
    document.body.style.overflow = 'hidden';
}

async function populateCMSNews() {
    const newsTrackEl = document.getElementById('news-track');
    if (!newsTrackEl) return;

    const articles = await fetchNews();
    if (!articles.length) return; // Preserve static HTML fallback

    const categoryLabels = {
        announcement: 'Announcement', academic: 'Academic',
        sports: 'Sports', cultural: 'Cultural',
        community: 'Community', achievement: 'Achievement'
    };

    newsTrackEl.innerHTML = '';
    newsArticles = articles; // Store globally for the modal

    articles.forEach(article => {
        const dateStr = article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
        const catLabel = categoryLabels[article.category] || article.category || '';

        const card = document.createElement('a');
        card.href    = '#'; 
        card.className = 'c-news-card';
        card.innerHTML = `
            <div class="c-news-header">
                <div>
                    ${catLabel ? `<span class="c-news-cat">${catLabel}</span>` : ''}
                    <h3>${article.title}</h3>
                </div>
                <span class="c-news-date">${dateStr}</span>
            </div>
            <p>${article.excerpt || ''}</p>
            <span class="c-news-readmore">Read More</span>
        `;

        card.addEventListener('click', (e) => {
            e.preventDefault();
            openNewsModal(article._id);
        });

        newsTrackEl.appendChild(card);
    });
}

// --- CMS Testimonials — Marquee & Student Carousel (Live Sanity) ---
async function populateCMSTestimonials() {
    const articles = await fetchTestimonials();
    if (!articles.length) return; // Preserve static HTML fallback

    // Split by type: parents → marquee, students → carousel
    const parents  = articles.filter(t => t.type === 'parent' || t.type === 'alumni' || t.type === 'partner');
    const students = articles.filter(t => t.type === 'student');

    // -- Parent Testimonials Marquee --
    const marquee = document.querySelector('.pt-marquee-wrapper');
    if (marquee && parents.length) {
        const stars = (rating = 5) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

        // Double the array for infinite CSS loop
        const doubled = [...parents, ...parents];
        marquee.innerHTML = doubled.map(t => {
            const avatarSrc = t.avatar ? buildImageUrl(t.avatar, 80, 80) : `https://i.pravatar.cc/80?u=${encodeURIComponent(t.authorName)}`;
            return `
            <div class="pt-card">
                <div class="pt-stars">${stars(t.rating)}</div>
                <p class="pt-quote">"${t.quote}"</p>
                <div class="pt-author">
                    <div class="pt-avatar-wrapper"><img src="${avatarSrc}" class="pt-avatar" alt="${t.authorName}"></div>
                    <div class="pt-author-info">
                        <p class="name">${t.authorName}</p>
                        <p class="role">${t.authorRole}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // -- Student Testimonials Carousel --
    const studentsEl = document.getElementById('students-track');
    if (studentsEl && students.length) {
        studentsEl.innerHTML = students.map((t, i) => {
            const avatarSrc = t.avatar ? buildImageUrl(t.avatar, 80, 80) : `https://i.pravatar.cc/80?u=${encodeURIComponent(t.authorName)}`;
            return `
            <div class="ut-card reveal reveal-active" style="transition-delay: ${i * 0.1}s;">
                <div class="ut-quote-mark">"</div>
                <p class="ut-quote">${t.quote}</p>
                <div class="ut-author">
                    <img src="${avatarSrc}" class="ut-avatar" alt="${t.authorName}">
                    <div class="ut-author-info">
                        <p class="name">${t.authorName}</p>
                        <p class="year">${t.authorRole}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
}



// --- WhatsApp Floating Button Injection ---
function injectWhatsAppButton() {
    if (document.querySelector('.whatsapp-float')) return; // Prevent double injection
    const waButton = document.createElement('a');
    waButton.href = 'https://wa.me/254703305656';
    waButton.className = 'whatsapp-float';
    waButton.target = '_blank';
    waButton.rel = 'noopener noreferrer';
    waButton.setAttribute('aria-label', 'Chat with us on WhatsApp');
    waButton.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    
    document.body.appendChild(waButton);
    
    // Entrance animation
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(waButton, 
            { scale: 0, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.6, delay: 2, ease: "back.out(1.7)" }
        );
    }
}

// --- CMS Faculty API Integration (Live Sanity) ---
async function populateCMSFaculty() {
    const facultyTrack = document.getElementById('faculty-track');
    if (!facultyTrack) return;

    const staffMembers = await fetchStaff();
    if (!staffMembers || staffMembers.length === 0) return;

    facultyTrack.innerHTML = ''; // Replace static fallback

    staffMembers.forEach(member => {
        const card = document.createElement('div');
        card.className = 'gov-faculty-card';

        const photoUrl = buildImageUrl(member.photo, 300, 300);
        
        card.innerHTML = `
            <img src="${photoUrl}" alt="${member.fullName}" loading="lazy">
            <h4 class="fac-name">${member.fullName}</h4>
            <span class="fac-subject">${member.department || 'Staff'}</span>
            ${member.position ? `<p class="fac-quote">${member.position}</p>` : ''}
            ${member.biography ? `
            <div class="fac-bio-overlay">
                <p>${member.biography}</p>
            </div>
            ` : ''}
        `;
        
        facultyTrack.appendChild(card);
    });

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.gov-faculty-card',
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out",
                scrollTrigger: {
                    trigger: '.gov-faculty-carousel-wrap',
                    start: "top 85%",
                }
            }
        );
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
}

// --- CMS Leadership API Integration (Live Sanity) ---
async function populateCMSLeadership() {
    const directorCard = document.getElementById('director');
    if (!directorCard) return;

    const staffMembers = await fetchStaff();
    if (!staffMembers || staffMembers.length === 0) return;

    // We assume the director might be marked 'executive' or position contains 'Director'
    const director = staffMembers.find(m => 
        (m.department === 'executive' && m.position.toLowerCase().includes('director')) || 
        m.fullName.toLowerCase().includes('atudo pin')
    );

    if (director && director.photo) {
        const imgEl = directorCard.querySelector('img');
        if (imgEl) {
            imgEl.src = buildImageUrl(director.photo, 450, 600);
            imgEl.alt = director.fullName;
        }
        
        const nameEl = directorCard.querySelector('.gov-name');
        if (nameEl) nameEl.textContent = director.fullName;
        
        const roleEl = directorCard.querySelector('.gov-role');
        if (roleEl && director.position) roleEl.textContent = director.position;
    }
}

// Global initialization — fire all CMS fetches in parallel
document.addEventListener('DOMContentLoaded', () => {
    handleIntroScreen();
    injectWhatsAppButton();
    setupPencilCursor();

    // CMS Data Hydration (all in parallel for speed)
    Promise.all([
        populateCMSPartners(),
        populateCMSNews(),
        populateCMSTestimonials(),
        populateHomepageEvents(),
        populateCMSFaculty(),
        populateCMSLeadership(),
    ]).then(() => {
        setupFAQ();
    }).catch(err => console.warn('[CMS] Hydration error:', err));

    // Modal Close Listeners (Generic for all CMS modals)
    document.querySelectorAll('.jj-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.jj-modal-overlay').forEach(m => m.classList.remove('modal-active'));
            document.body.style.overflow = '';
        });
    });

    document.querySelectorAll('.jj-modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('modal-active');
                document.body.style.overflow = '';
            }
        });
    });
});

window.addEventListener('load', () => {
    if (typeof animateHero === 'function') animateHero();
});


// --- FAQ Interaction Logic ---
function setupFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    const navLinks = document.querySelectorAll('.faq-nav-link');
    const sections = document.querySelectorAll('.faq-section');

    if (!questions.length) return;

    // Accordion Toggling
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const parentSection = q.closest('.faq-section');
            
            // Close other items in same section
            parentSection.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            
            item.classList.toggle('active');
        });
    });

    // Category Switching (Sidebar)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update nav state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === targetId) {
                    sec.classList.add('active');
                    // Reset accordions when switching
                    sec.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
                }
            });

            // Mobile: Scroll to content top
            if (window.innerWidth <= 900) {
                const contentArea = document.querySelector('.faq-content');
                contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

console.log('Jack & Jill School Flagship Core Initialized');

