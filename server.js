// https://github.com/bsansouci/marc-zuckerbot
// https://github.com/Schmavery/facebook-chat-api

const INFO = require('./info.js');
const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");

http.createServer(function (request, response) {
  console.log("ping");
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Hello");
  response.end("");
}).listen(process.env.PORT || 5000);

setInterval(function() {
  http.get("http://danksinatra.herokuapp.com", function(response) {
    console.log("pong");
  });
}, 1800000 * Math.random() + 1200000); // between 20 and 50 min

/**
 * Login to facebook.
 * Replace INFO.EMAIL and INFO.PASSWORD with the account email and password.
 */
login({email: INFO.EMAIL, password: INFO.PASSWORD}, function callback (error, api) {
	if(error) return console.error(error);
	
	// Send me a fb message upon login
	var message = {
		body: "I'm logged in now!",
		//attachments: {type: "photo", url:"media/monkey.jpg"} 
	};
	api.sendMessage(message, INFO.MY_ID);
	
	// Respond to messages
	api.listen(function callback(error, message) {
		// Echo response
        api.sendMessage(message.body, message.threadID);
    });
	
});
