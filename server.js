/*
	server.js
	Main method. Log in to facebook, listens to messages, and posts.
	The "ears" of Dank
*/

// Set environment variables
require('dotenv').config();

//const parse = require('./parse.js');

const login = require("facebook-chat-api");
const FB = require('fb');
const http = require('http');
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const Client = require('node-rest-client').Client;
const schedule = require('node-schedule');
const Firebase = require('firebase');
const cool = require('cool-ascii-faces');
const cows = require('cows');
const url = require('url');
const predict = require('eightball');
const greetings = require('greetings');
const shake_insult = require('shakespeare-insult');
const emoji = require('node-emoji');

var db = new Firebase(process.env.DANK_SINATRA_FIREBASE);
var message_reqs = db.child('Requests');
//var message_reqs = db.child("Requests");
var usersDB = db.child("users");
var chatsDB = db.child("chats");


// Set access token
FB.setAccessToken(process.env.FB_TOKEN);
var tag_id = "AaL3tJWg6NEupPka9yVHAZdJ4FDJBfoloNmbFKUriPffOsvUEd7-jlfd0ydn37_05MrdOY1PeVLpOQjiyur4qJyHjY7OToIxXKRfVndsLtS8cQ";

// Use for REST module
var client = new Client();

// Set up web page
fs.readFile('static/index.html', function(err, html){
	if(err) throw err;
	http.createServer(function (request, response) {
	console.log("ping");
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write(html);
	response.end();

	}).listen(process.env.PORT || 5000);
});

// Prevent idling
setInterval(function() {
	//http.get("danksinatra.mybluemix.net", function(response) {
	http.get("danksinatra.herokuapp.com", function(response) {
    console.log("pong");
  });
}, 300000); // 5 min


/**
 * MAIN METHOD FOR CHATTING
 * 
 * Login to facebook.
 */
//login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, {forceLogin: true}, function callback (error, api) {
login({email: process.env.EMAIL, password: process.env.PASSWORD}, {forceLogin: true}, function callback (error, api) {
	if(error) return console.error(error);
	// Set appstate
	//fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
	
	console.log("Logged in!");
	
	// Send me a fb message upon startup
	var message = {
		body: "I'm logged in now!\n" + Date(),
	};
	api.sendMessage(message, process.env.MY_ID);
	
	
	/*
	// Post status on startup
	FB.api('me/feed', 'post', {message: "Kennedy cheated on his wife."}, function(response){
		if(!response || response.error) return console.error(response.error);
		console.log('Post id: ' + response.id);
	});
	*/
	
		
	// Respond to messages
	api.listen(function callback(error, message) {
		
		// Echo response
        //api.sendMessage(message.body, message.threadID);
		parse(api,message);
		
		
		// Alert me
		var msginfo = 'From: ' + message.senderName + '\nTime: ' + Date() + '\nMessage: \"' + message.body + '\"';
		//api.sendMessage(msginfo, process.env.MY_ID);
		
		/*
		// Python email no longer works
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
		*/		
		
    });
});


/*
	Post time and weather to facebook every 12 hours.
*/
setInterval(function(){
	http.get('http://api.wunderground.com/api/'+process.env.WEATHER_API_KEY+'/conditions/q/TX/Houston.json',function(response){	
		//console.log(response.statusCode);
		
		var body = '';
		var temp = {};
		var status = {};
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
}, 60 * 12 * 60 * 1000); // Every 12 hours


setInterval(function(){
	// Post the URL to a picture of a trash can
	var options = {
		key: process.env.GOOGLE_API_SERVER_KEY,
		cx: process.env.cx,
		q: "trash can",
		searchType: "image",
		safe: "high",
		num: 10
	};
	var param = querystring.stringify(options);
	var url = 'https://www.googleapis.com/customsearch/v1?' + param;
	client.get(url, function(data, response){
		var trashURL = data.items[Math.floor(Math.random()*10)].link;
		console.log(trashURL);
		
		FB.api('me/photos', 'post', {url: trashURL}, function(response){
			if(!response || response.error){
				console.log(!response ? 'error occured': response.error);
				return;
			}
			console.log("Post id: " +  response.id);
		});
	});
}, 60 * 10 * 60 * 1000); // Every 10 hours


var db_clean_rule = new schedule.RecurrenceRule();
db_clean_rule.dayOfWeek = 0;
schedule.scheduleJob(db_clean_rule, function(){
	// Clean out firebase
	message_reqs.remove();
});


/*
	Cannot post to my wall, can only post to his own wall.
*/
schedule.scheduleJob('* * 21 2 *', function(){
	var wish = "Happy birthday! You are the coolest kid I know.";
	FB.api('me/feed', 'post', {message: wish, tags: tag_id}, function(response) {
		if(!response || response.error){
			console.log(!response ? 'error occured': response.error);
			return;
		}
		console.log('Post id: ' + response.id);	
	});
});


var choices = {
	help: /\\help/,
	
	greet: /\\howdy/,
	magic8: /\\magic8/,
	
	weather: /\\weather/,
	date: /\\date/,
	
	insult: /\\insult/,
	
	cool: /\\face/, 
	cow: /\\cow/,
	blaze: /\\blaze/,
	
	senate: /\\senate/,
	
	type: /\\type/,
	
	love: /\\love/
};

/*	
	TODO: 
	1. Simulate conversation. Use IDs and DB
*/
function parse(api, message){
	var response = '';
	
	// Add child for the threadID and append message there
	chatsDB.child(message.threadID).set(message);
	usersDB.child(message.senderID).set(message);
	
	// Send list of commands
	if (choices.help.test(message.body)){
		
		response = "Type '\\help' for a list of commands.\n";
		response += "\\howdy: Send a greeting.\n";
		response += "\\magic8 (yes/no question): Answer a yes/no question with complete accuracy.\n";
		response += "\\weather (ZIP code): Send the current weather in the given ZIP code.\n";
		response += "\\date: Send the current date.\n";
		response += "\\face: Send a cool ascii face.\n";
		response += "\\cow: Send an ascii cow.\n";
		response += "\\senate: Send a fact about the United States Senate.\n";
		response += "\\type: Send the 3 dots.";
		
		//response = "Check out <https://bitbucket.org/gaikema/danksinatra/wiki/Home> for help and a list of commands!";
		
		message_reqs.push(message);
		console.log("Sending " + response);		
		api.sendMessage({body: response}, message.threadID);
	}
	
	// Send a face
	else if (choices.cool.test(message.body)){
		response = cool();
		
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// Send the weather at a ZIP code
	else if (choices.weather.test(message.body)){
		var zip_code = message.body.replace(choices.weather,"");
		zip_code = zip_code.trim();
		console.log(zip_code);
		
		http.get('http://api.wunderground.com/api/'+process.env.WEATHER_API_KEY+'/conditions/q/' + zip_code + '.json',function(res){
			var body = '';
			var temp = '';
			var status = '';
			var city = '';
			
			res.on('data', function(chunk){
				body += chunk;
			});
			
			res.on('error', function(error){
				console.error(error.message);
				api.sendMessage("Invalid argument!",message.threadID);
			});			
			
			res.on('end', function(){
				var weather_data = JSON.parse(body);
				console.log(weather_data);
				
				if (!weather_data.response.error){
					temp = weather_data.current_observation.temp_f;
					status = weather_data.current_observation.weather;
					city = weather_data.current_observation.display_location.city;
					
					response += "The current temperature in " + city + " is " + temp + ".\n";
					response += "The weather is " + status + ".";
					
					message_reqs.push(message);		
					console.dir("Sending " + response);
					api.sendMessage(response, message.threadID);
				}
				else{
					response = JSON.stringify(weather_data.response.error);
					api.sendMessage(response,message.threadID);
				}
			});
		});
	}
	
	// Send the date
	else if (choices.date.test(message.body)){
		//var date = new Date();
		response = "The date is " + Date() + ".";
		message_reqs.push(message);		
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// Send a cow
	else if (choices.cow.test(message.body)){
		response = cows()[Math.floor(Math.random()*418)];
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// Send an insult
	else if (choices.insult.test(message.body)){
		response = message.senderName + " is a " + shake_insult.random() + "!";
		message_reqs.push(message);		
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// Send the senator with the fewest votes
	else if (choices.senate.test(message.body)){

		var client = new Client();
		var nyt_url = url.format({
			protocol: 'http',
			host: 'api.nytimes.com',
			pathname: '/svc/politics/v3/us/legislative/congress/113/senate/members.json',
			query: {
				'api-key': process.env.NYT_CONGRESS
			}
		});
		client.get(nyt_url, function(data, response) {			
			// Sort by total votes
			data.results[0].members.sort(function(a, b){
				return a.total_votes - b.total_votes;		
			});
			//console.log(data.results[0].members[0]);
			response = "The senator with the fewest total votes cast is ";
			response += data.results[0].members[0].first_name + ' ' + data.results[0].members[0].last_name;
			response += " with " + data.results[0].members[0].total_votes + " total votes.";
			
			message_reqs.push(message);
			console.log("Sending " + response);
			api.sendMessage(response, message.threadID);			
			
		});
	}
	
	// Send a random greeting
	else if (choices.greet.test(message.body)){
		response = greetings.random() + ", " + message.senderName + "!";
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}
	
	// Answer a yes/no question
	else if (choices.magic8.test(message.body)){
		response = predict();
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);		
	}
	
	// Send a cigarette
	else if (choices.blaze.test(message.body)){
		response = emoji.get('smoking');
		message_reqs.push(message);
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);		
	}
	
	// Send the 3 dots
	else if (choices.type.test(message.body)){
		message_reqs.push(message);
		api.sendTypingIndicator(message.threadID, function(){
			console.log("Typing");
		});
	}
	
	else if (choices.love.test(message.body)){
		message_reqs.push(message);
		response = "Don't worry, " + message.senderName + ", I love you!";
		console.log("Sending " + response);
		api.sendMessage(response,message.threadID);
	}	
}