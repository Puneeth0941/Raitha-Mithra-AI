import os
import shutil
from datetime import datetime, date

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.bill import Bill
from app.models.user import User
from app.schemas.bill import BillResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/bill",
    tags=["Bill Management"]
)

UPLOAD_FOLDER = "uploads/bills"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "application/pdf"}


from app.models.farm import Farm


@router.post("/upload", response_model=BillResponse)
def upload_bill(
    farm_id: Optional[int] = Form(None),
    bill_type: str = Form("General"),
    bill_date: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="Please select a file to upload.")

    if farm_id:
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=403, detail="Access denied: Farm does not belong to user")

    # 1. Validate File Extension & Content Type
    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a JPG, JPEG, PNG, or PDF file."
        )

    # 2. Validate File Size
    image.file.seek(0, os.SEEK_END)
    file_size = image.file.tell()
    image.file.seek(0)  # Reset stream position

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size / (1024 * 1024):.2f} MB) exceeds the maximum limit of 5 MB."
        )

    # 3. Save File
    safe_filename = f"{int(datetime.now().timestamp())}_{image.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file on server: {str(e)}")

    # 4. Parse Bill Date
    parsed_date = None
    if bill_date:
        try:
            parsed_date = datetime.strptime(bill_date, "%Y-%m-%d").date()
        except ValueError:
            parsed_date = date.today()

    # 5. Create DB Record
    bill = Bill(
        user_id=current_user.id,
        farm_id=farm_id,
        bill_type=bill_type,
        image_url=file_path,
        date=parsed_date or date.today(),
        notes=notes
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    return bill


@router.get("/all", response_model=list[BillResponse])
def get_all_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    return db.query(Bill).filter(
        (Bill.user_id == current_user.id) | (Bill.farm_id.in_(user_farm_ids))
    ).order_by(Bill.uploaded_at.desc()).all()


@router.get("/all/{farm_id}", response_model=list[BillResponse])
def get_bills_by_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=403, detail="Access denied: Farm does not belong to user")

    return db.query(Bill).filter(
        Bill.farm_id == farm_id,
        (Bill.user_id == current_user.id) | (Bill.farm_id == farm_id)
    ).order_by(Bill.uploaded_at.desc()).all()


@router.get("/download/{bill_id}")
def download_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        (Bill.user_id == current_user.id) | (Bill.farm_id.in_(user_farm_ids))
    ).first()

    if not bill or not os.path.exists(bill.image_url):
        raise HTTPException(status_code=404, detail="Bill file not found or access denied")

    ext = os.path.splitext(bill.image_url)[1].lower()
    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=bill.image_url,
        filename=os.path.basename(bill.image_url),
        media_type=media_type
    )


@router.delete("/delete/{bill_id}")
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    bill = db.query(Bill).filter(
        Bill.id == bill_id,
        (Bill.user_id == current_user.id) | (Bill.farm_id.in_(user_farm_ids))
    ).first()

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Bill record not found or access denied"
        )

    if os.path.exists(bill.image_url):
        try:
            os.remove(bill.image_url)
        except Exception as e:
            print(f"Error deleting bill file: {e}")

    db.delete(bill)
    db.commit()

    return {
        "message": "Bill deleted successfully"
    }