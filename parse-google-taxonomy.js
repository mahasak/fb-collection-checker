#!/usr/bin/env node
const figlet = require('figlet')
const LineByLineReader = require('line-by-line')
const fs = require('fs')
const commandLineArgs = require('command-line-args')
const optionDefinitions = [
    { name: 'src', type: String }
]
var request = require('request');

const https = require("https");

const file = fs.createWriteStream("google-taxonomy.txt");

https.get("https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt", response => {
    var stream = response.pipe(file);
    const taxonomy = []

    stream.on("finish", function () {
        console.log(figlet.textSync('Google Taxonomy Parser!', {
            horizontalLayout: 'default',
            verticalLayout: 'default'
        }));
        const fileReader = new LineByLineReader('google-taxonomy.txt')

        fileReader.on('line', function (line) {
            // 'line' contains the current line without the trailing newline character.
            if(line.indexOf(' - ') > -1) {
                const output = line.split(' - ')
                console.log(output[1])
                taxonomy.push(output[1].trim())
            }
        })
        
        fileReader.on('end', () =>
            fs.writeFileSync('./data.json', JSON.stringify(taxonomy, null, 2))
        )
        
    });
});



