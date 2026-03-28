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
    const loadingMsg = document.getElementById('loadingMessage');
    const noBooksMsg = document.getElementById('noBooksMessage');

    if (!container) return;

    if (loadingMsg) loadingMsg.style.display = 'block';
    if (noBooksMsg) noBooksMsg.style.display = 'none';
    container.innerHTML = '';

    try {
        const response = await fetch('/api/books');
        if (response.ok) {
            const books = await response.json();
            
            if (loadingMsg) loadingMsg.style.display = 'none';

            if (books.length === 0) {
                if (noBooksMsg) noBooksMsg.style.display = 'block';
            } else {
                books.forEach(book => {
                    container.appendChild(createBookCard(book));
                });
            }
        } else {
            if (loadingMsg) loadingMsg.style.display = 'none';
            container.innerHTML = '<p class="error-message">Failed to load books</p>';
        }
    } catch (error) {
        if (loadingMsg) loadingMsg.style.display = 'none';
        container.innerHTML = '<p class="error-message">An error occurred</p>';
    }
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col';

    const discountBadge = book.original_price && book.original_price > book.price 
        ? `<span class="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ${Math.round((1 - book.price/book.original_price) * 100)}% OFF
           </span>` 
        : '';

    card.innerHTML = `
        <div class="relative">
            ${discountBadge}
            ${
                book.image_url 
                ? `<img src="${book.image_url}" alt="${book.title}" class="w-full h-48 object-cover">`
                : `<div class="w-full h-48 flex items-center justify-center bg-gray-100 text-3xl">📖</div>`
            }
        </div>

        <div class="p-4 flex flex-col flex-grow">
            <h3 class="font-bold text-lg text-gray-800 line-clamp-1">${book.title}</h3>
            <p class="text-sm text-gray-500 mb-1">by ${book.author}</p>

            <span class="text-xs px-2 py-1 rounded-full w-fit mb-2
                ${book.condition === 'New' ? 'bg-green-100 text-green-700' : 
                  book.condition === 'Like New' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'}">
                ${book.condition}
            </span>

            ${book.category ? `<p class="text-xs text-gray-400 mb-2">${book.category}</p>` : ''}

            ${book.description 
                ? `<p class="text-sm text-gray-500 mb-3">
                    ${book.description.substring(0, 80)}${book.description.length > 80 ? '...' : ''}
                  </p>` 
                : ''}

            <div class="mt-auto">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-lg font-bold text-gray-900">₹${book.price.toFixed(2)}</span>
                    ${book.original_price 
                        ? `<span class="text-sm line-through text-gray-400">₹${book.original_price.toFixed(2)}</span>` 
                        : ''}
                </div>

                ${
                    !book.is_sold
                    ? `<button 
                        class="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
                        onclick="buyBook(${book.id})">
                        Buy Now
                       </button>`
                    : `<button 
                        class="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed" disabled>
                        Sold Out
                       </button>`
                }
            </div>
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
