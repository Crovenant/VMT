from datetime import datetime, timezone
import json
from pathlib import Path

from core.views.common.utils import DATA_DIR

COMMENTS_DIR = DATA_DIR / "comments"
COMMENTS_DIR.mkdir(parents=True, exist_ok=True)


def _comments_file(view_kind):
    view_kind = str(view_kind).lower()
    return COMMENTS_DIR / f"{view_kind}_comments.json"


def load_comments(view_kind):
    path = _comments_file(view_kind)
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                return data
            return {}
    except Exception:
        return {}


def save_comments(view_kind, data):
    path = _comments_file(view_kind)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_comments_for(view_kind, numero):
    all_comments = load_comments(view_kind)
    return list(all_comments.get(str(numero), []))


def append_comment(view_kind, numero, text, author=None):
    numero = str(numero)
    all_comments = load_comments(view_kind)
    comments = list(all_comments.get(numero, []))

    next_id = 1
    if comments:
        try:
            next_id = max(int(c.get("id", 0) or 0) for c in comments) + 1
        except Exception:
            next_id = len(comments) + 1

    comment = {
        "id": next_id,
        "author": author or "system",
        "text": text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    comments.append(comment)
    all_comments[numero] = comments
    save_comments(view_kind, all_comments)
    return comments
