# Puppeteer Worker 3

This project is the **second worker (of three)** that scrapes URLs fed from a backend service (`chunkgeneratorforaimodel`) based on searched keywords.  
The workers run in parallel to share the scraping load, increasing the speed and efficiency of the process.

---

## 📦 About This Package

- Functions as **3/3 of the scraper workload**.  
- Consumes jobs (**URLs + keywords**) from **Kafka**.  
- Uses **Puppeteer** to scrape the content of web pages.  
- Filters and extracts text that contains the searched keywords.  
- Sends results back to Kafka for further processing by the backend (`chunkgeneratorforaimodel`).  
- Designed to run together with two other workers for parallel scraping.  

---

## ⚙️ How It Works

### 🔹 Kafka Consumer
- Listens for messages on the **`topuppeteerworker`** topic.  
- Each message contains ~1/3 of the total URLs to be scraped.  

### 🔹 Scraping Process (`runScraper` in `puppeteerWorker.js`)
- 🖥️ Launches Puppeteer in headless mode  
- 🌐 Visits each URL  
- 🔍 Extracts page text  
- ✅ Checks for presence of keywords from `topicsArray`  
- 📦 If found, pushes a result in the format:  

{
  "text": "page content",
  "metadata": {
    "url": "https://example.com",
    "date": "2025-09-11T10:00:00.000Z",
    "sourcekb": "external",
    "searched": "your_query"
  }
}

---

💻 Platform Requirements

At least 12 GB RAM

At least 4 CPU cores (Intel i5 or higher recommended)

Docker installed

---

🚀 How to Run

Download the Docker image

**docker pull ghcr.io/hendram/puppeteerworker3**

Start the container

**docker run -it -d --network=host ghcr.io/hendram/puppeteerworker3 bash**

Find your container name

**docker ps**

Example: elastic_cori (your name will differ).

Enter the container

**docker exec -it pedantic_payne /bin/bash**

Run the service

**cd /home/browserconnworker3**
**node index.js**

---

🔧 Code Overview

index.js
🚀 Starts the worker, consumes jobs from Kafka, runs the scraper, and sends results back.

kafka.js
🔌 Handles Kafka connection, producer, and consumer setup.

puppeteerWorker.js
🕷️ Contains the runScraper function, which:

🖥️ Launches Puppeteer (headless browser)

🌐 Visits URLs

🔍 Extracts and filters page content

📦 Returns results with metadata

---

✨ Features & Functionality

✔️ Consumes jobs (URLs + keywords) from Kafka

✔️ Uses Puppeteer to scrape web pages in headless mode

✔️ Extracts page text and checks if it contains keywords

✔️ Produces structured results with metadata (URL, date, source, searched keyword)

✔️ Sends results back to Kafka for merging with outputs from other workers

✔️ Designed for distributed, scalable, and fast scraping

---

📡 Data Flow

    A[chunkgeneratorforaimodel] -->|Jobs| B[Kafka: "topuppeteerworker"]

    B --> C[Puppeteer Worker 3 🕷️]

    C -->|Results| D[Kafka: "frompuppeteerworker"]

    D --> E[Backend merges with Worker 1 & 2]
