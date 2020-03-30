const puppeteer = require("puppeteer");

const setLocalCovidData = require("./setLocalCovidData");
const setGlobalCovidData = require("./setGlobalCovidData");
const setLastUpdatedDate = require("./setLastUpdatedDate");

async function fetchCovid19Data(country, response) {
  const covid19Data = {
    globalTotalConfirmedCases: null,
    globalActiveCases: null,
    globalRecoveredCases: null,
    globalFatalCases: null,
    localData: [],
    dataLastUpdated: null
  };

  return (async () => {
    const countryInputSearchValue = country;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://bing.com/covid");

    try {
      const searchInput = await page.$("input.area");
      await searchInput.click();
      await searchInput.type(countryInputSearchValue);

      const firstSuggestedDiv = await page.$(".suggestion div.suggArea");

      const firstSuggestedDivInnerText = await page.evaluate(
        el => el.textContent,
        firstSuggestedDiv
      );
      const countryString = firstSuggestedDivInnerText;

      if (
        RegExp(countryInputSearchValue, "i").test(
          countryString.replace(/\s+/g, "")
        )
      ) {
        await firstSuggestedDiv.click();
      }

      await setLocalCovidData(countryString, page, covid19Data);

      await setGlobalCovidData(page, covid19Data);

      await setLastUpdatedDate(page, covid19Data);

      await browser.close();

      return covid19Data;
    } catch (error) {
      await browser.close();

      console.log(error.message);

      if (response) {
        response
          .status(500)
          .send(
            "Sorry server could  not process request. Make sure the correct country name is used in the URL path"
          );
      }
    }
  })();
}

module.exports = fetchCovid19Data;
