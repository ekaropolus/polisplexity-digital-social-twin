# Polisplexity Digital Social Twin

## Introduction

This project is part of our broader initiative to build a social digital twin for cities, focused on transforming the way we manage waste, optimize resources, and engage citizens in the emerging circular economy.

**The problem we're solving:**

Traditional smart city platforms and digital twins often focus only on physical infrastructure: sensors, trucks, traffic. However, they neglect direct social interaction, which is critical when tackling problems like waste separation, recycling, and overall urban sustainability.

In previous experiments, we tried using Telegram bots and other messaging platforms to directly interact with citizens. This allowed them to report waste, learn how to separate it, and even request special pickups. However, it remained fragmented.

What we are now doing is connecting all these interactions — WhatsApp, Telegram, Facebook, IoT data, optimized routing, and predictive analytics — into a unified digital social twin that truly represents both the physical and human aspects of urban waste management.

This opens the door to new mechanisms of accountability, education, and economic incentives, such as:

* Calculating individual or household carbon footprints based on waste.
* Issuing Green Coins, a kind of internal token that rewards proper disposal, which can be used for discounts or private collection services.
* Reinforcing the circular economy at the scale of entire cities.

## This repository

This repo contains the core orchestration layer of our social digital twin, powered by Coral Protocol, which provides:

* The Coral Server, orchestrating multi-agent workflows.
* The Coral Studio UI, where you can visualize agents, applications, and sessions.
* Several Coral Agents, including:

  * `interface-agent` for human-in-the-loop coordination.
  * `ollama-agent` for local LLM responses.
  * `groq-agent` for cloud LLM responses.
  * More planned for specialized analysis (image recognition, CO2 impact, etc).

## Installation & Running

This assumes you have Docker installed.

1. Clone the repository:

git clone [git@github.com](mailto:git@github.com)\:ekaropolus/polisplexity-digital-social-twin.git
cd polisplexity-digital-social-twin

2. Start Coral components:

docker compose up -d coral-server coral-studio

This will start the main orchestration server (coral-server) and the UI (coral-studio) on ports 5555 and 3010 respectively.

You can access Coral Studio at:

[http://localhost:3010](http://localhost:3010)

3. Start agents:

You can start agents individually. For example:

docker compose up -d --build interface-agent
docker compose up -d --build ollama-agent
docker compose up -d --build groq-agent

## What's next

We will gradually add:

* The digital twin waste optimization models (route planning, landfill allocation, etc).
* Integration of WhatsApp / Telegram bots as external agents.
* Real-time dashboards of carbon savings and green coin issuance.
* Documentation of our city-scale circular economy architecture.

## License

MIT License.

## Contact

For collaborations or research partnerships, reach out at:

Email: [git@hadox.org](mailto:git@hadox.org)
LinkedIn: Polisplexity

(This is an open experimental framework — we welcome contributors interested in AI for cities, digital twins, and sustainable urban systems.)

