
//************************************ Merge power outage model output with tract ID **********************************************************************************************

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

var HPOM = JSON.parse(Get('http://chapmanrebecca.com/AppliedClimate/HPOM/ctract.geojson'));	

for (var i = 0; i < HPOM.features.length; i++) {
    HPOM.features[i].properties.power = 0;
    HPOM.features[i].properties.people = 0;	
};

// Merge
for (var j = 0; j < HPOM.features.length; j++) {
    var flag = 0;
	for (var i = 1; i < jsonObject.length; i++) {
		result= csvData[i];
        if (result[0]===HPOM.features[j].properties.GEOID10) {
        HPOM.features[j].properties.power = (result[16]*100).toFixed(0);	
		HPOM.features[j].properties.people = (result[16]*result[1]).toFixed(0);
		flag =1;
        }		
    }
	
	if(flag === 0){	
	   delete HPOM.features[j];
	   HPOM.features = HPOM.features.filter(function( element ) {
               return element !== undefined;
       });
	   j--;
    };
};


//***************************************************Map HPOM output **************************************************************************************************************
	
// Set variable for map and initialize
	var mymap =  L.map('mapid', {
    center: [28.3, -97.2],
    zoom: 7.5,
});

function style(feature) {
    return {
        fillColor: getColor(feature.properties.power),
        weight: 1,
        opacity:1,
        color: getColor(feature.properties.power),
        fillOpacity: 0.5
    };
};
function style2(feature) {
    return {
        fillColor: false,
		fillOpacity:0,
        weight: 0.5,
        opacity:1,
        color: 'black'
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


function resetHighlight2(e) {
    geojson2.setStyle(style2);
	info.update();
};

function onEachFeature2(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight2,
        click: zoomToFeature
    });
};
	
LHPOM   = L.geoJson(HPOM, {style: style}).addTo(mymap);
LHPOM2  = L.geoJson(HPOM, {style: style2});

geojson = L.geoJson(HPOM, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);
geojson2 = L.geoJson(HPOM, {
    style: style2,
    onEachFeature: onEachFeature2
});	
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
	
//********************************************* Add hurricane map layers **********************************************************************************************************
var myStyle1 = {
"color": "#0000ff",
"fillColor":"#99ccff",
"weight": 2.5,
"fillOpacity": 0.4
};
var myStyle2 = {
"color": "#00ff00",
"weight": 3,
};

function myStyle3(feature) {
    return {
        fillColor: getsurgeColor(feature.properties.SURGE10),
        weight: 0,
        color: getsurgeColor(feature.properties.SURGE10),
        fillOpacity: 0.86
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
        fillOpacity: 0.86
    };
};
function getwindColor(d) {
	    return d ==">90%" ?  '#270000' :
	       d =="80-90%"   ?  '#6f0000' :
	       d =="70-80%"   ?  '#930000' :
	       d =="60-70%"   ?  '#934a00' :
	       d =="50-60%"   ?  '#939300' :
           d =="40-50%"   ?  '#4a9300' :
           d =="30-40%"   ?  '#009393' :
           d =="20-30%"   ?  '#006edb' :
           d =="10-20%"   ?  '#48a4ff' :
           d =="5-10%"    ?  '#90c8ff' :
           d =="<5%"      ?  '#d8ecff' :
		   '#e6e6ff';

};	


var track_forecast = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[5,6,16,17,27,28,38,39,49,50]},{style: myStyle1});
var watch_warning  = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[7,18,29,40,51]},{style: myStyle2});
var Psurge = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[14,25,36,46,58]},{style: myStyle3});
var Pwind34 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[59]},{style: myStyle4});
var Pwind50 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[60]},{style: myStyle4});
var Pwind64 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[61]},{style: myStyle4});
	
var check_number = 0;	
var wind_number  = 0;
function getLayer(value){   
    check_number = 0;
	wind_number  = 0;
	
    track_forecast.remove();
	watch_warning.remove();
	Psurge.remove();
	Pwind34.remove();
	Pwind50.remove();
	Pwind64.remove();
	
	LHPOM2.remove();
    geojson2.remove();
	legend_surge.remove();
	legend_wind.remove();
    LHPOM.addTo(mymap);
    geojson.addTo(mymap);
	legend.addTo(mymap)
	
	document.getElementById("myCheck1").checked = false;
	document.getElementById("myCheck2").checked = false;
	document.getElementById("myCheck3").checked = false;
	document.getElementById("myCheck4").checked = false;
	document.getElementById("myCheck5").checked = false;
	document.getElementById("myCheck6").checked = false;
if(value=="sample"){
	// sample hurricane layers: 2017 Harvey #15
	track_forecast = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_5day_015.zip',{style: myStyle1});
	watch_warning  = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017-015_ww_wwlin.zip',{style: myStyle2});
	Psurge  = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/al092017_esurge10_2017082400.zip',{style: myStyle3});
	Pwind34 = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/2017082400_wsp_120hr5km34.zip',{style: myStyle4});
	Pwind50 = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/2017082400_wsp_120hr5km50.zip',{style: myStyle4});
	Pwind64 = new L.Shapefile('http://chapmanrebecca.com/AppliedClimate/HPOM/2017082400_wsp_120hr5km64.zip',{style: myStyle4});
	}else{
    // Using external REST services
    track_forecast = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[5,6,16,17,27,28,38,39,49,50]},{style: myStyle1});
	watch_warning  = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[7,18,29,40,51]},{style: myStyle2});
	Psurge = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[14,25,36,46,58]},{style: myStyle3});
	Pwind34 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[59]},{style: myStyle4});
	Pwind50 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[60]},{style: myStyle4});
	Pwind64 = L.esri.dynamicMapLayer({url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/NHC_Atl_trop_cyclones/MapServer/', layers:[61]},{style: myStyle4});
	};	
	
};	


//***************************************************Add base map layers*****************************************************************************************************

// Create basemap layers -- basemaps http://leaflet-extras.github.io/leaflet-providers/preview/ 
var topo = L.esri.basemapLayer("Topographic");
var gray = L.esri.basemapLayer("Gray");
var imagery = L.esri.basemapLayer("ImageryClarity");
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

//******************************************************** Legend ***********************************************************************************************************
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
	
var legend_surge = L.control({position: 'bottomright'});
legend_surge.onAdd = function (map) {
     var div = L.DomUtil.create('div', 'info legend'),
     grades_surge = [0, 1, 2, 3, 4, 5, 6],
     labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades_surge.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getsurgeColor(grades_surge[i] + 0.1) + '"></i> ' +
            grades_surge[i] + (grades_surge[i + 1] ? '&ndash;' + grades_surge[i + 1] +'%'+'<br>' :'%+');
    }
    return div;
};
		
var legend_wind = L.control({position: 'bottomright'});
legend_wind.onAdd = function (map) {
     var div = L.DomUtil.create('div', 'info legend'),
     grades_wind = [0,5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
     grades =["<5%","5-10%","10-20%","20-30%","30-40%","40-50%","50-60%","60-70%","70-80%","80-90%",">90%"]
	 labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades_wind.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getwindColor(grades[i]) + '"></i> ' +
            grades_wind[i] + (grades_wind[i + 1] ? '&ndash;' + grades_wind[i + 1] +'%'+'<br>' :'%+');
    }
    return div;
};
		
//*********************************** Function used to add and remove layers via a checkbox ************************************	

var flagtrack    = 0;
var flagww       = 0;

function addLayerToMap(element, layer) {
	
    if (element.checked){
	    if(layer==track_forecast){
	       flagtrack = 1;
	    };
	    if(layer==watch_warning){
	       flagww    = 1;
	    };
		layer.addTo(mymap);
		
    } else {
		
		if(layer==track_forecast){
	       flagtrack = 0;
	    };
	    if(layer==watch_warning){
	       flagww    = 0;
	    };	
		
		if(check_number==0){
           layer.remove();
		   LHPOM2.remove();
		   geojson2.remove();
		   LHPOM.addTo(mymap);
		   geojson.addTo(mymap);
           if(flagtrack==1){		
		      track_forecast.bringToFront();
		   };
           if(flagww==1){		
              watch_warning.bringToFront();		
           };
		}else{
		   layer.remove();				
		};	
	};
};

function addLayerToMap2(element, layer) {
    if (element.checked){
		check_number ++;
		
		legend.remove();
		if(layer==Psurge){
	        legend_surge.addTo(mymap);
	    }else{
			wind_number ++;
		    legend_wind.addTo(mymap);
		};	

		layer.addTo(mymap);
		
		LHPOM.remove();	
		geojson.remove();
		LHPOM2.remove();
		geojson2.remove();
		LHPOM2.addTo(mymap);
		geojson2.addTo(mymap);	
        
		
    } else {
		check_number --;
		
		if(layer==Psurge){
	        legend_surge.remove();
	    }else{
			wind_number --;
			if(wind_number == 0){
				legend_wind.remove();
			};		    
		};	
		
		if(check_number==0){
           layer.remove();
		   LHPOM2.remove();
		   geojson2.remove();
		   LHPOM.addTo(mymap);
		   geojson.addTo(mymap);
		   legend.addTo(mymap)
		   if(flagtrack==1){		
		      track_forecast.bringToFront();
		   };
           if(flagww==1){		
              watch_warning.bringToFront();		
           };
        }else{
		   layer.remove();				
		};	
    };
};

//****************************************************** Download files ****************************************************************
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
	downloadObjectAsCsv(csvData, "HPOM");	
	};
	if (flag2 ===1){
	downloadObjectAsJson(HPOM, "HPOM_merged");	
	};
};	
//************************************************************** print snapshot **********************************************************
L.easyPrint({
	filename:"HPOMmap",	
	position: 'topleft',
	sizeModes: ['A4Portrait', 'A4Landscape'],
	exportOnly: true
}).addTo(mymap);

//************************************************************* add search function ******************************************************
function search(){
	var x = document.getElementById("ID").value;
	for (var j = 0; j < HPOM.features.length; j++) {
      if (x===HPOM.features[j].properties.GEOID10) {
        var percentage = HPOM.features[j].properties.power;	
        var population = HPOM.features[j].properties.people;
        var Lfeature   = L.geoJson(HPOM.features[j]);		
		flag =1;
        };		
    };
	
	if(flag ===0){
	alert('No Tract Found');}else
	{
	mymap.fitBounds(Lfeature.getBounds());
    alert('TractID: '+ x+ '\n' + 'Population affected: ' + population +'\n'+'Percentage: '+ percentage +'%');
	};
};	
//********************************************************************add popup************************************************************

function popup(id) {
    var popup = document.getElementById(id);
    popup.classList.toggle("show");
};

//************************************************Backup data layers*******************************************************************************************************************************************************
    
  //var watch_warn_adv = L.esri.dynamicMapLayer({
  //url:'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer', layers:[0,1]});
 
 //Potential Storm Surge Flooding Map
  //var storm_surge = L.esri.dynamicMapLayer({
  //url:'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_inundation/MapServer'});
 
 //Watches, Warnings, and Track/Intensity Forecasts
  //var best_track_fcst = L.esri.dynamicMapLayer({
    //url:'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer'});
  //https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/SPC_wx_outlks/MapServer
  // var hist_hurr_county = 
//https://coast.noaa.gov/arcgis/rest/services/Hurricanes/CountyStrikes/MapServer
// this is tiled
//CountyStrikes layer color coded to represent the amount of hurricane strikes as compared with population

  //var mapLayers = {
  //  track_forecast, surge, NHC_Atl_trop_cyclones, watch_warn_adv
  //}; #RC - want to build list of layers to use in map layer listing to reduce # of functions used
  //var blkmarble = L.tileLayer("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/2018-02-28/500m/6/13/36.png")