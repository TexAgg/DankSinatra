const INFO = require('./info.js');
const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");
const request = require('request');
const FB = require('fb');

//FB.setAccessToken('CAACEdEose0cBACwErIiUBNC1GVrt5oQEbbd523QasZB81IZA2aTmTGbcW4EpVnCURGNEOkkWC9BE8zS4JqbKM3W6PvqVYnsRAjsYq0hyRZAnTAY38dJxkHVRvA9eATtk7ihPttW6hdPF1PZCOOw5e4xoAWqYOTjCkGHUPjcFUl0zkAxMSbmN7ZAXhi1TKZA1W35081JcwrI5UiXm1ZBpMmX');

http.createServer(function (request, response) {
  console.log("ping");
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Hello");
  response.end("");
}).listen(process.env.PORT || 5000);

// Prevent idling
setInterval(function() {
  http.get("http://danksinatra.herokuapp.com", function(response) {
    console.log("pong");
  });
}, 300000); // 5 min

/**
 * Login to facebook.
 * Replace INFO.EMAIL and INFO.PASSWORD with the account email and password.
 */
login({email: INFO.EMAIL, password: INFO.PASSWORD}, function callback (error, api) {
	if(error) return console.error(error);
	
	// Send me a fb message upon startup
	var message = {
		body: "I'm logged in now!\n" + Date(),
		//attachments: {type: "photo", url:"media/monkey.jpg"} 
	};
	api.sendMessage(message, INFO.MY_ID);
	
	/*
	// Post status on startup
	FB.api('me/feed', 'post', {message: "I am up an running again with new improvements!"}, function(response){
		if(!response || response.error) return console.error(response.error);
		console.log('Post id: ' + response.id);
	});
	*/
		
	// Respond to messages
	api.listen(function callback(error, message) {
		
		// Echo response
        api.sendMessage(message.body, message.threadID);
		
		// Alert me
		var msginfo = 'From: ' + message.senderName + '\nTime: ' + Date() + '\nMessage: \"' + message.body + '\"';
		api.sendMessage(msginfo, INFO.MY_ID);
    });
	
	/*
	// Post to facebook
	var body = 'The time is now ' + Date();
	var minutes = 120;
	var the_interval = minutes * 60 *1000;
	setInterval(function(){
	FB.api('me/feed', 'post', { message: body}, function (res) {
		if(!res || res.error) {
			console.log(!res ? 'error occurred' : res.error);
			return;
		}
		console.log('Post Id: ' + res.id);
	});
	}, the_interval);
	*/
	
});
