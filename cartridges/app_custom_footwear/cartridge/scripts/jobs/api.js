function api() {
  let Logger = require("dw/system/Logger");

  let HTTPClient = require("dw/net/HTTPClient");

  let httpClient = new HTTPClient();
  httpClient.setTimeout(2000);
  let message;
  httpClient.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=karachi&appid=5dc7df9cbedfba250a74a0b0ece7979f");
  httpClient.send();

  if (httpClient.statusCode == 200) {
    message = httpClient.text
    Logger.info([message]);
  } else {
    // error handling
    message = "An error occured with status code " + httpClient.statusCode;
  }
}

module.exports.api = api;
