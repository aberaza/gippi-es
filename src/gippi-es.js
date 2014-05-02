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

    var that = this;

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
        that.isTracking = true;
        data.time = Date.now();
        timestampedPositions.push(data);
        that.lastPosition = data;

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
    };

    function processError(error){
        that.isTracking = false;
        console.warn(error.message);
        switch(error.code){
            case 1 :// PERMISION DENIED
                that.stopGPS();
                break;
            case 2: // POSITION UNAVAILABLE
                break;
            case 3: // TIMEOUT
                break;
        }
    };
}
