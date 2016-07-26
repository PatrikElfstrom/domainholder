const express = require('express');
const handlebars = require('express-handlebars');
const yargs = require('yargs').argv;
const app = express();
const fs = require('fs');
const coolors = require('./coolors');
const googleFonts = require('./google-fonts');
const config = require('./config');

let palettes = {};
let fonts = {};
let takenColors = [];

// Handlebars :-}
app.engine('handlebars', handlebars({
    layoutsDir:'.',
    defaultLayout: config.template
}));
app.set('views', '.');
app.set('view engine', 'handlebars');
app.set('trust proxy', true);
app.use(express.static('.'));

function getRandom( array ) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomColor( colors ) {
    let color = getRandom( colors );

    if( takenColors.includes( color ) ) {
        color = getRandomColor( colors )
    }

    takenColors.push(color);

    return color;
}


function updatePalettes( callback ) {
    coolors({
        l: yargs.length
    }, palettesArray => {

        fs.writeFile("./palettes.json", JSON.stringify(palettesArray), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("Palettes was updated!");
            if(callback) callback();
        });
    });
}

function updateGoogleFonts( callback ) {
    googleFonts( fonts => {

        // filter out all fonts with latin
        const latinFonts = fonts.filter( font => {
            if( font.subsets.includes('latin') ) {
                return true;
            } else {
                return false;
            }
        });

        fs.writeFile("./fonts.json", JSON.stringify(latinFonts), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("Fonts was updated!");
            if(callback) callback();
        });
    });
}

if( yargs.updatepalettes ) {
    updatePalettes();
}

else if( yargs.updatefonts ) {
    updateGoogleFonts();
}

else {

    try {
        palettes = require('./palettes');
    } catch (error) {
        updatePalettes(() => {
            palettes = require('./palettes');
        });
    }

    try {
        fonts = require('./fonts');
    } catch (error) {
        updateGoogleFonts(() => {
            fonts = require('./fonts');
        });
    }

    app.get('/', function (req, res) {
        takenColors = [];
        const domain = req.hostname.replace('www.', '');
        const palette = getRandom( palettes );
        const font = getRandom( fonts );

        const fontUrlArray = [];
              fontUrlArray.push('//fonts.googleapis.com/css?family=');
              fontUrlArray.push(font.family.replace(/ /g, '+'));
              fontUrlArray.push('&subset=latin');
        font['url'] = fontUrlArray.join('');
        font['siteUrl'] = 'https://fonts.google.com/specimen/' + font.family.replace(' ', '+');

        palette.info['url'] = 'https://coolors.co/' + palette.colors.join('-');

        res.render( config.template, {
            googleAnalytics: config.google.analytics,
            domain: domain,
            font: font,
            palette: palette,
            backgroundColor: getRandomColor( palette.colors ),
            textColor: getRandomColor( palette.colors ),
            textColor2: getRandomColor( palette.colors )
        });
    })
     
    app.listen(config.port)
}