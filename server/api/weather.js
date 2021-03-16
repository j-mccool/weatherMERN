const WEATHER = require("../models/Weather");
const axios = require("axios");

// Configuring the path to read the environment variable file, .env, to get the weather api key
require("dotenv").config({ path: "./../../../.env" });

const baseUrl = "http://api.openweathermap.org/data/2.5/weather";

class Weather {
    getWeatherData = async (zipCode, tempMetric) => {
    /**
     * Gets the weather data based on the zipcode and which temp system to converge to (imperial/metric system)
     *
     * @param {number} zipCode The zipcode used to get the weather info from the weather api
     * @param {string} tempMetric This is either "imperial" (use Fahrenheit) or "metric" (use Celsius)
     * @return {JSON} The data response from the weather api call.
     */
    let url = `${baseUrl}?zip=${zipCode},us&appid=${process.env.WEATHER_KEY}&units=${tempMetric}`;

    // Awaitable call to get the information from the weather api and then return the data.
    // TODO: Add error handling for this call
    return (await axios(url)).data;
    }

    saveWeatherDataToMongo = async (zipCode, data) => {
    /**
     * Saves the weather data using hte zipcode as the unique identifier
     * If it already exists, replace, if not, then add.
     *
     * @param {number} zipCode The zipcode used to identifiy the document to upsert
     * @param {string} data Weather data to save/update
     * @return {JSON} The data response from the weather api data.
     */

      const filter = {
        zip: zipCode,
      };

      const replace = {
        ...filter,
        ...data,
        data: Date.now(),
      };
      await this.findOneReplace(filter, replace);
    };

    /**
     * Saves Weather data to MongoDB
     * 
     * @param {number} zipCode The zipcode used as unique identifier to find the document from mongo.
     * @return {JSON} The data response from the mongodb.
     */
    getWeatherDataFromMongo = async (zipCode) => {
        return WEATHER.findOne({zip: zipCode});
    }

    /**
     * If a document already exists with the filter, then replace, if not, add.
     * 
     * @param {{zip: number}} filter The filter is the zipcode used as unique identifier to find the document from mongo.
     * @return {JSON} The data response from the mongodb.
     */
  async findOneReplace(filter, replace) {
      await WEATHER.findOneAndReplace(filter, replace, {new: true, upsert: true});
  }
}

module.exports = Weather;
