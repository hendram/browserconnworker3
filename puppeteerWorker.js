import * as puppeteer from "puppeteer";

// helper
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility function for structured logging of scraping results
function logScrapingResults(results, jobId = 3) {
  console.log(JSON.stringify({
    level: "INFO",
    timestamp: new Date().toISOString(),
    logger: "web-scraper",
    message: "Scraping completed successfully",
    jobId: jobId,
    results_count: results.length,
    sample_result: results.length > 0 ? {
      text_preview: results[0].text.slice(0, 100), // first 100 chars
      url: results[0].metadata?.url,
      sourcekb: results[0].metadata?.sourcekb
    } : null
  }));
}


export async function runScraper(query) {

const results = [];
    // --- SCRAPE SEARCH RESULTS LINKS ---

    for (const link of query.query) {
      let linkBrowser;
      let tab;
      let text = "";

      try {
        linkBrowser = await puppeteer.launch({
          headless: true,
          timeout: 60000,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--window-size=1280,800",
          ],
        });

        tab = await linkBrowser.newPage();
        await tab.goto(link, { waitUntil: "domcontentloaded", timeout: 250000 });
        await wait(5000);

        try {
          text = await tab.evaluate(() => document.body.innerText);
        } catch (frameErr) {
          console.log("Frame detached or JS error, skipping:", frameErr.message);
        }

        if (text) {
          const found = query.topicsArray.some((word) =>
            text.toLowerCase().includes(word.toLowerCase())
          );
          if (found) {
            results.push({ text, metadata: { url: link, date: new Date().toISOString(), sourcekb: "external", searched: query.searched } });
          }
        }
      } catch (err) {
        console.log(" ^}^l Failed to scrape link:", link, err.message);
      } finally {
        if (tab) try { await tab.close(); } catch {}
        if (linkBrowser) try { await linkBrowser.close(); } catch {}
      }
    }

logScrapingResults(results, 3);

return {jobId:3, results};

  } 
