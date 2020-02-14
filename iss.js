/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

// use request to fetch IP address from JSON API
const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null); // Error is just a object we can create and pass around
      return;
    }

    // if we get here, all's well and we got the data
    else callback(null, JSON.parse(body).ip);
  });
};

const fetchCoordsByIP = (function(callback) {
  fetchMyIP((error, ip) => {
    if (error) throw error;
    request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
      if (error) {
        callback('There was a error', null);
        return;
      }
      if (JSON.parse(body).status === "error") {
        callback(
          `\nCode: ${JSON.parse(body).errors[0].code}\nError Message: ${JSON.parse(body).errors[0].message}`, null
        );
        return;
      }
      const coord = JSON.parse(body).data;
      const latitude = coord.latitude;
      const longitude = coord.longitude;
      callback(null, {latitude, longitude});
    });
  });
});

module.exports = {
  fetchMyIP,
  fetchCoordsByIP
};