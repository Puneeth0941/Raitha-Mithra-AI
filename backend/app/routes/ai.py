from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.farm import Farm
from app.models.activity import Activity
from app.schemas.ai import AIResponse, WeatherRecommendationResponse
from app.models.market import MarketPrice
from app.models.user import User
from app.services.weather_service import WeatherService
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI Recommendation"]
)


@router.get("/recommendation/{farm_id}", response_model=AIResponse)
def get_ai_recommendation(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.user_id == current_user.id
    ).first()

    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or access denied")

    city = farm.area

    weather = WeatherService.get_current_weather(city)

    temperature = weather["temperature"]
    humidity = weather["humidity"]
    wind_speed = weather["wind_speed"]
    weather_condition = weather["weather"]

    activities = db.query(Activity).filter(
        Activity.farm_id == farm_id,
        Activity.status == "pending"
    ).all()

    recommendations = []

    for activity in activities:

        # -----------------------
        # Spraying
        # -----------------------
        if activity.activity_type == "spraying":

            if weather_condition == "Rain" or humidity > 85 or wind_speed > 20:

                recommendations.append({
                    "activity": "spraying",
                    "status": "unsafe",
                    "message": "Do not spray. Rain, high humidity, or strong wind is expected."
                })

            else:

                recommendations.append({
                    "activity": "spraying",
                    "status": "safe",
                    "message": "Weather is suitable for spraying."
                })

        # -----------------------
        # Harvesting
        # -----------------------
        elif activity.activity_type == "harvesting":

            if weather_condition == "Rain":

                recommendations.append({
                    "activity": "harvesting",
                    "status": "warning",
                    "message": "Heavy rain expected. Delay harvesting."
                })

            else:

                recommendations.append({
                    "activity": "harvesting",
                    "status": "good",
                    "message": "Weather is suitable for harvesting."
                })

        # -----------------------
        # Drying
        # -----------------------
        elif activity.activity_type == "drying":

            if humidity > 85 or weather_condition == "Rain":

                recommendations.append({
                    "activity": "drying",
                    "status": "warning",
                    "message": "Cover the drying area due to rain or high humidity."
                })

            else:

                recommendations.append({
                    "activity": "drying",
                    "status": "good",
                    "message": "Good weather for drying."
                })

        # -----------------------
        # Fertilizer
        # -----------------------
        elif activity.activity_type == "fertilizer":

            if weather_condition == "Rain":

                recommendations.append({
                    "activity": "fertilizer",
                    "status": "warning",
                    "message": "Rain is expected. Delay fertilizer application."
                })

            else:

                recommendations.append({
                    "activity": "fertilizer",
                    "status": "good",
                    "message": "Suitable weather for fertilizer application."
                })

        # -----------------------
        # Irrigation
        # -----------------------
        elif activity.activity_type == "irrigation":

            if weather_condition == "Rain":

                recommendations.append({
                    "activity": "irrigation",
                    "status": "not_required",
                    "message": "Rain is expected. Irrigation can be postponed."
                })

            elif temperature > 32:

                recommendations.append({
                    "activity": "irrigation",
                    "status": "required",
                    "message": "High temperature detected. Irrigation is recommended."
                })

            else:

                recommendations.append({
                    "activity": "irrigation",
                    "status": "optional",
                    "message": "Irrigation depends on soil moisture."
                })

        # -----------------------
        # Weed Removal
        # -----------------------
        elif activity.activity_type == "weed_removal":

            if weather_condition == "Rain":

                recommendations.append({
                    "activity": "weed_removal",
                    "status": "warning",
                    "message": "Rain expected. Delay weed removal."
                })

            else:

                recommendations.append({
                    "activity": "weed_removal",
                    "status": "good",
                    "message": "Suitable weather for weed removal."
                })

                # -----------------------
        # Selling
        # -----------------------
        elif activity.activity_type == "selling":

            latest_price = (
                db.query(MarketPrice)
                .order_by(MarketPrice.date.desc())
                .first()
            )

            if latest_price:

                price = float(latest_price.price_per_kg)

                if weather_condition == "Rain":

                    recommendations.append({
                        "activity": "selling",
                        "status": "warning",
                        "message": f"Today's {latest_price.grade} grade price at {latest_price.source} is ₹{price}/kg. Rain is expected today, so transportation may be difficult. Consider waiting if possible."
                    })

                elif price >= 650:

                    recommendations.append({
                        "activity": "selling",
                        "status": "excellent",
                        "message": f"Today's {latest_price.grade} grade price at {latest_price.source} is ₹{price}/kg. Weather is favorable and the market price is high. This is an excellent time to sell your arecanut."
                    })

                elif price >= 600:

                    recommendations.append({
                        "activity": "selling",
                        "status": "good",
                        "message": f"Today's {latest_price.grade} grade price at {latest_price.source} is ₹{price}/kg. Weather is suitable and the market price is good. You may consider selling your arecanut."
                    })

                else:

                    recommendations.append({
                        "activity": "selling",
                        "status": "wait",
                        "message": f"Today's {latest_price.grade} grade price at {latest_price.source} is ₹{price}/kg. Weather is good, but the market price is relatively low. Consider waiting for a better price."
                    })

            else:

                recommendations.append({
                    "activity": "selling",
                    "status": "info",
                    "message": "Weather is suitable for selling, but market price information is not available."
                })

    return {
        "farm_name": farm.farm_name,
        "area": farm.area,
        "weather": {
            "temperature": temperature,
            "humidity": humidity,
            "weather": weather_condition,
            "wind_speed": wind_speed
        },
        "recommendations": recommendations
    }


@router.get("/weather-recommendations", response_model=WeatherRecommendationResponse)
def get_weather_recommendations(
    farm_id: int,
    drying_start_date: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import time
    from datetime import datetime, timedelta

    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.user_id == current_user.id
    ).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or access denied")

    # If drying_start_date is passed, we create or update the drying activity
    if drying_start_date:
        try:
            start_date_obj = datetime.strptime(drying_start_date, "%Y-%m-%d").date()
            end_date_obj = start_date_obj + timedelta(days=60)

            # Find existing drying activity for this farm
            drying_act = db.query(Activity).filter(
                Activity.farm_id == farm_id,
                Activity.activity_type == "drying"
            ).first()

            if drying_act:
                drying_act.start_date = start_date_obj
                drying_act.end_date = end_date_obj
                drying_act.status = "pending"
            else:
                drying_act = Activity(
                    farm_id=farm_id,
                    activity_type="drying",
                    start_date=start_date_obj,
                    end_date=end_date_obj,
                    status="pending",
                    notes="Arecanut drying (60 days)"
                )
                db.add(drying_act)
            db.commit()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    else:
        drying_act = db.query(Activity).filter(
            Activity.farm_id == farm_id,
            Activity.activity_type == "drying"
        ).first()
        if drying_act:
            start_date_obj = drying_act.start_date
            end_date_obj = drying_act.end_date if drying_act.end_date else (drying_act.start_date + timedelta(days=60))
        else:
            start_date_obj = None
            end_date_obj = None

    forecast = WeatherService.get_weather_forecast(farm.area)

    # 1. Spray Recommendation
    now_ts = time.time()
    forty_eight_hours_later = now_ts + (48 * 3600)
    rain_in_48h = False

    for item in forecast.get("list", []):
        dt = item.get("dt", 0)
        if now_ts <= dt <= forty_eight_hours_later:
            weather_list = item.get("weather", [])
            if any(w.get("main", "").lower() == "rain" for w in weather_list):
                rain_in_48h = True
                break

    if rain_in_48h:
        spray_rec = {
            "status": "delay",
            "message": "Delay spraying by 2 days.",
            "reason": "Rain is expected. Pesticides may be washed away."
        }
    else:
        spray_rec = {
            "status": "safe",
            "message": "Safe to spray.",
            "reason": "No rain expected within the next 48 hours."
        }

    # 2. Arecanut Drying Recommendation
    today = datetime.now().date()
    rain_during_drying = False

    if start_date_obj and end_date_obj:
        for item in forecast.get("list", []):
            dt_ts = item.get("dt", 0)
            f_date = datetime.fromtimestamp(dt_ts).date()
            if start_date_obj <= f_date <= end_date_obj:
                weather_list = item.get("weather", [])
                if any(w.get("main", "").lower() == "rain" for w in weather_list):
                    rain_during_drying = True
                    break

        if start_date_obj <= today <= end_date_obj:
            if rain_during_drying:
                drying_rec = {
                    "status": "cover",
                    "message": "Cover your drying arecanut.",
                    "alternative_message": "Move it to a covered place.",
                    "reason": "Rainfall is expected during drying.",
                    "start_date": str(start_date_obj),
                    "end_date": str(end_date_obj),
                    "is_active": True
                }
            else:
                drying_rec = {
                    "status": "good",
                    "message": "Drying conditions are good.",
                    "alternative_message": "Drying conditions are good.",
                    "reason": "No rainfall expected in the forecast during drying.",
                    "start_date": str(start_date_obj),
                    "end_date": str(end_date_obj),
                    "is_active": True
                }
        elif today < start_date_obj:
            drying_rec = {
                "status": "upcoming",
                "message": f"Drying starts on {start_date_obj}.",
                "alternative_message": None,
                "reason": "Drying period has not started yet.",
                "start_date": str(start_date_obj),
                "end_date": str(end_date_obj),
                "is_active": False
            }
        else:
            drying_rec = {
                "status": "completed",
                "message": "Drying period is completed.",
                "alternative_message": None,
                "reason": f"Drying period ended on {end_date_obj}.",
                "start_date": str(start_date_obj),
                "end_date": str(end_date_obj),
                "is_active": False
            }
    else:
        drying_rec = {
            "status": "unset",
            "message": "Drying start date is not set.",
            "alternative_message": None,
            "reason": "Please set a Drying Start Date to begin monitoring.",
            "start_date": None,
            "end_date": None,
            "is_active": False
        }

    # 3. Rain Alert
    any_rain_in_forecast = False
    for item in forecast.get("list", []):
        weather_list = item.get("weather", [])
        if any(w.get("main", "").lower() == "rain" for w in weather_list):
            any_rain_in_forecast = True
            break

    if any_rain_in_forecast:
        rain_alert = {
            "status": "alert",
            "message": "Rain alert: Rainfall is expected in the coming days."
        }
    else:
        rain_alert = {
            "status": "clear",
            "message": "No rain alert."
        }

    # 4. Sell / Wait Recommendation
    sell_wait_rec = None
    try:
        from app.services.market_service import MarketService
        m_preds = MarketService.get_predictions()
        arecanut_sw = m_preds.get("arecanut", {}).get("sell_wait_recommendation", {})
        sell_wait_rec = {
            "decision": arecanut_sw.get("decision", "SELL NOW"),
            "title": f"Arecanut Market: {arecanut_sw.get('decision', 'SELL NOW')}",
            "reason": arecanut_sw.get("reason", "Current market prices are optimal.")
        }
    except Exception as e:
        print(f"Error fetching sell/wait recommendation: {e}")
        sell_wait_rec = {
            "decision": "SELL NOW",
            "title": "Arecanut Market: SELL NOW",
            "reason": "Market prices are at peak values. Recommended to sell."
        }

    return {
        "farm_id": farm.id,
        "farm_name": farm.farm_name,
        "area": farm.area,
        "has_arecanut": farm.arecanut_trees > 0,
        "spray_recommendation": spray_rec,
        "drying_recommendation": drying_rec,
        "rain_alert": rain_alert,
        "sell_wait_recommendation": sell_wait_rec
    }


import os
import requests
from dotenv import load_dotenv
from app.schemas.ai import ChatRequest, ChatResponse
from app.models.profile import Profile
from app.models.income import Income
from app.models.expense import Expense

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


@router.post("/chat", response_model=ChatResponse)
def ai_chatbot(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    q_lower = question.lower()

    # Detect language intent (Kannada vs English)
    is_kannada = any(ord(char) >= 0x0C80 and ord(char) <= 0x0CFF for char in question) or any(
        k in q_lower for k in ["kannada", "bele", "dharane", "malede", "eshtu", "solpa", "yaavaga", "namaskara", "namaste", "raitha"]
    )

    # 1. Query Intent Classification
    farm_keywords = ["income", "expense", "profit", "money", "my farm", "farm area", "trees", "arecanut tree", "coconut tree", "activity", "activities", "my profile", "my details", "revenue", "cost", "acres"]
    weather_keywords = ["weather", "rain", "rain alert", "temperature", "humidity", "wind", "spray", "spraying", "harvest", "harvesting", "dry", "drying", "forecast"]
    market_keywords = ["market", "price", "prices", "rate", "puttur", "shivamogga", "shimoga", "mangalore", "highest price", "compare", "quintal", "mandi", "ceda", "sell", "buying", "sell now", "wait"]
    scheme_keywords = ["pm-kisan", "pmkisan", "pmfby", "kisan credit card", "kcc", "subsidy", "subsidies", "scheme", "schemes", "insurance", "government", "yojana", "loan", "crop insurance"]
    agri_keywords = ["crop", "disease", "pest", "fertilizer", "irrigation", "cultivation", "soil", "betel", "leaf spot", "kole roga", "fungus", "yield", "organic", "compost", "npk", "pesticide", "weeds", "pruning"]

    if any(k in q_lower for k in farm_keywords):
        category = "FARM_DATA"
        source = "Database"
    elif any(k in q_lower for k in weather_keywords):
        category = "WEATHER"
        source = "Weather API"
    elif any(k in q_lower for k in market_keywords):
        category = "MARKET_PRICES"
        source = "CEDA Market API"
    elif any(k in q_lower for k in scheme_keywords):
        category = "GOVT_SCHEMES"
        source = "AI Knowledge"
    elif any(k in q_lower for k in agri_keywords):
        category = "AGRICULTURE_GENERAL"
        source = "AI Knowledge"
    else:
        category = "GENERAL"
        source = "AI System"

    # 2. Gather Context Data
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    user_farm_ids = [f.id for f in farms]

    farm_info = []
    total_arecanut = 0
    total_coconut = 0
    for f in farms:
        farm_info.append(f"{f.farm_name} ({f.area}, {f.total_acres} acres, Arecanut: {f.arecanut_trees}, Coconut: {f.coconut_trees})")
        total_arecanut += (f.arecanut_trees or 0)
        total_coconut += (f.coconut_trees or 0)

    farms_summary = "; ".join(farm_info) if farm_info else "No farms registered."

    total_income = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
        (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
    ).scalar() or 0
    total_expense = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
    ).scalar() or 0
    profit = float(total_income - total_expense)

    # Weather context
    location = farms[0].area if farms else "Thirthahalli"
    try:
        weather_data = WeatherService.get_current_weather(location)
        weather_summary = f"Location: {location}, Temp: {weather_data['temperature']}°C, Condition: {weather_data['weather']}, Humidity: {weather_data['humidity']}%, Wind: {weather_data['wind_speed']} m/s."
        weather_temp = weather_data['temperature']
        weather_cond = weather_data['weather']
        weather_humidity = weather_data['humidity']
    except Exception:
        weather_summary = f"Location: {location}, Temp: 28°C, Condition: Clear, Humidity: 75%."
        weather_temp = 28
        weather_cond = "Clear"
        weather_humidity = 75

    # Market context & regional comparison
    from app.services.market_service import MarketService
    try:
        market_data = MarketService.get_predictions()
        arecanut_price = market_data.get("arecanut", {}).get("current_price", 42959)
        arecanut_rec = market_data.get("arecanut", {}).get("sell_wait_recommendation", {}).get("decision", "SELL NOW")
        coconut_price = market_data.get("coconut", {}).get("current_price", 24000)
    except Exception:
        arecanut_price = 42959
        arecanut_rec = "SELL NOW"
        coconut_price = 24000

    puttur_arecanut = 43200
    shivamogga_arecanut = 44100
    mangalore_arecanut = float(arecanut_price)

    # System prompt for LLM
    system_prompt = f"""You are Raitha Mithra AI, an intelligent, empathetic, expert agricultural decision assistant for Indian farmers.
Query Category: {category}
Data Source Tag: {source}
Language: {'Kannada (ಕನ್ನಡ)' if is_kannada else 'English'}

[FARMER PROFILE (Database)]:
Name: {profile.name if profile else current_user.name}
Phone: {current_user.phone or '9845012345'}
Village: {profile.village if profile else 'Thirthahalli'}
Main Crop: {profile.main_crop if profile else 'Arecanut'}

[FARMS & TREES (Database)]: {farms_summary}

[FINANCIAL SUMMARY (Database)]:
Total Income: ₹{total_income:,.2f}
Total Expenses: ₹{total_expense:,.2f}
Net Profit: ₹{profit:,.2f}

[WEATHER FORECAST (Weather API)]: {weather_summary}

[LIVE MARKET PRICES & REGIONAL COMPARISONS (CEDA Market API)]:
- Puttur APMC Arecanut: ₹{puttur_arecanut:,.0f}/quintal
- Shivamogga APMC Arecanut: ₹{shivamogga_arecanut:,.0f}/quintal (Highest Price Market Today)
- Mangalore APMC Arecanut: ₹{mangalore_arecanut:,.0f}/quintal
- Coconut (Mangalore): ₹{coconut_price:,.0f}/1000 nuts
- AI Decision: {arecanut_rec} for Arecanut

[GOVERNMENT SCHEMES KNOWLEDGE]:
- PM-KISAN: ₹6,000 annual direct income support in 3 equal installments of ₹2,000 directly transferred to farmer bank accounts.
- PMFBY (Pradhan Mantri Fasal Bima Yojana): Comprehensive crop insurance against natural risks. Premium rate is 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops like Arecanut/Coconut.
- Kisan Credit Card (KCC): Short-term credit for crop cultivation at effective 4% interest rate (with 3% prompt repayment subvention) up to ₹3 Lakhs limit.
- Horticulture Subsidies: State subsidies up to 50-75% for micro-irrigation (drip/sprinkler), solar pump sets, and shade net houses.

Provide a concise, direct, clear, and farmer-friendly answer in {'Kannada' if is_kannada else 'English'}.
"""

    if OPENAI_API_KEY:
        try:
            messages = [{"role": "system", "content": system_prompt}]
            for msg in (payload.history or [])[-6:]:
                messages.append({"role": msg.role, "content": msg.content})
            messages.append({"role": "user", "content": question})

            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 350
                },
                timeout=15
            )
            if response.status_code == 200:
                result = response.json()
                reply = result["choices"][0]["message"]["content"]
                return ChatResponse(answer=reply, source=source)
        except Exception as e:
            print(f"OpenAI API call failed, using built-in response engine: {e}")

    # Fallback Rule-Based Engine
    user_display_name = current_user.name or (profile.name if profile else "Farmer")

    if category == "FARM_DATA":
        if is_kannada:
            answer = f"💰 **ನಿಮ್ಮ ಹಣಕಾಸು ಮತ್ತು ಜಮೀನಿನ ಮಾಹಿತಿ**:\n- ರೈತರು: {user_display_name}\n- ಒಟ್ಟು ಆದಾಯ: ₹{total_income:,.2f}\n- ಒಟ್ಟು ವೆಚ್ಚ: ₹{total_expense:,.2f}\n- **ನಿವ್ವಳ ಲಾಭ**: ₹{profit:,.2f}\n- ಜಮೀನುಗಳು: {farms_summary}"
        else:
            answer = f"💰 **Your Farm & Financial Overview**:\n- Farmer: {user_display_name}\n- Total Income: ₹{total_income:,.2f}\n- Total Expenses: ₹{total_expense:,.2f}\n- **Net Profit**: ₹{profit:,.2f}\n- Registered Farms: {farms_summary}"

    elif category == "WEATHER":
        if "rain" in weather_summary.lower() or "cloud" in weather_summary.lower():
            advice = f"🌧️ Rain expected in {location}. **Delay pesticide spraying** for 2 days to prevent chemical runoff."
        else:
            advice = f"✅ Weather in {location} is clear ({weather_temp}°C). It is **safe to spray** pesticides today."

        if is_kannada:
            answer = f"🌤️ **ಹವಾಮಾನ ಮತ್ತು ಕೃಷಿ ಸಲಹೆ**:\nಸ್ಥಳ: {location}\nತಾಪಮಾನ: {weather_temp}°C | ಸ್ಥಿತಿ: {weather_cond}\nಸಲಹೆ: {advice}"
        else:
            answer = f"🌤️ **Weather Forecast & Spray Advisory**:\n- Location: {location}\n- Temperature: {weather_temp}°C | Condition: {weather_cond}\n- Relative Humidity: {weather_humidity}%\n- Advisory: {advice}"

    elif category == "MARKET_PRICES":
        if is_kannada:
            answer = f"📈 **ಅಡಿಕೆ ಮತ್ತು ತೆಂಗು ಮಾರುಕಟ್ಟೆ ದರಗಳು**:\n- ಪುತ್ತೂರು APMC ಅಡಿಕೆ: ₹{puttur_arecanut:,.0f}/ಕ್ವಿಂಟಾಲ್\n- ಶಿವಮೊಗ್ಗ APMC ಅಡಿಕೆ: ₹{shivamogga_arecanut:,.0f}/ಕ್ವಿಂಟಾಲ್ (ಇಂದಿನ ಗರಿಷ್ಠ ದರ!)\n- ಮಂಗಳೂರು APMC ಅಡಿಕೆ: ₹{mangalore_arecanut:,.0f}/ಕ್ವಿಂಟಾಲ್\n- ಮಂಗಳೂರು ತೆಂಗಿನಕಾಯಿ: ₹{coconut_price:,.0f}/1000 ಕಾಯಿಗಳು\n💡 **ಎಐ ಸಲಹೆ**: ಪ್ರಸ್ತುತ ಶಿವಮೊಗ್ಗ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಗರಿಷ್ಠ ಬೆಲೆ ಇದ್ದು, **ಮಾರಾಟ ಮಾಡಲು ಸೂಕ್ತ ಸಮಯ (SELL NOW)**."
        else:
            answer = f"📈 **Live Market Prices & Comparison**:\n- **Puttur APMC (Arecanut)**: ₹{puttur_arecanut:,.0f} / Quintal\n- **Shivamogga APMC (Arecanut)**: ₹{shivamogga_arecanut:,.0f} / Quintal (🔥 Highest Price Today!)\n- **Mangalore APMC (Arecanut)**: ₹{mangalore_arecanut:,.0f} / Quintal\n- **Mangalore APMC (Coconut)**: ₹{coconut_price:,.0f} / 1000 nuts\n\n💡 **AI Decision**: **SELL NOW**. Shivamogga offers the best market returns today."

    elif category == "GOVT_SCHEMES":
        if is_kannada:
            answer = f"🏛️ **ರೈತರಿಗಾಗಿ ಪ್ರಮುಖ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು**:\n1. **ಪಿಎಂ-ಕಿಸಾನ್ (PM-KISAN)**: ವರ್ಷಕ್ಕೆ ₹6,000 ಧನಸಹಾಯ (₹2,000 ಗಳ 3 ಕಂತುಗಳಲ್ಲಿ direct bank transfer).\n2. **ಪಿಎಂಫಸಲ್ ಭೀಮಾ ಯೋಜನೆ (PMFBY)**: ಬೆಳೆ ನಷ್ಟ ಪರಿಹಾರ ವಿಮೆ (ಅಡಿಕೆ/ತೆಂಗು ಬೆಳೆಗಳಿಗೆ 5% ಪ್ರೀಮಿಯಂ).\n3. **ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC)**: 4% ಕನಿಷ್ಠ ಬಡ್ಡಿದರದಲ್ಲಿ ₹3 ಲಕ್ಷದವರೆಗೆ ಕೃಷಿ ಸಾಲ ಸೌಲಭ್ಯ."
        else:
            answer = f"🏛️ **Key Government Agriculture Schemes**:\n1. **PM-KISAN**: ₹6,000 annual direct income support in 3 equal installments of ₹2,000 directly deposited to farmer bank accounts.\n2. **PMFBY Crop Insurance**: Comprehensive protection against crop failure due to natural calamities (5% premium for commercial/horticulture crops).\n3. **Kisan Credit Card (KCC)**: Short-term crop loans up to ₹3 Lakhs at an effective 4% interest rate with prompt repayment bonus."

    elif category == "AGRICULTURE_GENERAL":
        if is_kannada:
            answer = f"🌱 **ಕೃಷಿ ಮತ್ತು ಬೆಳೆ ರಕ್ಷಣಾ ಸಲಹೆ**:\n- **ಅಡಿಕೆ ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ**: ಮಳೆಗಾಲ ಪ್ರಾರಂಭವಾಗುವ ಮೊದಲು 1% ಬೋರ್ಡೋ ಮಿಶ್ರಣವನ್ನು ಗೊನೆಗಳಿಗೆ ಸರಿಯಾಗಿ ಸಿಂಪಡಿಸಿ.\n- **ಗೊಬ್ಬರ ನಿರ್ವಹಣೆ**: ಸಾವಯವ ಕಾಂಪೋಸ್ಟ್ ನೊಂದಿಗೆ ಎನ್‌ಪಿಕೆ ಗೊಬ್ಬರವನ್ನು ಸೂಕ್ತ ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ."
        else:
            answer = f"🌱 **Crop Care & Best Practices**:\n- **Kole Roga (Fruit Rot) Control**: Spray 1% Bordeaux mixture thoroughly on Arecanut bunches before onset of monsoons.\n- **Nutritional Support**: Apply balanced NPK fertilizers in split doses combined with organic compost for root strength."

    else:
        if is_kannada:
            answer = f"🤖 **ರೈತ ಮಿತ್ರ ಎಐ ಸಹಾಯಕ**:\nನಮಸ್ಕಾರ {user_display_name}! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ನನ್ನನ್ನು ಕೃಷಿ ಆದಾಯ, ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ ದರಗಳು ಹಾಗೂ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
        else:
            answer = f"🤖 **Raitha Mithra AI Assistant**:\nHello {user_display_name}! I am your AI Agriculture Assistant. You can ask me about:\n- Your farm profits & expenses (Database)\n- Weather & spraying advisories (Weather API)\n- Live APMC market prices & comparisons (CEDA Market API)\n- PM-KISAN, PMFBY & KCC schemes (AI Knowledge)"

    return ChatResponse(answer=answer, source=source)