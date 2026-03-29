from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os

from app import models, schemas, auth
from app.database import engine, get_db, init_db, get_db_info
import logging

# Create database tables
init_db()

# Log database diagnostics (masked URL) so hosted logs show which DB is used
db_info = get_db_info()
masked = db_info.get("database_url_masked")
db_type = "PostgreSQL (Supabase)" if db_info.get("is_postgresql") else "SQLite (local)"
logging.basicConfig(level=logging.INFO)
logging.getLogger("uvicorn.error").info(f"Using database: {db_type}; URL: {masked}")

app = FastAPI(title="BookMarket API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/api/health")
def health_check():
    """Diagnostic endpoint to check DB connection status."""
    return {
        "status": "healthy",
        "database": get_db_info()
    }

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse("templates/index.html")

@app.get("/login", response_class=HTMLResponse)
async def login_page():
    return FileResponse("templates/login.html")

@app.get("/books", response_class=HTMLResponse)
async def books_page():
    return FileResponse("templates/books.html")

@app.get("/profile", response_class=HTMLResponse)
async def profile_page():
    return FileResponse("templates/profile.html")

@app.get("/payment", response_class=HTMLResponse)
async def payment_page():
    return FileResponse("templates/payment.html")

# Auth endpoints
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = auth.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(credentials: schemas.Login, db: Session = Depends(get_db)):
    username = credentials.username
    password = credentials.password
    
    user = auth.authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Book endpoints
@app.get("/api/books", response_model=List[schemas.BookResponse])
def get_books(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    books = db.query(models.Book).filter(models.Book.is_sold == False).offset(skip).limit(limit).all()
    return books

@app.get("/api/books/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.post("/api/books", response_model=schemas.BookResponse)
def create_book(book: schemas.BookCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_book = models.Book(**book.dict(), seller_id=current_user.id)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.put("/api/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book_update: schemas.BookUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    if db_book.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this book")
    
    update_data = book_update.dict(exclude_unset=True)
    if "is_sold" in update_data and update_data["is_sold"]:
        from datetime import datetime
        update_data["sold_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_book, field, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

@app.delete("/api/books/{book_id}")
def delete_book(book_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    if db_book.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this book")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}

# User profile endpoints
@app.get("/api/users/me/books", response_model=List[schemas.BookResponse])
def get_my_books(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    books = db.query(models.Book).filter(models.Book.seller_id == current_user.id).all()
    return books

@app.get("/wishlist", response_class=HTMLResponse)
async def wishlist_page():
    return FileResponse("templates/wishlist.html")
