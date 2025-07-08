FROM python:3.13-slim

WORKDIR /app

# Install only the MCP client and OpenAI SDK
RUN pip install --no-cache-dir \
    python-mcp-client \
    openai

# Copy your agent code (env_file will mount .env at runtime)
COPY main.py ./

# Run the agent
CMD ["python", "main.py"]
