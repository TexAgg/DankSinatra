/*
	parse.js
	Reads the incoming message and chooses the appropriate response.
	The "mouth" of Dank
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');
const http = require('http');
const Firebase = require("firebase");
const cows = require('cows');
const url = require('url');
const Client = require('node-rest-client').Client;
const predict = require('eightball');
const greetings = require('greetings');
const shake_insult = require('shakespeare-insult');
const emoji = require('node-emoji');
const watson = require('watson-developer-cloud');
const fs = require('fs'); 

var dialog_service = watson.dialog({
	username: process.env.dialog_username,
	password: process.env.dialog_password,
	version: 'v1'
});
var text_to_speech = watson.text_to_speech({
	username: process.env.text_to_speech_username,
  	password: process.env.text_to_speech_password,
  	version: 'v1',
});

var db = new Firebase(process.env.DANK_SINATRA_FIREBASE);
var message_reqs = db.child("Requests");
var usersDB = db.child("users");
var chatsDB = db.child("chats");
var converseDB = db.child("Conversations");


function parse(api, message, data){
	data = data || {};
	
	//console.log(data);
	
	// All commands go here
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
		
		love: /\\love/,
		
		convo: /\\convo/,
		speak: /\\speak/,

		roll: /\\roll/
	};
	
	var response = '';
	
	// Quit if there is no body
	message.body = message.body || {};
	
	// Add child for the threadID and append message there
	chatsDB.child(message.threadID).set(message);
	usersDB.child(message.senderID).set(message);
	
	// check if a dialog exists with this user
	if (!data && !message.isGroup && data.conversation){
		//console.log('nice');
		
		// End the conversation
		if (message.body == '\\quit'){
			api.sendMessage({body: "Bye!"}, message.threadID);
			return;
		}
		
		var params = {
			conversation_id: data.conversation.conversation_id,
			dialog_id: process.env.dialog_id,
			client_id: data.conversation.client_id,
			input:     message.body
		};
		dialog_service.conversation(params, function(err, conversation) {
		if (err)
			console.log(err)
		else
			//console.log(conversation);
			chatsDB.child(message.threadID).set({
				message: message,
				conversation: conversation
			});			
			api.sendMessage(conversation.response[0], message.threadID);
		});		
	}
	
	else if (choices.convo.test(message.body) && !message.isGroup){
		// Start new conversation
		
		var converse_params = {
			dialog_id: process.env.dialog_id
		};
		dialog_service.conversation(converse_params, function(err, watson_response){
			if (err)
				console.log(err);
			else {
				console.log(watson_response);
				converseDB.child(watson_response.conversation_id).set(watson_response);
				chatsDB.child(message.threadID).set({
					message: message,
					conversation: watson_response
				});
				
				response = watson_response.response[0];
				api.sendMessage(response, message.threadID);
			}	
		});		
	}
	
	// Send list of commands
	else if (choices.help.test(message.body)){
		
		response = "Type '\\help' for a list of commands.\n";
		response += "\\howdy: Send a greeting.\n";
		response += "\\magic8 (yes/no question): Answer a yes/no question with complete accuracy.\n";
		response += "\\weather (ZIP code): Send the current weather in the given ZIP code.\n";
		response += "\\date: Send the current date.\n";
		response += "\\face: Send a cool ascii face.\n";
		response += "\\cow: Send an ascii cow.\n";
		response += "\\senate: Send a fact about the United States Senate.\n";
		response += "\\type: Send the 3 dots.";
		
		//response = "Check out https://bitbucket.org/gaikema/danksinatra/wiki/Home for help and a list of commands!";
		
		message_reqs.push(message);
		console.log("Sending " + response);		
		api.sendMessage({body: response}, message.threadID);
		//api.sendMessage({body: "Check out ", url: "https://bitbucket.org/gaikema/danksinatra/wiki/Home"}, message.threadID);
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
		var zip_code = message.body.replace(choices.weather, "");
		zip_code = zip_code.trim();
		//console.log(zip_code);
		
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
				//console.log(weather_data);
				
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

	//roll a random number between 1 and argument
	else if(choices.roll.test(message.body)){
		var upper_limit = message.body.replace(choices.roll, "");
		upper_limit = upper_limit.trim();
		var result = Math.floor(Math.random()*upper_limit+1);

		response += "You rolled a " + result + ".\n";
		console.log(response);
		api.sendMessage(response, message.threadID);
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
		response = "You are a " + shake_insult.random() + "!";
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
		response = greetings.random() + ", you!";
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
	
	// Tell me you love me
	else if (choices.love.test(message.body)){
		message_reqs.push(message);
		//response = "Don't worry, I love you!";
		var responses = [
			"Don't worry, I love you!",
			"I love you!",
			"You're my favorite person.",
			"You're beautiful!",
			"You're so cute!",
			"<3",
			"<3 <3 <3",
		];
		response = responses[Math.floor(Math.random() * responses.length)];
		console.log("Sending " + response);
		api.sendMessage(response, message.threadID);
	}	
	
	/*
	// Send speech
	else if (choices.speak.test(message.body)){
		message_reqs.push(message);
		
		//var speech = message.body.replace(choices.speak, "");
		var params = {
			text: message.body.replace(choices.speak, ""),
			accept: 'audio/wav'
		};

		// Pipe the synthesized text to a file
		text_to_speech.synthesize(params).pipe(fs.createWriteStream('output.wav'));		
		
		console.log("Sending output.wav");
		api.sendMessage({
			body: "Here is your speech", 
			attachment: fs.createReadStream(__dirname + '/output.wav') || {}
		}, message.threadID);	
	}
	*/
}

module.exports.parse = parse;
