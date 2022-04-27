"use strict"

/*
Aufgabe 2, Geosoftware
@author Jonas Starke
*/

var meta = document.createElement("meta");
meta.author = "author";
meta.content = "Jonas Starke";
document.head.appendChild(meta);
var meta = document.createElement("meta");
meta.description = "description";
meta.content = "This page calculates distances";
document.head.appendChild(meta);





//creates a confirmation field for the page, which the user must confirm to access the page 
document.title = "welcome! Would you like to determine distances? "
confirm(document.title)




//creates an array to store our distance 
let result = new Array()
//this KEY_ENTER shows us the KEY_CODE of the Enter key, which we use in another function 
const KEY_ENTER = 13





//Here we get a pair of elements with their Id. We will need these later in the process
let bestimmterTbody = document.getElementById("tbody_id")
let buttonTaste = document.getElementById("button_location")
var x = document.getElementById("my_Location")




/**Haversine Formel
   * @function haversineFormel
    *@desc The Haversine formula determines the great circle distance between two points on a sphere based on their longitudes and latitudes
    *@return An array with the respective distances 
    *@parm Longitude, the transmitted coordinate and latitude of the transmitted coordinate
*/ 

function haversineFormel(cord1,cord2) {


    for(var i=0; i<16;i++){

    //Longitude
    var lat1 = cord1.coordinates[1]
    //Latitude
    var lon1 = cord2.coordinates[0]
    var lon2 = pois.features[i].geometry.coordinates[0] 
    var lat2 = pois.features[i].geometry.coordinates[1]

    const R = 6371e3; 
    const breitengrad1 = lat1 * Math.PI / 180;
    const breitengrad2 = lat2 * Math.PI / 180;
    const differenzBreitengrad = (lat2-lat1) * Math.PI/180;
    const differenzLängengrad = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(differenzBreitengrad/2) * Math.sin(differenzBreitengrad/2) +
          Math.cos(breitengrad1) * Math.cos(breitengrad2) *
          Math.sin(differenzLängengrad/2) * Math.sin(differenzLängengrad/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;
    result[i] = d

    }
    /** 
     *@function sortieren
     *@desc This function sorts our values in ascending order
     */
    
    function sortieren(){
    const sortetDistance= result.sort(sortNumber);
    }

    function sortNumber(a,b){
        return(b-a)
    }
    sortieren()
}

/** 
 * @function getLocation 
 * @desc function to get the location of the user
 * @source https://www.w3schools.com/html/html5_geolocation.asp
 */
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, showError)

    }else{
        x.innerHTML = "Geolocation is not supported by this browser"
    }
}


//create an new Array for the location1
let location1 = new Array()

/**
 * @function  showPosition 
 * @desc Function to convert the coordinates of the user's position into a GeoJSON point and display it in the text field and above it 
 * @param position coordinates of the user
 */
function showPosition(position){
    x.innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude
    location1 = [position.coords.longitude, position.coords.latitude]
    location1= new JSONConstructor(location1, "Point")
    document.getElementById("text_location").innerHTML = JSON.stringify(location1)
    haversineFormel(location1, location1)    
}

/**
 * @function  showError 
 * @desc function to give out error if location could not be determined
 * @param error 
 * @source https://www.w3schools.com/html/html5_geolocation.asp
 */
function showError(error) {
    switch(error.code){
      case error.PERMISSION_DENIED:
        x.innerHTML = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        x.innerHTML = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        x.innerHTML = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        x.innerHTML = "An unknown error occurred."
        break;
    }
  }
 /**
   * @function a
   * @desc Creates us a table, the heading and the rows. It also assigns to each row, a distance from the given coordinates and the respective geoobjects.
   */
  function a(){
    if(result.length > 1){
        function createTable (){
        let table = document.getElementById("table")
        let thead = document.createElement("thead")
        table.appendChild(thead)

        let row1 = document.createElement("tr")
        let heading = document.createElement("th")
         heading.innerHTML = "Dstance"

        row1.appendChild(heading)
        thead.appendChild(row1)
        
        for(var n = 0; n<16; n++){
            var row = bestimmterTbody.insertRow(0)
            var cell1 = row.insertCell(-1)
    
            cell1.innerHTML = result[n].toFixed(1)
        }
    }
    createTable()
    refreshButton()
}
   
}
/**
 * @function JSONConstructor
 * @desc builds a JSON object 
 * @param  array array for transformation
 * @param  type given GeoJSON object-type
 * @source https://www.w3schools.com/js/js_object_constructors.asp
 */
function JSONConstructor(array, type) {
    this.type = type
    this.coordinates = array
}

/**
 * @function isvalid
 * @desc  tests if the string given to us is a JSON string 
 * @param string stringified JSON
 * @retrun ture === JSON String, false === error not JSON String
 */
function isValid(string) {
    try {
        JSON.parse(string);
    } catch (error) {
        return false;
    }
    return true;
}

const clearComplete = document.querySelector(".clear_complete")
//Here we decide when we want to see the clearComplete button and when we don't.
const refreshButton = () =>{
    if(result.length < 1){
        clearComplete.style.display = "none"
    }else{
        clearComplete.style.display = ""
    }
}
refreshButton()

const allTable = document.querySelector(".table_div")
//This event removes the table and its characters
clearComplete.addEventListener("click", (event) =>{
    
    const completeTable = allTable.querySelectorAll(".all_table")            
    for(const completeTables of completeTable){
        completeTables.remove()
    }
    refreshButton()
})


var givenpoint
/**
 * @function getInputValue
 * @desc the text field gets a point and should be able to read this point and thus be able to determine the distance using the HaversineFormula() 
 */
function getInputValue() {
    document.getElementById("errorMessage").innerHTML = ""
    if (isValid(document.getElementById("text_location").value) == true) { // Checks whether the location is valid
        if ((JSON.parse(document.getElementById("text_location").value)).type != "Point") {
            document.getElementById("errorMessage").innerHTML = 'ERROR: This is not a Point. Expected pattern: {"type":"Point","coordinates":[...]}'
        } else {
            givenpoint = JSON.parse(document.getElementById("text_location").value)
            console.log(givenpoint)
            haversineFormel(givenpoint, givenpoint)
        }
    } else { // Throws an error if not
        document.getElementById("errorMessage").innerHTML = "ERROR: This is not a valid GeoJSON"
    }
}

/**
 * @function standard
 * @desc function for standard point
 */
function standard(){
    
    haversineFormel(givenpoint, givenpoint)
    console.log(givenpoint)
    main()
}
//Here we pass the default point in the JSON structure and store it in the variable givenpoint
point = new JSONConstructor(point, "Point")
givenpoint = point

//Performs the essential functions 
function main(x){
    a()
    isValid()
 }
 
 //This is an EventListener, which reacts on a click and executes the function getLocation().
 buttonTaste.addEventListener("click", () =>{
     getLocation()
     
     
   })

//by confirming the Enter key in the input field, we read in the values 
let location_eingabe = document.getElementById("text_location")
location_eingabe.addEventListener("keydown", (event) =>{
    if(event.keyCode === KEY_ENTER){
        getInputValue()
        main()

    }
})


let start = document.getElementById("button_start")
start.addEventListener("click", () =>{
    if(result.length<1){
        getInputValue()
    }else{
        main()
    }
    
    
})
////updates our page with the ecs-Taste
let aktualisiere = document.getElementById("c")
aktualisiere.addEventListener("keydown", (event) => {
    if(event.keyCode === 27){
        location.reload()
    }
    
    
})

//updates our page
let aktualisiere00 = document.getElementById("aktualisiere00")
aktualisiere00.addEventListener("click", ()=>{
    location.reload()


})

/**
 * @function back
 * desc This is for the second page of HTML. This function is linked to a button and brings us back to the Main
 */
function back(){
    location.reload()
}



  
    











