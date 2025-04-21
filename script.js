// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const counters = document.querySelectorAll('.counter');
const heroSlideshow = document.getElementById('heroSlideshow');
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');
const heroPrevBtn = document.querySelector('.hero-slideshow-nav .prev-btn');
const heroNextBtn = document.querySelector('.hero-slideshow-nav .next-btn');

// Gallery Elements
const galleryGrid = document.getElementById('galleryGrid');

// Hero Slideshow variables
let currentHeroSlide = 0;
let heroSlideInterval;

// Load gallery images from Firebase
function loadGalleryImages() {
    // Create modal elements for image viewing
    createGalleryModal();
    
    // Show loading indicator
    showGalleryLoading();
    
    try {
        // Direct connection to Firebase database
        const dbUrl = 'https://muskurahat-166bb-default-rtdb.firebaseio.com';
        const galleryPath = '/gallery/images.json';
        const fullUrl = dbUrl + galleryPath;
        
        // Fetch gallery data directly from Firebase URL
        fetch(fullUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Remove loading indicator
                hideGalleryLoading();
                
                // If data is null or empty, initialize database with sample images
                if (!data) {
                    console.log('Firebase database is empty. Initializing with sample images...');
                    initializeGalleryData();
                    return;
                }
                
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('No valid gallery images found in Firebase. Using fallback images.');
                    loadFallbackGalleryImages();
                    return;
                }
                
                // Clear existing gallery items
                galleryGrid.innerHTML = '';
                
                // Add images to gallery grid
                data.forEach((image, index) => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item loading'; // Start with loading state
                    galleryItem.setAttribute('data-index', index);
                    
                    // Create image element
                    const img = document.createElement('img');
                    img.src = image.src;
                    img.alt = image.alt || 'Gallery image';
                    img.loading = 'lazy'; // Lazy load images
                    
                    // Remove loading state when image loads
                    img.onload = function() {
                        galleryItem.classList.remove('loading');
                    };
                    
                    // Keep loading state if image fails to load
                    img.onerror = function() {
                        console.warn(`Failed to load image: ${image.src}`);
                        galleryItem.innerHTML = '<div class="error-message">Image not available</div>';
                    };
                    
                    // Add caption if available
                    if (image.caption) {
                        const caption = document.createElement('div');
                        caption.className = 'gallery-caption';
                        caption.textContent = image.caption;
                        galleryItem.appendChild(caption);
                    }
                    
                    // Add click event to open modal
                    galleryItem.addEventListener('click', () => {
                        openGalleryModal(image.src, image.caption || '');
                    });
                    
                    galleryItem.appendChild(img);
                    galleryGrid.appendChild(galleryItem);
                });
            })
            .catch(error => {
                console.error('Error loading gallery images from Firebase:', error);
                hideGalleryLoading();
                loadFallbackGalleryImages();
            });
    } catch (error) {
        console.error('Error loading gallery images from Firebase:', error);
        hideGalleryLoading();
        loadFallbackGalleryImages();
    }
}

// Show gallery loading indicator
function showGalleryLoading() {
    // Clear the gallery and show loading indicator
    galleryGrid.innerHTML = '';
    
    const loadingElement = document.createElement('div');
    loadingElement.className = 'gallery-loading';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading gallery images...</div>
    `;
    
    galleryGrid.appendChild(loadingElement);
}

// Hide gallery loading indicator
function hideGalleryLoading() {
    // Remove loading indicator if it exists
    const loadingElement = galleryGrid.querySelector('.gallery-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Initialize gallery data in Firebase if it's empty
function initializeGalleryData() {
    console.log('Initializing gallery data in Firebase...');
    
    // Check if Firebase authentication is ready
    if (!window.firebaseAuthReady) {
        console.log('Waiting for Firebase authentication...');
        setTimeout(initializeGalleryData, 1000);
        return;
    }
    
    // Sample gallery images for initialization
    const sampleImages = [
        {
            src: 'images/gallery/education1.jpg',
            alt: 'Children learning in a classroom',
            caption: 'Education support for underprivileged children'
        },
        {
            src: 'images/gallery/community1.jpg',
            alt: 'Community service event',
            caption: 'Community development projects'
        },
        {
            src: 'images/gallery/education2.jpg',
            alt: 'Students with new school supplies',
            caption: 'Distributing educational materials'
        },
        {
            src: 'images/gallery/health1.jpg',
            alt: 'Health camp for children',
            caption: 'Health and wellness initiatives'
        },
        {
            src: 'images/gallery/community2.jpg',
            alt: 'Volunteers working together',
            caption: 'Volunteer engagement in local communities'
        },
        {
            src: 'images/gallery/education3.jpg',
            alt: 'Teacher training workshop',
            caption: 'Teacher training programs'
        }
    ];
    
    // Upload sample images to Firebase
    const dbUrl = 'https://muskurahat-166bb-default-rtdb.firebaseio.com';
    const galleryPath = '/gallery/images.json';
    const fullUrl = dbUrl + galleryPath;
    
    fetch(fullUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleImages)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to initialize gallery data');
        }
        console.log('Gallery data initialized successfully');
        return response.json();
    })
    .then(data => {
        console.log('Sample gallery images uploaded to Firebase');
        // Reload gallery images from Firebase
        loadGalleryImages();
    })
    .catch(error => {
        console.error('Error initializing gallery data:', error);
        hideGalleryLoading();
        loadFallbackGalleryImages();
    });
}

// Load fallback gallery images if Firebase fails
function loadFallbackGalleryImages() {
    const fallbackImages = [
        {
            src: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
            alt: "Children in classroom",
            caption: "Learning together"
        },
        {
            src: "https://images.unsplash.com/photo-1565945887714-d5139f4eb0ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80", 
            alt: "Educational workshop",
            caption: "Interactive learning workshops"
        },
        {
            src: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
            alt: "Students studying",
            caption: "Study sessions"
        },
        {
            src: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
            alt: "Food distribution",
            caption: "Nutrition support"
        },
        {
            src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
            alt: "Community service",
            caption: "Giving back to communities"
        },
        {
            src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
            alt: "Team collaboration",
            caption: "Collaborative initiatives"
        }
    ];
    
    // Clear existing gallery items
    galleryGrid.innerHTML = '';
    
    // Add fallback images to gallery grid
    fallbackImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);
        
        // Create image element
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        img.loading = 'lazy'; // Lazy load images
        
        // Add caption if available
        if (image.caption) {
            const caption = document.createElement('div');
            caption.className = 'gallery-caption';
            caption.textContent = image.caption;
            galleryItem.appendChild(caption);
        }
        
        // Add click event to open modal
        galleryItem.addEventListener('click', () => {
            openGalleryModal(image.src, image.caption || '');
        });
        
        galleryItem.appendChild(img);
        galleryGrid.appendChild(galleryItem);
    });
}

// Create modal for gallery images
function createGalleryModal() {
    // Check if modal already exists
    if (document.getElementById('galleryModal')) {
        return;
    }
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.id = 'galleryModal';
    modal.className = 'gallery-modal';
    
    const modalContent = document.createElement('img');
    modalContent.className = 'modal-content';
    modal.appendChild(modalContent);
    
    const modalCaption = document.createElement('div');
    modalCaption.className = 'modal-caption';
    modal.appendChild(modalCaption);
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeGalleryModal);
    modal.appendChild(closeBtn);
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                closeGalleryModal();
            }
        }
    });
    
    // Append modal to body
    document.body.appendChild(modal);
}

// Open gallery modal
function openGalleryModal(src, caption) {
    const modal = document.getElementById('galleryModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalCaption = modal.querySelector('.modal-caption');
    
    // Set image source and caption
    modalContent.src = src;
    modalCaption.textContent = caption;
    
    // Show modal
    modal.style.display = 'block';
    
    // Disable scroll on body
    document.body.style.overflow = 'hidden';
}

// Close gallery modal
function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
    
    // Re-enable scroll on body
    document.body.style.overflow = '';
}

// Stat Counter Animation
function animateCounters() {
    const counterSection = document.querySelector('.decade-stats');
    
    if (!counterSection) return;
    
    const sectionPosition = counterSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight;
    
    if (sectionPosition < screenPosition) {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/,/g, '');
            
            // If counter hasn't reached target
            if (count < target) {
                // Calculate increment
                const increment = target / 100;
                
                // Animate count
                if (count + increment < target) {
                    counter.innerText = Math.ceil(count + increment).toLocaleString();
                    counter.classList.add('animated');
                    
                    // Continue animation
                    setTimeout(() => {
                        counter.classList.remove('animated');
                        animateCounters();
                    }, 50);
                } else {
                    counter.innerText = target.toLocaleString();
                    counter.classList.add('animated');
                }
            }
        });
    } else {
        // Check again later if section not yet in view
        window.addEventListener('scroll', animateCounters, { once: true });
    }
}

// Add active class to navbar links based on scroll position and animate counters
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navbarHeight = document.getElementById('navbar').offsetHeight;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navbarHeight - 20;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            document.querySelector(`.nav-link[href="#${sectionId}"]`).classList.add('active');
        } else {
            document.querySelector(`.nav-link[href="#${sectionId}"]`).classList.remove('active');
        }
    });
    
    // Check if counters are in view and animate them
    animateCounters();
});

// Page load animations
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    const heroElements = document.querySelectorAll('.hero > *:not(.hero-image-container)');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
    
    // Initialize hero slideshow
    initHeroSlideshow();
    
    // Load gallery images from Firebase
    loadGalleryImages();
    
    // Initialize counters if any
    if (counters.length > 0) {
        animateCounters();
    }
    
    // Handle dropdowns for mobile
    if (window.innerWidth <= 768) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('.nav-link');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            dropdownLink.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('active');
                dropdownMenu.classList.toggle('active');
            });
        });
    }
    
    // Handle donation popup
    const donateButtons = document.querySelectorAll('.open-donate-popup');
    const donationPopup = document.getElementById('donationPopup');
    const closePopup = document.querySelector('.close-popup');
    const donationForm = document.getElementById('donationForm');
    const donationAmount = document.getElementById('donationAmount');
    const payButton = document.getElementById('payButton');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const phonePeContainer = document.getElementById('phonePeContainer');
    
    if (donateButtons.length && donationPopup) {
        donateButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                donationPopup.style.display = 'block';
            });
        });
        
        closePopup.addEventListener('click', function() {
            donationPopup.style.display = 'none';
            // Reset form
            donationForm.reset();
            payButton.disabled = true;
            paymentSuccess.style.display = 'none';
            phonePeContainer.style.display = 'none';
        });
        
        // Close popup if clicking outside content
        window.addEventListener('click', function(e) {
            if (e.target === donationPopup) {
                donationPopup.style.display = 'none';
                // Reset form
                donationForm.reset();
                payButton.disabled = true;
                paymentSuccess.style.display = 'none';
                phonePeContainer.style.display = 'none';
            }
        });
        
        // Enable pay button when amount is entered
        donationAmount.addEventListener('input', function() {
            payButton.disabled = this.value <= 0;
        });
        
        // Handle PhonePe payment process
        payButton.addEventListener('click', function() {
            const amount = document.getElementById('donationAmount').value;
            const name = document.getElementById('donorName').value;
            const email = document.getElementById('donorEmail').value;
            const phone = document.getElementById('donorPhone').value;
            
            if (!amount || !name || !email || !phone) {
                alert('Please fill all the required fields');
                return;
            }
            
            // Show loading state
            setButtonLoading(payButton, true);
            
            // Call our server-side handler instead of PhonePe API directly
            // Use mock=true for development/testing
            fetch('phonepe_handler.php?mock=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    name: name,
                    email: email,
                    phone: phone
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setButtonLoading(payButton, false);
                
                if (data.success) {
                    // Redirect to PhonePe payment page
                    window.location.href = data.data.instrumentResponse.redirectInfo.url;
                } else {
                    alert('Payment initiation failed: ' + (data.message || data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error initiating payment:', error);
                alert('Payment initiation failed. Please try again.');
                setButtonLoading(payButton, false);
            });
        });
        
        // Check for successful payment return
        window.addEventListener('load', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const txnId = urlParams.get('txnId');
            const status = urlParams.get('status');
            
            if (txnId) {
                // Verify payment status - use mock=true for development/testing
                fetch('verify_payment.php?txnId=' + txnId + '&mock=true')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            // Show success message
                            donationPopup.style.display = 'block';
                            paymentSuccess.style.display = 'block';
                            donationForm.style.display = 'none';
                            
                            // Save donation record to Firebase if available
                            if (window.firebaseAuthReady) {
                                // Firebase database code would go here
                                console.log('Recording donation in Firebase');
                            }
                        } else {
                            // Show error message
                            alert('Payment verification failed: ' + (data.message || data.error || 'Unknown error'));
                        }
                        
                        // Clear transaction parameters from URL
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    })
                    .catch(error => {
                        console.error('Error verifying payment:', error);
                        
                        // Clear transaction parameters from URL
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    });
            }
        });
    }
    
    // Handle contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Thank you ${name}! Your message has been sent. We will get back to you soon.`);
            contactForm.reset();
        });
    }
});

// Initialize Hero Slideshow
function initHeroSlideshow() {
    // Set active slide initially
    goToHeroSlide(0);
    
    // Start slideshow
    startHeroSlideshow();
}

function startHeroSlideshow() {
    // Clear any existing interval
    if (heroSlideInterval) {
        clearInterval(heroSlideInterval);
    }
    
    // Set up interval for automatic sliding
    heroSlideInterval = setInterval(nextHeroSlide, 5000);
}

function nextHeroSlide() {
    goToHeroSlide((currentHeroSlide + 1) % heroSlides.length);
}

function goToHeroSlide(index) {
    // Hide all slides
    heroSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Show the target slide
    heroSlides[index].classList.add('active');
    
    // Update current slide index
    currentHeroSlide = index;
    
    // Update dots if they exist
    if (heroDots.length > 0) {
        heroDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    const bars = document.querySelectorAll('.bar');
    if (menuToggle.classList.contains('active')) {
        bars[0].style.transform = 'translateY(8px) rotate(45deg)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
});

// Close mobile menu when a regular link is clicked
document.querySelectorAll('.nav-links > li:not(.dropdown) > .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
            
            const bars = document.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = document.getElementById('navbar').offsetHeight;
            
            window.scrollTo({
                top: targetElement.offsetTop - navbarHeight,
                behavior: 'smooth'
            });
        }
    });
});

// Global AJAX loading indicator functions
function showAjaxLoader() {
    const loader = document.querySelector('.ajax-loader');
    if (!loader) {
        const newLoader = document.createElement('div');
        newLoader.className = 'ajax-loader';
        document.body.appendChild(newLoader);
        
        // Force reflow before adding active class
        newLoader.offsetWidth;
        
        setTimeout(() => {
            newLoader.classList.add('active');
        }, 10);
        
        return newLoader;
    }
    
    loader.classList.add('active');
    return loader;
}

function hideAjaxLoader() {
    const loader = document.querySelector('.ajax-loader');
    if (loader) {
        loader.classList.remove('active');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 300);
    }
}

// Page loading functions
function showPageLoading(message = 'Loading...') {
    const existingLoader = document.querySelector('.page-loading');
    
    if (existingLoader) {
        const textEl = existingLoader.querySelector('.page-loading-text');
        if (textEl) textEl.textContent = message;
        existingLoader.classList.add('active');
        return existingLoader;
    }
    
    const loader = document.createElement('div');
    loader.className = 'page-loading';
    loader.innerHTML = `
        <div class="page-spinner"></div>
        <div class="page-loading-text">${message}</div>
    `;
    
    document.body.appendChild(loader);
    
    // Force reflow before adding active class
    loader.offsetWidth;
    
    setTimeout(() => {
        loader.classList.add('active');
    }, 10);
    
    return loader;
}

function hidePageLoading() {
    const loader = document.querySelector('.page-loading');
    if (loader) {
        loader.classList.remove('active');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (loader && loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        }, 300);
    }
}

// Button loading state functions
function setButtonLoading(button, isLoading = true) {
    if (!button) return;
    
    if (isLoading) {
        button.classList.add('loading');
        
        // Save original text
        const btnText = button.innerHTML;
        button.setAttribute('data-original-text', btnText);
        
        // Create spinner and text container
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'btn-text';
        textSpan.innerHTML = btnText;
        
        button.innerHTML = '';
        button.appendChild(spinner);
        button.appendChild(textSpan);
    } else {
        button.classList.remove('loading');
        
        // Restore original text
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
            button.removeAttribute('data-original-text');
        }
    }
}

// Example of using AJAX with loader
function fetchWithLoading(url, options = {}) {
    showAjaxLoader();
    
    return fetch(url, options)
        .then(response => {
            hideAjaxLoader();
            return response;
        })
        .catch(error => {
            hideAjaxLoader();
            throw error;
        });
}

// Add event listeners to initialize loaders when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add the AJAX loader to the DOM
    const ajaxLoader = document.createElement('div');
    ajaxLoader.className = 'ajax-loader';
    document.body.appendChild(ajaxLoader);
    
    // Example intercepting all fetch requests to show loader
    const originalFetch = window.fetch;
    window.fetch = function() {
        showAjaxLoader();
        return originalFetch.apply(this, arguments)
            .then(response => {
                hideAjaxLoader();
                return response;
            })
            .catch(error => {
                hideAjaxLoader();
                throw error;
            });
    };
}); 