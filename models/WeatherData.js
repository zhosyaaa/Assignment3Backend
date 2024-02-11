const mongoose = require("mongoose");

const weatherDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", 
  },
  city: String,
  temperature: Number,
  feelsLike: Number,
  retrievalTime: Date, 
  weatherIcon: String,
  description: String,
  coordinates: String,
  humidity: Number,
  pressure: Number,
  windSpeed: Number,
  countryCode: String,
  rainVolume: String,
  country: String,
});


module.exports = mongoose.model("WeatherData", weatherDataSchema);
