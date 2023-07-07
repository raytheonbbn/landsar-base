function createWebSocket(path, ipAddr) {
    var protocolPrefix = (window.location.protocol === 'https:') ? 'wss:' : 'ws:';
    if(ipAddr !== null && ipAddr !== undefined){
        return new WebSocket(protocolPrefix + '//' + ipAddr +'/'+ path);
    }else {
        return new WebSocket(protocolPrefix + '//' + location.host + '/' + path);
    }
}

function keepAlive(webSocket) { 
    var timeout = 20000;  
    if (webSocket.readyState == webSocket.OPEN) { 
    	console.log("Sending keep-alive");
        webSocket.send('keep-alive');  
    }  
    timerId = setTimeout(keepAlive, timeout, webSocket);  
}  