/*
Geosoftware Aufgabe 1 
@autohor Jonas Starke
*/



/*The "use strict" directive was new in ECMAScript version 5.

It is not a statement, but a literal expression, ignored by earlier versions of JavaScript.

The purpose of "use strict" is to indicate that the code should be executed in "strict mode".

With strict mode, you can not, for example, use undeclared variables
Source: https://www.w3schools.com/js/js_strict.asp
*/

"use strict"


//Name from the Cities
const cityName = ["Kyoto","Kairo", "Tunis","Bucharest", "Barcelona", "Dublin","Oslo","Graz", "Amsterdam", "Kassel", "Köln"]
//Array to save the result
let result = new Array()

    
/*
The haversine formula determines the great-circle distance between two points on a sphere given their 
longitudes and latitudes. Important in navigation, it is a special case of a more general formula in spherical trigonometry,
 the law of haversines, that relates the sides and angles of spherical triangles.
 Source: https://en.wikipedia.org/wiki/Haversine_formula
*/
function haversineFormel() {


    for(var i=0; i<cities.length;i++){

    
    var lat1 = point[1]; 
    var lon1 = point[0]; 
    var lon2 = cities[i][0]; 
    var lat2 = cities[i][1]; 

    const R = 6371e3; 
    const breitengrad1 = lat1 * Math.PI / 180;
    const breitengrad2 = lat2 * Math.PI / 180;
    const differenzBreitengrad = (lat2-lat1) * Math.PI/180;
    const differenzLängengrad = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(differenzBreitengrad/2) * Math.sin(differenzBreitengrad/2) +
          Math.cos(breitengrad1) * Math.cos(breitengrad2) *
          Math.sin(differenzLängengrad/2) * Math.sin(differenzLängengrad/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c / 1000;
    result[i] = d
    
    }
    //This function sorts our values in ascending order
    function sortieren(){
    const sortetDistance= result.sort(sortNumber);
    }

    function sortNumber(a,b){
        return(b-a)
    }
    sortieren()
    
   

}
/*
Adjusted order of the corded cities. 
Serves to ensure that we already have the correct order of cities to simplify the assignment
*/
    let citiesPoints = [
        [135.7681,35.0116],
        [31.2357, 30.0444], //Kairo
        [10.1815, 36.8065], //Tunis
        [26.1025, 44.4268], //Bucharest
        [2.1686, 41.3874], //Barcelona
        [-6.2603, 53.3498], //Dublin
        [10.7522, 59.9139], //Oslo
        [15.4395, 47.0707], //Graz
        [4.9041, 52.3676], //Amsterdam
        [9.4797, 51.3127], //Kassel
        [6.9570, 50.9367], //Köln
    ]


    /*
    Returns a reference to an element based on its ID.
    We can then use this reference to create a table in the next function
    */
    let bestimmerTody = document.getElementById("tbody_id")

    
haversineFormel()
    
    function createTable (){
    for(var n=0;n<11;n++){
        //Creates a new line and returns a reference to that line
        var row = bestimmerTody.insertRow(0)
        //InsertCell () inserts a new cell into a table row and then returns a reference to that row
        var celli1 = row.insertCell(-1)
        var celli2 = row.insertCell(-1)
        
        /*
        Here we use the function .innerHTML to pass the names of the cities
         and their coordinates to our previously created line 
        */
        celli1.innerHTML = cityName[n] +" " +"(" + citiesPoints[n] + ")" 
        /*
        Here we use again the function .innerHTML and .toFixed(2)
         to add the results of the Haversine formula with two decimal places to the table
        */
        celli2.innerHTML =   result[n].toFixed(2) + " " + "km"
    
    
    }
    }
createTable()
    
    






   
