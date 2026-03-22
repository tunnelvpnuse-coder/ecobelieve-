from app.main import app


def test_app_metadata_loaded():
    assert app.title == "Aliafrica Marketplace API"
