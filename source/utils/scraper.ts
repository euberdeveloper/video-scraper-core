import * as fs from 'fs';
import * as puppeteerStream from 'puppeteer-stream';
import { Page /*, Browser*/ } from 'puppeteer';
import { Logger } from 'euberlog';

import { BrowserOptions, InternalBrowserOptions, ScrapingOptions } from '../types';
import {
    VideoScraperCoreBrowserNotLaunchedError,
    VideoScraperCoreDuringBrowserCloseError,
    VideoScraperCoreDuringBrowserLaunchError,
    VideoScraperCoreDuringScrapingError
} from '../errors';

import { handleBrowserOptions, handleScrapingOptions } from './options';

/**
 * The [[VideoScraperCore]] class, that can be extended to scrape a video from a website and saves it to a file.
 */
export abstract class VideoScraperCore {
    private logger: Logger;
    private options: InternalBrowserOptions;
    private browser: /*Browser*/ any | null = null;

    private readonly videoDurationSelector: string;
    private readonly fullScreenSelector: string;
    private readonly playButtonSelector: string;

    /**
     * The constructor of the [[VideoScraperCore]] class.
     * @param passcode The passcode to access the video.
     * @param options The [[BrowserOptions]] to pass to the instance.
     */
    constructor(options: BrowserOptions = {}) {
        this.setBrowserOptions(options);
        this.videoDurationSelector = this.getVideoDurationSelector();
        this.fullScreenSelector = this.getFullScreenSelector();
        this.playButtonSelector = this.getPlayButtonSelector();
    }

    /**
     * Given the duration text gotten from the page's HTML (e.g. 1:30:23), it returns the duration in milliseconds.
     * This method can be overridden in case the page's time format is not compatible.
     * @param durationText The duration text gotten from the page's HTML.
     * @returns The duration in milliseconds.
     */
    protected handleDurationText(durationText: string): number {
        const [hours, minutes, seconds] = durationText.split(':');
        return (+hours * 3600 + +minutes * 60 + +seconds) * 1000;
    }

    /**
     * Gets the video duration by parsing the given page.
     * This method can be overridden in case the page's way to display time is not compatible.
     * @param page A browser page (of puppeteer)
     * @param logger A logger instance to write log
     * @returns The extracted video duration
     */
    protected async getVideoDuration(page: Page, logger: Logger): Promise<number> {
        logger.debug('Waiting for selector of video duration');
        await page.waitForSelector(this.videoDurationSelector);

        logger.debug('Getting the total time of the video');
        const durationText = await page.$eval(this.videoDurationSelector, (el: HTMLElement) => {
            return el.innerHTML;
        });

        return this.handleDurationText(durationText);
    }

    /**
     * Sets the video put the video in fullscreen.
     * This method can be overridden in case the page's way to put the video in fullscreen is not compatible.
     * @param page A browser page (of puppeteer)
     * @param logger A logger instance to write log
     */
    protected async setVideoToFullScreen(page: Page, logger: Logger): Promise<void> {
        logger.debug('Waiting for selector of fullscren button');
        await page.waitForSelector(this.fullScreenSelector);

        logger.debug('Clicking the fullscreen button');
        await page.$eval(this.fullScreenSelector, (el: HTMLElement) => {
            return el.click();
        });
    }

    /**
     * Plays the video by clicking the play button.
     * This method can be overridden in case the page's way to start the video is not compatible.
     * @param page A browser page (of puppeteer)
     * @param logger A logger instance to write log
     */
    protected async playVideo(page: Page, logger: Logger): Promise<void> {
        logger.debug('Waiting for selector of play button');
        await page.waitForSelector(this.playButtonSelector);

        logger.debug('Clicking play on the video');
        await page.click(this.playButtonSelector);
    }

    /**
     * Changes the [[BrowserOptions]] options.
     * @param options The new options.
     */
    public setBrowserOptions(options: BrowserOptions): void {
        this.options = handleBrowserOptions(options);
        this.logger = new Logger({
            debug: this.options.debug,
            scope: this.options.debugScope
        });

        this.logger.debug('BrowserOptions are', this.options);
    }

    /**
     * Launches the browser window.
     */
    public async launch(): Promise<void> {
        try {
            this.logger.debug('Launching browser');
            this.browser = await puppeteerStream.launch({
                executablePath: this.options.browserExecutablePath,
                defaultViewport: null,
                args: [`--window-size=${this.options.windowSize.width},${this.options.windowSize.height}`]
            });
            this.logger.debug('Browser launched');
        } catch (error) {
            throw new VideoScraperCoreDuringBrowserLaunchError(error);
        }
    }

    /**
     * Closes the browser window.
     */
    public async close(): Promise<void> {
        try {
            if (this.browser) {
                await this.browser.close();
            }
        } catch (error) {
            throw new VideoScraperCoreDuringBrowserCloseError(error);
        }
    }

    /**
     * Scrapes a video.
     * @param url The url of the video to save
     * @param destPath The path where the video will be saved. Note that the extension should be webm.
     * @param options The [[ScrapingOptions]] to pass to this method.
     */
    public async scrape(url: string, destPath: string, options: ScrapingOptions = {}): Promise<void> {
        const scrapingOptions = handleScrapingOptions(options);

        if (!this.browser) {
            throw new VideoScraperCoreBrowserNotLaunchedError();
        }

        try {
            const logger = options.useGlobalDebug
                ? this.logger
                : new Logger({ debug: scrapingOptions.debug ?? this.options.debug, scope: scrapingOptions.debugScope });

            logger.debug('Launching page and going to the url', url);
            const page = await this.browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle0' });

            logger.debug('Executing the afterPageLoaded hook');
            await this.afterPageLoaded(scrapingOptions, page, logger);

            if (scrapingOptions.duration === null) {
                scrapingOptions.duration = await this.getVideoDuration(page, logger);
            }

            if (scrapingOptions.fullScreen) {
                await this.setVideoToFullScreen(page, logger);
            }
            await this.playVideo(page, logger);

            logger.debug(`Waiting for ${scrapingOptions.delayAfterVideoStarted}ms before starting recording`);
            await page.waitForTimeout(scrapingOptions.delayAfterVideoStarted);

            logger.debug('Staring recording');
            const file = fs.createWriteStream(destPath);
            const stream = await puppeteerStream.getStream(page, {
                audio: scrapingOptions.audio,
                video: scrapingOptions.video,
                mimeType: scrapingOptions.mimeType,
                audioBitsPerSecond: scrapingOptions.audioBitsPerSecond,
                videoBitsPerSecond: scrapingOptions.videoBitsPerSecond,
                frameSize: scrapingOptions.frameSize
            });
            stream.pipe(file);

            logger.debug('Waiting for video to end. Duration is', scrapingOptions.duration);
            await page.waitForTimeout(scrapingOptions.duration);

            logger.debug(`Waiting for ${scrapingOptions.delayAfterVideoFinished}ms before stopping recording`);
            await page.waitForTimeout(scrapingOptions.delayAfterVideoFinished);

            logger.debug('Stopping recording');
            await stream.destroy();
            file.close();

            logger.debug('Closing page');
            await page.close();
        } catch (error) {
            throw new VideoScraperCoreDuringScrapingError(error);
        }
    }

    /**
     * This method is called after the page, with the specified url, is loaded.
     * It can be used for things such as logging in if it is requested before reaching the video page.
     * @param options The [[ScrapingOptions]] that can be used or changed in this method
     * @param page The page (puppeteer) that is loaded
     * @param logger A logger instance to write log
     */
    protected abstract afterPageLoaded(options: ScrapingOptions, page: Page, logger: Logger): Promise<void>;
    /**
     * Returns the video duration selector, which is used by the method [[getVideoDuration]] to extract the video duration text from the page.
     */
    protected abstract getVideoDurationSelector(): string;
    /**
     * Returns the video full screen selector, which is used by the method [[setVideoToFullScreen]] to put the video in full screen.
     */
    protected abstract getFullScreenSelector(): string;
    /**
     * Returns the video play button selector, which is used by the method [[playVideo]] to play the video.
     */
    protected abstract getPlayButtonSelector(): string;
}
