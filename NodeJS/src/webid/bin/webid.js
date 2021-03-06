// Generated by CoffeeScript 1.10.0
(function() {
  var WebID, _, rdfstore, request, url,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebID = (typeof exports !== "undefined" && exports !== null) && exports || (this.WebID = {});

  request = require('request');

  url = require('url');

  rdfstore = require('rdfstore');

  WebID.VerificationAgent = (function() {
    function VerificationAgent(certificate) {
      this.verifyWebID = bind(this.verifyWebID, this);
      this.uris = [];
      if (!certificate.subjectaltname) {
	this.subjectAltName = certificate.extensions.subjectAlternativeName;
	} else {
     	 this.subjectAltName = certificate.subjectaltname;
	}
	//check module
	if (!certificate.modulus) {
	this.modulus = certificate.publicKey.n;
	} else {
     	 this.modulus = certificate.modulus;
	}
	//check exponent
	if (!certificate.exponent) {
	this.exponent = certificate.publicKey.e;
	} else {
     	 this.exponent = certificate.exponent;
	}
     // this.exponent = parseInt(this.exponent, 16).toString();
      this.subjectAltName.replace(/URI:([^, ]+)/g, (function(_this) {
        return function(match, uri) {
          return _this.uris.push(uri);
        };
      })(this));
    }

    VerificationAgent.prototype.verify = function(success, error, arg) {
      var uri;
      arg;
      if (this.waitFor == null) {
        this.waitFor = 0;
      }
      if (this.uris.length === 0) {
        return error('certificateProvidedSAN');
      } else {
        uri = this.uris.shift();
        return this.getWebID(uri, success, error);
      }
    };

    VerificationAgent.prototype.getWebID = function(uri, success, error) {
      var options, parsedURI, r;
      parsedURI = url.parse(uri);
      options = {
        url: parsedURI,
        method: 'GET',
        headers: {
          Accept: 'text/turtle, application/ld+json'
        }
      };
      return r = request(options, (function(_this) {
        return function(err, res, body) {
          if (err) {
            return error('profileGet');
          } else {
            return _this.verifyWebID(uri, body, res.headers['content-type'], success, error);
          }
        };
      })(this));
    };

    VerificationAgent.prototype.verifyWebID = function(webID, profile, mimeType, successCB, errorCB) {
      return rdfstore.create((function(_this) {
        return function(store) { //store
          return store.load(mimeType, profile, function(success, results) {
            if (!success) {
	      
              return store.execute("PREFIX cert: <http://www.w3.org/ns/auth/cert#> PREFIX foaf: <http://xmlns.com/foaf/0.1/> SELECT ?webid ?name ?m ?e ?known WHERE { ?webid cert:key ?key . ?webid foaf:name ?name . ?webid foaf:knows ?known . ?key cert:modulus ?m . ?key cert:exponent ?e . }", function(success, results) {
                var exponent, i, modulus;
                if (!success) {
                  i = 0;
                  while (i < results.length) {
                    modulus = null;
                    exponent = null;
                    if (results[i].webid.value === webID) {
                      modulus = results[i].m.value;
                      exponent = results[i].e.value;
                      if ((modulus != null) && (exponent != null) && (modulus.toLowerCase() === _this.modulus.toLowerCase()) && (exponent === _this.exponent)) {
                        successCB(results);
                        return void 0;
                      }
                    }
                    i++;
                  }
                  return errorCB("profileAllKeysWellFormed");
                } else {
                  return errorCB("profileAllKeysWellFormed");
                }
              });
            } else {
              return errorCB("profileWellFormed");
            }
          });
        };
      })(this));
    };

    return VerificationAgent;

  })();

  _ = require('underscore');

  WebID.Foaf = (function() {
    function Foaf(graph) {
      this.graph = graph;
    }

    Foaf.prototype.parse = function() {
      return {
        title: "WebID Sucess !",
        name: this.graph[0].name.value,
       // birthday: this._getValue("birthday"),
        webid: this.graph[0].webid.value,
        //knows: this.graph[0].known.value
	knows: this._getKnows(this)
      };
     // return {
     //   title: "WebID Sucess !",
     //   name: this._getValue("name"),
     //   birthday: this._getValue("birthday"),
     //   webid: this._getWebid(),
     //   knows: this._getKnows()
     // };
    };


    /*
    Gets the WebID (URI).
     */

    Foaf.prototype._getWebid = function() {
      var temp;
      temp = this.graph.filter(function(t) {
        return t.predicate.equals("http://www.w3.org/ns/auth/cert#key");
      }).toArray();
      if (temp.length === 1) {
        return temp[0].subject.valueOf();
      } else {
        return "";
      }
    };


    /*
    Get knows relation
    @return List of "known" WebID.
     */

    /*Foaf.prototype._getKnows = function() {
      var result, temp;
      temp = this.graph.filter(function(t) {
        return t.predicate.equals("http://xmlns.com/foaf/0.1/knows");
      }).toArray();
      result = [];
      _.each(temp, function(elem) {
        return result.push(elem.object.valueOf());
      });
      return result;
    };*/
    Foaf.prototype._getKnows = function(t) {
      var i =0;
      result = [];
      while (i < t.graph.length){
	result[i]=t.graph[i].known.value;
	i++;
      }
	
      return result;
    };

    /*
    @param The FOAF value to get
     */

    Foaf.prototype._getValue = function(value) {
      var temp;
      temp = this.graph.filter(function(t) {
        return t.predicate.equals("http://xmlns.com/foaf/0.1/" + value);
      }).toArray();
      if (temp.length === 1) {
        return temp[0].object.valueOf();
      } else {
        return "";
      }
    };

     Foaf.prototype._getName = function(value) {
      var temp;
      temp = this.graph.filter(function(t) {
        return t.predicate.equals("http://xmlns.com/foaf/0.1/" + value);
      }).toArray();
      if (temp.length === 1) {
        return temp[0].object.valueOf();
      } else {
        return "";
      }
    };

    return Foaf;

  })();

}).call(this);
