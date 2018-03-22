

//*************************************merge power outage model output with tract ID *****************************

// Retrived data from csv file content
var url = "http://chapmanrebecca.com/AppliedClimate/HPOM/sample.csv";
var request = new XMLHttpRequest();  //This is deprecated. We need to change this
request.open("GET", url, false);   
request.send(null);  

var csvData = new Array();
var jsonObject = request.responseText.split(/\r?\n|\r/);
for (var i = 0; i < jsonObject.length; i++) {
  csvData.push(jsonObject[i].split(','));
}

// Read tract ID
function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}
var HOPM = JSON.parse(Get('http://chapmanrebecca.com/AppliedClimate/HPOM/ctract.geojson'));	
for (var i = 0; i < HOPM.features.length; i++) {
    HOPM.features[i].properties.power = 0;	   
}

// Merge
for (var j = 0; j < HOPM.features.length; j++) {
    var flag = 0;
	for (var i = 1; i < jsonObject.length; i++) {
		result= csvData[i];
        if (result[0]===HOPM.features[j].properties.GEOID10) {
        HOPM.features[j].properties.power = result[16]*100;	
		flag =1;
        }		
    }
	
	if(flag === 0){	
	   delete HOPM.features[j];
	   HOPM.features = HOPM.features.filter(function( element ) {
               return element !== undefined;
       });
	   j--;
    };
};
//**************************************************************************************************************** 
	function style(feature) {
    return {
        fillColor: getColor(feature.properties.power),
        weight: 1,
        opacity:1,
        color: getColor(feature.properties.power),
        //dashArray: '3',
        fillOpacity: 0.7
    };
};
	var ctract = new L.GeoJSON(HOPM, {style: style})
	// Change color
	function getColor(d) {
    return d > 60 ? '#800026' :
           d > 50  ? '#BD0026' :
           d > 40  ? '#E31A1C' :
           d > 30  ? '#FC4E2A' :
           d > 20  ? '#FD8D3C' :
           d > 10   ? '#FEB24C' :
                     '#FFEDA0';
};	


var myStyle = {
"color": "#007bff",
"weight": 1.2,
"opacity": 0.65
};

// Create hurricane layers
	var track_forecast = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_5day_015.zip',{style: myStyle});
	var surge = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_esurge10_2017082400.zip',{style:style});
// Using external REST services
  var NHC_Atl_trop_cyclones =  L.esri.featureLayer({
    url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/'});
  var watch_warn_adv = L.esri.dynamicMapLayer({
    url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer', layers:[0,1]});
  //
  //https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/SPC_wx_outlks/MapServer
  //var mapLayers = {
  //  track_forecast, surge, NHC_Atl_trop_cyclones, watch_warn_adv
  //}; #RC - want to build list of layers to use in map layer listing to reduce # of functions used


// Create basemap layers -- basemaps http://leaflet-extras.github.io/leaflet-providers/preview/ 
  var topo = L.esri.basemapLayer("Topographic");
  var gray = L.esri.basemapLayer("Gray");
  var imagery = L.esri.basemapLayer("ImageryClarity");
  //var blkmarble = L.tileLayer("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/2018-02-28/500m/6/13/36.png")
  var blkmarble = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_Black_Marble/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
  bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
  minZoom: 1,
  maxZoom: 8,
  format: 'png',
  time: '',
  tilematrixset: 'GoogleMapsCompatible_Level'
});
  var radar = L.esri.dynamicMapLayer({url:'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/', layers:[3]});
  //https://idpgis.ncep.noaa.gov/arcgis/rest/services/NOS_ESI/ESI_TexasUpperCoast_Maps/ImageServer


// Set variable for map and initialize
	var mymap =  L.map('mapid', {
    center: [28.8, -97.2],
    zoom: 7.5,
});

// Add layers to map
    ctract.addTo(mymap);
	topo.addTo(mymap);
// Create layer control
	var baseMaps ={
	"Topographic":topo, 
    "Black Marble":blkmarble,
    "Imagery":imagery,
    "Light Gray":gray
};	
  var overlayMaps = {
    "Radar":radar
};
    L.control.layers(baseMaps, overlayMaps).addTo(mymap);
// 
	var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 30, 40, 50, 60],
        labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] +'%'+'<br>' :'%+');
    }
    return div;
};
	legend.addTo(mymap);
	

	
//********************************************add layer control***************************************************	
function myFunction1() {
    var checkBox = document.getElementById("myCheck1");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        track_forecast.addTo(mymap);
    } else {
        track_forecast.remove();
    }
};	

function myFunction2() {
    var checkBox = document.getElementById("myCheck2");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        surge.addTo(mymap);
    } else {
        surge.remove();
    }
};			

function myFunction3() {
    var checkBox = document.getElementById("myCheck3");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        NHC_Atl_trop_cyclones.addTo(mymap);
    } else {
        NHC_Atl_trop_cyclones.remove();
    }
};

function myFunction4() {
    var checkBox = document.getElementById("myCheck4");
    var text = document.getElementById("text");
    if (checkBox.checked == true){
        watch_warn.addTo(mymap);
    } else {
        watch_warn.remove();
    }
};    

