

//************************************ Merge power outage model output with tract ID *****************************

// Retrived data from csv file content
var url = "http://chapmanrebecca.com/AppliedClimate/HPOM/sample.csv";
var request = new XMLHttpRequest();  //This is deprecated. We need to change this
request.open("GET", url, false);   
request.send(null);  

var csvData = new Array();
var jsonObject = request.responseText.split(/\r?\n|\r/);
for (var i = 0; i < jsonObject.length; i++) {
  csvData.push(jsonObject[i].split(','));
};

// Read tract ID
function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
};

var HOPM = JSON.parse(Get('http://chapmanrebecca.com/AppliedClimate/HPOM/ctract.geojson'));	

for (var i = 0; i < HOPM.features.length; i++) {
    HOPM.features[i].properties.power = 0;
    HOPM.features[i].properties.people = 0;	
};

// Merge
for (var j = 0; j < HOPM.features.length; j++) {
    var flag = 0;
	for (var i = 1; i < jsonObject.length; i++) {
		result= csvData[i];
        if (result[0]===HOPM.features[j].properties.GEOID10) {
        HOPM.features[j].properties.power = (result[16]*100).toFixed(0);	
		HOPM.features[j].properties.people = (result[16]*result[1]).toFixed(0);
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


//*******************************************Map HOPM output ***************************************************************
	
// Set variable for map and initialize
	var mymap =  L.map('mapid', {
    center: [28.8, -97.2],
    zoom: 7.5,
});

	
	function style(feature) {
    return {
        fillColor: getColor(feature.properties.power),
        weight: 1,
        opacity:1,
        color: getColor(feature.properties.power),
        //dashArray: '3',
        fillOpacity: 0.5
    };
};

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


// Add interactions
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    
	info.update(layer.feature.properties);
	
};

function resetHighlight(e) {
    geojson.setStyle(style);
	info.update();
};

function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
};

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
};
	
L.geoJson(HOPM, {style: style}).addTo(mymap);
geojson = L.geoJson(HOPM, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);
	
// add info control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>HPOM Output</h4>' +  (props ?
        '<b>Tract: ' + props.GEOID10 + '</b><br /> Population Affected: '+ props.people+ '</b><br /> Percentage: '+ props.power + ' %'
        : 'Hover over a census tract');
};

info.addTo(mymap);	
	
//********************************************* Add hurricane map layers **********************************************************
var myStyle1 = {
"color": "#007bff",
"weight": 1.2,
"opacity": 0.65
};
var myStyle2 = {
"color": "#0000ff",
"weight": 2.5,
};

function myStyle3(feature) {
    return {
        fillColor: getsurgeColor(feature.properties.SURGE10),
        weight: 0,
        color: getsurgeColor(feature.properties.SURGE10),
        fillOpacity: 0.8
    };
};

function getsurgeColor(d) {
    return d > 6  ?  '#000080' :
           d > 5  ?  '#0000cc' :
           d > 4  ?  '#1a1aff' :
           d > 3  ?  '#4d4dff' :
           d > 2  ?  '#8080ff' :
           d > 1  ?  '#b3b3ff' :
                     '#e6e6ff';
};	

function myStyle4(feature) {
    return {
        fillColor: getwindColor(feature.properties.PERCENTAGE),
        weight: 1,
        color: getwindColor(feature.properties.PERCENTAGE),
        fillOpacity: 0.5
    };
};
function getwindColor(d) {
	    return d ==">90%"     ?  '#212121' :
	       d =="80-90%"   ?  '#4a235a' :
	       d =="70-80%"   ?  '#5b2c6f' :
	       d =="60-70%"   ?  '#6c3483' :
	       d =="50-60%"   ?  '#7d3c98' :
           d =="40-50%"   ?  '#8e44ad' :
           d =="30-40%"   ?  '#a569bd' :
           d =="20-30%"   ?  '#bb8fce' :
           d =="10-20%"   ?  '#d2b4de' :
           d =="5-10%"    ?  '#e8daef' :
           d =="<5%"      ?  '#f4ecf7':
		   '#e6e6ff';

};	









var track_forecast = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[5,6,16,17,27,28,38,39,49,50]});
var watch_warning  = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[7,18,29,40,51]});
var Psurge = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[14,25,36,46,58]});
var Pwind34 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[59]});
	
function getLayer(value){   
    track_forecast.remove();
	watch_warning.remove();
	Psurge.remove();
	document.getElementById("myCheck1").checked = false;
	document.getElementById("myCheck2").checked = false;
	document.getElementById("myCheck3").checked = false;
	document.getElementById("myCheck4").checked = false;
if(value=="sample"){
	// sample hurricane layers: 2017 Harvey #15
	track_forecast = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_5day_015.zip',{style: myStyle1});
	watch_warning  = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017-015_ww_wwlin.zip',{style: myStyle2});
	Psurge = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_esurge10_2017082400.zip',{style: myStyle3});
	Pwind34 = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/2017082400_wsp_120hr5km34.zip',{style: myStyle4});
	}else{
    // Using external REST services
    track_forecast = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[5,6,16,17,27,28,38,39,49,50]});
	watch_warning  = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[7,18,29,40,51]});
	Psurge = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[14,25,36,46,58]});
	};	
	
};	

//************************************************Backup data layers*****************************************************************************
    
  //var watch_warn_adv = L.esri.dynamicMapLayer({
  //url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer', layers:[0,1]});
 
 //Potential Storm Surge Flooding Map
  //var storm_surge = L.esri.dynamicMapLayer({
  //url:'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_inundation/MapServer'});
 
 //Watches, Warnings, and Track/Intensity Forecasts
  var best_track_fcst = L.esri.dynamicMapLayer({
    url:'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer'});
  //https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/SPC_wx_outlks/MapServer
  // var hist_hurr_county = 
//https://coast.noaa.gov/arcgis/rest/services/Hurricanes/CountyStrikes/MapServer
// this is tiled
//CountyStrikes layer color coded to represent the amount of hurricane strikes as compared with population

  //var mapLayers = {
  //  track_forecast, surge, NHC_Atl_trop_cyclones, watch_warn_adv
  //}; #RC - want to build list of layers to use in map layer listing to reduce # of functions used

//***************************************************Add base map layers*****************************************************************************************

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
  // need to include info button that links to metadata https://nowcoast.noaa.gov/metadata/radar_meteo_imagery_nexrad_time.xml
  //https://idpgis.ncep.noaa.gov/arcgis/rest/services/NOS_ESI/ESI_TexasUpperCoast_Maps/ImageServer

// Initialize map with the topo basemap
	topo.addTo(mymap);

// Create layer controls to change basemaps
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


//*********************************************************** Legend *********************************************************
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
	

//********************************** Function used to add and remove layers via a checkbox ***********************************	
function addLayerToMap(element, layer) {
    if (element.checked){
        layer.addTo(mymap);
    } else {
        layer.remove();
    }
};

//*************************************************** Download files *********************************************************
function downloadObjectAsCsv(exportObj, exportName){
    var dataUrl = "http://chapmanrebecca.com/AppliedClimate/HPOM/sample.csv";
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataUrl);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

function downloadObjectAsJson(exportObj, exportName){
    var jsonData = new Blob([JSON.stringify(exportObj)], { type: 'application/json' }); 
    var dataUrl = URL.createObjectURL(jsonData);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataUrl);
    downloadAnchorNode.setAttribute("download", exportName + ".geojson");
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }  
  
var flag1 = 0;
var flag2 = 0;

function FunctionEF1() {
	var checkBox = document.getElementById("EF1");
    if (checkBox.checked == true){
        flag1 = 1;
    } else {
        flag1 = 0;
    }    
};

function FunctionEF2() {
	var checkBox = document.getElementById("EF2");
    if (checkBox.checked == true){
        flag2 = 1;
    } else {
        flag2 = 0;
    }    
};

function download() {
	if (flag1 ===1){
	downloadObjectAsCsv(csvData, "HOPM");	
	};
	if (flag2 ===1){
	downloadObjectAsJson(HOPM, "HOPM_merged");	
	};
};	
//*************************************************** print snapshot ***************************************
L.easyPrint({
	filename:"HOPMmap",	
	position: 'topleft',
	sizeModes: ['A4Portrait', 'A4Landscape'],
	exportOnly: true
}).addTo(mymap);

//*************************************************** add search function *********************************

function search(){
	var x = document.getElementById("ID").value;
	for (var j = 0; j < HOPM.features.length; j++) {
      if (x===HOPM.features[j].properties.GEOID10) {
        var percentage = HOPM.features[j].properties.power;	
        var population = HOPM.features[j].properties.people;	
		flag =1;
        };		
    };
	
	if(flag ===0){
	alert('No Tract Found');}else
	{
    alert('TractID: '+ x+ '\n' + 'Population affected: ' + population +'\n'+'Percentage: '+ percentage +'%');
	};
};	
//***************************************************add popup************************************************

function popup(id) {
    var popup = document.getElementById(id);
    popup.classList.toggle("show");
}