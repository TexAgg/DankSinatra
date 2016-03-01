const INFO = require('./info.js');
const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");
const request = require('request');
const FB = require('fb');

// Set access token
FB.setAccessToken('CAAQF0gVJQWUBAHen6FZAuCZC2ycPIRkovZAUhroQbS2gsdrSG5LDXyxD8N0h4xUOmGI98e6IwVEXAgM7lZCqWdWtTSfm7NZARWMuUaXfz2ZBW0DZCHzxbmlNcvmsTlMAlPXQGTsVs7BvHmSeYTTMJWQ45CZC1Pkb43ZAUqKFkSUwgnqyRIVxgVECDirO9YC7WJGFE0wQcOM6HWwZDZD');

// Get better access token
FB.api('oauth/access_token', {
    client_id: '1132299496800613',
    client_secret: '14c5dbcb7631cd5e0161ef71b511f961',
    grant_type: 'fb_exchange_token',
    fb_exchange_token: 'CAAQF0gVJQWUBAHen6FZAuCZC2ycPIRkovZAUhroQbS2gsdrSG5LDXyxD8N0h4xUOmGI98e6IwVEXAgM7lZCqWdWtTSfm7NZARWMuUaXfz2ZBW0DZCHzxbmlNcvmsTlMAlPXQGTsVs7BvHmSeYTTMJWQ45CZC1Pkb43ZAUqKFkSUwgnqyRIVxgVECDirO9YC7WJGFE0wQcOM6HWwZDZD'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    var expires = res.expires ? res.expires : 0;
});


http.createServer(function (request, response) {
  console.log("ping");
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Hello");
  response.end("from the other side.");
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
	
	// Post status on startup
	FB.api('me/feed', 'post', {message: "TAMU is bad at football"}, function(response){
		if(!response || response.error) return console.error(response.error);
		console.log('Post id: ' + response.id);
	});
		
	// Respond to messages
	api.listen(function callback(error, message) {
		
		/*
		Parse message with function declared in another file,
		parse.js, then return the response.
		*/
		
		// Echo response
        api.sendMessage(message.body, message.threadID);
		
		// Alert me
		var msginfo = 'From: ' + message.senderName + '\nTime: ' + Date() + '\nMessage: \"' + message.body + '\"';
		api.sendMessage(msginfo, INFO.MY_ID);
    });
	
	
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
	
	
});
