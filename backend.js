var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const {execFile} = require('child_process');
const {execFileSync} = require('child_process');
var data = '';
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {
}

//External Ressources
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/public', express.static(__dirname + '/public/'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/popper', express.static(__dirname + '/external/'));

//Send index.html to client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/*app.get('/api', function(req, res){

    res.writeHead(200, {"Content-Type" : "application/json"});


    var params = req.query;

    //Globals
    var time = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var response= new Object();

    console.log('Request Path: '+ req.path);
    console.log('Request Parameter: '+ Object.keys(params)[0]);
    console.log('All Request Parameter: '+ JSON.stringify(params));

    let string = Object.keys(params)[0];
    if (string === "status") {
        response.category = "status";
        response.command = "no sub-commands for status";
        response.timestamp = time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        response.data = {"nodeversion": ""};
        response.data = {"serveros": ""};
        response.data = {"uptime": ""};

        //Deklaration der ext. lProgramme
        const node = execFileSync('node', ['--version']);
        const uname = execFileSync('uname', ['-a']);
        const uptime = execFileSync('uptime', ['-p']);

        response.data.nodeversion = node.toString('utf8', 0, node.length - 1);
        response.data.serveros = uname.toString('utf8', 0, uname.length - 1);
        response.data.uptime = uptime.toString('utf8', 0, uptime.length - 1);

        //Rückgabe
        res.end(JSON.stringify(response));
    }

    else if (string === "netinfo") {
        response.category = "netinfo";
        response.timestamp = time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        //Get Command (/api?netinfo=command)
        var command = params.netinfo;

        if (command === "hostip") {
            response.command = "hostip";
            const hostname_ip = execFile('hostname', ['-I'], [], (error, stdout, stderr) => {

                if(error){
                    console.log(`API error: ${stderr}`);
                    throw error;
                }
                console.log(`API output: ${stdout.trim()}`);
                response.data = stdout.replace(/ /g,'').split("\n");
                response.data.pop();
                res.end(JSON.stringify(response));
            });
        }

        else if (command === "publicip") {
            response.command = "publicip";

            const publicip = execFile('curl', ['https://canihazip.com/s'], [], (error, stdout, stderr) => {

                if (error) {
                    console.log(`API error: ${stderr}`);

                    //throw error;
                }
                //console.log(`API output: ${stdout}`);
                response.data = stdout.split("\n");

                const mywhois = execFile('mywhois', [response.data[0]], [], (error, stdout, stderr) => {

                    if (error) {
                        console.log(`API error: ${stderr}`);

                        //throw error;
                    }
                    console.log(`mywhois API output: ${stdout}`);
                    const isp = stdout.split("\,");
                    isp.pop();
                    response.data.push(isp[0]);
                    //res.end(JSON.stringify(response));
                    res.end(JSON.stringify(response));
                });


            });
        }

        else if (command === "gateway") {
            response.command = "gateway";
            const get_gateway = execFile('get_gateway', [''], [], (error, stdout, stderr) => {

                if (error) {
                    console.log(`API error: ${stderr}`);
                    throw error;
                }

                console.log(`API output: ${stdout}`);
                response.data = stdout.split("\n");
                response.data.pop();
                res.end(JSON.stringify(response));

            })


        } else if (command === "subnet") {
            response.command = "subnet"
            const get_subnethosts = execFile('get_subnethosts', ['10.0.2.1'], [], (error, stdout, stderr) => {

                if (error) {
                    console.log(`API error: ${stderr}`);
                    throw error;
                }

                console.log(`API output: ${stdout}`);

                response.data = stdout.split("\n");
                response.data.pop();
                res.end(JSON.stringify(response));
            });
        } else {
            response.command = "not found";
            response.timestamp = time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
            response.data = "Empty Response.";
            res.end(JSON.stringify(response));
        }
    } else if (string === "findports") {
        response.category = "findports";
        response.timestamp = time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        var ipaddr = params.findports;
        response.command = ipaddr;

        const get_openports = execFile('get_openports', [ipaddr], [], (error, stdout, stderr) => {

            if (error) {
                throw error;
            }

            console.log(`Find Ports stdout: ${stdout}`);

            response.data = stdout.split("\n");
            response.data.pop();
            res.end(JSON.stringify(response));

        });


    }
    else {
        response.category = "not found";
        response.command = "not found";
        response.timestamp = time.getDate() + ' ' + months[time.getMonth()] + ' ' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
        response.data = "Empty Response.";
        res.end(JSON.stringify(response));
    }

    //JSON.stringify(params);
});*/

// Socket.io Websocket Connection listeners
io.on('connection', function (socket) {
    var globalEmitter = new MyEmitter();

    console.log('Connected!');
    socket.on('disconnect', function () {
        console.log('Disconnected!');
    });

    /*function apicall(command,target) {
        var url = 'http://127.0.0.1:7000/api?'+command;
        const myEmitter = new MyEmitter();

        http_get.get(url, function(res){
            var body = '';

            res.on('data', function(chunk){
                body += chunk;
            });

            res.on('end', function(){
                APIResponse = JSON.parse(body);
                console.log("Whole response: ", APIResponse);
                console.log("Exact response: ", APIResponse.data);
                myEmitter.emit('data',APIResponse.data);
            });
        }).on('error', function(e){
            console.log("Got an error: "+e);
            io.emit('error',e);
        });
        myEmitter.on('data', (data) => {
            console.log('Listener got Data: '+data);
            io.emit(target, data);




        });
        myEmitter.on('error', (error) => {
            console.log('Listener got Data: '+data);
            io.emit(target, "Error in API Call ("+error+')');
        });
    }*/


    // These Functions get called on "load" of socket.io
    function getLocalIP() {
        const spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let hostip = spawn('hostname', ['-I'], options);

        hostip.stdout.on('data', function (data) {
            console.log(`Hostip output: ${data.toString()}`);
            let ips = data.toString().split(" ");
            ips.pop();
            socket.emit('hostip_output', ips);
        });

        hostip.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        hostip.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
        });
    }

    function getNetworks() {
        const spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let get_networks = spawn('get_networks', [], options);
        let list = [];

        get_networks.stdout.on('data', function (data) {
            console.log(`getNetworks output: ${data.toString()}`);
            list = (data.toString().split('\n'));
            list.pop();
            socket.emit('get_networks_output', list);
        });

        get_networks.stderr.on('data', function (data) {
            console.log('getNetworks stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        get_networks.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
        });

    }

    function getPublicIP() {
        const spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let publicip = spawn('curl', ['-s', 'https://ipinfo.io/ip'], options);

        publicip.stdout.on('data', function (data) {
            console.log(`getPublicIP output: ${data.toString()}`);
            socket.emit('got_publicip', data.toString());
            globalEmitter.emit('data', data.toString());
        });

        publicip.stderr.on('data', function (data) {
            console.log('getPublicIP: ' + data.toString());
            socket.emit('debug_output', data.toString());

        });

        publicip.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
        });
    }

    function getISP(publicip) {
        const spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let mywhois = spawn('mywhois', [publicip], options);

        mywhois.stdout.on('data', function (data) {
            console.log(`getISP output: ${data.toString().split('\n')}`);
            socket.emit('got_isp', data.toString());
        });

        mywhois.stderr.on('data', function (data) {
            console.log('getISP: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        mywhois.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
        })
    }

    function getGatewayIP() {
        const spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let getgateway = spawn('get_gateway', [], options);

        getgateway.stdout.on('data', function (data) {
            console.log(`getGateway output: ${data.toString()}`);
            socket.emit('got_gateway', data.toString());
        });

        getgateway.stderr.on('data', function (data) {
            console.log('getGateway stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        getgateway.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
        })
    }

    function getWordlists() {
        const {exec} = require('child_process');
        const options = new Object();
        options.uid = 1000;

        exec('ls -sh wordlists/', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            let output = stdout.toString().split('\n');

            output.shift();
            output.pop();
            console.log(`Content of wordlists/: ${output}`);
            console.log(typeof (output));
            socket.emit('wordlists', output);
        });
    }

    //Socket.io Listeners
    socket.on('load', function () {
        console.log('Page loaded!');

        //checkDeps();
        getNetworks();
        getLocalIP();
        getPublicIP();
        getGatewayIP();
        getWordlists();

        //Wait for response from getPublicIP() and get ISP
        globalEmitter.on('data', function (publicip) {
            getISP(publicip);
        });

        //apicall('netinfo=publicip','netinfo_publicip');

        //apicall('netinfo=gateway','netinfo_gateway');

        //apicall('netinfo=subnet','netinfo_subnet');

        //apicall('netinfo=mywhois','netinfo_gateway_isp');

        console.log('Page loaded!');

    });

    socket.on('findports', function (msg) {
        const get_openports = execFile('get_openports', [msg], [], (error, stdout, stderr) => {

            if (error) {
                console.log(`Bash Execution error: ${stderr}`);
                throw error;
            }
            let ports = stdout.split("\n");
            let response = {"host": msg, 'ports': ports};
            ports.pop();
            console.log(`No-API Call output ${JSON.stringify(response)}`);
            socket.emit('foundports', response);

        });
    });

    socket.on('hydra', function (bruteforcedata) {
        console.log('Received Brute Force Data: ' + JSON.stringify(bruteforcedata));
        var spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let user = bruteforcedata.user;
        let protocol = bruteforcedata.protocol;
        let hostip = bruteforcedata.hostip;
        let wordlist = bruteforcedata.wordlist;

        const bruteforce = spawn('bruteforce', [user, protocol, hostip, wordlist], options);

        bruteforce.stdout.on('data', function (data) {
            console.log(`Hydra output: ${data.toString()}`);
            socket.emit('hydra_output', data.toString());
        });

        bruteforce.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            socket.emit('hydra_output', data.toString());
        });

        bruteforce.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            socket.emit('hydra_output', data.toString());
            socket.emit('hydra_ended');
        });
    });

    socket.on('cancelHydra', function () {
        const options = {
            uid: 1000
        };
        const spawn = require('child_process').spawn;
        const kill = spawn('pkill', ['hydra'], options);

        kill.stdout.on('data', function (data) {
            console.log(`Hydra output: ${data.toString()}`);
            socket.emit('hydra_output', data.toString());
        });

        kill.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            socket.emit('hydra_output', data.toString());
        });

        kill.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            socket.emit('hydra_output', data.toString());
        });
    });

    socket.on('curl', function (curldata) {
        console.log('Received Curl Data: ' + JSON.stringify(curldata));
        var spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        var target = "http://" + curldata.hostip + ":" + curldata.port;
        let args = "-v";
        if (curldata.port === "443") {
            console.log("443!");
            target = "https://" + curldata.hostip + ":" + curldata.port;
            args = "-vk";
        }
        let curl = spawn('curl', [args, target], options);

        curl.stdout.on('data', function (data) {
            console.log(`Curl output: ${data.toString()}`);
            socket.emit('curl_output', data.toString());
        });

        curl.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
            socket.emit('curl_output', data.toString());
        });

        curl.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            socket.emit('curl_output', data.toString());
        });

    });

    socket.on('service_detect', function (servicedata) {
        console.log('Received Service Data: ' + JSON.stringify(servicedata));
        var spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let idservice = spawn('nmap', ['-sV', '-T4', '-Pn', '-p' + servicedata.port, servicedata.hostip], options);

        idservice.stdout.on('data', function (data) {
            console.log(`Ident Service output: ${data.toString()}`);
            socket.emit('debug_output', data.toString());
        });

        idservice.stderr.on('data', function (data) {
            console.log('Ident Service stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        idservice.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            socket.emit('debug_output', data.toString());
        });

    });

    socket.on('nikto', function (niktodata) {
        console.log('Received Nikto Data: ' + JSON.stringify(niktodata));
        var spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let nikto = spawn('nikto', ['-h', niktodata.hostip, '-p', niktodata.port], options);

        nikto.stdout.on('data', function (data) {
            console.log(`Nikto output: ${data.toString()}`);
            socket.emit('debug_output', data.toString());
        });

        nikto.stderr.on('data', function (data) {
            console.log('Nikto stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        nikto.on('exit', function (code) {
            console.log('Nikto exited with code ' + code.toString());
            socket.emit('debug_output', data.toString());
        });

    });

    socket.on('scan_subnet', function (network) {
        console.log('Submitted Network: ' + network);
        var spawn = require('child_process').spawn;
        const options = {
            uid: 0
        };
        let args = '';
        if (network.indexOf('\:') > -1) {
            args = 'arp';
            network = network.split('\:')[0];
            console.log("Arp Scan requested. Subnet: " + network);
        }

        let get_subnethosts = spawn('get_subnethosts', [network, args], options);

        get_subnethosts.stdout.on('data', function (data) {
            console.log(`get_subnethosts output: ${data.toString()}`);
            const list = data.toString().split('\n');
            list.pop();
            socket.emit('netinfo_subnet', list);
        });

        get_subnethosts.stderr.on('data', function (data) {
            console.log('scan_subnet stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        get_subnethosts.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            if (code === 255) {
                socket.emit('debug_output', "No host did respond.");

            }
        });

    });

    socket.on('command', function (command) {
        console.log('Received Command Data: ' + JSON.stringify(command));
        var spawn = require('child_process').spawn;
        const options = {
            uid: 1000
        };
        let run_command = spawn(command.command, args, options);

        run_command.stdout.on('data', function (data) {
            console.log(`Command output: ${data.toString()}`);
            socket.emit('debug_output', data.toString());
        });

        run_command.stderr.on('data', function (data) {
            console.log('command stderr: ' + data.toString());
            socket.emit('debug_output', data.toString());
        });

        run_command.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            socket.emit('debug_output', data.toString());
        });

    });
});

http.listen(7000, function () {
    console.log('listening on *:7000');
});
