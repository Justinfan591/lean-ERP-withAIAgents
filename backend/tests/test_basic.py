import requests

BASE = "http://localhost:8000"

def test_health():
    r = requests.get(f"{BASE}/health", timeout=3)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_db_ping():
    r = requests.get(f"{BASE}/db/ping", timeout=5)
    assert r.status_code == 200
    assert r.json()["ok"] is True
