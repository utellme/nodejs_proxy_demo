let path = require('path');
let http = require("http");
let fs = require('fs');
let request = require('request');
let through = require('through');

let scheme = 'http://';
 let argv = require('yargs')
 			.default('host', '127.0.0.1:8000')
 			.argv

console.log(argv);

 
 //let destinationUrl = scheme + argv.host;

 let port = argv.port || argv.host === '127.0.0.1' ? 8000:80;

 let destinationUrl = argv.url || scheme + argv.host + ':' + port;

 let outputStream = argv.logfile1 ? fs.createWriteStream(path.join(__dirname, argv.logfile1)) : process.stdout;

 //console.log(destinationUrl);
// console.log(outputStream);


function onRequest(req, res) {
  
  //console.log('\nRequest received at:' + req.url);
  


  outputStream.write('\n\n\n\nEcho Request received at ' + req.url + '\n\n' + JSON.stringify(req.headers));

  //outputStream.write('\nRequest received at:  ${req.url}');
  //req.pipe(outputStream);
 

  //response.writeHead(200, {"Content-Type": "text/plain"});
  for(let header in req.headers){

 	res.setHeader(header, req.headers[header]);

 }

 //res.write("Hello World\n");

   through(req, outputStream, {autoDestroy: false});

  req.pipe(res);
  //res.end();
}

http.createServer(onRequest).listen(8000);

console.log("Server has started.");

/************Proxy Server*************/

function onProxyRequest(req, res) {
  
	//let destinationUrl = '127.0.0.1:8000';
	

	///console.log('\nProxying request to ' + destinationUrl + req.url);
	outputStream.write('\nRequest Proxied to ' + destinationUrl + req.url);
	through(req, outputStream, {autoDestroy: false})


   let url = destinationUrl

   //console.log("\nRequest " + req.headers);

  if (req.headers['x-destination-url']) {
    url = req.headers['x-destination-url']
    delete req.headers['x-destination-url']
  }


  let options = {
    headers: req.headers,
    url: url + req.url
  }



  outputStream.write('\n\n' + JSON.stringify(req.headers));
	  //req.pipe(process.stdout);
	 // req.pipe(process.stdout);
 // req.pipe(outputStream);
 through(req, outputStream, {autoDestroy: false});

  let downstreamResponse = req.pipe(request(options));

  outputStream.write('\n\n' + JSON.stringify(downstreamResponse.headers));

  //downstreamResponse.pipe(outputStream);
 
  downstreamResponse.pipe(res);
  
  through(downstreamResponse, outputStream, {autoDestroy: false});
  
	

 /* request(options);
  console.log(++num);

	request(options).pipe(res);
	console.log(++num);

   	options.method = req.method;
   	console.log(++num);

  	req.pipe(request(options)).pipe(res);
  	console.log(++num);

  	*/

}

http.createServer(onProxyRequest).listen(8001);
console.log("Proxy Server has Started")
