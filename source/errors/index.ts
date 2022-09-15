/* eslint-disable @typescript-eslint/naming-convention */

/** The base error class of the tum-conf-video-scraper module */
export class VideoScraperCoreError extends Error {
    public __proto__: Error;
    /** A context that may contain information about the error */
    public readonly context: any;

    /**
     * The constructor of the [[VideoScraperCoreError]] class
     * @param message The message of the error
     * @param context The context of the error
     */
    constructor(message = 'There was a generic error with VideoScraperCore', context: any = null) {
        super(message);

        this.name = 'VideoScraperCoreError';
        this.context = context;
    }
}

export * from './browserNotLaunched';
export * from './duringBrowserLaunch';
export * from './duringBrowserClose';
export * from './duringScraping';
