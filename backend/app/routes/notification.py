from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.notification import Notification
from app.models.farm import Farm
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationCreate
from app.utils.security import get_current_user
from app.services.weather_service import WeatherService
from app.services.market_service import MarketService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def auto_generate_user_notifications(db: Session, user: User) -> List[Notification]:
    """
    Evaluates real weather, AI recommendation, and market data to dynamically generate
    notifications tailored to the user's farms and market trends.
    """
    generated = []

    # 1. Fetch User Farms
    farms = db.query(Farm).filter(Farm.user_id == user.id).all()
    cities = list(set([f.area for f in farms if f.area])) if farms else ["Thirthahalli"]

    # 2. Weather & AI Recommendations Notifications
    for city in cities[:2]:  # Check primary cities
        try:
            weather = WeatherService.get_current_weather(city)
            temp = weather.get("temperature", 28)
            humidity = weather.get("humidity", 60)
            cond = weather.get("weather", "").lower()
            wind = weather.get("wind_speed", 10)

            # Weather Alerts
            if "rain" in cond or "drizzle" in cond:
                n1 = Notification(
                    user_id=user.id,
                    title="🌧️ Heavy Rain Alert",
                    description=f"Precipitation detected in {city}. Heavy rain expected. Avoid pesticide spraying.",
                    category="Weather Alerts",
                    priority="High",
                    is_read=False
                )
                db.add(n1)
                generated.append(n1)
            elif temp > 32:
                n1 = Notification(
                    user_id=user.id,
                    title="☀️ High Temperature Detected",
                    description=f"Temperature reached {temp}°C in {city}. Additional crop irrigation may be required.",
                    category="Weather Alerts",
                    priority="High",
                    is_read=False
                )
                db.add(n1)
                generated.append(n1)

            if wind > 18:
                n2 = Notification(
                    user_id=user.id,
                    title="💨 Strong Winds Expected",
                    description=f"Wind speeds reaching {wind} km/h in {city}. Delay spraying activities.",
                    category="Weather Alerts",
                    priority="Medium",
                    is_read=False
                )
                db.add(n2)
                generated.append(n2)

            if humidity > 80:
                n3 = Notification(
                    user_id=user.id,
                    title="💧 High Humidity Alert",
                    description=f"Relative humidity is {humidity}% in {city}. Increased risk of fungal diseases.",
                    category="Weather Alerts",
                    priority="Medium",
                    is_read=False
                )
                db.add(n3)
                generated.append(n3)

            # AI Farming Recommendations
            if "clear" in cond or "sunny" in cond or "few clouds" in cond:
                n4 = Notification(
                    user_id=user.id,
                    title="🌾 Suitable Spraying Weather",
                    description=f"Clear conditions in {city}. Today is suitable for pesticide & fertilizer application.",
                    category="AI Farming Recommendations",
                    priority="Medium",
                    is_read=False
                )
                db.add(n4)
                generated.append(n4)

                n5 = Notification(
                    user_id=user.id,
                    title="☀️ Good Weather for Drying",
                    description=f"Favorable sunlight in {city}. Good weather for drying arecanut and crops.",
                    category="AI Farming Recommendations",
                    priority="Low",
                    is_read=False
                )
                db.add(n5)
                generated.append(n5)
        except Exception as e:
            print(f"Error fetching weather for notification generation: {e}")

    # 3. Market Intelligence Notifications
    try:
        live_markets = MarketService.get_live_prices()
        arecanut_info = live_markets.get("arecanut")
        coconut_info = live_markets.get("coconut")

        if arecanut_info:
            n_m1 = Notification(
                user_id=user.id,
                title="📈 Arecanut Market Intelligence",
                description=f"Arecanut price at ₹{arecanut_info['current_price']:,}/Quintal in {arecanut_info['market']}. AI suggests SELL based on peak trends.",
                category="Market Intelligence",
                priority="High",
                is_read=False
            )
            db.add(n_m1)
            generated.append(n_m1)

        if coconut_info:
            n_m2 = Notification(
                user_id=user.id,
                title="🥥 Coconut Price Update",
                description=f"Coconut price trading at ₹{coconut_info['current_price']:,} in {coconut_info['market']}. Best nearby market for selling today.",
                category="Market Intelligence",
                priority="Medium",
                is_read=False
            )
            db.add(n_m2)
            generated.append(n_m2)

    except Exception as e:
        print(f"Error fetching market for notification generation: {e}")

    db.commit()
    for item in generated:
        db.refresh(item)
    return generated


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    # Auto-generate notifications if user has none
    if not notifications:
        notifications = auto_generate_user_notifications(db, current_user)
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == current_user.id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    return notifications


@router.post("/generate", response_model=List[NotificationResponse])
def trigger_notification_generation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    auto_generate_user_notifications(db, current_user)
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)

    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}


@router.delete("/clear-all")
def clear_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete(synchronize_session=False)

    db.commit()
    return {"message": "All notifications cleared"}
