/****************************************************

Homework Assignment:
17-Visualizing Data with Leaflet - Project Earthquake

@Author Jeffery Brown (daddyjab)
@Date 4/6/19
@File eq_visualize.js

 ****************************************************/

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
// CHANGE: Not needed - too close to streetsMap
// var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.outdoors",
//     accessToken: API_KEY
// });

// Create the tile layer that will be the background of our map
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

function sizeMarker(a_mag) {
    // Ensure the magnitude factor is >= 1
    // so that at least a minimal marker size is returned
    mag = a_mag > 0 ? a_mag : 1;
    return mag * 5.0;
}

function colorMarker(a_mag) {
    if (a_mag >= 6.0) {
        colorString = "darkred";
    } else if (a_mag >= 5.0) {
        colorString = "red";
    } else if (a_mag >= 4.0) {
        colorString = "darkgoldenrod";
    } else if (a_mag >= 3.0) {
        colorString = "yellow";
    } else if (a_mag >= 2.0) {
        colorString = "yellowgreen";
    } else if (a_mag >= 1.0) {
        colorString = "green";
    } else {
        colorString = "lightgreen";
    }

    // Return a string representing the marker color
    return colorString;
}

var slideControl = null;

var plateMap = null;

// Use Leaflet to add the GeoJSON data to the map
d3.json(usgs_eq_7d_url).then(eqDataItems => {

    // This will be run when L.geoJSON creates the point layer from the GeoJSON data.
    function createCircleMarker(feature, latlng) {
        // Change the values of these options to change the symbol's appearance
        var options = {
            radius: sizeMarker(feature.properties.mag),
            fillColor: colorMarker(feature.properties.mag),
            fillOpacity: 0.5,
            color: "black",
            opacity: 0.8,
            weight: 1
        }
        return L.circleMarker(latlng, options);
    }

    var eqMarkerLayer = L.geoJSON(eqDataItems, {

        pointToLayer: createCircleMarker, // Call the function createCircleMarker to create the symbol for this layer

        onEachFeature: function (feature, layer) {
            // Get key information
            eqLatitude = feature.geometry.coordinates[1];
            eqLongitude = feature.geometry.coordinates[0];
            eqDepth = feature.geometry.coordinates[2];
            eqMag = feature.properties.mag;
            // eqMagType = feature.properties.magType;
            eqPlace = feature.properties.place;

            // Format the time and split it out to fit better in the popup
            eqTime = (new Date(parseInt(feature.properties.time))).toString();
            eqTimeZone = eqTime.substr(24);
            eqTime = eqTime.substr(0,24);

            // See if a tsunami occurred
            eqTsunami = feature.properties.tsunami;

            // Create Popup Text
            eqPopupText = `<h4>*** Magnitude ${eqMag} Earthquake ***<br>${eqPlace}</h4><hr>`
            eqPopupText += `<p>${eqTime}<br>${eqTimeZone}</p>`
            eqPopupText += `<p>Latitude/Longitude: [ ${eqLatitude}, ${eqLongitude} ]<br>Depth: ${eqDepth}</p>`
            if (eqTsunami > 0) {
                eqPopupText += `<p>[Possible Tsunami detected]</p>`
            }

            layer.bindPopup(eqPopupText);
        }
    });

    // Configure a slider control
    sliderControl = L.control.sliderControl({
        position: "topleft",
        layer: eqMarkerLayer,
        timeAttribute: 'time',      // 'time' in ms gets parsed to: "Fri Apr 05 2019 14:47:12 GMT-0500 (Central Daylight Time)"
        isEpoch: true,              // 'time' field is in ms since epoch
        startTimeIdx: 0,            // After parsing, time starts at 0 in the timestring
        timeStrLength: 24,          // Limit the time string to: "Fri Apr 05 2019 14:47:12 GMT-0500" => 33
        range: true,
        alwaysShowDate: true,
        follow: 5
    });

    // Create an overlay layer of the tectonic plate boundaries
    d3.json(tp_boundaries_url).then(tp => {

        // Use Leaflet to add the GeoJSON data to the map
        plateMap = L.geoJSON(tp, {
            style: {
                color: 'blue',
                opacity: 0.5,
                weight: 2,
                dashArray: "10 5"
            },

            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h6>Tectonic plate boundary line</h6>");
            }

        });

        // Create the map object with options
        var eq_map = L.map("eq_map_id", {
            center: [44.672501, -103.855103],
            zoom: 3,
            layers: [streetsMap, eqMarkerLayer, plateMap]
        });

        // Add the slider control to the map
        eq_map.addControl(sliderControl);

        // Start the slider control
        sliderControl.startSlider();

        // Add a legend to the map
        var eqLegend = L.control({position: 'bottomright'});
        
        eqLegend.onAdd = function (map) {
            // Create a div to hold the legend
            var div = L.DomUtil.create('div', 'eq_legend');

            // Define the scales for the legend
            const eqLegendScales = [
                { label: "6.0 or More", color: "darkred"},
                { label: "5.0 to 6.0",  color: "red"},
                { label: "4.0 to 5.0",  color: "darkgoldenrod"},
                { label: "3.0 to 4.0",  color: "yellow"},
                { label: "2.0 to 3.0",  color: "yellowgreen"},
                { label: "1.0 to 2.0",  color: "green"},
                { label: "Less than 1.0", color: "lightgreen"},
            ];

            // Create a table
            var eqLegendTableHTML = "<table><thead><tr><th>Color</th><th>Magnitude</th></tr></thead><tbody>"

            // Loop through and generate legend elements
            for (var i = 0; i < eqLegendScales.length; i++) {
                eqLegendTableHTML += `<tr><td class='eq_legend_color' style=\"background-color:${eqLegendScales[i].color};\"></td>`;
                eqLegendTableHTML += `<td class='eq_legend_label'>${eqLegendScales[i].label}</td></tr>`;
            }
            
            // End the table
            eqLegendTableHTML += "</tbody></table>";

            div.innerHTML = eqLegendTableHTML;

            // console.log(div.innerHTML);
            return div;
        };
        
        eqLegend.addTo(eq_map);


        // Create a baseMaps object to hold the lightmap layer
        var baseMaps = {
            "Streets Map": streetsMap,
            "Light Map": lightMap,
            "Satellite Map": satelliteMap
        };

        // Create an overlayMaps object to hold the bikeStations layer
        var overlayMaps = {
            "Earthquake Events": eqMarkerLayer,
            "Tectonic Plates": plateMap
        };

        // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(eq_map);

    });
});