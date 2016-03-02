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
longLiveMyToken('CAAQF0gVJQWUBAOpVFmE7z9eMnvAvZBTCtpYZAYtffffgqYfshuUZCwqSe8soC4JBxXEZBQ4EVNmWF27wq8eHT4bdaqqzHHvk5MCGsahJxyZCunyYcGr3DgKthlSm1OnYVWLi50jE2jIj0BVkNG4uHLGAJmR2fvCq1z9ZCvbHouZB4DoQcIHDQZCftFOm5JA3a7sk8jxDQs95nm0Y859b1Ftc',
	'1132299496800613','14c5dbcb7631cd5e0161ef71b511f961');