#!/usr/bin/env node
const figlet = require('figlet');
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'type', type: String, defaultValue: 'marketplace' },
    { name: 'src', type: String }
]

console.log(figlet.textSync('Catalog Checker!', {
    horizontalLayout: 'default',
    verticalLayout: 'default'
}));

const options = commandLineArgs(optionDefinitions)

console.log("Checking catalog: [" + options.src + "] with type: [" + options.type + "]")

const results = []

const required_fields = [
    'id',
    'availability',
    'title',
    'description',
    'link',
    'image_link',
    'condition',
    'price',
    'google_product_category']

const availabilities = [
    'in stock', 
    'out of stock', 
    'preorder', 
    'available for order', 
    'discontinued']
    
const conditions = [
    'new', 
    'refurbished', 
    'used']

const taxonomy = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

// error placeholders
const errors = []
const invalid_taxonomy = []
const invalid_availability = []
const invalid_condition = []
const extension = path.extname(options.src)

if (extension === '.rss' || extension === '.xml') {
    console.log('checker currently not support ' + extension + ' filetype !')

} else {

    const separator = extension === '.tsv' ? '\t' : ','

    fs.createReadStream(options.src)
        .pipe(csv({ separator: separator }))
        .on('data', (data) => {
            const fields = Object.keys(data)
            // Checking required field exists
            required_fields.forEach(field => {
                if (!fields.includes(field) && !errors.includes(field)) {
                    errors.push(field)
                }
            })

            // Checking at least this three field exists one
            if (!(fields.includes('brand') || fields.includes('gtin') || fields.includes('mpn'))) {
                if (!errors.includes('gtin/brand/mpn')) {
                    errors.push('gtin/brand/mpn')
                }
            }

            if (!conditions.includes(data['condition']) && !invalid_condition.includes(data['condition'])) {
                invalid_condition.push(data['condition'])
            }

            if (!availabilities.includes(data['availability']) && !invalid_availability.includes(data['availability'])) {
                invalid_availability.push(data['availability'])
            }

            if (!taxonomy.includes(data['google_product_category']) && !invalid_taxonomy.includes(data['google_product_category'])) {
                invalid_taxonomy.push(data['google_product_category'])
            }
        })
        .on('end', () => {
            if (errors.length > 0) {
                console.log('Missing fields:')
                console.log(errors)
            }

            if (invalid_availability.length > 0) {
                console.log('Invalid availability:')
                console.log(invalid_availability)
            }

            if (invalid_taxonomy.length > 0) {
                console.log('Invalid product category (google product taxonomy):')
                console.log(invalid_taxonomy)
            }
        })
}