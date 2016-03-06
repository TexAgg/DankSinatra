// Exchange short-lived access token for longer one

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
longLiveMyToken('CAAQF0gVJQWUBANUGKN9lJEZA2DjwgRwJLBdNsXAZBb6uhxwTJiQi2fNwdgalS7kTjwp9LYpxdDjqZCB9qIhIQEwBG6fIZB36AwK2exZAYxjHvnb4sbqZBAYcWZBtuqAl3T0QAB5fZBD5u3k2zy5D8u0p7KYVrZCUixTyCkXjYuOF205SDkR7qlUZCZBlfAZCdaJemHQyKeLN3gcjwbLXy3Nz12Tb',
	'1132299496800613','14c5dbcb7631cd5e0161ef71b511f961');