module.exports = {
    entryPoints: [
        './source'
    ],
    name: 'video-scraper-core - DEV',
    tsconfig: 'source/tsconfig.json',
    gaID: process.env.GA_TOKEN,
    out: './docs/documentation/html-dev'
};