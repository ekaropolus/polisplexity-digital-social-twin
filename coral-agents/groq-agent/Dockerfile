FROM python:3.10-slim

WORKDIR /app

# Install only what this agent needs
RUN pip install --no-cache-dir \
    python-dotenv \
    httpx \
    sseclient-py

# Copy code and example env
COPY main.py .env.example ./

# Run the agent process
CMD ["python", "main.py"]
