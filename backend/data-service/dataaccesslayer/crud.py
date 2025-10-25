"""
CRUD helper functions. Each function uses a SQLAlchemy Session and performs DB ops.
We keep this separate from the HTTP controllers to maintain separation of concerns.
"""
from sqlalchemy.orm import Session
from . import models
from presentationlayer import schemas
from typing import List

def create_location(db: Session, loc: schemas.LocationCreate):
    # create Location record
    db_obj = models.Location(
        query=loc.query,
        display_name=loc.display_name,
        lat=loc.lat,
        lng=loc.lng,
        source=loc.source
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_location(db: Session, location_id: int):
    return db.query(models.Location).filter(models.Location.id == location_id).first()

def list_locations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Location]:
    return db.query(models.Location).offset(skip).limit(limit).all()

def create_weather_record(db: Session, rec: schemas.WeatherRecordCreate):
    db_obj = models.WeatherRecord(
        location_id=rec.location_id,
        raw_data=rec.raw_data,
        summary=rec.summary,
        temp=rec.temp,
        min_temp=rec.min_temp,
        max_temp=rec.max_temp
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_weather_record(db: Session, record_id: int):
    return db.query(models.WeatherRecord).filter(models.WeatherRecord.id == record_id).first()

def list_weather_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.WeatherRecord).offset(skip).limit(limit).all()

def update_weather_record(db: Session, record_id: int, patch: dict):
    obj = get_weather_record(db, record_id)
    if not obj:
        return None
    for k, v in patch.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

def delete_weather_record(db: Session, record_id: int):
    obj = get_weather_record(db, record_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
