require([
        "esri/map",
        "esri/InfoTemplate",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
        "esri/dijit/Popup",
        "dojo/_base/array",
        "esri/Color",
        "dojo/dom-construct",
        "dojo/domReady!"
      ], function (
        Map, InfoTemplate, ArcGISDynamicMapServiceLayer, SimpleFillSymbol,
        SimpleLineSymbol, IdentifyTask, IdentifyParameters, Popup,
        arrayUtils, Color, domConstruct
       ) {
		   /*
		var popup = new Popup({
          fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
        }, domConstruct.create("div"));

        map = new Map("map", {
          basemap: "satellite",
          center: [-93.275, 42.573],
          zoom: 12,
          infoWindow: popup
        }); */

        map.on("click", doIdentify);
		var idLayer="https://programs.iowadnr.gov/geospatial/rest/services/OneStop/IaFmFacilities/MapServer";
		map.addLayer(new ArcGISDynamicMapServiceLayer(idLayer, { 
				//"visible": false,
				"opacity": 0.9 }));
				
		function doIdentify(evt) {
		 wellInfo = ""; //define outside function on top 
		//let mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
		//infoContent += "X,Y: " + mp.x.toFixed(4) + ", " + mp.y.toFixed(4) + "<br>";


		
		//map.graphics.clear();
		// markerSymbol is used for point and multipoint, see http://raphaeljs.com/icons/#talkq for more examples
		//var markerSymbol = new SimpleMarkerSymbol();
		//markerSymbol.setPath("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z");
		//markerSymbol.setColor(new Color("#00FFFF"));
	
		//map.graphics.add(new Graphic(evt.mapPoint, sms));
		//console.log(evt);
		//burialLayer = "https://programs.iowadnr.gov/geospatial/rest/services/Agriculture/Burial/MapServer";
		
		//let identifyTask = new IdentifyTask(burialLayer);
		let identifyTask = new IdentifyTask(idLayer);
		let identifyParams = new IdentifyParameters();
		identifyParams.tolerance = 3;
		//identifyParams.spatialReference = new esri.SpatialReference({"wkid":26915});
		identifyParams.returnGeometry = true;
		//identifyParams.layerIds = [28]; 
		identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;  //redundancy with the layerIds.
		identifyParams.width = map.width;
		identifyParams.height = map.height
		identifyParams.geometry = evt.mapPoint;

		identifyParams.mapExtent = map.extent;

		//let burialZone ="";
		// let alluvial, publicWaterSupply, insideCities, wetland, conservationEasement, floodArea, floodPlain;
		// let waterProtectionZone, woodyVegetation, NHD,publicLand, PrivateWellPermit;

		var deferred = identifyTask
			.execute(identifyParams)
			.addCallback(function (response) {
				// response is an array of identify result objects
				// Let's return an array of features.
				//console.log(response);
				//dojo._base.array
				//let arrValues = arrayUtils.map(response, function (result) {
			 //require(["dojo/_base/array"], function(arrayUtil) {
				//let arrValues = array.map(response, function (result) {
				let arrValues = arrayUtils.map(response, function (result) {	
					var feature = result.feature;
					var layerName = result.layerName;
					let layerId = result.layerId;
					console.log(result);
					if (layerId === 28) {
						//burialZone = "${feature.attributes['Pixel Value']}";
						//burialZone = "${CATEGORY}";
						//infoContent += "test";
						//<a href='https://www.iowadnr.gov/portals/idnr/uploads/afo/hqwr2.pdf' target = '_blank'
						wellInfo += `WELL ID: ${feature.attributes['WELLID']} <a href='${feature.attributes.HLINK}' target = '_blank'>`;
						// var link = "${feature.attributes.HLINK}"
						//wellInfo += "${feature.attributes['WELLID']}: <a href='"+link+"' target = '_blank'>";
						//infoContent += `<br>`;
					}
				return feature;
				});
				map.infoWindow.setContent(wellInfo);
				map.infoWindow.resize(300, 400);
				map.infoWindow.show(evt.mapPoint, map.getInfoWindowAnchor(evt.screenPoint));
			})
			
			//map.infoWindow.setFeatures([deferred]);
            //map.infoWindow.show(event.mapPoint);
		}
	});