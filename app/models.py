# app/models.py
from typing import Any, Dict, List
from pydantic import BaseModel

class GenerateColumnRequest(BaseModel):
    rows: List[Dict[str, Any]]      # e.g. [{"firstName":"Alice",…,"major":"CS"}…]
    columnName: str                 # e.g. "EngineerClassification"

class GenerateColumnResponse(BaseModel):
    values: List[str]               # e.g. ["Engineer", "Non-Engineer", …]
