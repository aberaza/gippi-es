/**
 * @class
 * @classdesc Description of class here
 */
var GeoEngine = function(){
    /**
     * @namespace GeoEngine
     * @property {boolean} isTracking 
     * @property {number} speed
     * @property {number} height
     * @property {array} position
     * @property {string} status
     */
    this.isTracking = false;
    this.position = undefined;
    this.speed = undefined;
    this.height = undefined;
    this.status = undefined;

    var watchID = undefined;
    var MAXAGE = 30000; //Cache max age
    var TIMEOUT = 27000; //answer callback

    var timestampedPositions = [];

    var self = this;

    this.startGPS = function(){
        if("geolocation" in navigator){
            if(watchID === undefined){
                navigator.geolocation.watchPosition(processLocation, processError, {enableHighAccuracy : true, maximumAge : MAXAGE, timeout : TIMEOUT });
            }else{
                console.warn("Already started");
            }
        }else{
            console.warn("Browser does not support geolocation api");
        }
    };

    this.stopGPS = function(){
        if(watchID!==undefined){
            navigator.geolocation.clearWatch(watchID);
        }
        watchID = undefined;
        this.isTracking = false;
    };

    this.clearCache = function(){
        timestampedPositions = [];
    };

    function processLocation(data){
        self.isTracking = true;
        data.time = Date.now();
        timestampedPositions.push(data);
        self.lastPosition = data;

        /**
         * position event.
         *
         * @event GeoEngine#position
         * @type {object}
         * @property {number} time timestamp of data
         * @property {object} .... something
         */
        document.dispatchEvent(
                new CustomEvent('position', {detail:data}, {bubbles : true, cancelable : true}));

        return data;
    };

    function pseudoDerivative(a,b){
        
    }

    function pseudoDoubleDerivative(a,b,c){
        var x = (b-a)/2;
        var y = (c-b)/2;
        
    }

    function processError(error){
        self.isTracking = false;
        console.warn(error.message);
        switch(error.code){
            case 1 :// PERMISION DENIED
                self.stopGPS();
                break;
            case 2: // POSITION UNAVAILABLE
                break;
            case 3: // TIMEOUT
                break;
        }
    };
};

var CONFIGURATION = {
    forceSpeedEstimate : false,
    forceRadiusEstimate : false
};

var C = {
    a  : 6378133.0,
    b  : 6356752.3142,
    e2 : 0.00669437999014,
    ep2: 0.00673949674228,
    "1f": 298257223563,
    R  : 6371009.0
};

function get2DSpeed(a, b){
    if(!a.speed || CONFIGURATION.forceSpeedEstimate){
        //First read, speed is 0
        if(b === undefined) return 0;
        //otherwise...
        var dX = a.X - b.X,
            dY = a.Y - b.Y;
        // Returns speed in m/s (expects timestamp to be in miliseconds)
        return Math.sqrt(dX*dX + dY*dY)*1000/(a.timestamp - b.timestamp);
    }
    // By default and if available use GPS returned speed
    return loc.speed;
}


function get3DSpeed(a, b){
    // First calculate Z axis speed:
    var speedZ = (a.Z - b.Z)*1000/(a.timestamp - b.timestamp);
    //Then calculate total speed adding speedZ to already found 2D speed
    var speed2D = (!a.speed || CONFIGURATION.forceSpeedEstimate)? a.speed : a.speed2D;

    return Math.sqrt(speedZ*speedZ + speed2D*speed2D);
}


function getCoords(loc){
    var cosLat = Math.cos(loc.latitude),
        sinLat = Math.sin(loc.latitutde),
        cosLong = Math.cos(loc.longitude),
        sinLong = Math.sin(loc.longitude);

    //TODO verify if altitude is really what should be.
    var R = CONFIGURATION.forceRadiusEstimate? C.R : C.a/Math.sqrt(1-C.e2*sinLat*sinLat);
    
    return ( (R +  loc.altitude) * cosLat * cosLong,
             (R +  loc.altitude) * cosLat * sinLong,
             (R*(1-C.e2) + loc.altitude) * sinLong );
}


