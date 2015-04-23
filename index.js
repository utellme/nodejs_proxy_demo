let http = require("http");
let fs = require('fs');
let request = require('request');

let scheme = 'http://';
 let argv = require('yargs')
 			.default('host', '127.0.0.1:8000')
 			.argv

console.log(argv);

 
 //let destinationUrl = scheme + argv.host;

 let port = argv.port || argv.host === '127.0.0.1' ? 8000:80;

 let destinationUrl = scheme + argv.host + ':' + port;

 let outputStream = argv.log1 ? fs.createWriteStream(argv.log1) : process.stdout;

 //console.log(destinationUrl);
// console.log(outputStream);


function onRequest(req, res) {
  
  //console.log('\nRequest received at:' + req.url);
  


  outputStream.write('\ Request received at ' + req.url);

  //outputStream.write('\nRequest received at:  ${req.url}');
  req.pipe(outputStream);

  //response.writeHead(200, {"Content-Type": "text/plain"});
  for(let header in req.headers){

 	res.setHeader(header, req.headers[header]);
 }

 //res.write("Hello World\n");

  
  req.pipe(res);
  //res.end();
}

http.createServer(onRequest).listen(8000);

console.log("Server has started.");

/************Proxy Server*************/

function onProxyRequest(req, res) {
  
	//let destinationUrl = '127.0.0.1:8000';
	
	//let num = 0;
	let url;

	///console.log('\nProxying request to ' + destinationUrl + req.url);
	outputStream.write('\nProxying request to ' + destinationUrl + req.url);

	

   url = destinationUrl + req.url;


  let options = { 
  //	method:req.method,
  	headers: req.headers,
  	//url: `http://${destinationUrl}${req.url}`
  	url: url
  }

  outputStream.write('\n\n\n' + JSON.stringify(req.headers));
	  //req.pipe(process.stdout);
	 // req.pipe(process.stdout);
  req.pipe(outputStream);

  let downstreamResponse = req.pipe(request(options));

  //outputStream.write(JSON.stringify(downstreamResponse.headers));

  downstreamResponse.pipe(outputStream);
	
  downstreamResponse.pipe(res);
	

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
