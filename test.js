const request = require('request');

//Lets configure and request
request({
    url: 'https://modulus.io/contact/demo', //URL to hit
    qs: {from: 'blog example', time: +new Date()}, //Query string data
    method: 'POST',
    headers: {
        'Content-Type': 'MyContentType',
        'Custom-Header': 'Custom Value'
    },
    body: 'Hello Hello! String body!' //Set the body as a string
}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
});

/*
var help = /\\help/;
var weather = /\\weather/;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  //console.log('Thank you for your valuable feedback:', answer);
  
	if(help.exec(answer))
  		console.log("Here are our commands:");
	else
		console.log('oh');	 
  
  rl.close();
});
*/
