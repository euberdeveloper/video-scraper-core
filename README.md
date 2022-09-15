![Build](https://github.com/euberdeveloper/video-scraper-core/workflows/Build/badge.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/npm/l/video-scraper-core.svg)](https://github.com/euberdeveloper/video-scraper-core/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/euberdeveloper/video-scraper-core.svg)](https://github.com/euberdeveloper/video-scraper-core/issues)
[![GitHub stars](https://img.shields.io/github/stars/euberdeveloper/video-scraper-core.svg)](https://github.com/euberdeveloper/video-scraper-core/stargazers)
![npm](https://img.shields.io/npm/v/video-scraper-core.svg)

# video-scraper-core
An npm package that provides an abstract class to scrape videos with Puppeteer.

## Install

To install video-scraper-core, run:

```bash
$ npm install video-scraper-core
```

## Project purpose

This module is written because videos hosted on some websites are difficult to download and watchable only in the browser. Even by using some browser tools, sometimes, it may be difficult or impossible to download the video. A solution that can always be used, is actually taking a video screen recording after having played the video, but it is too time-consuming to be done manually.

This is why I have written this module, that uses [**puppeteer**](https://www.npmjs.com/package/puppeteer) under the hood to open a google-chrome browser, see the video and take a video recording of it.

The module is written in **Typescript**, uses **Webpack** to reduce the bundle size (even if most of it comes from the puppeter browser), uses **[euberlog](https://www.npmjs.com/package/euberlog)** for a scoped debug log and is **full of configurations**.

## How does it work

The module provides an abstract class that you can extend to create your own scraper. By overriding some simple methods, you can adapt the scraper to your needs.
## Project usage

An example to create a scraper for TumConf:

```javascript
import { VideoScraperCore, ScrapingOptions, BrowserOptions } from 'video-scraper-core';
import { Page } from 'puppeteer';
import { Logger } from 'euberlog';

// Extend VideoScraperCore to create the scraper class
export class TumConfScraper extends VideoScraperCore {
    // The passcode used to login
    private readonly passcode: string;

    // The constructor that allows the passcode to be specified
    constructor(passcode: string, browserOptions: BrowserOptions) {
        super(browserOptions);
        this.passcode = passcode;
    }

    // The selector of the full screen button
    protected getFullScreenSelector(): string {
        return '.vjs-fullscreen-toggle-control-button';
    }
    // The selector of the play button
    protected getPlayButtonSelector(): string {
        return '.vjs-play-control';
    }
    // The selector of the video time duration
    protected getVideoDurationSelector(): string {
        return '.vjs-time-range-duration';
    }

    // After the page is loaded, login by using puppeteer
    protected async afterPageLoaded(_options: ScrapingOptions, page: Page, logger: Logger): Promise<void> {
        logger.debug('Putting the passcode to access the video');
        await page.waitForSelector('input#password');
        await page.$eval(
            'input#password',
            (el: HTMLInputElement, passcode: string) => (el.value = passcode),
            this.passcode
        );

        logger.debug('Clicking the button to access the video');
        await page.waitForSelector('.btn-primary.submit');
        await page.$eval('.btn-primary.submit', (button: HTMLButtonElement) => button.click());
    }
}

async function main() {
    // Create an instance of the scraper
    const scraper = new TumConfScraper('mypasscode', { debug: true });
    // Launch the Chrome browser
    await scraper.launch();
    // Scrape and save the video
    await scraper.scrape('https://videourl.com', './saved.webm');
    // Close the browser
    await scraper.close();
}
main();
```

## API

The documentation site is: [video-scraper-core documentation](https://video-scraper-core.euber.dev)

The documentation for development site is: [video-scraper-core dev documentation](https://video-scraper-core-dev.euber.dev)

### VideoScraperCore

The VideoScraperCore class, that can be extended to scrape a video from a website and saves it to a file.

**Constructor:**

`VideoScraperCore(options)`

**Parameters:**

* __options__: Optional. A `BrowserOptions` object that specifies the options for this instance.

**Public methods:**

* __setBrowserOptions(options: BrowserOptions): void__: Changes the browser options with the ones given by the `options` parameter.
* __launch(): Promise<void>__: Launches the browser window.
* __close(): Promise<void>__: Closes the browser window.
* __scrape(url: string, destPath: string, options: ScrapingOptions): Promise<void>__: Scrapes the video in `url` and saves it to `destPath`. Some ScrapingOptions can be passed.

**Protected methods:**

* __handleDurationText(durationText: string): number__: Given the duration text gotten from the page's HTML (e.g. 1:30:23), it returns the duration in milliseconds.
* __getVideoDuration(page: Page, logger: Logger): Promise<number>__: Gets the video duration by parsing the given page.
* __setVideoToFullScreen(page: Page, logger: Logger): Promise<void>__: Sets the video put the video in fullscreen.
* __playVideo(page: Page, logger: Logger): Promise<void>__: Plays the video by clicking the play button.

### BrowserOptions

The options given to the VideoScraperCore constructor.

**Parameters:**

* __debug__: Default value: `false`. If true, it will show debug log.
* __debugScope__: Default value: `'VideoScraperCore'`. The scope given to the euberlog debug logger.
* __browserExecutablePath__: Default value: `'/usr/bin/google-chrome'`. The path to the browser executable.
* __windowSize__: Default value: `{ width: 1920, height: 1080 }`. The object that says how big the window size will be.

### ScrapingOptions

The options given to a scrape method.

**Parameters:**

* __duration__: Default value: `null`. The duration in milliseconds of the recorded video.
* __delayAfterVideoStarted__: Default value: `0`. The delay in milliseconds after that the play button has been clicked.
* __delayAfterVideoFinished__: Default value: `15_000`. The delay in milliseconds after that the duration milliseconds are past and before that the recording is stopped.
* __fullscreen__: Default value: `false`. If true, the video will be recorded after having put it on fullscreen.
* __audio__: Default value: `true`. If true, the audio will be recorded.
* __video__: Default value: `true`. If true, the video will be recorded.
* __mimeType__: Default value: `'video/webm'`. The mimetype of the recorded video or audio.
* __audioBitsPerSecond__: Default value: `undefined`. The chosen bitrate for the audio component of the media. If not specified, it will be adaptive, depending upon the sample rate and the number of channels.
* __videoBitsPerSecond__: Default value: `undefined`. The chosen bitrate for the video component of the media. If not specified, the rate will be 2.5Mbps.
* __frameSize__: Default value: `20`. The number of milliseconds to record into each packet.
* __useGlobalDebug__: Default value: `true`. If true, the global logger will be used, ignoring other debug options in this object.
* __debug__: Default value: `null`. If null, the debug will be shown by looking at the passed BrowserOptions. Otherwise, if useGlobalDebug is false, this specifies if the debug will be shown.
* __debugScope__: Default value: `null`. If useGlobalDebug is true, this will be ignore. Otherwise, this specifies if the euberlog logger scope for the debug of this scrape.

### Errors

There are also some error classes that can be thrown by this module:

* __VideoScraperCoreError__: The base error class of the bbb-video-scraper module
* __VideoScraperCoreBrowserNotLaunchedError__: The error extending VideoScraperCoreError that is thrown when actions on a non-launched browser are attempted to be executed.
* __VideoScraperCoreDuringBrowserLaunchError__: The error extending VideoScraperCoreError that is thrown when an error occurred when a browser is getting closed.
* __VideoScraperCoreDuringBrowserCloseError__: The error extending VideoScraperCoreError that is thrown when an error occurs during the launch of a browser.
* __VideoScraperCoreDuringScrapingError__: The error extending VideoScraperCoreError that is thrown when an error occurs during a video scraping

## Notes

* The default browser is **Google Chrome** on `/usr/bin/google-chrome`, because Chromium did not support the BBB videos. You can always change the browser executable path on the configurations.
* By default (if the **duration** option is `null`), the **duration of the recording will be automatically detected** by looking at the vjs player of the page and by adding a stopping delay of 15 seconds.
* This module can be uses only in **headful mode**.

## Projects using this module

* [bbb-video-scraper](https://github.com/euberdeveloper/bbb-video-scraper)
* [tum-conf-scraper](https://github.com/euberdeveloper/tum-conf-scraper)