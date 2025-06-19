# app/llm.py
import os
import json
import openai
import random
import time
from typing import List, Dict, Any

from .config import settings

openai.api_key = settings.OPENAI_API_KEY

def process_data_with_prompt(data: List[Dict[str, Any]], prompt: str) -> List[str]:
    """
    Calls OpenAI with a custom prompt to process data.
    Returns a list of string values (one per input row).
    """
    if settings.ENV.lower() == "dev":
        # Mock mode: return random responses for testing
        return [f"Mock response {i+1}" for i in range(len(data))]

    # Create a more flexible prompt that includes the data
    system_prompt = f"You are a data processor. Given the following prompt: '{prompt}'"
    
    # Convert data to a more readable format
    data_str = json.dumps(data, indent=2)
    
    user_prompt = f"""
Data to process:
{data_str}

Prompt: {prompt}

Return ONLY a JSON array of strings with the same length as the input data.
Each string should be the result of applying the prompt to the corresponding data row.
Do NOT return the full data objects, only the classification/result strings.

Example: If you have 3 rows and the prompt is "classify as STEM or non-STEM", 
return: ["STEM", "STEM", "non-STEM"]
"""

    for attempt in range(3):
        try:
            start = time.time()
            resp = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.0,
            )
            latency = time.time() - start
            print(f"[LLM] processing took {latency:.2f}s")
            text = resp.choices[0].message.content.strip()
            
            # Try to parse the response as JSON
            try:
                values = json.loads(text)
            except json.JSONDecodeError:
                # If it's not valid JSON, try to extract values from the text
                print(f"[LLM] Failed to parse JSON, raw response: {text}")
                # Look for array-like patterns in the response
                import re
                # Try to find array-like content
                array_match = re.search(r'\[.*?\]', text, re.DOTALL)
                if array_match:
                    try:
                        values = json.loads(array_match.group())
                    except:
                        raise ValueError("Could not parse response as JSON array")
                else:
                    raise ValueError("No array found in response")
            
            # Ensure we have a list of strings
            if not isinstance(values, list):
                raise ValueError("Response is not a list")
            
            # Convert all values to strings and ensure correct length
            string_values = []
            for i, value in enumerate(values):
                if i >= len(data):
                    break  # Stop if we have more values than data rows
                string_values.append(str(value))
            
            # If we don't have enough values, pad with empty strings
            while len(string_values) < len(data):
                string_values.append("")
            
            print(f"[LLM] Returning {len(string_values)} values: {string_values}")
            return string_values
            
        except Exception as e:
            print(f"[LLM] attempt {attempt+1} failed: {e}")
            if attempt < 2:  # Don't sleep on the last attempt
                time.sleep(1)
    
    # final failure
    raise RuntimeError("LLM error after retries")
