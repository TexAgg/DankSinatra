/*
	parse.js
	Reads the incoming message and chooses the appropriate response
*/

const login = require("facebook-chat-api");
const cool = require('cool-ascii-faces');

var choices = {
	help: /\\help/,
	weather: /\\weather/,
	insult: /\\insult/,
	cool: /\\face/
};

/*
	TODO: instead of sending message from here, 
	pass the response back to server.js
*/
function parse(api, message){
	var response = '';
	
	if (choices.cool.test(message.body)){
		response = cool();
		console.log("Sending");
		api.sendMessage(response, message.threadID);
	}
}

module.exports.parse = parse;