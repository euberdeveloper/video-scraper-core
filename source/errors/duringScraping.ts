import { VideoScraperCoreError } from '.';

/** The error extending [[VideoScraperCoreError]] that is thrown when an error occurs during a video scraping */
export class VideoScraperCoreDuringScrapingError extends VideoScraperCoreError {
    /**
     * The constructor of the [[VideoScraperCoreDuringScrapingError]] class.
     * @param error The error that caused this error.
     * @param message The message of the error.
     * @param otherInfo Other information about this error.
     */
    constructor(error: Error, message = 'There was an error during the scraping.', otherInfo?: any) {
        super(message, {
            error,
            otherInfo
        });
        this.name = 'VideoScraperCoreDuringScrapingError';
    }
}
