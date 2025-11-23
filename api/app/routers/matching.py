import random
from typing import Dict, List, Optional, Set, Tuple

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.firebase import SERVER_TIMESTAMP, get_firestore
from app.dependencies.auth import get_current_user_uid
from app.models.matching import (
    MatchModel,
    MatchesResponse,
    NextBatchResponse,
    NextBatchUser,
    SubmitSwipeRequest,
    SubmitSwipeResponse,
)


router = APIRouter(prefix="/api", tags=["matching"])


# ----------------------------
# Utility helpers
# ----------------------------


def _norm_time(val: Optional[str]) -> Optional[str]:
    """Normalize stored PreferredStudyTime to required format string.

    Accepts variants like 'morning', 'MORNING'. Returns one of
    'MORNING', 'AFTERNOON', 'EVENING' if recognizable; otherwise None.
    Note: if a value like 'night' appears, map it to 'EVENING'.
    """
    if not val or not isinstance(val, str):
        return None
    v = val.strip().upper()
    if v in {"MORNING", "AFTERNOON", "EVENING"}:
        return v
    if v == "NIGHT":
        return "EVENING"
    return None


def _read_user_profile(db, uid: str) -> Optional[Dict]:
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return None
    data = doc.to_dict() or {}
    # Support both capitalized keys (as stored by profile router) and lowercase from spec
    full_name = data.get("fullName") or data.get("FullName") or ""
    pref_time = data.get("preferredStudyTime") or data.get("PreferredStudyTime")
    classes = data.get("classes") or data.get("Classes") or {}
    # New fields with safe defaults
    major = data.get("major") or ""
    year = data.get("year") or "freshman"
    description = data.get("description") or ""

    return {
        "uid": uid,
        "fullName": full_name,
        "preferredStudyTime": _norm_time(pref_time) or "MORNING",  # default to MORNING if missing
        "classes": {k: int(v) for k, v in classes.items() if isinstance(v, (int, float, str))},
        # New fields
        "major": major,
        "year": year,
        "description": description,
    }


def calculate_complementarity(userA: Dict, userB: Dict) -> int:
    """Compute complementarity based on overlapping classes.

    For each overlapping class name:
      +2 if (a=0,b=2) or (a=2,b=0)
      +1 if both are 1
      +0 otherwise
    """
    a_classes: Dict[str, int] = userA.get("classes") or {}
    b_classes: Dict[str, int] = userB.get("classes") or {}
    score = 0
    for cls in set(a_classes.keys()) & set(b_classes.keys()):
        try:
            a = int(a_classes.get(cls))
            b = int(b_classes.get(cls))
        except Exception:
            continue
        if (a == 0 and b == 2) or (a == 2 and b == 0):
            score += 2
        elif a == 1 and b == 1:
            score += 1
        else:
            score += 0
    return score


def _match_id(uid1: str, uid2: str) -> str:
    a, b = sorted([uid1, uid2])
    return f"{a}_{b}"


def check_existing_match(db, uid: str, target_uid: str) -> Optional[MatchModel]:
    mid = _match_id(uid, target_uid)
    mref = db.collection("matches").document(mid).get()
    if not mref.exists:
        return None
    m = mref.to_dict() or {}
    return MatchModel(matchId=mid, userA=m.get("userA", ""), userB=m.get("userB", ""))


def create_match(db, uid: str, target_uid: str) -> MatchModel:
    """Create match doc if not existing and return it."""
    mid = _match_id(uid, target_uid)
    doc_ref = db.collection("matches").document(mid)
    snap = doc_ref.get()
    if not snap.exists:
        payload = {"userA": min(uid, target_uid), "userB": max(uid, target_uid), "createdAt": SERVER_TIMESTAMP}
        doc_ref.set(payload)
        return MatchModel(matchId=mid, userA=payload["userA"], userB=payload["userB"])
    data = snap.to_dict() or {}
    return MatchModel(matchId=mid, userA=data.get("userA", ""), userB=data.get("userB", ""))


def _get_user_swiped_set(db, uid: str) -> Set[str]:
    swipes_ref = db.collection("user_swipes").document(uid).collection("swipes").stream()
    return {doc.id for doc in swipes_ref}


def _get_matched_set(db, uid: str) -> Set[str]:
    # Firestore has no OR; do two queries
    a_q = db.collection("matches").where("userA", "==", uid).stream()
    b_q = db.collection("matches").where("userB", "==", uid).stream()
    others: Set[str] = set()
    for d in a_q:
        m = d.to_dict() or {}
        other = m.get("userB")
        if isinstance(other, str):
            others.add(other)
    for d in b_q:
        m = d.to_dict() or {}
        other = m.get("userA")
        if isinstance(other, str):
            others.add(other)
    return others


def get_unseen_users(db, uid: str) -> List[Dict]:
    """Return user profiles that are not the current user, not swiped by current user, and not matched."""
    swiped: Set[str] = _get_user_swiped_set(db, uid)
    matched: Set[str] = _get_matched_set(db, uid)

    profiles = []
    for doc in db.collection("users").stream():
        target_uid = doc.id
        if target_uid == uid:
            continue
        if target_uid in swiped:
            continue
        if target_uid in matched:
            continue
        norm = _read_user_profile(db, target_uid)
        if norm:
            profiles.append(norm)
    return profiles


@router.get("/next_batch", response_model=NextBatchResponse, summary="Fetch next batch of candidate users")
async def next_batch(uid: str = Depends(get_current_user_uid)) -> NextBatchResponse:
    db = get_firestore()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not initialized")

    me = _read_user_profile(db, uid)
    if me is None:
        # If user profile missing, treat as empty but still allow browsing
        me = {"uid": uid, "fullName": "", "preferredStudyTime": None, "classes": {}}

    unseen = get_unseen_users(db, uid)

    # Helper to score and filter by study time
    def filter_and_score(require_time_match: bool) -> List[Tuple[Dict, int]]:
        results: List[Tuple[Dict, int]] = []
        for p in unseen:
            if require_time_match:
                if _norm_time(me.get("preferredStudyTime")) and _norm_time(p.get("preferredStudyTime")):
                    if _norm_time(me.get("preferredStudyTime")) != _norm_time(p.get("preferredStudyTime")):
                        continue
                else:
                    # If either unknown, skip when requiring match
                    continue
            score = calculate_complementarity(me, p)
            if score >= 1:
                results.append((p, score))
        return results

    # Stage 1: require study time overlap
    scored = filter_and_score(require_time_match=True)
    # Stage 2: relax study time but keep complementarity >= 1
    if len(scored) < 20:
        extra = filter_and_score(require_time_match=False)
        # Merge keeping highest score per uid
        best: Dict[str, Tuple[Dict, int]] = {p["uid"]: (p, s) for p, s in scored}
        for p, s in extra:
            uidp = p["uid"]
            if uidp not in best or s > best[uidp][1]:
                best[uidp] = (p, s)
        scored = list(best.values())

    # Sort by score desc with slight randomization
    random.shuffle(scored)
    scored.sort(key=lambda ps: ps[1], reverse=True)

    candidates: List[Dict] = [p for p, _ in scored][:20]

    # If still <20, fill with random unseen users not already included
    if len(candidates) < 20:
        taken = {p["uid"] for p in candidates}
        remaining = [p for p in unseen if p["uid"] not in taken]
        random.shuffle(remaining)
        to_add = remaining[: max(0, 20 - len(candidates))]
        candidates.extend(to_add)

    batch = [
        NextBatchUser(
            uid=p["uid"],
            fullName=p.get("fullName", ""),
            preferredStudyTime=_norm_time(p.get("preferredStudyTime")) or "MORNING",
            classes=p.get("classes", {}),
            # New fields
            major=p.get("major", ""),
            year=p.get("year", "freshman"),
            description=p.get("description", ""),
        )
        for p in candidates
    ]
    return NextBatchResponse(batch=batch)


@router.post("/submit_swipe", response_model=SubmitSwipeResponse, summary="Submit a swipe for a target user")
async def submit_swipe(payload: SubmitSwipeRequest, uid: str = Depends(get_current_user_uid)) -> SubmitSwipeResponse:
    db = get_firestore()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not initialized")

    if payload.targetUid == uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot swipe on yourself")

    # Write the swipe
    try:
        swipe_ref = db.collection("user_swipes").document(uid).collection("swipes").document(payload.targetUid)
        swipe_ref.set({"direction": payload.direction, "timestamp": SERVER_TIMESTAMP})
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record swipe")

    match_model: Optional[MatchModel] = None

    if payload.direction == "right":
        # Check if target previously right-swiped current user
        try:
            reverse_ref = (
                db.collection("user_swipes").document(payload.targetUid).collection("swipes").document(uid).get()
            )
            if reverse_ref.exists:
                rd = reverse_ref.to_dict() or {}
                if rd.get("direction") == "right":
                    # Create match if missing
                    match_model = create_match(db, uid, payload.targetUid)
        except Exception:
            # If any error occurs, do not fail the swipe recording; just proceed without match
            match_model = None

    return SubmitSwipeResponse(match=match_model)


@router.get("/matches", response_model=MatchesResponse, summary="Get all matches for the current user")
async def get_matches(uid: str = Depends(get_current_user_uid)) -> MatchesResponse:
    db = get_firestore()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not initialized")

    results: List[MatchModel] = []
    try:
        a_q = db.collection("matches").where("userA", "==", uid).stream()
        b_q = db.collection("matches").where("userB", "==", uid).stream()
        for d in a_q:
            mid = d.id
            m = d.to_dict() or {}
            results.append(MatchModel(matchId=mid, userA=m.get("userA", ""), userB=m.get("userB", "")))
        for d in b_q:
            mid = d.id
            m = d.to_dict() or {}
            results.append(MatchModel(matchId=mid, userA=m.get("userA", ""), userB=m.get("userB", "")))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch matches")

    return MatchesResponse(matches=results)
