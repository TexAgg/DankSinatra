const INFO = require('./info.js');
const parse = require('./parse.js');

const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");
const request = require('request');
const FB = require('fb');
const https = require('https');

// https://www.firebase.com/docs/web/guide/saving-data.html
/*
* Currently, data is organized by each individual message.
* Should organize it by user or conversation
*/
var message_data = new Firebase("https://danksinatra.firebaseio.com//Messages");

// Set access token
FB.setAccessToken('CAAQF0gVJQWUBAHH911wEYi268weeOThGWHw5ZBHOZBaSHbTA8roBU0LhOPZAUCQt1JV8zMUYI01HdDLiBN83kIQe9G3EZAEdkUR68nMqrQPsePMq2INsWPVmagT3DJ6kDBbIhOMzHrUYNpsGoi41s6nizskiuKGZCtAFC6j8V99FgHombVvX0');

http.createServer(function (request, response) {
  console.log("ping");
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write("Hello\n");
  response.end("from the other side.");
}).listen(process.env.PORT || 5000);

// Prevent idling
setInterval(function() {
  http.get("http://danksinatra.herokuapp.com", function(response) {
    console.log("pong");
  });
}, 300000); // 5 min


/**
 * MAIN METHOD FOR CHATTING
 * 
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
	
	
	/*
	// Post status on startup
	FB.api('me/feed', 'post', {message: "I am sentient now."}, function(response){
		if(!response || response.error) return console.error(response.error);
		console.log('Post id: ' + response.id);
	});
	*/
	
		
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
});


/*
	Post time and weather to facebook every 3 hours.
*/
var minutes = 60 * 3;
var the_interval = minutes * 60 * 1000;
setInterval(function(){
	http.get('http://api.wunderground.com/api/ecc2911f5f7c6247/conditions/q/TX/Houston.json',function(response){	
		//console.log(response.statusCode);
		
		var body = '';
		var temp = {};
		var status = {};
		var date = new Date().toLocaleTimeString();
		var update = 'The time is now ' + date + '.\n';
		
		// Add json response to string
		response.on('data',function(chunk){
			body += chunk;
		});
		
		response.on('end',function(){	
			// Parse data
			var weather_data = JSON.parse(body);
			temp = weather_data.current_observation.temp_f;
			status = weather_data.current_observation.weather;
			
			console.log(temp);
			console.log(status);
			update += "The current temperature is " + temp + '.\n';
			update += "The weather is " + status + '.';
			
			console.log(update);
			
			FB.api('me/feed','post',{message: update},function(response){
				if(!response || response.error){
					console.log(!response ? 'error occured': response.error);
					return;
				}
				console.log('Post id: ' + response.id);
			});
			
		});
	});
},the_interval);
