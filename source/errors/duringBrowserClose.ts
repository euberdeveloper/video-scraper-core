import { VideoScraperCoreError } from '.';

/** The error extending [[VideoScraperCoreError]] that is thrown when an error occurred when a browser is getting closed */
export class VideoScraperCoreDuringBrowserCloseError extends VideoScraperCoreError {
    /**
     * The constructor of the [[VideoScraperCoreDuringBrowserCloseError]] class.
     * @param error The error that caused this error.
     * @param message The message of the error.
     * @param otherInfo Other information about this error.
     */
    constructor(error: Error, message = 'There was an error during the browser close.', otherInfo?: any) {
        super(message, {
            error,
            otherInfo
        });
        this.name = 'VideoScraperCoreDuringBrowserCloseError';
    }
}
