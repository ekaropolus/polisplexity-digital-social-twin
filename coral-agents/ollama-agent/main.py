#!/usr/bin/env python3
import os, asyncio
from mcp.client.sse import sse_client
from mcp.client.session import ClientSession
from openai import OpenAI

# ─── CONFIG ─────────────────────────────
SSE_URL  = os.environ["CORAL_SSE_URL"]
AGENT_ID = os.environ["CORAL_AGENT_ID"]

OLLAMA_URL = os.environ["OLLAMA_URL"]
MODEL      = os.environ["MODEL"]

# ─── LLM CLIENT ─────────────────────────
# Point OpenAI SDK at your local Ollama server
ollama = OpenAI(base_url=OLLAMA_URL, api_key="")

# ─── MESSAGE LOOP ───────────────────────
async def handle_messages(session: ClientSession):
    async for msg in session.receive_messages():
        if msg.role == "user":
            resp = await ollama.chat.completions.create(
                model=MODEL,
                messages=[{"role":"user","content":msg.content}]
            )
            await session.send_message(
                thread_id=msg.thread_id,
                content=resp.choices[0].message.content
            )

# ─── BOOTSTRAP ──────────────────────────
async def main():
    # register agent_id on the SSE connect
    async with sse_client(
        SSE_URL,
        agent_id=AGENT_ID,
        agent_description="Ollama LLM Agent"
    ) as (read_stream, write_stream):
        async with ClientSession(
            read_stream=read_stream,
            write_stream=write_stream
        ) as session:
            await handle_messages(session)

if __name__ == "__main__":
    asyncio.run(main())
