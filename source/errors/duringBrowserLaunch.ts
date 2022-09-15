import { VideoScraperCoreError } from '.';

/** The error extending [[VideoScraperCoreError]] that is thrown when an error occurs during the launch of a browser */
export class VideoScraperCoreDuringBrowserLaunchError extends VideoScraperCoreError {
    /**
     * The constructor of the [[VideoScraperCoreDuringBrowserCloseError]] class.
     * @param error The error that caused this error.
     * @param message The message of the error.
     * @param otherInfo Other information about this error.
     */
    constructor(error: Error, message = 'There was an error during the browser launch.', otherInfo?: any) {
        super(message, {
            error,
            otherInfo
        });
        this.name = 'VideoScraperCoreDuringBrowserLaunchError';
    }
}
