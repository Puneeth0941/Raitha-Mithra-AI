from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.utils.security import hash_password, verify_password, get_current_user
from app.utils.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -----------------------------
# Register API
# -----------------------------
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        return existing_user

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        phone=user.phone or "9845012345"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -----------------------------
# Login API
# -----------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        # Seamlessly create user account on first login attempt
        user_name = user.email.split("@")[0].replace(".", " ").capitalize()
        existing_user = User(
            name=user_name or "Farmer User",
            email=user.email,
            password_hash=hash_password(user.password),
            phone="9845012345"
        )
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)
    else:
        if not verify_password(user.password, existing_user.password_hash):
            raise HTTPException(status_code=400, detail="Invalid email or password")

    # Generate JWT Token
    access_token = create_access_token(
        data={"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -----------------------------
# Get Current User Info API
# -----------------------------
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user