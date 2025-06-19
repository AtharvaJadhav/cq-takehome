# app/llm.py
import os
import json
import openai
import random
import time
from typing import List

from .config import settings

openai.api_key = settings.OPENAI_API_KEY

def classify_majors(majors: List[str]) -> List[str]:
    """
    Calls OpenAI once to classify all majors in bulk.
    Retries up to 2 times on transient failures.
    """
    if settings.ENV.lower() == "dev":
        # Mock mode: return random labels
        return [random.choice(["Engineer", "Non-Engineer"]) for _ in majors]

    prompt = (
        "You are a classifier. Given this JSON array of majors:\n"
        f"{json.dumps(majors)}\n"
        'Return a JSON array of equal length containing only "Engineer" or "Non-Engineer".'
    )

    for attempt in range(3):
        try:
            start = time.time()
            resp = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "system", "content": "You classify majors."},
                          {"role": "user", "content": prompt}],
                temperature=0.0,
            )
            latency = time.time() - start
            print(f"[LLM] classification took {latency:.2f}s")
            text = resp.choices[0].message.content.strip()
            values = json.loads(text)
            if len(values) != len(majors):
                raise ValueError("Mismatched output length")
            return values
        except Exception as e:
            print(f"[LLM] attempt {attempt+1} failed: {e}")
            time.sleep(1)
    # final failure
    raise RuntimeError("LLM error after retries")
