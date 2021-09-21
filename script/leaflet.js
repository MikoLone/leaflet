/**
 * Leaflet app
 * 
 */
var Leaflet = function (){
    var userId = "someidthatisastring", //hard coded userId as per instructions
    currentItem = null,//placeholder for the currentitem
    nextItem = null;//holds the data for the next item

    
    /**
     * Messages class for outputting messages and errors.
     * 
     */
    var Messaging = function(){
        /**
         * Creats the KO observables for messages
         */
        var messages = {
            "message":ko.observable("")
            ,"error":ko.observable("")
        },
        /**
         * What the user should see when some errors happen. Other times it just what is sent. 
         */
        userMessages = {
            "commsError":"We could not get the media from the server. We are on it. Please try again another time."
        };
        /**
         * Handles errors that come along. Displays errors on the page. and logs them but obviously only to the console
         * but a FUTURE would be to send them somewhere a developer would see them. 
         * 
         * @param String errortype optional but if the type as a usermessage asscociated with it it will display that message instead of message
         * @param {*} message  the message you want display if it doesn't have an error type. if it is displayed this message is logged.
         * @param int duration the amount of time in miliseconds to show the message. null or 0 will show it forever.
         */
        function handleErrors(errortype, message, duration){
            console.log(errortype, message);

            if(userMessages.hasOwnProperty(errortype )){
                userMessage = userMessages[errortype];
            }else{
                userMessage = message;
            }

            var node = document.getElementById("errorContainer");
            node.classList.toggle("d-none");

            messages.error(userMessage);
            timeoutMessage(duration, node);
        }
        /**
         * If there was a message with a duration then this will execute that. 
         * 
         * @param int duration time in miliseconds
         * @param DOMnode node the node of the display message container that needs to be toggled when durattion ends
         */
        function timeoutMessage(duration, node){
            if(node === null ){
                console.log("node is null timeout will be ignored");
                return;
            }

            if(duration > 0){
                setTimeout(function(){
                    node.classList.toggle("d-none");
                }, 5000);
            }
        }
        /**
         * Displays a message to the user with an optional duration.
         * 
         * @param String msg 
         * @param int duration time in milliseconds that the message should be displayed. 0 means it will display for ever. 
         */
        function displayMessage(msg, duration){
            messages.message(msg);
            var node = document.getElementById("messages");
            node.classList.toggle("d-none");
            timeoutMessage(duration, node);
        }
        /**
         * Initializes the KO bindings for the messages
         */
        function init(){
            ko.applyBindings(messages, document.getElementById("messages"));
            ko.applyBindings(messages, document.getElementById("errorContainer"));
        }

        
        return {
            "handleErrors":handleErrors
            ,"displayMessage":displayMessage
            ,"init":init
        }
    }();
    

    /**
     * Handles grabbing the data from the server and handling the response and
     * sending it along. 
     * 
     * Expects a sendObj as follows
     * 
     * {
     *  "endpoint":"getItem" | "rate", //the endpoint is which api call you want to do. 
     *  "rating":{ // if it is "rate" then the server expects this rating object. not expected for getItem
     *      "itemId":"string"
     *      ,"rating":boolean
     *      }
     *  }
     * 
     * @param {*} sendObj 
     * @returns 
     */
    function getData(sendObj){

        /**
         * Sets up the endpoints and destination for the service
         */
        var settings = {
            "baseUrl":"https://api.lib.byu.edu/leaflet"
            //"baseUrl":"https://example.com/leaflet"
            ,"endpoints":{
                "item":"/item"
                ,"rate":"/users/" + userId + "/ratings"
            }
        }
        /**
         * These are the js Fetch settings. 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
         */
        ,sendSettings = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'omit', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
            },
            body: null//TODO CHECK IF THIS WORKS
        };
        
        /**
         * Write the fetch so that I can do the response.
         * data is the following 
         * {
         *  "endpoint":"getItem" | "rate", 
         *  "rating":{ // if it is "rate" then the server expects this object
         *      "itemId":"string"
         *      ,"rating":boolean
         *      }
         *  }
         */
        async function comms(sendObj){
            //TODO make endpoints a STATIC
            var url = settings.baseUrl + settings.endpoints[sendObj.endpoint];
            if(sendObj.endpoint !== "item"){
                sendSettings.body = JSON.stringify(sendObj.data);
                sendSettings.method = "POST";
            }

            const response = await fetch(url, sendSettings);
            return response.json(); // parses JSON response into native JavaScript objects
        }

        function checkendPoint(endpoint){
            if(!settings.endpoints.hasOwnProperty(endpoint)){
                Messaging.handleErrors("commsError", "Unknown Endppoint");
                return false;
            }

            return true;
        }


        if(!checkendPoint(sendObj.endpoint)){
            return;
        }

        comms(sendObj).then(data => {
            processServerResponse(sendObj, data);
        }).catch((error) => {
            Messaging.handleErrors("commsError", error);
        });
        
    }
    /**
     * Initializes the Knockout Binding for the Items
     * uses some bunk placeholder data in case there is an 
     * error on the server.
     * 
     */
    function initItemKo(){

        var initItem = {
            "author":"Michael J Fox"
            ,"description":"There was a problem on the server" 
            ,"id": "someid"
            ,"thumbnail":"/img/backtothefuture.jpg"
            ,"title":"Back to the Future"
            ,"type":"FILM"
        };

        currentItem = createItem(initItem);
        ko.applyBindings(currentItem, document.getElementById("mediaCard"));
       
    }
    /**
     * Caches the next item so use doesn't have to wait. 
     * 
     * @param {*} item @see Item model on https://api.lib.byu.edu/leaflet/swagger-ui.html
     */
    function setNextItem(item){
        nextItem = item;
    }
    /**
     * Processes the item and updates the UI
     * 
     * @param {*} item 
     */
    function processItem(item){
        updateCurrentItem(item);
    }
    
    /**
     * Little helper function that
     * Sets up the default item knockout bindings for the UI.
     * 
     * @param {*} item @see Item model on https://api.lib.byu.edu/leaflet/swagger-ui.html
     * @returns Item as KO observables.
     */
    function createItem(item){
        return {
            "author": ko.observable(item.author)
            ,"description": ko.observable(item.description)
            ,"id": ko.observable(item.id)
            ,"thumbnail": ko.observable(item.thumbnail)
            ,"title": ko.observable(item.title)
            ,"type": ko.observable(item.type)
        }
    }
    /**
     * Changes the knockout binding to update the UI.
     * 
     * @param {*} item @see item model on https://api.lib.byu.edu/leaflet/swagger-ui.html
     */
    function updateCurrentItem(item){
        currentItem.author(item.author)
        .description(item.description)
        .id(item.id)
        .thumbnail(item.thumbnail)
        .title(item.title)
        .type(item.type)
    }
    /**
     * Displays the thank you message and processing
     * the next item and gets a new one from the service.
     */
    function handleRating(){ 
        Messaging.displayMessage("Thank you for rating", 3000);
        processItem(nextItem);
        getData({"endpoint":"item", "callback":setNextItem});
    }
    /**
     * Processes the responses from the service. Handles 
     * if we are processing a rating or a item retrieval.
     * 
     * For descriptions of sendObj see comms documentation.
     * For descirptions of data see the service documentation at 
     * https://api.lib.byu.edu/leaflet/swagger-ui.html
     * 
     * @param {*} sendObj 
     * @param {*} data 
     */
    function processServerResponse(sendObj, data){
        if(sendObj.endpoint === "item"){
            sendObj.callback(data);            
        }else if(sendObj.endpoint === "rate"){
            handleRating(data);
        }
    }
    /**
     * Initializes the app. Sets up the knockout bindings and the
     * messeging system. Then it retrieves the first 2 media items 
     * from the service. 
     */
    function init(){
        initItemKo();
        Messaging.init();

        getData({"endpoint":"item", "callback":processItem});
        getData({"endpoint":"item", "callback":setNextItem});
        
        //Messaging.displayMessage("blah", 5000);
        //Messaging.handleErrors("", "display the error", 5000);
    }
    /**
     * Collects the data to send to the service for the rating
     * and send it.
     * 
     * @param boolean wouldread 
     */
    function rateProcess(wouldread){
        var data = {
            "rating":wouldread
            ,"itemId":currentItem.id()
        };

        getData({"endpoint":"rate", "data": data});
    }

    return {
        "rate":rateProcess
        ,"init":init
    }
}();

window.onload = function (){
    Leaflet.init();
}