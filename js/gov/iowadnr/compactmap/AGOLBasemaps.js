function createWebMercatorGallery() {
	basemaps = [];
	basemapWorldImageryLabels = new esri.dijit.Basemap({
        layers : [new esri.dijit.BasemapLayer({
            url : "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer"
            ,isReference: true
        }),
		new esri.dijit.BasemapLayer({
            url : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
			
        })],
        id : "bmWorldImageryLabelled",
        title : "Imagery with Labels"
    });
    basemaps.push(basemapWorldImageryLabels );
	
	basemapImageryOnly = new esri.dijit.Basemap({
        layers : [
		new esri.dijit.BasemapLayer({
            url : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
			
        })],
        id : "ImageryOnly",
        title : "Imagery Only"
    });
    basemaps.push(basemapImageryOnly );
	
	
	
	plss = new esri.dijit.Basemap({
		layers : [ new esri.dijit.BasemapLayer({
			 url: 'https://gis.iowadot.gov/public/rest/services/Basemap/Basemap_LabelsOnly/MapServer'
		   }),
		  new esri.dijit.BasemapLayer({		
			 url: "https://athene.gis.iastate.edu/arcgis/rest/services/ortho/naip_2017_nc/ImageServer"
			 ,opacity: 0.9
		  }),
		  new esri.dijit.BasemapLayer({
			url : "https://programs.iowadnr.gov/geospatial/rest/services/tools/plssLocator/MapServer"
			,isReference: true
		  }),
		  new esri.dijit.BasemapLayer({
            url : "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer"
           })
		  ],
        id : "plssMap",
        title : "Imagery(NAIP) with PLSS"
	});
	basemaps.push(plss);

	/*
    basemapRoads = new esri.dijit.Basemap({
        layers : [new esri.dijit.BasemapLayer({
            url : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
        })],
        id : "bmRoads",
        title : "Roads and Streets"
    });
    basemaps.push(basemapRoads); 
	
    basemapGray = new esri.dijit.Basemap({
        layers : [new esri.dijit.BasemapLayer({
            url : "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer"
            ,isReference: true
        }), new esri.dijit.BasemapLayer({
            url : "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
        })],
        id : "bmGray",
        title : "Gray Canvas"   
    });
    basemaps.push(basemapGray);   */
	
    basemapTopographic = new esri.dijit.Basemap({
        layers : [new esri.dijit.BasemapLayer({
            url : "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
        })],
        id : "bmTopo",
        title : "Map (Topography)"
    });
    basemaps.push(basemapTopographic);
	
	
    basemapOSM = new esri.dijit.Basemap({
        layers : [new esri.dijit.BasemapLayer({
            type : "OpenStreetMap"
        })],
        id : "bmOSM",
        title : "OpenStreetMap"
    });
    basemaps.push(basemapOSM);  
	
	ImageRelief = new esri.dijit.Basemap({
		
       layers : [ /*new esri.dijit.BasemapLayer({
            url : "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer"
            ,isReference: true
			 ,opacity: 0.5
         }), */

		  new esri.dijit.BasemapLayer({
            url : "https://programs.iowadnr.gov/geospatial/rest/services/Elevation/Shaded_Relief/MapServer"
            //,opacity: 0.9
         })
        ],
        title : "LiDAR Relief",
        id : "bmRelief"
    });
    basemaps.push(ImageRelief);
	
    basemapRelief = new esri.dijit.Basemap({
       layers : [new esri.dijit.BasemapLayer({
            url : "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer"
            ,isReference: true
         }),
         
		 new esri.dijit.BasemapLayer({		
			 url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
			 ,opacity: 0.7
		  })
		  , new esri.dijit.BasemapLayer({
            url : "https://programs.iowadnr.gov/geospatial/rest/services/Elevation/Shaded_Relief/MapServer"
            ,opacity: 0.9
         })
        ],
       
        title : "Imagery with LiDAR Relief",
        id : "ImageRelief"
    });
    basemaps.push(basemapRelief);
    
    
    basemap_menu = new dijit.Menu({
        id: 'basemapGalleryMenu'
    });


	basemap_gallery = new esri.dijit.BasemapGallery({
		showArcGISBasemaps : false,
		map : map,
		basemaps : basemaps,
		id: "BaseMapGallery"
	}, "basemapGallery");
    
	dojo.connect(basemap_gallery, "onError", function(msg) {
		console.log(msg);
	});
	
	
	dojo.forEach(basemap_gallery.basemaps, function(basemap) {
		dijit.byId("basemapGalleryMenu").addChild(new dijit.MenuItem({
			label : basemap.title,
			baseClass : "basemapMenuItem",
			onClick : dojo.hitch(this, function() {
				this.basemap_gallery.select(basemap.id);
			})
		}));
	});
	button = new dijit.form.DropDownButton({
		label : "Basemaps",
		id : "layerBtn",
		iconClass : "dnrBasemapIcon",
		baseClass : "dnrToolButton",
		title : "Basemaps",
		dropDown : basemap_menu
	});
	dojo.byId('header-toolbar').appendChild(button.domNode);	
return basemap_gallery;
}