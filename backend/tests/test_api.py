import sqlite3

import pytest
from fastapi.testclient import TestClient

from backend.main import Settings, create_app


@pytest.fixture
def client(tmp_path):
    settings = Settings(database_path=tmp_path / "messages.db", _env_file=None)
    with TestClient(create_app(settings)) as test_client:
        yield test_client, settings


def message():
    return {
        "name": "Hiring Manager",
        "email": "manager@example.com",
        "subject": "Interview opportunity",
        "message": "We would like to discuss a role with you next week.",
    }


def test_health(client):
    response = client[0].get("/api/health")
    assert response.json() == {"status": "ok"}
    assert response.headers["x-content-type-options"] == "nosniff"


def test_contact_persists(client):
    test_client, settings = client
    assert test_client.post("/api/contact", json=message()).status_code == 201
    with sqlite3.connect(settings.database_path) as database:
        assert database.execute("SELECT name FROM messages").fetchone()[0] == "Hiring Manager"


@pytest.mark.parametrize("change", [{"email": "invalid"}, {"message": "short"}, {"name": "  "}])
def test_invalid_contact(client, change):
    assert client[0].post("/api/contact", json=message() | change).status_code == 422


def test_honeypot(client):
    assert client[0].post("/api/contact", json=message() | {"website": "spam"}).status_code == 400


def test_rate_limit(client):
    for _ in range(5):
        assert client[0].post("/api/contact", json=message()).status_code == 201
    assert client[0].post("/api/contact", json=message()).status_code == 429


@pytest.mark.parametrize(
    "resume_id", ["general", "analytics", "data-engineering", "java", "operations", "not-a-resume"]
)
def test_resume_endpoints_removed(client, resume_id):
    assert client[0].get(f"/api/resumes/{resume_id}").status_code == 404


def test_portfolio_contract(client):
    response = client[0].get("/api/portfolio")
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == "Tanya"
    assert content["verified"] is False
    assert len(content["roles"]) == 7
    assert {"frontend", "salesforce", "devops"} <= {role["id"] for role in content["roles"]}
    assert "resumes" not in content


def test_organizations_learning_and_certification(client):
    content = client[0].get("/api/portfolio").json()
    assert {job["company"] for job in content["experience"]} == {"Cognizant", "Norway Cup 2026"}
    assert {course["institution"] for course in content["education"]} == {
        "University of Mumbai",
        "AWS re/Start",
        "Caritas",
    }
    courses = {course["institution"]: course for course in content["education"]}
    assert courses["AWS re/Start"]["location"] == "Oslo, Norway"
    degree = courses["University of Mumbai"]
    assert degree["degree"] == "Bachelor of Engineering in Information Technology"
    assert degree["period"] == "2017 - 2021"
    assert degree["grade"] == "80.2%"
    assert degree["recognition"] == "Recognized by HK-dir"
    assert courses["AWS re/Start"]["recognition"] is None
    assert courses["Caritas"]["recognition"] is None
    certification = content["certifications"][0]
    assert certification["issuer"] == "Salesforce"
    assert certification["verified"] is True
    assert [item["name"] for item in content["certifications"]] == [
        "Salesforce Certified Platform Administrator",
        "Salesforce Certified Platform Developer",
        "Salesforce Certified Platform Foundations",
        "Salesforce Certified Platform App Builder",
        "Salesforce Agentblazer (Trailhead)",
        "Triple Star Ranger",
    ]
    assert content["certifications"][-1]["category"] == "Trailhead achievement"
    assert all(
        item["verified"] and item["credential_url"] for item in content["certifications"][:4]
    )
    expected_url = (
        "https://trailhead.salesforce.com/en/credentials/certification-detail-print/"
        "?searchString=DO/ZHFrjb6GPYw6nQdBMsmklSZ0WJcni4KJ+x9sa/TmfW6EDKCWTBGmZ7AeBHRDi"
    )
    assert all(item["credential_url"] == expected_url for item in content["certifications"][:4])
    assert content["certifications"][-1]["verified"] is False
    assert content["certifications"][-1]["credential_url"] is None


def test_public_contact_details(client):
    contact = client[0].get("/api/portfolio").json()["contact"]
    assert contact["email"] == "tanyaguptanorway@gmail.com"
    assert contact["linkedin_url"] == "https://www.linkedin.com/in/tanyaguptanorway/"
    assert contact["phone"] == "+4740152755"
    assert contact["phone_display"].replace(" ", "") == contact["phone"]
    assert contact["github_url"] == "https://github.com/tanyaguptaportfolio"
