

// Tectonic Plate data from: World tectonic plates and boundaries (Hugo Ahlenius)
// Dataset Site: https://github.com/fraxen/tectonicplates/tree/master/GeoJSON
// Main file needed: tp_boundaries_url
const tp_boundaries_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
const tp_orogens_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_orogens.json";
const tp_plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
const tp_steps_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json";

// Earthquake event data from: United States Geological Survey (USGS)
// API Site: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const usgs_eq_1h_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"; // ~6 records
const usgs_eq_1d_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"; // ~274 records
const usgs_eq_7d_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"; // ~2300 records
const usgs_eq_30d_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";  // ~9300 records


function createMap(eqEventMarkers) {
  // This function accepts a Leaflet Layer Group containing
  // markers for earthquake events and associated pop-ups, etc.

  // Create the tile layer that will be the background of our map
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create the tile layer that will be the background of our map
  var streetsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // Create the tile layer that will be the background of our map
  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Create the tile layer that will be the background of our map
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create an overlay layer of the tectonic plate boundaries
  d3.json(tp_boundaries_url).then(tp => {

    // Use Leaflet to add the GeoJSON data to the map
    var plateMap = L.geoJSON(tp, {
      style: {
        color: 'blue',
        weight: 2,
        dashArray: "10 5"
      },

      onEachFeature: function (feature, layer) {
        layer.bindPopup("This is a tectonic plate boundary line.");
      }

    });


    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightMap,
      "Streets Map": streetsMap,
      "Outdoors Maps": outdoorsMap,
      "Satellite Map": satelliteMap
    };

    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "Earthquake Events": eqEventMarkers,
      "Tectonic Plate Boundaries": plateMap
    };

    // Create the map object with options
    var eq_map = L.map("eq_map_id", {
      center: [44.672501, -103.855103],
      zoom: 3,
      layers: [lightMap, eqEventMarkers, plateMap]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(eq_map);

  });

}

function createMarkers(eqData) {
  // This function obtains uses earthquake event GeoJSON data
  // to create markers for each event.  createMap is then called to display
  // the map and markers.

  // Get the earthquake events meta data
  eqTitle = eqData.metadata.title;
  eqEventCount = eqData.metadata.count;
  eqTimeStamp = eqData.metadata.generated;

  // Get earthquake events
  var eqEventData = eqData.features;
  // console.log(eqEventData);

  // Initialize an array to hold earthquake event markers
  var eqMarkers = [];

  // Loop through the earthquake event array
  eqEventData.forEach(eq => {

    // For each station, create a marker and bind a popup with the earthquake event name
    latlong = [eq.geometry.coordinates[1], eq.geometry.coordinates[0]];
    popupText = "<h6>" + eq.properties.title + "</h6><hr><p>Time: " + eq.properties.time + "</p>"
    markerStyle = {
      color: 'darkred',
      fillColor: 'red',
      fillOpacity: 0.5,
      radius: 100000
    };

    // Now, create the marker - a circle in this case
    var eqMarker = L.circle(latlong, markerStyle).bindPopup(popupText);

    // Add the marker to the eqMarkers array
    eqMarkers.push(eqMarker);

  });

  // console.log(eqMarkers);

  // Create a layer group made from the earthquake event markers array
  // Then pass it into the createMap function
  createMap(L.layerGroup(eqMarkers));
}

// Perform an API call to the Citi Bike API to get the earthquake information,
// then call createMarkers() when the data is available
d3.json(usgs_eq_1h_url)
  .then(createMarkers);


