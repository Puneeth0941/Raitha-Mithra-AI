from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.utils.security import (
    hash_password,
    verify_password,
    get_current_user,
)
from app.utils.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ----------------------------------------
# Register API
# ----------------------------------------
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        phone=user.phone or "9845012345",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ----------------------------------------
# Login API
# ----------------------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    # User not found
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(
        user.password,
        existing_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": existing_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ----------------------------------------
# Current Logged-in User
# ----------------------------------------
@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user