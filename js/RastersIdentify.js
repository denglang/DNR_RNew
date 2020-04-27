function doIdentify2(evt) {
	console.log("inside doIdentify2");
	require([
			"esri/arcgis/utils",
			"esri/map",
			"esri/dijit/LayerList",
			"esri/dijit/InfoWindow",
			"esri/geometry/webMercatorUtils",
			"dojo/dom",
			"dojo/on",
			"esri/geometry/Circle",
			"esri/dijit/BasemapToggle",
			"esri/layers/GraphicsLayer",
			"esri/graphic",
			"esri/dijit/Scalebar",
			"esri/InfoTemplate",
			"esri/layers/ArcGISDynamicMapServiceLayer",
			"esri/symbols/SimpleFillSymbol",
			"esri/symbols/SimpleLineSymbol",
			"esri/symbols/SimpleMarkerSymbol",
			"esri/tasks/IdentifyTask",
			"esri/tasks/IdentifyParameters",
			"dojo/_base/array"
			], function (
			arcgisUtils, Map, LayerList, InfoWindow, webMercatorUtils, dom, on, Circle, 
			BasemapToggle, GraphicsLayer, Graphic, Scalebar, InfoTemplate, ArcGISDynamicMapServiceLayer, SimpleFillSymbol,
			SimpleLineSymbol, SimpleMarkerSymbol, IdentifyTask, IdentifyParameters,arrayUtils){
	
	
	//////////////////////////////////////////////
				infoContent = "";
				//let mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
				//infoContent += "X,Y: " + mp.x.toFixed(4) + ", " + mp.y.toFixed(4) + "<br>";


				//if (map.getScale() > 50000) {
				//	alert("Please zoom in until you see the current map scale at lower left\nturn blue or the scale bar showing 0.2mi or smaller; then click to see result.");
				//	return;
				//}
				//console.log(evt);
				//map.graphics.clear();
				// markerSymbol is used for point and multipoint, see http://raphaeljs.com/icons/#talkq for more examples
				//var markerSymbol = new SimpleMarkerSymbol();
				//markerSymbol.setPath("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z");
				//markerSymbol.setColor(new Color("#00FFFF"));
			
				//map.graphics.add(new Graphic(evt.mapPoint, sms));

				let burialLayer = "https://programs.iowadnr.gov/geospatial/rest/services/Agriculture/Burial/MapServer";
				map.addLayer(new ArcGISDynamicMapServiceLayer(burialLayer, { "opacity": 1.0 }));
				//let identifyTask = new IdentifyTask(burialLayer);
				let identifyTask = new IdentifyTask(burialLayer);
				let identifyParams = new IdentifyParameters();
				identifyParams.tolerance = 5;
				identifyParams.returnGeometry = false;
				//identifyParams.layerIds = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,26,27]; //flowaccsqmi(layer 6 is taken off,  just use layer 10-DA polygon)
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
						console.log(response);
						let arrValues = arrayUtils.map(response, function (result) {
							var feature = result.feature;
							var layerName = result.layerName;
							let layerId = result.layerId;

							//feature.attributes.layerName = layerName;
							//console.log(result.layerId);
							if (layerId === 2) {
								burialZone = "${feature.attributes['Pixel Value']}";
								//burialZone = "${CATEGORY}";
								infoContent += `Burial Zone: ${feature.attributes['CATEGORY']}</br>`;
								//console.log(burialZone);
								// feature.setInfoTemplate(alluvialTemplate);
							}
							else if (layerId === 3) {
								
								infoContent += `Alluvial: ${feature.attributes['DESCR_']} <br>`;
							} 
							else if (layerId === 4) {

								infoContent += `Public Water Supply - Non-Municipal: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 5) {
								
								infoContent += `Inside Cities: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 6) {
								
								infoContent += `Surface Water Set-back - Wetland: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 27) {
								infoContent += `Surface Water Set-back - Streams: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 7) {
								
								infoContent += `Conservation Easements:${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 8) {
								
								infoContent += `SinkHoles:${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 9) {
								
								infoContent += `Steep Slopes:${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 10) {
								
								infoContent += `Floodplain Area:${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 11) {
								
								infoContent += `Floodplain:${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 12) {
								
								infoContent += `Source Water Protection Zones: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 13) {
								
								infoContent += `Woody Vegetation: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 14) {
								
								infoContent += `Public Water Supplies - Municipal: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 15) {
								
								infoContent += `NHD: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							
							} else if (layerId === 16) {
								
								infoContent += `Steep Slopes: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							} else if (layerId === 17) {
								
								infoContent += `Private Permitted Wells: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 18) {

								infoContent += `Excessively Drained: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 19) {

								infoContent += `Flood Frequency: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 20) {

								infoContent += `Moderate Slopes: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 21) {

								infoContent += `Ponded Soils: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 22) {

								infoContent += `Depth to Seasonal High Water Table (SHWT): ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 23) {

								infoContent += `Landscape Position: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 24) {

								infoContent += `Landscape Position - Upland Drainages: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							else if (layerId === 25) {
								infoContent += `Shallow Depth to Bedrock: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}

							else if (layerId === 26) {
								infoContent += `Ag Drainage Wells: ${feature.attributes['Pixel Value'] == 1 ? 'Yes' : 'No'}<br>`;
							}
							return feature;

						});
						console.log(infoContent);
						/*
						infoContent += "<a href='https://www.iowadnr.gov/Environment/LandStewardship/AnimalFeedingOperations/Mapping/ProperAFOSiting.aspx' target = '_blank'>Proper AFO Siting</a><br />";
						infoContent += "<a href='https://www.iowadnr.gov/portals/idnr/uploads/afo/hqwr2.pdf' target = '_blank'>High Quality Waters information</a><br />";
						infoContent += "<a href='https://www.iowadnr.gov/Portals/idnr/uploads/afo/files/Alluvial-Karst%20determinations-Final1-24-12%20w%20links.pdf' target = '_blank'>Alluvial and Karst Determinations</a><br /><br />"; 
						*/
						document.getElementById("p0").innerHTML += infoContent;
						//map.infoWindow.setContent(infoContent);
						//map.infoWindow.resize(400, 620);
						//map.infoWindow.show(evt.mapPoint, map.getInfoWindowAnchor(evt.screenPoint));
						
					});
					//return infoContent; 
			})
	}