// Theme toggle system
function initThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    
    // Icon states
    const darkIcon = '☀️';
    const lightIcon = '🌔';
    
    // Set initial icon
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    btn.textContent = currentTheme === 'dark' ? darkIcon : lightIcon;

    btn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        btn.textContent = newTheme === 'dark' ? darkIcon : lightIcon;
    });
}
document.addEventListener('DOMContentLoaded', initThemeToggle);

function getSkeletonCardsHTML(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="book-card skeleton-card">
                <div class="skeleton-img skeleton"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title skeleton"></div>
                    <div class="skeleton-author skeleton"></div>
                    <div class="skeleton-text skeleton"></div>
                    <div class="skeleton-price skeleton"></div>
                    <div class="skeleton-btn skeleton"></div>
                </div>
            </div>
        `;
    }
    return html;
}

// Authentication helpers
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('loginLink');
    const profileLink = document.getElementById('profileLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const addBookBtn = document.getElementById('addBookBtn');

    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.addEventListener('click', logout);
        }
        if (addBookBtn) addBookBtn.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (addBookBtn) addBookBtn.style.display = 'none';
    }
}

// Load books
async function loadBooks() {
    const container = document.getElementById('booksContainer');
    const noBooksMsg = document.getElementById('noBooksMessage');

    if (!container) return;
    
    container.innerHTML = getSkeletonCardsHTML(6);
    if (noBooksMsg) noBooksMsg.style.display = 'none';

    try {
        const response = await fetch('/api/books');
        
        // Add a small artificial delay so the skeleton is actually visible
        await new Promise(resolve => setTimeout(resolve, 800));

        if (response.ok) {
            const books = await response.json();
            
            container.innerHTML = '';
            container.style.opacity = '0'; // Start invisible for fade-in

            if (books.length === 0) {
                if (noBooksMsg) noBooksMsg.style.display = 'block';
            } else {
                books.forEach(book => {
                    const card = createBookCard(book);
                    card.style.animationDelay = `${index * 0.1}s`;
                    container.appendChild(card);
                });
            }
            
            // Trigger fade-in
            requestAnimationFrame(() => {
                container.style.transition = 'opacity 0.5s ease';
                container.style.opacity = '1';
            });
        } else {
            container.innerHTML = '<p class="error-message">Failed to load books</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="error-message">An error occurred while fetching books</p>';
    }
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    
    const discountBadge = book.original_price && book.original_price > book.price ? 
        `<span class="discount-badge">${Math.round((1 - book.price/book.original_price) * 100)}% OFF</span>` : '';
    
    card.innerHTML = `
        ${discountBadge}
        <div class="book-image">
            ${book.image_url ? `<img src="${book.image_url}" alt="${book.title}">` : '<div class="book-placeholder">📖</div>'}
        </div>
        <div class="book-info">
            <h3>${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <p class="book-condition">Condition: ${book.condition}</p>
            ${book.category ? `<p class="book-category">${book.category}</p>` : ''}
            ${book.description ? `<p style="color: var(--text-light); font-size: 0.875rem; margin-top: 0.5rem;">${book.description.substring(0, 100)}${book.description.length > 100 ? '...' : ''}</p>` : ''}
            <div class="book-price">
                <span class="price">₹${book.price.toFixed(2)}</span>
                ${book.original_price ? `<span class="original-price">₹${book.original_price.toFixed(2)}</span>` : ''}
            </div>
            ${!book.is_sold ? `
            <div class="book-actions" style="margin-top: 1rem;">
                <button class="btn btn-primary btn-block" onclick="buyBook(${book.id})">Buy Now</button>
            </div>
            ` : `
            <div class="book-actions" style="margin-top: 1rem;">
                <button class="btn btn-block" disabled style="background: var(--text-light); cursor: not-allowed;">Sold Out</button>
            </div>
            `}
        </div>
    `;
    return card;
}

function buyBook(bookId) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        if (confirm('You need to login to buy a book. Redirect to login page?')) {
            window.location.href = '/login';
        }
        return;
    }
    
    // Redirect to payment page with book ID
    window.location.href = `/payment?bookId=${bookId}`;
}
