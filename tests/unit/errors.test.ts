import {
    VideoScraperCoreError,
    VideoScraperCoreDuringScrapingError,
    VideoScraperCoreBrowserNotLaunchedError,
    VideoScraperCoreDuringBrowserCloseError,
    VideoScraperCoreDuringBrowserLaunchError
} from '../../source';

describe('Test: errors classes', function () {
    it(`Should properly create a default VideoScraperCoreError`, function () {
        const error = new VideoScraperCoreError();

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(VideoScraperCoreError);
        expect(error.name).toEqual('VideoScraperCoreError');
    });
    it(`Should properly create a custom VideoScraperCoreDuringScrapingError`, function () {
        const error = new VideoScraperCoreDuringScrapingError(new Error('msg'), 'MESSAGE');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(VideoScraperCoreError);
        expect(error).toBeInstanceOf(VideoScraperCoreDuringScrapingError);
        expect(error.name).toEqual('VideoScraperCoreDuringScrapingError');
        expect(error.message).toEqual('MESSAGE');
    });
    it(`Should properly create a custom VideoScraperCoreBrowserNotLaunchedError`, function () {
        const error = new VideoScraperCoreBrowserNotLaunchedError('MESSAGE');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(VideoScraperCoreError);
        expect(error).toBeInstanceOf(VideoScraperCoreBrowserNotLaunchedError);
        expect(error.name).toEqual('VideoScraperCoreBrowserNotLaunchedError');
        expect(error.message).toEqual('MESSAGE');
    });
    it(`Should properly create a custom VideoScraperCoreDuringBrowserCloseError`, function () {
        const error = new VideoScraperCoreDuringBrowserCloseError(new Error('msg'), 'MESSAGE');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(VideoScraperCoreError);
        expect(error).toBeInstanceOf(VideoScraperCoreDuringBrowserCloseError);
        expect(error.name).toEqual('VideoScraperCoreDuringBrowserCloseError');
        expect(error.message).toEqual('MESSAGE');
    });
    it(`Should properly create a custom VideoScraperCoreDuringBrowserLaunchError`, function () {
        const error = new VideoScraperCoreDuringBrowserLaunchError(new Error('msg'), 'MESSAGE');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(VideoScraperCoreError);
        expect(error).toBeInstanceOf(VideoScraperCoreDuringBrowserLaunchError);
        expect(error.name).toEqual('VideoScraperCoreDuringBrowserLaunchError');
        expect(error.message).toEqual('MESSAGE');
    });
});
