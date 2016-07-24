(() => {
    'use strict';
    const https = require('https');
    const config = require('./config');

    const googleFonts = ( apiKey, callback ) => {
        const url = config.googleFonts.api.url + '?key=' + config.googleFonts.api.key;

        https.get(url, res => {
            let responseString = '';

            res.on('data', data => {
                responseString += data;
            });

            res.on('end', () => {
                const fonts = JSON.parse(responseString)
                callback(fonts.items);
            });

        }).on('error', error => {
          console.error(error);
        });
    }

    module.exports = googleFonts;
})();