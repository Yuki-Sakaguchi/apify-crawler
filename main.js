const Apify = require('apify');
const fs = require('fs')
const del = require('del')

const URL = 'https://uuuundefined.tokyo/'
const STORAGE_DIR = 'apify_storage'
const RESULT_FILE_NAME = 'urlList.json'

Apify.main(async () => {
    await del(STORAGE_DIR)
    await del(RESULT_FILE_NAME)

    const urlList = []
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: URL });
    const pseudoUrls = [new Apify.PseudoUrl(`${URL}[.*]`)];

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        handlePageFunction: async ({ request, page }) => {
            const title = await page.title();
            urlList.push({
              title: title,
              url: request.url, 
            })
            await Apify.utils.enqueueLinks({ page, selector: 'a', pseudoUrls, requestQueue });
        },
        maxRequestsPerCrawl: 100,
        maxConcurrency: 10,
        launchPuppeteerOptions: {
          headless: true,
        },
    });

    await crawler.run();

    console.log(urlList)
    fs.writeFileSync(RESULT_FILE_NAME, JSON.stringify(urlList, null, '    '));
});
