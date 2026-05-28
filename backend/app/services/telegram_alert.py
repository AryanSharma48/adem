import requests
from datetime import datetime, timedelta
from app.core.config import settings

def send_alert(pm25_predicted: float, primary_source: str, timestamp: str):
    """
    Sends a MarkdownV2 formatted alert to Telegram when predicted PM2.5 exceeds WHO limits.
    """
    try:
        # MarkdownV2 requires escaping certain characters like `.`, `-`, `!`, etc.
        def escape_md2(text: str) -> str:
            chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
            for c in chars:
                text = text.replace(c, f"\\{c}")
            return text
            
        # Parse the raw UTC timestamp, convert to Astana time (UTC+5), and add 1 hour for the forecast peak
        try:
            dt = datetime.fromisoformat(timestamp)
            spike_time = dt + timedelta(hours=5) + timedelta(hours=1)
            formatted_time = spike_time.strftime("%d %b %Y, %H:%M (Astana Time)")
        except Exception:
            formatted_time = timestamp[:19] # Fallback
            
        location = escape_md2("Astana, KZ")
        safe_time = escape_md2(formatted_time)
        safe_pm25 = escape_md2(f"{pm25_predicted:.2f}")
        safe_source = escape_md2(primary_source.capitalize())

        message = (
            "⚠️ *ADEM Critical Alert* ⚠️\n\n"
            f"📍 *Location:* {location}\n"
            f"🕒 *Expected Spike:* {safe_time}\n"
            f"😷 *Predicted PM2\\.5:* {safe_pm25} µg/m³\n"
            f"🚨 *Primary Driver:* {safe_source}\n"
            "_Air quality is projected to breach WHO safe limits \\(50 µg/m³\\) within the next hour\\. Please take necessary precautions\\._\n\n"
            "➖➖➖➖➖➖➖➖➖➖\n\n"
            "⚠️ *ADEM Қауіпті Ескертуі* ⚠️\n\n"
            f"📍 *Орналасқан жері:* {location}\n"
            f"🕒 *Күтілетін шарықтау шегі:* {safe_time}\n"
            f"😷 *Болжанған PM2\\.5:* {safe_pm25} µg/m³\n"
            f"🚨 *Негізгі себеп:* {safe_source}\n"
            "_Ауа сапасы алдағы бір сағат ішінде ДДҰ қауіпсіздік шегінен \\(50 µg/m³\\) асады деп күтілуде\\. Қажетті сақтық шараларын қолданыңыз\\._"
        )

        payload = {
            "chat_id": settings.TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "MarkdownV2"
        }

        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        print(f"Telegram alert sent successfully for PM2.5 = {pm25_predicted:.2f}")
        
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")
