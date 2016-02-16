var http = require('http');
var Router = require('node-router');
const x509 = require('x509');
var fs = require('fs');
var https = require('https');
var util = require('util');
var path = require('path');
var _ = require('underscore')._;
var express = require('express');
var jade = require('jade');
var webid = require('./webid/bin/webid');
//var flag = require.specified('webid');

// Getting configuration
var configuration = require("./configuration");

var router = Router();
router.push('GET', '/login', routeHandler);

var server = http.createServer( router ).listen( 1100 );

function routeHandler(req, res) {
	try {
	var str = req.query.x ;
	//console.log(str);

	/*fs.writeFile('webid.pem', str,  (err) => {
		if (err) throw err;
		console.log('It\'s saved!');
	});*/
	try {
		var cert = x509.parseCert(str);
	} catch (e) {
	var profile ={};
	profile ["mess"]= "Unable to parse misformed certificate";
	res.send( { profile : profile } );
   	}
	//var cert = x509.parseCert('server/webid.pem'),
	date = new Date();
	if (cert.notBefore > date) {
	// Certificate isn't active yet.
		var message = "Certificate isn't active yet";
	}
	if (cert.notAfter < date) {
  	// Certificate has expired.	
	var message = "Certificate has expired";
	}
	
        // Ask for user certificate
       // var certificate = req.connection.getPeerCertificate();
	
	//console.log(flag);
        if (cert) {
	  
            // If the user provite a certificate, verify it
            var vAgent = new webid.VerificationAgent(cert);
            vAgent.verify(function (result) {
				var foaf = new webid.Foaf(result);
				var profile = foaf.parse();		
				result=profile;
				//res[output ]= profile;
				//req[identified] = true;				
				//req.session.profile = foaf.parse();
				//req.session.identified = true;
				//res.redirect('/profile');
				// var message = 'Valide Certificate!!';
				 profile["mess"]= "OK";
				res.send( { profile : profile } );
            }, function(result) {
				
				switch (result) {
                    case 'certificateProvidedSAN':
                        var message = 'No valide Certificate Alternative Name in your certificate';
                        break;
                    case 'profileWellFormed':
                        var message = 'Can\'t load your foaf file (RDF may not be valid)';
                        break;
                    case 'falseWebID':
                        var message = 'Your certificate public key is not the one of the FOAF file';
                        break;
                    case 'profileAllKeysWellFormed':
                        var message = "Missformed WebID";
                        break;
                    default:
                        var message = "Unknown WebID error";
                        break;
                    }
			console.log(message);
			var profile = {};
			profile["mess"]=message;
			res.send( { profile : profile } );
                   // sendError(res, message);
				});
        } else {
            throw new Error("Certificate not provided");
        }
    } catch (e) {
	console.log( "Error: " + e + "---");
    }
  
}
