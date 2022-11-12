// @ts-nocheck

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
// const router = express.Router();

const nameBase = "https://www.youtube.com/c/";
const idBase = "https://www.youtube.com/channel/";
const youtubeChannelSources = [
    { name: "C-SPAN", id: "UCb--64Gl51jIEVE-GLDAVTg" },
    { name: "Politico", id: "UCgjtvMmHXbutALaw9XzRkAg" },
    { name: "Bloomberg Politics", id: "UCV61VqLMr2eIhH4f51PV0gA" },
    { name: "Propublica", id: "UCtCL58_DaVdVRmev3yHK7pg" },
    { name: "Capitol Babble", id: "UC4X_dh5dgyC0d6T3KkjFTTQ" }
];

const keywords = [
    "election", "us congress", "capitol", "capitol hill", "gop", "dems", "republicans", "democrats", "senate", "house of representatives", "speaker of the house", "stock", "investing", "tax", "majority leader", "minority leader", "filibuster", "constitution", "vote"
];

const videos = [];
const date = new Date();

youtubeChannelSources.forEach(source => {

    console.log(`${source.name} puppeteer begin`);

    const url = `${idBase}${source.id}/videos`;

    const thisList = getYoutubeVideoList(url);
    thisList.then((res) => {
        // console.log(res);
        videos.push({ "channel": source.name, "channel-videos": res.length > 5 ? res.slice(0, 5) : res });
        // console.log(videoList);
    });

    // videoList.push({ thisList });
    console.log(`${source.name} puppeteer end`);
});


app.get('/videos', (req, res) => {
    // console.log(videos);
    res.json({ "retrieved-date": date, videos });
});

app.get('/', (req, res, next) => {
    // console.log(videoList);
    res.json('Congressional YouTube Video API');
});

app.listen(3000, () => console.log('Server is running'));

/// FUNCTION TO FETCH VIDEO URLs WITH VIDEO IDs
async function getYoutubeVideoList(urlAddress) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(urlAddress, {
        waitUntil: "networkidle2"
    });

    await page.waitForSelector('#thumbnail');
    // const dimensions = await page.evaluate(() => {
    //     return {
    //         width: document.documentElement.clientWidth,
    //         height: document.documentElement.clientHeight,
    //         deviceScaleFactor: window.devicePixelRatio,
    //     };
    // });
    // console.log('Dimensions:', dimensions);
    // console.log('Thumbnail URLs:', thumbnailUrls)

    const thumbnailUrls = await page.evaluate(() => Array.from(document.querySelectorAll('#thumbnail'), attr => attr.href));
    const filteredUrls = thumbnailUrls.filter(e => e != '' && e != null);

    await browser.close();
    return filteredUrls;

    // const pageBody = await page.$('body');
    // const html = await page.evaluate(body => body.innerHTML, pageBody);
    // await pageBody.dispose();
    // console.log('HTML:', html);

}