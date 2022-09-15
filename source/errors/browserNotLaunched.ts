import { VideoScraperCoreError } from '.';

/** The error extending [[VideoScraperCoreError]] that is thrown when actions on a non-launched browser are attempted to be executed */
export class VideoScraperCoreBrowserNotLaunchedError extends VideoScraperCoreError {
    /**
     * The constructor of the [[VideoScraperCoreBrowserNotLaunchedError]] class.
     * @param message The message of the error.
     * @param context The context of the error.
     */
    constructor(
        message = 'You cannot scrape if a browser was not launched. Use "scraper.launch()" before calling this method',
        context = null
    ) {
        super(message, context);
        this.name = 'VideoScraperCoreBrowserNotLaunchedError';
    }
}
