const http = require('http');
const url = require('url');
const fs = require('fs');
const utf8 = require('utf8');
const { normalize } = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const route_api = '/api';


const server = http.createServer((req, res) => {
    if (req.url.startsWith(route_api)) {
        handleApi(req, res, fs);
    } else if (req.url === '/' || req.url === 'index.html') {
        fs.readFile('main-view/index.html', function (err, data) {
            write(res, 'text/html', data);
        });
    } else {
        fs.readFile(`main-view${req.url}`, function (err, data) {
            write(res, getContentType(req.url), data);
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

/**
 * 
 * @param {*} fileName 
 */
function getContentType(fileName) {
    if (!fileName) {
        return 'text/plain';
    }
    var name = '' + fileName.toLowerCase();
    name = name.substring(name.length - 3, name.length);
    switch (name) {
        case 'css':
            return 'text/css';
        case 'htm':
        case 'tml':
            return 'text/html';
        case 'xml':
            return 'text/xml';
        case '.js':
            return 'application/x-javascript';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'peg':
        case 'jpg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'ico':
            return 'image/x-icon';
        default:
            return 'text/plain';
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} fs 
 */
function handleApi(req, res, fs) {
    const queryObject = url.parse(req.url, true).query;
    var ort = queryObject.ort;
    var plz = queryObject.plz;
    var postleitzahl = queryObject.plz;
    fs.readFile('api/plz.json', function (err, data) {
        var retval;
        if (!ort && !plz) {
            retval = data;
        } else {
            var json = JSON.parse(data);
            var returnValue = [];
            for (i = 0; i < json.length; i++) {
                if (matches(ort, plz, json[i])) {
                    returnValue.push(json[i]);
                }
            }
            retval = JSON.stringify(returnValue);
        }
        write(res, 'application/json', retval);
    });
}

/**
 * 
 * @param {*} ort 
 * @param {*} plz 
 * @param {*} obj 
 */
function matches(ort, plz, obj) {
    if (ort) {
        return eq(obj.Stadt, ort);
    }
    if (plz) {
        return eq('' + obj.PLZ, '' + plz);
    }
    return false;
}

/**
 * 
 * @param {*} str1 
 * @param {*} str2 
 */
function eq(str1, str2) {
    var v1 = str1.toLowerCase();
    var v2 = str2.toLowerCase();
    v1 = v1.substring(0, v2.length );
    if (v1 === v2) {
        return true;
    } else {
        return false;
    }
}

/**
 * 
 * @param {*} res 
 * @param {*} contentType 
 * @param {*} data 
 */
function write(res, contentType, data) {
    if (data) {
        var headers = {
            "Content-Type" : contentType + ';charset=utf-8',
            "Content-Length" : Buffer.byteLength(data),
            'Access-Control-Allow-Origin' : '*'
          };
        res.writeHead(200, headers);
        res.write(data);
    }
    res.end();
}

