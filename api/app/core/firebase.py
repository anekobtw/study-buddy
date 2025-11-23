import json
import os
import base64
from typing import Optional

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore as admin_firestore

_firebase_initialized: bool = False
_firestore_client: Optional[admin_firestore.Client] = None


def initialize_firebase_from_env() -> bool:
    """Initialize Firebase Admin SDK, supporting multiple credential sources.

    Priority order:
      1) FIREBASE_CREDENTIALS env var:
         - raw JSON
         - base64-encoded JSON
         - filesystem path to JSON file
      2) GOOGLE_APPLICATION_CREDENTIALS env var (path)
      3) Application Default Credentials (ADC)

    Returns True if initialized (or already initialized), False otherwise.
    """
    global _firebase_initialized, _firestore_client

    # If already initialized, consider success
    try:
        firebase_admin.get_app()
        _firebase_initialized = True
        return True
    except ValueError:
        pass

    def try_initialize_with_cred(cred_obj) -> bool:
        global _firebase_initialized, _firestore_client
        try:
            firebase_admin.initialize_app(cred_obj)
            _firebase_initialized = True
            _firestore_client = None
            return True
        except Exception:
            _firebase_initialized = False
            _firestore_client = None
            return False

    # 1) FIREBASE_CREDENTIALS
    val = os.getenv("FIREBASE_CREDENTIALS")
    if val:
        v = val.strip()
        # raw JSON
        if v.startswith("{"):
            try:
                obj = json.loads(v)
                cred = credentials.Certificate(obj)
                if try_initialize_with_cred(cred):
                    return True
            except Exception:
                pass
        else:
            # base64 JSON?
            try:
                decoded = base64.b64decode(v).decode("utf-8")
                if decoded.strip().startswith("{"):
                    obj = json.loads(decoded)
                    cred = credentials.Certificate(obj)
                    if try_initialize_with_cred(cred):
                        return True
            except Exception:
                # not base64 JSON; treat as path
                pass
            # path
            try:
                cred = credentials.Certificate(v)
                if try_initialize_with_cred(cred):
                    return True
            except Exception:
                pass

    # 2) GOOGLE_APPLICATION_CREDENTIALS path
    gpath = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if gpath:
        try:
            cred = credentials.Certificate(gpath)
            if try_initialize_with_cred(cred):
                return True
        except Exception:
            pass

    # 3) Application Default Credentials
    try:
        cred = credentials.ApplicationDefault()
        if try_initialize_with_cred(cred):
            return True
    except Exception:
        pass

    # Failed all attempts
    _firebase_initialized = False
    _firestore_client = None
    return False


def is_firebase_initialized() -> bool:
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False


def get_firestore() -> Optional[admin_firestore.Client]:
    """Return a Firestore client if Firebase is initialized; otherwise None.

    Lazily creates and caches the Firestore client.
    """
    global _firestore_client
    if not is_firebase_initialized():
        return None
    if _firestore_client is None:
        try:
            _firestore_client = admin_firestore.client()
        except Exception:
            _firestore_client = None
    return _firestore_client


def is_firestore_available() -> bool:
    return get_firestore() is not None


# Convenience re-export for server timestamp constant
SERVER_TIMESTAMP = admin_firestore.SERVER_TIMESTAMP
