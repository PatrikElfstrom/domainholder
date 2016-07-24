(() => {
    'use strict';
    const https = require('https');
    const merge = require('merge');
    const querystring = require('querystring');
    const CryptoJS = require('crypto-js');
    const config = require('./config');

    function sslDecrypt(string, ajaxKey = config.coolors.sslKey) {
        const bytes = CryptoJS.AES.decrypt(string, ajaxKey);
        const plaintext = bytes.toString(CryptoJS.enc.Utf8);
        return plaintext;
    }

    function parsePalettes( result, offset, callback ) {
        let data = JSON.parse(result);
            data = JSON.parse(sslDecrypt(data.reply));

        let palettes = data.palettes[offset % 50];

        if( palettes.length === 1 ) {
            palettes = palettes[0];
        }

        callback( palettes );
    }

    const coolors = ( userPostData, callback ) => {

        const defaultPostData = {
            o: 0,
            l: 10,
            s: 'best',
            t: '',
            token: ''
        }

        const postData = merge(defaultPostData, userPostData);

        const requestPostData = querystring.stringify(postData);

        const options = {
            hostname: config.coolors.hostname,
            port: config.coolors.port,
            path: config.coolors.path,
            method: 'POST',
            headers: {
                'referer': config.coolors.referer,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': Buffer.byteLength(requestPostData)
            }
        };

        var req = https.request(options, res => {
            let responseString = '';

            res.on('data', data => {
                responseString += data;
            });

            res.on("end", function () {
                parsePalettes( responseString, postData.o, callback );
            });
        });

        req.write(requestPostData);
        req.end();

        req.on('error', error => {
            console.error(error);
        });
    }

    module.exports = coolors;
})();