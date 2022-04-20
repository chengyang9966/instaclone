const puppeteer = require("puppeteer");
const { CreateToken } = require("../middleware/token");

async function printPDFHTML(urlPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let token = CreateToken({ name: "Cheng Yang", age: 23 });
  await page.setExtraHTTPHeaders({
    Authorization: `Basic ${token}`,
  });
  page.on("request", (request) =>
    console.log(
      `Request: ${request.resourceType}: ${request.url} (${JSON.stringify(
        request.headers()
      )})`
    )
  );
  // navigate to the websit
  await page.goto(urlPath, {
    waitUntil: "networkidle0",
  });
  const pdf = await page.pdf({ format: "A4" });
  let html = await page.content();

  await browser.close();
  return { pdf, html };
}
module.exports = printPDFHTML;
