# BookMarket - Second Hand Book Marketplace

A full-stack web application for buying and selling second-hand books at discounted prices.

## Live Demo

- **Deployed URL** (Render):  
  https://bookmarket-mayurroro.onrender.com/

All backend APIs and frontend pages (home, login, browse books, profile, payment) are served from this URL.
## Features

- **User Authentication**: Secure login and registration system
- **Book Listings**: Browse available books for sale
- **Book Management**: List your own books with details (title, author, price, condition, etc.)
- **User Profile**: View your listed books and their status (sold/available)
- **Discounted Pricing**: Display original and discounted prices
- **Modern UI**: Beautiful, responsive design

## Tech Stack

- **Backend**: Python with FastAPI
- **Database**: SQLite (SQL database)
- **Authentication**: JWT tokens
- **Frontend**: HTML, CSS, JavaScript
- **Database**: PostgreSQL (via Supabase) - SQLite for local development
- **Authentication**: JWT tokens (`python-jose`)
- **ORM**: SQLAlchemy
- **Frontend**: HTML, CSS, JavaScript (served via FastAPI templates)
- **Deployment**: Render (single service running FastAPI app)

## Installation

1. **Clone or navigate to the project directory**

2. **Create a virtual environment** (recommended):
```bash
python -m venv venv
```

3. **Activate the virtual environment**:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**:
```bash
pip install -r requirements.txt
```

## Running the Application

1. **Start the FastAPI server**:
```bash
uvicorn app.main:app --reload
```

2. **Open your browser** and navigate to:
```
http://localhost:8000
```

The application will automatically create the SQLite database (`bookmarket.db`) on first run.

## Supabase Integration (for Production/Hosting)

**Important**: SQLite data is lost when the server restarts on hosting platforms. To persist data in production:

## Project Structure

```
BookMarket/
├── app/                          # FastAPI application package
│   ├── __init__.py              # Package initialization
│   ├── main.py                  # FastAPI app, routes, and endpoints
│   ├── database.py              # Database configuration and session management
│   ├── models.py                # SQLAlchemy ORM models (User, Book)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── auth.py                  # Authentication utilities (JWT, bcrypt, password handling)
│   ├── config.py                # Configuration and environment variable management
│   └── app.py                   # ASGI entrypoint
│
├── templates/                    # HTML templates
│   ├── index.html               # Home page
│   ├── login.html               # Login/Registration page
│   ├── books.html               # Browse books page
│   ├── profile.html             # User profile page
│   └── payment.html             # Dummy payment page
│
├── static/                       # Static assets
│   ├── css/
│   │   └── style.css            # Main stylesheet
│   └── js/
│       └── app.js               # Frontend JavaScript (auth, API calls)
│
├── .env                         # Environment variables (NOT in git, local only)
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── requirements.txt             # Python dependencies
├── run.py                       # Helper script to run uvicorn with reload
├── render.yaml                  # Render deployment configuration
│
└── README.md                    # This file
```

### Directory Descriptions

**`app/`** - Core FastAPI application
- Contains all backend logic: models, routes, database configuration, and authentication
- `main.py` defines all API endpoints and serves HTML templates
- `database.py` handles connection pooling for PostgreSQL and SQLite
- `auth.py` manages JWT token generation and password hashing with bcrypt
- `config.py` loads environment variables and manages app configuration

**`templates/`** - Server-rendered HTML pages
- FastAPI serves these templates to the frontend
- Each page includes forms and interactions handled by `static/js/app.js`

**`static/`** - Client-side assets
- `style.css` provides responsive design for all pages
- `app.js` handles user authentication, API calls, and dynamic page updates

**Documentation files** - Setup and deployment guides
- `SUPABASE_SETUP.md` - Step-by-step Supabase account and database setup
- `RENDER_DEPLOYMENT.md` - Instructions for deploying to Render with persistent data
- `QUICK_START.md` - 5-minute quick reference
- `INTEGRATION_CHECKLIST.md` - Verification steps for database integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
- `GET /api/auth/me` - Get current user info (requires authentication)

### Books
- `GET /api/books` - Get all available books
- `GET /api/books/{book_id}` - Get a specific book
- `POST /api/books` - Create a new book listing (requires authentication)
- `PUT /api/books/{book_id}` - Update a book (requires authentication, owner only)
- `DELETE /api/books/{book_id}` - Delete a book (requires authentication, owner only)

### User Profile
- `GET /api/users/me/books` - Get current user's books (requires authentication)

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email
- `hashed_password`: Encrypted password
- `full_name`: User's full name
- `created_at`: Account creation timestamp

### Books Table
- `id`: Primary key
- `title`: Book title
- `author`: Book author
- `isbn`: International Standard Book Number (optional)
- `description`: Book description
- `price`: Selling price
- `original_price`: Original price (for discount calculation)
- `condition`: Book condition (New, Like New, Good, Fair, Poor)
- `category`: Book category
- `image_url`: Book cover image URL
- `is_sold`: Whether the book is sold
- `seller_id`: Foreign key to users table
- `created_at`: Listing creation timestamp
- `sold_at`: Sale timestamp (if sold)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Books**: View all available books on the books page
3. **List a Book**: Click "Add Book" to list your own book for sale
4. **Manage Your Books**: Go to your profile to see all your listed books
5. **Mark as Sold**: Update the status of your books when they're sold

