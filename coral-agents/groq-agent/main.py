#!/usr/bin/env python3
import os, json
from time import sleep
import httpx
from sseclient import SSEClient
from dotenv import load_dotenv

load_dotenv()

API_KEY   = os.environ["GROQ_API_KEY"]
SSE_URL   = os.environ["CORAL_SSE_URL"]
POST_URL  = SSE_URL.replace("/sse", "/messages")
AGENT_ID  = "groq_agent"

client = httpx.Client(
    base_url="https://api.groq.com/openai/v1",
    headers={"Authorization": f"Bearer {API_KEY}"}
)

def run():
    for event in SSEClient(SSE_URL):
        if event.event != "message" or not event.data:
            continue
        msg = json.loads(event.data)
        if msg.get("role") != "user":
            continue

        thread = msg["threadId"]
        prompt = msg["content"]

        try:
            r = client.post("/chat/completions", json={
                "model": "gpt-4",
                "messages": [{"role": "user", "content": prompt}]
            })
            r.raise_for_status()
            data = r.json()
            reply = data["choices"][0]["message"]["content"]
        except Exception as e:
            reply = f"⚠️ Groq API error: {e}"

        httpx.post(
            POST_URL,
            json={"threadId": thread, "content": reply},
            timeout=10
        )
        sleep(0.1)

if __name__ == "__main__":
    run()
