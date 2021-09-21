/**
 * Leaflet app
 * 
 * TODO make leaflet icon
 * TODO get/make book/movie icon
 */
var Leaflet = function (){
    var userId = "someidthatisastring",
    currentItem = null,
    nextItem = null;

    

    var Messaging = function(){

        var messages = {
            "message":ko.observable("")
            ,"error":ko.observable("")
        };
        /**
         * error handling
         * @param String message 
         */
        function handleErrors(errortype, message){
            console.log(errortype, message);
            
            messages.error(message);
        }

        function displayMessage(msg, duration){
            messages.message(msg);
            document.getElementById("messages").classList.toggle("d-none");

            if(duration > 0){
                setTimeout(function(){
                    document.getElementById("messages").classList.toggle("d-none");
                }, 5000);
            }
            
        }

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
    


    function getData(sendObj){
        var settings = {
            "baseUrl":"https://api.lib.byu.edu/leaflet"
            ,"endpoints":{
                "item":"/item"
                ,"rate":"/users/" + userId + "/ratings"
            }
        },sendSettings = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'omit', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
            },
            //redirect: 'follow', // manual, *follow, error
            //body: ""
        };
        
        /**
         * Write the fetch so that I can do the response.
         * data is the following 
         * {
         *  "endpoint":"getItem" | "rate",
         *  "rating":{
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

        console.log("calling coms");
        console.log(sendObj);
        comms(sendObj).then(data => {
            processServerResponse(sendObj, data);
        }).catch((error) => {
            Messaging.handleErrors("commsError", error);
        });
        
    }

    function initKo(){

        //TODO: create/download loading book thumbnail

        var initItem = {
            "author":"miguel"
            ,"description":"description" 
            ,"id": "someid"
            ,"thumbnail":"somethumbnail"
            ,"title":"title"
            ,"type":"BOOK"
        };

        currentItem = createItem(initItem);
        ko.applyBindings(currentItem, document.getElementById("mediaCard"));

        
    }

    function setNextItem(item){
        nextItem = item;
    }

    function processItem(item){
        updateCurrentItem(item);
    }
    
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

    function updateCurrentItem(item){
        currentItem.author(item.author)
        .description(item.description)
        .id(item.id)
        .thumbnail(item.thumbnail)
        .title(item.title)
        .type(item.type)
    }

    function handleRating(ratingResponse){
        console.log(ratingResponse);
        //output feedback for successfull rating

        processItem(nextItem);
        getData({"endpoint":"item", "callback":setNextItem});
    }

    function processServerResponse(sendObj, data){
        console.log(sendObj);
        console.log(data);

        if(sendObj.endpoint === "item"){
            sendObj.callback(data);            
        }else if(sendObj.endpoint === "rate"){
            handleRating(data);
        }
    }

    function init(){
        initKo();
        
        getData({"endpoint":"item", "callback":processItem});
        getData({"endpoint":"item", "callback":setNextItem});


        Messaging.init();
        //Messaging.displayMessage("blah", 5000);
        
    }

    function rateProcess(wouldread){

        console.log("rating", wouldread);

        var data = {
            "rating":wouldread
            ,"itemId":currentItem.id()
        };

        getData({"endpoint":"rate", "data": data});

        //output next precached item. 
        //send rating for current item.
    }

    return {
        "rate":rateProcess
        ,"init":init
    }
}();

window.onload = function (){

    console.log("loaded and inited");
    Leaflet.init();
}