# app/models.py
from typing import Any, Dict, List
from pydantic import BaseModel

class GenerateColumnRequest(BaseModel):
    rows: List[Dict[str, Any]]      # e.g. [{"firstName":"Alice",…,"major":"CS"}…]
    columnName: str                 # e.g. "EngineerClassification"
    prompt: str                     # e.g. "Classify as Engineer or Non-Engineer"

class GenerateColumnResponse(BaseModel):
    values: List[str]               # e.g. ["Engineer", "Non-Engineer", …]
