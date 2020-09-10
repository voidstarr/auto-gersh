require('dotenv').config()
const got = require('got')
const cheerio = require('cheerio')
const moment = require('moment')

const username = process.env.USERNAME
const password = process.env.PASSWORD

async function main() {
  let response = await got('https://www.cpp.edu/~dagershman/cs2600-001/', {
    resolveBodyOnly: true,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  });

  let $ = cheerio.load(response);
  let links = $('a');
  let today = moment().hours(0).minutes(0).seconds(0).millisecond(0)

  // Locate today's date
  for (let i = 0; i < links.length; i++) {
    let link = $(links[i]);
    let format = /^Day [0-9]{1,2} - .*, (.*, 2020)/g.exec(link.text());
    if (!format || format.length !== 2) continue; // Does not match the date format

    let date = moment(format[1], 'MMMM D, YYYY');
    if (!date.isSame(today)) continue; // Not today

    let rawSectionText = $(`#outline-container-${link.attr('href').substring(1)}`).text().trim();
    let zoomId = /Meeting ID: ([0-9]* [0-9]* [0-9]*)/i.exec(rawSectionText)[1];
    let zoomPassword = /Pass.*: ([0-9]*)/i.exec(rawSectionText)[1];
    console.log(`Meeting ID: ${zoomId}`);
    console.log(`Passcode: ${zoomPassword}`);
    console.log(`https://cpp.zoom.us/j/${zoomId.replace(/ /g, '')}`)
  }
}

main().catch(console.log)
