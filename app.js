const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));

mongoose.connect("mongodb+srv://zhosya:zhosya@atlascluster.7brkquj.mongodb.net/?retryWrites=true&w=majority");

mongoose.connection.on("connected",
()=>{console.log("Mongo db established")})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const News = require('./models/News')
const Currency = require('./models/Currency');
const User = require('./models/User');
const WeatherData = require('./models/WeatherData')

// Routes
app.get('/', (req, res) => {
  res.render('register');
});

app.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    req.session.user = user;
    res.redirect(`/weather/${user._id}`);
  } else {
    res.send('Invalid username or password.');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ username, email});
    if (existingUser) {
      res.render("register.ejs", { errorMessage: "Username already exists" });
      return; 
    }
    let isAdmin = false;
    if (password === "zhansaya" && email === "zhansaya@gmail.com" && username === "zhansaya") {
      isAdmin = true;
    }
    const newUser = new User({ username, email, password, isAdmin });
    await newUser.save();
    req.session.userId = newUser._id;
    res.redirect(`/weather/${newUser._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/weather/:userId", async (req, res) => {
  try {
    res.render("weather", {
      userId: req.params.userId,
      weatherData: {
        cityName: null,
        country: null,
        temperature: null,
        feelsLike: null,
        description: null,
        weatherIcon: null,
        coordinates: null,
        humidity: null,
        pressure: null,
        windSpeed: null,
        countryCode: null,
        rainVolume: null,
      },
    }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
});

app.get("/currency/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; 
    const currencyInfo = {
      user: userId,
      currencyCode: null,
    
  };
    res.render("currency", { userId: userId, savedCurrency: currencyInfo }); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
});

app.post("/currency/:userId", async (req, res) => {
  try {
      const  currencyCode = req.body.currencyCode;
      const amount = req.body.amount
      const userId = req.params.userId;
      if (!currencyCode || !amount) {
          return res.status(400).json({ error: 'Не указаны все необходимые данные' });
      }

      const apiUrl = `https://open.er-api.com/v6/latest/${currencyCode}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.rates && response.data.rates.USD) {
          const usdAmount = amount * response.data.rates.USD;

          const currencyInfo = {
              user: req.params.userId,
              currencyCode: currencyCode,
              amount,
              usdAmount
          };

          const savedCurrency = await Currency.create(currencyInfo);

          res.render("currency", {
            userId: req.params.userId,
            savedCurrency: savedCurrency,
          });
      } else {
          res.status(400).json({ error: 'Invalid currency' });
      }
  } catch (error) {
      console.log(error);
      res.status(500).send("Error converting currency");
  }
});


const handler = async (req, res) => {
  try {
    const apiKey = 'b5fdd2a1af9a0ae8da767e9a8b7e5d81';
    const city = req.body.city;
    const userId = req.session.userId; 
    if (!city) {
      return res.status(400).json({ error: 'Не указан город в запросе' });
    }
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
 
    const response = await axios.get(apiUrl);
    const weatherData = response.data;
    const retrievalTime = new Date();
    const temperature = weatherData.main.temp;
    const feelsLike = weatherData.main.feels_like;
    const weatherIcon = weatherData.weather[0].icon;
    const description = weatherData.weather[0].description;
    const coordinates = `(${weatherData.coord.lat}, ${weatherData.coord.lon})`;
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = weatherData.wind.speed;
    const countryCode = weatherData.sys.country;
    const rainVolume = weatherData.rain ? weatherData.rain["1h"] : "N/A";
    const cityName = weatherData.name;
    const country = weatherData.sys.country;

    await WeatherData.create({
      user: req.params.userId,
      city: cityName,
      temperature,
      feelsLike,
      retrievalTime,
      weatherIcon,
      description,
      coordinates,
      humidity,
      pressure,
      windSpeed,
      countryCode,
      rainVolume,
      country,
    });
    const newWeatherData = await WeatherData.findOne({
      user: req.params.userId,
      city: cityName,
    });

    if (!newWeatherData) {
      res.status(404).send("Weather data not found for this user.");
      return;
    }
    res.render("weather", {
      userId: req.params.userId,
      weatherData: newWeatherData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching weather data");
  }
}

app.post("/weather/:userId", handler);

app.get("/news/:userId", async (req, res) => {
  try {
    const apiKey = '6dcf985c19dc4b84ac1de09160364a42'; 
    const apiUrl = 'https://newsapi.org/v2/top-headlines';
    const country = 'us';
    const apiKeyParam = `apiKey=${apiKey}`;
    const url = `${apiUrl}?country=${country}&${apiKeyParam}`;
    const response = await axios.get(url);
    if (response.data && response.data.articles) {
      const userId = req.params.userId; 
      const newsArticles = response.data.articles;
      res.render("news", { userId: userId, articles: newsArticles }); 
    } else {
      res.status(400).send('Error fetching news');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching news data");
  }
})


app.post("/news/:userId", async (req, res) => {
  try {
    const apiKey = '6dcf985c19dc4b84ac1de09160364a42';
    const apiUrl = 'https://newsapi.org/v2/top-headlines';
    let { country, keyword, date } = req.body; 

    if (country === undefined || country === null) {
      country = 'us';
    }

    const apiKeyParam = `apiKey=${apiKey}`;
    const url = `${apiUrl}?country=${country}&q=${keyword}&from=${date}&${apiKeyParam}`;

    const response = await axios.get(url);
    const articles = response.data.articles;

    await News.create({
      user: req.params.userId,
      news: articles
    });

    res.render("news", { userId: req.params.userId, articles: articles });
  } catch (error) {
    console.error("Ошибка при сохранении и отправке новостей:", error);
    res.status(500).json({ error: "Произошла ошибка при сохранении и отправке новостей." });
  }
});

const isAdmin = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    console.log(user)
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).send('Access forbidden. Only administrators can access this page.');
    }
  } catch (error) {
    console.error('Ошибка при поиске пользователя:', error);
    res.status(500).send('Internal Server Error');
  }
};


app.get('/admin/:userId', isAdmin,async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await User.find();
    res.render('admin', {  userId: userId, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/:userId', isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    const users = await User.find();
    res.render('admin', { userId: userId, users}); 
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/admin/deleteUser/:deletedUserId/:userId', isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userIdToDelete = req.params.deletedUserId;
    await User.findByIdAndDelete(userIdToDelete);
    const users = await User.find();
    res.render('admin', { userId: userId, users});
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const weatherHistory = await WeatherData.find({ user: userId });
    const currencyHistory = await Currency.find({ user: userId });
    const newsHistory = await News.find({ user: userId });
    const history = {
      weatherHistory,
      currencyHistory,
      newsHistory
    };
    const user = await User.findById(userId);
    res.render('history', { userId: userId, user: user,  history: history });

  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

