module.exports = {
    entryPoints: [
        './source/index.ts'
    ],
    name: 'video-scraper-core',
    excludeExternals: true,
    includeVersion: true,
    tsconfig: 'source/tsconfig.json',
    gaID: process.env.GA_TOKEN,
    excludePrivate: true,
    excludeProtected: true,
    disableSources: true,
    out: './docs/documentation/html'
};