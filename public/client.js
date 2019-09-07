$(function () {

    var socket = io();

    var textarea = document.getElementById('txtarea_hydra');

    //Timer
    let ms=0;
    let s=0;
    let m=0;
    var timer;

    function startTimer(){
        $('#stopwatch').attr('style','display: inline; margin-left: 15px;');
        timer = setInterval(updateTimer, 100);
    }
    function updateTimer() {
        if (ms === 10){
            ms=0;
            s++;
        }
        if(s === 59){
            m++
            s=0;
        }
        $('#time_m').text(m);

        if(s < 10) {
            $('#time_s').text('0'+s);
        }else $('#time_s').text(s);

        $('#time_ms').text(ms++);
    }
    function freezeTimer(){
        clearInterval(timer);
    }
    function resetTimer(){
        $('#stopwatch').attr('display','none');
        clearInterval(timer);
        ms=0;
        s=0;
        m=0;
        $('#time_m').text(m);
        $('#time_s').text(s);
        $('#time_s').text(s);
    }

    //Clear Fields
    $('#command_command').val('');
    $('#command_args').val('');
    $('#txtarea_hydra').val('');
    $('#input_cidr').val('');
    $('#btn_scan').prop('disabled', true);

    // Form Action for Hydra
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        const bruteforcedata = new Object();
        bruteforcedata.user = $('#username').val();
        bruteforcedata.hostip = $('#bf_ip').val();
        bruteforcedata.protocol = $('#protocol').val();
        bruteforcedata.wordlist = $('#pwdlist').val();

        socket.emit('hydra', bruteforcedata);
        $('#btn_brute').prop('disabled', true);
        $('#btn_brute').prop('style', 'display: none');

        $('#btn_brute').parent().parent().append($('<button>', {
            id: 'btn_brute_cancel',
            class: 'btn btn-warning btn-sm',
            text: 'Cancel',
            click: cancelHydra
        }));
        $('#bf_ip').val('');
        return false;
    });


    //Greeter for Output - Box
    $('#txtarea_hydra').val('Hello there! This is your Backend output speaking.\nEverything which is not processed by the Frontend directly\nappears here, including execution errors!\n');

    //Run Command Button
    $('#btn_command').click(runCommand);

    socket.emit('load');

    socket.on('netinfo_subnet', function (data) {

        //clear old data
        $('#neighbors').empty();
        $('#thead_neighbors').attr('style','');

        if (data.length > 0) {
            for (var i = 0; i < (data.length); i++) {
                //remove dots from ip address to use as id
                let ip_id = data[i].toString().replace(/\./g, '');

                console.log(i + ': ' + data[i]);
                const btn_id = 'btn_' + ip_id;
                const $btn_portscan = $('<button/>', {
                    id: btn_id,
                    type: 'button',
                    class: 'btn btn-info btn-sm',
                    value: 'Scan',
                    address: data[i].toString(),
                    text: 'Scan',
                    click: portScan
                });

                $('#neighbors').append($('<tr id=tr_host_' + ip_id + '>'));
                $('#tr_host_' + ip_id).append($('<td style="width: 15%">').text(data[i].toString()));
                //$('#tr_host_' + ip_id).append($('<td>'));
                $('#tr_host_' + ip_id).append($('<td>').append($btn_portscan));
                //$btn_portscan.appendTo($btngrp_host);

                $('#spinner_subnet').remove();

                //$('#btn_scan').text('Analysing..');
                //$('#btn_scan').append($('<div id="spinner_networks" class="spinner-border spinner-border-sm"/>'));
                $('#btn_scan').prop('disabled', false);
                $('#btn_scan').text('Scan Subnet');

                //$('#btn_networks').attr('class', 'btn btn-sm btn-success dropdown-toggle');
                //$('#btn_scan').prop('disabled',false);
                $('#btn_networks').text('Select Nework');
                $('#btn_networks').prop('disabled', false);
                $('#input_cidr').prop('disabled', false);
                $('#input_cidr').val('');
                $('#btn_scan').prop('disabled', true);

            }
            freezeTimer();
        }
    });

    socket.on('wordlists', (list) => {
        list.forEach((name) => {
            let name_size = name.split(' ');
            if(name_size[0] === ''){
                name_size.shift();
            }
            $('#pwdlist').append($('<option>', {
                value: name_size[1],
                text: name_size[1]+' ('+name_size[0]+')'
            }))
        })
    });

    socket.on('debug_output', function (data) {
        $('#txtarea_hydra').val($('#txtarea_hydra').val()+data);
        //Scroll
        textarea.scrollTop = textarea.scrollHeight;
        //console.log(data);

    });

    //APPLY ACTIONS FOR FOUND PORTS
    socket.on('foundports', function (data) {

        const ip_id = data.host.toString().replace(/\./g, '');
        const grp_id = 'btngrp_port_' + ip_id;


        $('.no-results-'+ip_id).remove();
        if(data.ports.length === 0){
            $('#tr_host_' + ip_id).append($('<td>',{
                class:  'no-results-'+ip_id,
                text:   'No open Ports'
            }));
            //Remove Load Spinner from Button
            $('#spinner_' + ip_id).remove();

            //Remove btngrp
            $('#btngrp_port_'+ip_id).parent().remove();
            return 0;
        }

        //alert(JSON.stringify(data));

        const btngrp_hostports = $('<div>', {
            class: 'btn-group',
            id: grp_id
        });
        //Remove Scan Button

        $('#tr_host_' + ip_id).append($('<td>').append(btngrp_hostports));
        //$('#tr_host_' + ip_id).children().next().next().find(':first-child').attr("disabled", true);
        $('.class_foundports'+ip_id).remove();


        let i = 0;
        for (i = 0; i < (data.ports.length); i++) {
            //alert('i: '+i+' Port: '+JSON.stringify(data.ports[i])+' Laenge: '+data.ports.length);
            const btn_id = 'btn_port_' + ip_id + '_' + data.ports[i].toString();
            const receiver_host = data.host;
            const btn_grp_dropdown = $('<div>', {
                class: 'btn-group class_foundports'+ip_id,
                id: 'btn_grp_dropdown_'+ip_id+i
            });
            btn_grp_dropdown.appendTo($('#'+grp_id));
            const div_port_dropdown = $('<div>', {
                id: 'dropdown_'+ip_id+i,
                class: 'dropdown-menu'
            });
            div_port_dropdown.appendTo($('#btn_grp_dropdown_'+ip_id+i));
            const btn_port = $('<button/>', {
                id: btn_id,
                type: 'button',
                class: 'btn btn-success btn-sm dropdown-toggle',
                'data-toggle': 'dropdown',
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
                //click: portConnect
            });
            btn_port.text(data.ports[i]);
            btn_port.prependTo($('#btn_grp_dropdown_'+ip_id+i));


            //PORT ACTIONS
            const port_action_curl = $('<a/>', {
                class: 'dropdown-item',
                value: data.ports[i],
                address: data.host,
                click: portConnect
            });
            port_action_curl.text('Curl');
            port_action_curl.appendTo($('#dropdown_'+ip_id+i));

            //PORT ACTIONS
            const port_action_browser = $('<a/>', {
                class: 'dropdown-item',
                value: data.ports[i],
                address: data.host,
                click: openTab
            });
            port_action_browser.text('Open in Browser');
            port_action_browser.appendTo($('#dropdown_'+ip_id+i));

            const port_action_brute = $('<a/>', {
                class: 'dropdown-item',
                value: data.ports[i],
                address: data.host,
                click: copyToBruteforce
            });
            port_action_brute.text('Bruteforce');
            port_action_brute.appendTo($('#dropdown_'+ip_id+i));

            const port_action_servicedetect = $('<a/>', {
                class: 'dropdown-item',
                value: data.ports[i],
                address: data.host,
                click: serviceDetect
            });
            port_action_servicedetect.text('Identify Service');
            port_action_servicedetect.appendTo($('#dropdown_'+ip_id+i));

            const port_action_nikto = $('<a/>', {
                class: 'dropdown-item',
                value: data.ports[i],
                address: data.host,
                click: niktoScan
            });
            port_action_nikto.text('Nikto');
            port_action_nikto.appendTo($('#dropdown_'+ip_id+i));
        }


        //Remove Load Spinner from Button
        $('#spinner_' + ip_id).remove();
    });

    socket.on('curl_output', function (data) {
        $('#txtarea_hydra').val($('#txtarea_hydra').val()+data);
        //Scroll
        textarea.scrollTop = textarea.scrollHeight;
        //console.log(data);

    });

    socket.on('hydra_output', function (data) {
        $('#txtarea_hydra').val($('#txtarea_hydra').val()+data);
        //Scroll
        textarea.scrollTop = textarea.scrollHeight;


        //console.log(data);

    });

    socket.on('hostip_output', function (ip) {
        /*
        <table class="table table-borderless table-sm">
                <tbody>
                <tr id="localip">
                <td>Local IP
            <div id="spinner_localip" class="spinner-border spinner-border-sm" style="float: right;"></div>
                </td>
        */

        $('#localip').append($('<td>').text(ip.toString()));
        $('#spinner_localip').remove();

        //$('#scan_dropdown').append($('<a class="dropdown-item" onclick=alert("OhOh!")>'+ip+'</a>'));
    });

    socket.on('get_networks_output', function (list) {

        let i = 0;
        list.forEach(function(network){
            const entry = $('<a/>', {
                id: 'network_'+i,
                class: 'dropdown-item',
                value: network,
                click: updateDropdown
            });
            entry.text(network);
            entry.appendTo($('#scan_dropdown'));
            i++;
        });

        $('#btn_networks').text('Select Network');

        $('#spinner_networks').remove();
        $('#btn_scan').click(scanNetwork);
    });

    socket.on('got_gateway', function (ip) {

        $('#gatewayip').append($('<td>').text(ip));
        $('#spinner_gateway').remove();
    });

    socket.on('got_publicip', function (ip) {

        $('#publicip').append($('<td class="">').text(ip));
        $('#spinner_publicip').remove();
    });

    socket.on('got_isp', function (isp) {

        $('#isp').append($('<td class="">').text(isp));
        $('#spinner_isp').remove();

    });

    socket.on('hydra_ended', function (){
        alert('Hydra sent an exit code. Check Output!');
    });

    function updateDropdown(){

        if( $(this).attr('value').indexOf(':') === -1) {
            $('#stopwatch').attr('style','display: none');
            $('#btn_networks').text($(this).attr('value'));
            //Store selected IP into 'value' attribute of dropdown button
            $('#btn_networks').attr('value', $(this).attr('value'));

            //Fill the CIDR Overrider with Data
            let ip = $(this).attr('value').split('/');

            //Write CIDR
            $('#input_cidr').val('/' + ip[1]);

            //Add Click Action to btn_scan
            $('#btn_scan').prop('disabled', false);

        } else alert('I don\'t like IPv6 :(');
    }



    //PORT ACTIONS

    function portConnect() {

        const curldata = new Object();
        const port = $(this).attr('value');
        const addr = $(this).attr('address');

        curldata.hostip = addr;
        curldata.port = port;
        //alert('Test:'+JSON.stringify(curldata));
        socket.emit('curl', curldata);

        $('html, body').animate({
            scrollTop: $("#txtarea_hydra").offset().top
        }, 1000);

    }

    function serviceDetect(){
        const servicedata = new Object();
        const port = $(this).attr('value');
        const addr = $(this).attr('address');

        //alert(addr + port);
        servicedata.hostip = addr;
        servicedata.port = port;
        //alert('Test:'+JSON.stringify(curldata));
        socket.emit('service_detect', servicedata);

        $('html, body').animate({
            scrollTop: $("#txtarea_hydra").offset().top
        }, 1000);
    }

    function openTab() {

        const port = $(this).attr('value');
        const addr = $(this).attr('address');

        var win = window.open('http://'+addr+':'+port, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }

    }

    function niktoScan(){
        const niktodata = new Object();
        const port = $(this).attr('value');
        const addr = $(this).attr('address');
        niktodata.hostip = addr;
        niktodata.port = port;
        //  alert('Nikto:'+JSON.stringify(niktodata));
        socket.emit('nikto', niktodata);

        $('html, body').animate({
            scrollTop: $("#txtarea_hydra").offset().top
        }, 500);
    }

    function copyToBruteforce(){
        $('#bf_ip').val($(this).attr('address'));
        $('html, body').animate({
            scrollTop: $("#bruteforce").offset().top
        }, 500);
    }

    //NETWORK ACTIONS

    function scanNetwork(){

        $('#input_cidr').attr('value',$('#input_cidr').val());

        //Split Subnet in IP & CIDR
        let old_subnet = $('#btn_networks').attr('value').split('/');
        let ip = old_subnet[0];

        /*//Remove last Octet with "1"
        ip = ip.substring(0,ip.lastIndexOf('\.')+1);
        ip = ip+"1";*/

        let cidr = $('#input_cidr').val();
        let subnet = ip.toString()+cidr.toString();

        if (cidr.length > 1 && cidr.length < 4 && cidr.charAt(0) === "/" && cidr.charAt(1)+cidr.charAt(2) < 33 ) {
            $('#btn_networks').prop('disabled',true);
            $('#btn_scan').text('Analysing..');
            $('#btn_scan').append($('<div id="spinner_networks" class="spinner-border spinner-border-sm"/>'));
            $('#btn_scan').prop('disabled',true);
            $('#input_cidr').prop('disabled',true);

            if($('#arpcheck').is(':checked')){
                //   alert('Arpscan!');
                subnet=subnet+':arp'
            }
            socket.emit('scan_subnet', subnet);
            // alert(subnet);
            resetTimer();
            startTimer();

        }else alert("Invalid CIDR!" + $('#input_cidr').val());

    }

    function portScan() {
        const address = $(this).attr('address');
        let ip_id = address.replace(/\./g, '');
        socket.emit('findports', address);

        //Add Load Spinner to Button
        const spinner = $('<span>', {
            id: 'spinner_' + ip_id,
            class: "spinner-border spinner-border-sm"
        });
        $('#btn_' + ip_id).append(spinner);


    }

    //MISC

    function runCommand() {
        var command = new Object();
        command.command = $('#command_command').val();
        command.args = $('#command_args').val();

        socket.emit('command', command);
    }

    function cancelHydra() {

        socket.emit('cancelHydra', '');

        $('#btn_brute').prop('disabled', false);
        $('#btn_brute').removeAttr('style');
        $('#btn_brute_cancel').remove();

    }

});