/**
* Musterlösung zu Aufgabe 3, Geosoft 1, SoSe 2020
* @author {Jonas Starke   matr.Nr.: {506 583}
*/

//****various jshint configs****
// jshint esversion: 8
// jshint browser: true
// jshint node: true
// jshint -W117
"use strict";

//declaration of global variables
var busStops = [];
var point;
var departureList;
var rectangle = []
var drawnPolygonBusStops = []
var departues


/**
* @function onLoad function that is executed when the page is loaded
*/
async function onLoad() {
  busAPI.haltestellen();
  
  
}



//##############################################################################
//## FUNCTIONS
//##############################################################################

/**
* @function calculateResults the function that calculates all results
*/
function calculateResults(point, busStops) {

  let results = sortByDistance(point, busStops);

  //get the departures of the nearest stop for the next 5 minutes.
  busAPI.departures(
    results[0].id, 3000
  );
  DocumentInterface.updateDepartureHeader(results[0].name);

  //display the resulting geoJSON on the page
  DocumentInterface.displayGeojsonOnPage(
    GeoCalculator.formatStringifiedGeoJSON(
      JSON.stringify(busStops, null, "\t")
    ));

  DocumentInterface.clearTable('resultTable');
  DocumentInterface.drawBusStopTable(results);
}

/**
* @function refresh
* @desc called when refresh button presssd are inserted. refreshes the page data.
*/
function refresh() {
  let positionGeoJSON = document.getElementById("userPosition").value;

  try {
    positionGeoJSON = JSON.parse(positionGeoJSON);
    //check validity of the geoJSON. it can only be a point
    if (geoJSON.isValidGeoJSONPoint(positionGeoJSON)) {
      point = positionGeoJSON.features[0].geometry.coordinates;
      calculateResults(point, busStops);
    } else {
      alert("invalid input.please input a single valid point in a feature collection");
    }
  }
  catch (error) {
    console.log("invalid input. see console for more info.");
    console.log(error);
    alert("invalid input. see console for more info.");
  }
}

/**
* @function sortByDistance
* @desc takes a point and an array of points and sorts them by distance ascending
* @param point array of [lon, lat] coordinates
* @param pointArray array of points to compare to
* @returns Array with JSON Objects, which contain coordinate and distance
*/
function sortByDistance(point, pointArray) {
  let output = [];

  for (let i = 0; i < pointArray.features.length; i++) {
    let distance = GeoCalculator.twoPointDistance(point, pointArray.features[i].geometry.coordinates);
    let j = 0;
    //Searches for the Place
    while (j < output.length && distance > output[j].distance) {
      j++;
    }
    let newPoint = {
      index : i,
      coordinates: pointArray.features[i].geometry.coordinates,
      distance: Math.round(distance*100)/100,

      name : pointArray.features[i].properties.lbez,
      id: pointArray.features[i].properties.nr,

    };
    output.splice(j, 0, newPoint);
  }

  return output;
}

/**
* The following class declarations exist so functions can be grouped into them;
* that way the code doesn't get too cluttered. The page may just as well be
* scripted purely functional with minimal changes.
*/

/** Class for communicating with the BusAPI
* for a more functional approach of xhr, see: https://github.com/streuselcake/jslab/blob/master/client/01-html-js-css/xhr/mensa/mensa.js
*/
class BusAPI{
  

  

  /**
   * haltestellen
   * @public
   * @desc method to retrieve bus-stop data from busAPI.
   * 
   * 
   */
  async haltestellen(){
    const API_URL = "https://rest.busradar.conterra.de/prod"
    const response = await fetch(API_URL + `/haltestellen`)
    const data = await response.json()
    busStops = data
    calculateResults(point, busStops)
    
    
    



   
    return(true);
  }

  /**
   * departures
   * @public
   * @desc method to retrieve upcoming departues from a given bus stop.
   * functions simlar to haltestellen. is called once nearest bus stop is known.
   * callback functions will do further work.
   * @param busStopNr the number of the bus stop as returned by the api.
   * @param time seconds from now during which departures are to be shown. defaults to 300 (5 minutes)
   * @see haltestellen
   * 
   */
  async departures(busStopNr, time){
    
    const API_URL = "https://rest.busradar.conterra.de/prod"
    let resource = API_URL+`/haltestellen/${busStopNr}/abfahrten?sekunden=`;
    resource += time || 300
    const response = await fetch(resource)
    const data = await response.json()
    departureList = data
    DocumentInterface.clearTable("nextDeparturesTable");
    DocumentInterface.drawDepartureTable(departureList);
  }

}

/** Class containing all static methods for displaying data on page */
class DocumentInterface{

  /**
   * showPosition
   * @public
   * @desc Shows the position of the user in the textarea.
   * callback function that is passed by getLocation
   * @see getLocation
   * @param {*} position Json object of the user
   */
  static showPosition(position) {
    var x = document.getElementById("userPosition");
    //"Skeleton" of a valid geoJSON Feature collection
    let outJSON = { "type": "FeatureCollection", "features": [] };
    //skelly of a (point)feature
    let pointFeature = {"type": "Feature","properties": {},"geometry": {"type": "Point","coordinates": []}};
    pointFeature.geometry.coordinates = [position.coords.longitude, position.coords.latitude];
    //add the coordinates to the geoJson
    outJSON.features.push(pointFeature);
    x.innerHTML = JSON.stringify(outJSON);
  }

  /**
   * getLocation
   * @public
   * @desc function that requests the geographic position of the browser
   * @see getPosition
   */
  static getLocation() {
    var x = document.getElementById("userPosition");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition);
      navigator.geolocation.getCurrentPosition(myPosition)
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  /**
   * drawBusStopTable
   * @desc inserts the bus stop list into the Table on the web-page
   * @param {*} results array of JSON with contains
   */
  static drawBusStopTable(results) {
    var table = document.getElementById("resultTable");
    //creates the Table with the distances
    for (var j = 0; j < results.length; j++) {
      var newRow = table.insertRow(j + 1);
      var cel1 = newRow.insertCell(0);
      var cel2 = newRow.insertCell(1);
      var cel3 = newRow.insertCell(2);
      cel1.innerHTML = results[j].name;
      cel2.innerHTML = results[j].coordinates;
      cel3.innerHTML = results[j].distance;
    }
  }

  /**
   * drawBusStopTable
   * @desc inserts the results into the Table on the web-page
   * @param {*} results array of JSON with contains
   */
  static drawDepartureTable(results){
    var table = document.getElementById("nextDeparturesTable");
    for (var j = 0; j < results.length; j++) {
      var newRow = table.insertRow(j + 1);
      var cel1 = newRow.insertCell(0);
      var cel2 = newRow.insertCell(1);
      var cel3 = newRow.insertCell(2);
      cel1.innerHTML = results[j].linienid;
      cel2.innerHTML = results[j].richtungstext;
      cel3.innerHTML = this.time(results[j].abfahrtszeit);
    }
  }

  /**
   * updateDepartureHeader
   * @desc updates the header above the departure table with the name of the stop.
   * @param {*} results array of JSON with contains
   */
  static updateDepartureHeader(busStopName){
    if(busStopName === undefined){
      document.getElementById("nextDeparturesHeader").innerHTML = "no upcoming departures";
    } else {
      let message = "upcoming departures from " + busStopName;
      document.getElementById("nextDeparturesHeader").innerHTML = message;
    }

  }

  /**
   * clearTable
   * @desc removes all table entries and rows except for the header.
   * @param tableID the id of the table to clear
   */
  static clearTable(tableID){
    //remove all table rows
    var tableHeaderRowCount = 1;
    var table = document.getElementById(tableID);
    var rowCount = table.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
      table.deleteRow(tableHeaderRowCount);
    }
  }

  /**
   * displayGeojsonOnPage
   * @desc psuhes a given string onto the geoJSON-id'd tag in the DOM.
   * @param geoJSONString string, expected to represent geojson but can be anything.
   */
  static displayGeojsonOnPage(geoJSONString){
    document.getElementById('geoJSON').innerHTML = geoJSONString;
  }

  /**
   * time
   * @desc takes a second-value (as in seconds elapsed from jan 01 1970) of the time and returns the corresponding time.
   * source: https://stackoverflow.com/a/35890816
   * @param seconds time in milliseconds
   */
  static time(seconds) {
    seconds = parseInt(seconds); //ensure the value is an integer
    var ms = seconds*1000;
    var time = new Date(ms).toISOString().slice(11, -5);
    return time + " GMT";
  }


}

/** Class containing all static methods for geographic distance calculation */
class GeoCalculator{

  /**
  * twoPointDistance
  * @public
  * @desc takes two geographic points and returns the distance between them. Uses the Haversine formula (http://www.movable-type.co.uk/scripts/latlong.html, https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula)
  * @param start array of [lon, lat] coordinates
  * @param end array of [lon, lat] coordinates
  * @returns the distance between 2 points on the surface of a sphere with earth's radius
  */
  static twoPointDistance(start, end) {
    //variable declarations
    var earthRadius; //the earth radius in meters
    var phi1;
    var phi2;
    var deltaLat;
    var deltaLong;

    var a;
    var c;
    var distance; //the distance in meters

    //function body
    earthRadius = 6371e3; //Radius
    phi1 = this.toRadians(start[1]); //latitude at starting point. in radians.
    phi2 = this.toRadians(end[1]); //latitude at end-point. in radians.
    deltaLat = this.toRadians(end[1] - start[1]); //difference in latitude at start- and end-point. in radians.
    deltaLong = this.toRadians(end[0] - start[0]); //difference in longitude at start- and end-point. in radians.

    a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = earthRadius * c;

    return distance;
  }

  /**
  * toRadians
  * @public
  * @desc helping function, takes degrees and converts them to radians
  * @returns a radian value
  */
  static toRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }

  /**
  * toDegrees
  * @public
  * @desc helping function, takes radians and converts them to degrees
  * @returns a degree value
  */
  static toDegrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
  }

  /**
  * @function formatStringifiedGeoJSON
  * @desc formats String of geojson so it has whitespace and line breaks
  * @param text String of the text that is to be displayed
  * @returns String, html formatted geoJSON
  */
  static formatStringifiedGeoJSON(text){
    //replace line-breaks with according html
    text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    //replace white space with according html
    text = text.replace(/\s/g, '&nbsp');
    return text;
  }
}

/** Class containing methods for geoJSON processing*/
class GeoJSON{
  constructor(){
    this.featureCollection = { "type": "FeatureCollection", "features": [] };
    this.pointFeature = { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [] } };
  }

  /**
  * arrayToGeoJSON
  * @public
  * @desc method that converts a given array of points into a geoJSON feature collection.
  * @param inputArray Array that is to be converted
  * @returns JSON of a geoJSON feature collection
  */
  arrayToGeoJSON(inputArray) {
    //"Skeleton" of a valid geoJSON Feature collection
    let outJSON = this.featureCollection;

    //turn all the points in the array into proper features and append
    for (const element of inputArray) {
      let newFeature = this.pointFeature;
      newFeature.geometry.coordinates = element;
      outJSON.features.push(JSON.parse(JSON.stringify(newFeature)));
    }

    return outJSON;
  }

  /**
  * isValidGeoJSONPoint
  * @public
  * @desc method that validates the input GeoJSON so it'S only a point
  * @param geoJSON the input JSON that is to be validated
  * @returns boolean true if okay, false if not
  */
  isValidGeoJSONPoint(geoJSON) {
    if (geoJSON.features.length == 1 &&
      geoJSON.features[0].geometry.type.toUpperCase() == "POINT"
    ) {
      return true;
    } else {
      return false;
    }
  }

}

//##############################################################################
//## OBJECTS
//##############################################################################
const geoJSON = new GeoJSON();
const busAPI = new BusAPI();










var map = L.map('map').setView([51.95309971434405, 7.613353729248046], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  /*
  * 
  * @desc Shows us our position on the map
  */
  function myPosition(position){
    let myPositionMap = document.getElementById("mapButton")

    myPositionMap.addEventListener("click", () => {
      var lat01 = position.coords.latitude
      var lng01 = position.coords.longitude
      console.log(position.coords.latitude)
      //var circle = L.circle([lat, lng]).addTo(map);
      var circle = L.circle([lat01, lng01], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 5
    }).addTo(map)
      circle.bindPopup("Position: " + lat01 + " " + lng01).openPopup()
      map.setView([lat01, lng01], 13)


    })
  }


var drawnItems = new L.FeatureGroup()
var drawControl = new L.Control.Draw({
  draw: {
    polygon: false,
    marker: false,
    circle: false,
    polyline: false,
    circlemarker: false
  },
  edit: {
    featureGroup: drawnItems
  }
})

// adding drawControl
map.addLayer(drawnItems)
map.addControl(drawControl)


map.on(L.Draw.Event.CREATED, (e) => {
    var type = e.layerType,
      layer = e.layer;
    rectangle = layer.toGeoJSON().geometry.coordinates;
    drawnItems.addLayer(layer)

    map.addLayer(layer);
 
 
 
 let drawnPolygonBusStops = sortByDistance(point, busStops)
/*
* @desc creates a popup with all info about the stop
*/
 for(let i in drawnPolygonBusStops){
   var poly = turf.polygon(rectangle)
   var pt = turf.point(drawnPolygonBusStops[i].coordinates)
   //turf.booleanPointInPolygon(pt, poly)
  if(turf.booleanPointInPolygon(pt, poly) == true){
   let marker = new L.marker([drawnPolygonBusStops[i].coordinates[1], drawnPolygonBusStops[i].coordinates[0]]).addTo(map)
   marker.bindPopup("Bus stop name: " + drawnPolygonBusStops[i].name + "<br> Distance to used Point: " + drawnPolygonBusStops[i].distance +
        "m <br> Direction: " + drawnPolygonBusStops[i].richtung + "<br>Coordinates of bus stop: " + drawnPolygonBusStops[i].coordinates) //customOptionsBusStops)
      }


   
 }
});





  

  