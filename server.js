const INFO = require('./info.js');
const parse = require('./parse.js');

const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");
const request = require('request');
const FB = require('fb');
const https = require('https');

// https://www.firebase.com/docs/web/guide/saving-data.html
var message_data = new Firebase("https://danksinatra.firebaseio.com//Messages");

// Set access token
FB.setAccessToken('CAAQF0gVJQWUBAHH911wEYi268weeOThGWHw5ZBHOZBaSHbTA8roBU0LhOPZAUCQt1JV8zMUYI01HdDLiBN83kIQe9G3EZAEdkUR68nMqrQPsePMq2INsWPVmagT3DJ6kDBbIhOMzHrUYNpsGoi41s6nizskiuKGZCtAFC6j8V99FgHombVvX0');

/*
// Get better access token
FB.api('oauth/access_token', {
    client_id: '1132299496800613',
    client_secret: '14c5dbcb7631cd5e0161ef71b511f961',
    grant_type: 'fb_exchange_token',
    fb_exchange_token: 'CAAQF0gVJQWUBAOpVFmE7z9eMnvAvZBTCtpYZAYtffffgqYfshuUZCwqSe8soC4JBxXEZBQ4EVNmWF27wq8eHT4bdaqqzHHvk5MCGsahJxyZCunyYcGr3DgKthlSm1OnYVWLi50jE2jIj0BVkNG4uHLGAJmR2fvCq1z9ZCvbHouZB4DoQcIHDQZCftFOm5JA3a7sk8jxDQs95nm0Y859b1Ftc'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    var expires = res.expires ? res.expires : 0;
});
*/

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
	};
	api.sendMessage(message, INFO.MY_ID);
	
	// Post status on startup
	FB.api('me/feed', 'post', {message: "I am sentient now."}, function(response){
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
		//parse.parse(api,message);
		
		/*
		// Alert me
		var msginfo = 'From: ' + message.senderName + '\nTime: ' + Date() + '\nMessage: \"' + message.body + '\"';
		api.sendMessage(msginfo, INFO.MY_ID);
		*/
		
		// Add message data to Firebase
		message_data.push({
			"From": message.senderName,
			"Time": Date(),
			"Message": message.body
		});
    });
	
	
	// Post to facebook
	var body = 'The time is now ' + Date();
	var minutes = 120 * 3;
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
