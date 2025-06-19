# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_502_BAD_GATEWAY

from .config import settings
from .models import GenerateColumnRequest, GenerateColumnResponse
from .llm import process_data_with_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-column", response_model=GenerateColumnResponse)
async def generate_column(req: GenerateColumnRequest):
    try:
        values = process_data_with_prompt(req.rows, req.prompt)
        return GenerateColumnResponse(values=values)
    except RuntimeError as e:
        raise HTTPException(
            status_code=HTTP_502_BAD_GATEWAY,
            detail="LLM error, please retry"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
