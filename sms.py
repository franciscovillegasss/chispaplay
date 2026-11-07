"""Twilio Verify adapter. Provider messages and secrets stay on the server."""

import base64
import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class Unavailable(Exception):
    pass


class Rejected(Exception):
    pass


def request(endpoint, fields):
    api_key = os.environ.get("TWILIO_API_KEY", "")
    api_secret = os.environ.get("TWILIO_API_SECRET", "")
    service = os.environ.get("TWILIO_VERIFY_SERVICE_SID", "")
    if not re.fullmatch(r"SK[0-9a-fA-F]{32}", api_key) or not api_secret or not re.fullmatch(r"VA[0-9a-fA-F]{32}", service):
        raise Unavailable()
    basic = base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()
    req = Request(
        f"https://verify.twilio.com/v2/Services/{service}/{endpoint}",
        data=urlencode(fields).encode(),
        headers={"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urlopen(req, timeout=8) as response:
            return json.load(response)
    except HTTPError as error:
        if error.code in (400, 404, 429):
            raise Rejected() from None
        raise Unavailable() from None
    except (URLError, TimeoutError, ValueError):
        raise Unavailable() from None


def start(phone):
    result = request("Verifications", {"To": phone, "Channel": "sms", "Locale": "es"})
    sid = result.get("sid", "")
    if result.get("status") != "pending" or not re.fullmatch(r"VE[0-9a-fA-F]{32}", sid):
        raise Rejected()
    return sid


def check(verification_id, phone, code):
    result = request("VerificationCheck", {"VerificationSid": verification_id, "Code": code})
    return result.get("status") == "approved" and result.get("to") == phone
