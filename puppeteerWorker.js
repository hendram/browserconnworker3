import * as puppeteer from "puppeteer";

// helper
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

return {jobId:3, results};

  } 
