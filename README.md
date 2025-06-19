<!-- README.md -->
# FastAPI "Engineer vs. Non-Engineer" Column Generator

## Setup

1. **Clone** this repo  
2. **Create** a `.env` file at project root:
   ```
   OPENAI_API_KEY=your_key_here
   ENV=dev
   ```

3. **Install** dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run** the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```