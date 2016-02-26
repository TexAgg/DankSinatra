        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
                /* 
                *  message can be posted to Facebook directly
                *  using the FB.api method or accessToken
                *  can be sent to the server and do the call
                *  from there
                */
            } else {
                // status is either not_authorized or unknown
                FB.login(function(response) {
                    if (response.authResponse) {
                        var accessToken = response.authResponse.accessToken;
                    } else {
                        alert('User cancelled login or did not fully authorize.');
                    }
                }, {scope: 'publish_stream'});
            }
        });
