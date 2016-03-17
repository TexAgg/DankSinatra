/*
	token.js
	Copy and past fb token here, run 'node token.js', 
	and copy the output token into info.js
*/
require('dotenv').config();
var https = require('https');

function longLiveMyToken(token, appId, clientSecret) {
  var req = https.request({
    host: 'graph.facebook.com',
    path: '/oauth/access_token',
    method: 'POST'
  }, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log(chunk);
    });
    res.on('end', function() {
      console.log('status: '+res.status);
    });
  });
  req.end('grant_type=fb_exchange_token'
    +'&client_id='+encodeURIComponent(appId)
    +'&client_secret='+encodeURIComponent(clientSecret)
    +'&fb_exchange_token='+encodeURIComponent(token)
   );
};


// Get a 60 day token
longLiveMyToken('CAAQF0gVJQWUBABvxHjk8dFZBrwZAIvWJS9hI09ZCGIp5dE4ptoGeU7KE0mMnBlmMuciZBxrEoYNIjO7rcrdy28GmpbGU4CUJKoYZBbynfHza7YWFwiZBljYzu9JZCZAhTvc0yEC5V7VZCccZCNYIeJ95ZBcEwvPNPgfoLOjVEr4G06BNJWrA6MBfvZCnR9U2uzvJVqDzyslvGsFDIrB9NCEyD6VZB',
	process.env.FB_APP_ID,process.env.FB_APP_SECRET);