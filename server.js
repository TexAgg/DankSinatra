/*
	server.js
	Main method. Log in to facebook, listens to messages, and posts.
	The "ears" of Dank
*/

// Set environment variables
require('dotenv').config();

const parse = require('./parse.js');

const login = require("facebook-chat-api");
const FB = require('fb');
const http = require('http');
const https = require('https');
const fs = require('fs');
const querystring = require('querystring');
const Client = require('node-rest-client').Client;
const schedule = require('node-schedule');
const Firebase = require('firebase');

var db = new Firebase(process.env.DANK_SINATRA_FIREBASE);
var message_reqs = db.child('Requests');
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
	http.get("http://danksinatra.mybluemix.net", function(response) {
	//http.get("http://danksinatra.herokuapp.com", function(response) {
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
	var intro_message = {
		body: "I'm logged in now!\n" + Date(),
	};
	api.sendMessage(intro_message, process.env.MY_ID);
	
	
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
		
		// Temporary hotfix until attachments are supported
		message.attachments = {};
		
		chatsDB.once('value', function(snapshot){
			//var data = snapshot.child(message.threadID).val();
			parse.parse(api, message, snapshot.child(message.threadID).val());
			//parse.parse(api, message, snapshot);	
		});
		
		//parse.parse(api,message);	
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


/*
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
*/


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
