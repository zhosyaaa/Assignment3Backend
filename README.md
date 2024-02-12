# neWs Web Application

neWs is a web application that provides information about weather, currency conversion, and top headlines. The application is built using Node.js, Express, and integrates with external APIs for weather data, currency conversion, and news articles.

## https://news-and-weather.onrender.com

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zhosyaaa/Assignment3Backend.git

2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Start the server using `nodemon app.js`.

## Usage
- The server runs on port 3000.
- Access the weather in a web browser via the link `http://localhost:3000/weather/:userId`.
- Calculate the dollar exchange rate for any other currency using the link `http://localhost:3000/currency/:userId`.
- ``http://localhost:3000/news/:userId`: for getting news
- `http://localhost:3000`: login or register
- `http://localhost:3000/admin/:userId`: admin page

## Admin information:
- username: zhansaya
- email: zhansaya@gmail.com
- password: zhansaya

## Dependencies
- **Express:** Used for server setup and routing.
- **Body-parser:** Middleware for parsing incoming request bodies.
- **Axios:** Handles HTTP requests.
- **Path:** Helps manage file paths.
- **Nodemon** Monitors for changes and automatically restarts the server.

## APIs Used
- OpenWeatherMap API - For weather data.
- News API - For top headlines news articles.
- ExchangeRate-API - For currency conversion.

## Running the Server
The server script is located in `app.js`. Start the server using `nodemon app.js`.

## File Structure
- `views/`: Contains client-side files (ejs).
- `models/`/: For mongoose schemas