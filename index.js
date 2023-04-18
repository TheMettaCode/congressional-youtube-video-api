// @ts-nocheck

const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();

/// FUNCTION TO FETCH VIDEO URLs WITH VIDEO IDs
async function getYoutubeVideoList(channel, urlAddress) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Configure the navigation timeout
    // await page.setDefaultNavigationTimeout(0);

    const status = await page.goto(urlAddress, {
        // waitUntil: "networkidle2"
        waitUntil: "load",
        // waitUntil: "domcontentloaded",
        // timeout: 5000
    });

    if (status != 404) {

        console.log(`Page found . Status code: ${status.status()}`);

        await page.waitForSelector('#details');

        const allTitles = await page.evaluate(() => Array.from(document.querySelectorAll('h3 a'), attr => attr.title));
        const allUrls = await page.evaluate(() => Array.from(document.querySelectorAll('h3 a'), attr => attr.href));
        const allDates = await page.evaluate(() => Array.from(document.querySelectorAll('span.inline-metadata-item'), attr => attr.innerHTML));

        const titles = allTitles.filter(e => e !== undefined && e != '' && e != null);
        const urls = allUrls.filter(e => e !== undefined && e != '' && e != null);
        const dates = allDates.filter(e => e !== undefined && e != '' && e != null && !e.includes('view'));

        const combinedData = [];
        if (titles.length == urls.length && urls.length == dates.length) {
            for (var i = 0; i < titles.length; i++) {
                console.log(`[${i}] - ${channel}, ${titles[i]}, ${urls[i]}, ${dates[i]}`);
                if ((channel == 'Capitol Babble' || channel == 'MettaCode Developers' || keywords.find((word) => titles[i].toLowerCase().includes(word)))
                    && (dates[i].includes('minute') || dates[i].includes('minutes') || dates[i].includes('hour') || dates[i].includes('hours') || dates[i].includes('day') || dates[i].includes('seconds'))) { combinedData.push({ "channel": channel, "title": titles[i], "url": urls[i], "id": urls[i].split('v=').pop(), "date": dates[i], "thumbnail": `https://i.ytimg.com/vi/${urls[i].split('v=').pop()}/hqdefault.jpg` }); }
            }
            console.log(`${titles.length} titles - ${urls.length} urls - ${dates.length} dates`);
        } else {
            console.log(`${titles.length} titles - ${urls.length} urls - ${dates.length} dates`);
        }

        await browser.close();
        return combinedData;
    } else {
        console.log(`Page not found error... Status code: ${status.status()}`);
    }

}

const nameBase = "https://www.youtube.com/c/";
const idBase = "https://www.youtube.com/channel/";
const youtubeChannelSources = [
    // { name: "MettaCode Developers", id: "UCUrW7YMZDBaVMjP7V3XnpVw", slug: "mettacode" },
    { name: "C-SPAN", id: "UCb--64Gl51jIEVE-GLDAVTg", slug: "cspan" },
    { name: "Politico", id: "UCgjtvMmHXbutALaw9XzRkAg", slug: "politico" },
    { name: "Bloomberg Politics", id: "UCV61VqLMr2eIhH4f51PV0gA", slug: "bloomberg" },
    { name: "Propublica", id: "UCtCL58_DaVdVRmev3yHK7pg", slug: "propublica" },
    { name: "Capitol Babble", id: "UC4X_dh5dgyC0d6T3KkjFTTQ", slug: "capitolbabble" },
    { name: "USA Today", id: "UCP6HGa63sBC7-KHtkme-p-g", slug: "usatoday" }
];

const keywords = [
    "amendment", "biden", "ballot", " bill ", "congress", "capitol", "capitol hill", "constitution", " dems ", "democrats", "election", "filibuster", " gop ", "house floor", "house of representatives", "investing", " law ", "majority leader", "midterms", "midterm elections", "minority leader", "nuclear war", "obama", "omnibus", "pelosi", "republicans", "runoff election", "senate", "senate floor", "speaker of the house", "stock", "tax", "trump", "us congress", "vote", "war in", "washington dc", "white house"
];

const videos = [];
const date = new Date();
const outputFileName = "latest_videos.json";

async function getVideos(sources) {
    for (var source of sources) {

        console.log(`${source.name} puppeteer begin`);

        const url = `${idBase}${source.id}/videos`;

        await getYoutubeVideoList(source.name, url)
            .then((channelVideos) => {
                videos.push({ "channel-name": source.name, "channel-id": source.id, "channel-slug": source.slug, "channel-url": url, "channel-videos": channelVideos.length > 6 ? channelVideos.slice(0, 6) : channelVideos });
                // console.log(videoList);
            });

        // videoList.push({ thisList });
        console.log(`${source.name} puppeteer end`);
    };
};


getVideos(youtubeChannelSources).then(() => {
    console.log(`Writing to ${outputFileName}`);
    fs.writeFile(outputFileName, JSON.stringify({ "retrieved-date": date, videos }), (err) => {
        if (err) { console.log(err); }
    });
});


app.get('/videos', (req, res) => {
    // console.log(videos);
    res.json({ "retrieved-date": date, videos });
});

app.get('/', (req, res, next) => {
    // console.log(videoList);
    res.json('Congressional YouTube Video API');
});

// app.listen(3000, () => console.log('Server is running'));

