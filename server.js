/*
	server.js
	Main method. Log in to facebook, listens to messages, and posts.
*/

const INFO = require('./info.js');
const parse = require('./parse.js');

const login = require("facebook-chat-api");
const http = require('http');
const Firebase = require("firebase");
const request = require('request');
const FB = require('fb');
const https = require('https');
const PythonShell = require('python-shell');

// https://www.firebase.com/docs/web/guide/saving-data.html
/*
* Currently, data is organized by each individual message.
* Should organize it by user or conversation
*/
var message_data = new Firebase("https://danksinatra.firebaseio.com//Messages");

// Set access token
FB.setAccessToken(INFO.FB_ACCESS_TOKEN);

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
		
		// Echo response
        //api.sendMessage(message.body, message.threadID);
		parse.parse(api,message);
		
		
		// Alert me
		var msginfo = 'From: ' + message.senderName + '\nTime: ' + Date() + '\nMessage: \"' + message.body + '\"';
		//api.sendMessage(msginfo, INFO.MY_ID);
		
		var options = {
			mode: 'text',
			script: 'mail.py',
			pythonOptions: ['-u'],
			args: [msginfo]
		};
		PythonShell.run('mail.py', options, function (err, results) {
			if (err) throw err;
			console.log('Python results: %j', results);
			console.log('Python finished');
		});		

		// Add message to Firebase if they aren't from me
		//if(message.senderID != '100001305344580')
		message_data.push(message);
		
    });
});


/*
	Post time and weather to facebook every 3 hours.
	BUG: Time is way off
*/
var minutes = 60 * 4;
var the_interval = minutes * 60 * 1000;
setInterval(function(){
	http.get('http://api.wunderground.com/api/ecc2911f5f7c6247/conditions/q/TX/Houston.json',function(response){	
		//console.log(response.statusCode);
		
		var body = '';
		var temp = {};
		var status = {};
		//var date = new Date().toLocaleTimeString();
		//var update = 'The time is now ' + date + '.\n';
		var update = '';
		
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
			update += "The current temperature in Houston is " + temp + '.\n';
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
