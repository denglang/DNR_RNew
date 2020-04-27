/**
 * @name Google Maps Layer for ArcGIS Server JavaScript API
 * @author: Nianwei Liu (nianwei at gmail dot com)
 * @fileoverview
 * <p>Use Google Maps in application built on ESRI ArcGIS Server JavaScript API.
 *  </p>
 */
// Change log: 
//2011-12-15: v1.07, update to jsapi2.6, oblique rotation, work with esri BasemapGallery, delayed of loading of API until set as visible
//2011-10-24: v1.05, working with basemapcontrol, styled options
//2011-10-18: v1.04, xd built
//2011-10-17: v1.03, added support for StreetView, Sub layers (Traffic, Point of Interest etc)
//2011-10-05: fixed issues with Chrome, IE7, IE8
//2011-08-11: updated for JSAPI 2.4. changed package.

window.google = window.google || {}; // somehow IE needs this, otherwise complain google.maps namespace;
/*global dojo esri  agsjs */
dojo.provide('dijits.agsjs.layers.GoogleMapsLayer');

dojo.require('esri.dijit.BasemapGallery');

dojo.declare("dijits.agsjs.layers.GoogleMapsLayer", esri.layers.Layer, {
  /**
   * @name GoogleMapsLayerOptions
   * @class This is an object literal that specify the option to construct a {@link GoogleMapsLayer}.
   * @property {String} [id] layerId.
   * @property {Boolean} [visible] default visibility
   * @property {Number} [opacity] opacity (0-1)
   * @property {GoogleMapsAPIOptions} [apiOptions] The options to load Google API. Include property: v, client, sensor, language etc,see {@link GoogleMapsAPIOptions}
   * @property {google.maps.MapOptions} [mapOptions] optional. The options for construct Google Map instance. See <a href=https://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions>MapOptions</a>.
   */
  /**
   * @name GoogleMapsAPIOptions
   * @class This is an object literal that specify the option to load Google Maps API V3. See <a href=https://code.google.com/apis/maps/documentation/javascript/basics.html>Google documentation</a> for more information.
   * @property {Boolean} [sensor] whether GPS device is used. default to false;
   * @property {Number} [v] API version, 3, 3.1 etc. default to 3.
   * @property {String} [client] client ID for Google Maps Premier license.
   * @property {String} [language] language to use for text such as the names for controls, etc, e.g. cn, ja
   * @property {String} [dir] Bi-directional (Bidi) text. rtl or ltr;
   * @property {String} [libraries] Additonal libraries (geometry|places|adsense);
   *
   */
  /** 
   * Create a GoogleMapsLayer using config {@link GoogleMapsLayerOptions}
   * @name GoogleMapsLayer
   * @constructor
   * @class This class allows Google Maps been used in ESRI ArcGIS JavaScript API.
   * @param {GoogleMapsLayerOptions} opts
   */
  constructor: function(opts) {
    opts = opts || {};
    // this tileInfo does not actually do anything. It simply tricks nav control to 
    // show a slider bar if only agsjs are used, which should be a rare case.
    this.tileInfo = new esri.layers.TileInfo({
      rows: 256,
      cols: 256,
      dpi: 96,
      origin: {
        x: -20037508.342787,
        y: 20037508.342787
      },
      spatialReference: {
        wkid: 102100
      },
      lods: [{
        level: 0,
        resolution: 156543.033928,
        scale: 591657527.591555
      }, {
        level: 1,
        resolution: 78271.5169639999,
        scale: 295828763.795777
      }, {
        level: 2,
        resolution: 39135.7584820001,
        scale: 147914381.897889
      }, {
        level: 3,
        resolution: 19567.8792409999,
        scale: 73957190.948944
      }, {
        level: 4,
        resolution: 9783.93962049996,
        scale: 36978595.474472
      }, {
        level: 5,
        resolution: 4891.96981024998,
        scale: 18489297.737236
      }, {
        level: 6,
        resolution: 2445.98490512499,
        scale: 9244648.868618
      }, {
        level: 7,
        resolution: 1222.99245256249,
        scale: 4622324.434309
      }, {
        level: 8,
        resolution: 611.49622628138,
        scale: 2311162.217155
      }, {
        level: 9,
        resolution: 305.748113140558,
        scale: 1155581.108577
      }, {
        level: 10,
        resolution: 152.874056570411,
        scale: 577790.554289
      }, {
        level: 11,
        resolution: 76.4370282850732,
        scale: 288895.277144
      }, {
        level: 12,
        resolution: 38.2185141425366,
        scale: 144447.638572
      }, {
        level: 13,
        resolution: 19.1092570712683,
        scale: 72223.819286
      }, {
        level: 14,
        resolution: 9.55462853563415,
        scale: 36111.909643
      }, {
        level: 15,
        resolution: 4.77731426794937,
        scale: 18055.954822
      }, {
        level: 16,
        resolution: 2.38865713397468,
        scale: 9027.977411
      }, {
        level: 17,
        resolution: 1.19432856685505,
        scale: 4513.988705
      }, {
        level: 18,
        resolution: 0.597164283559817,
        scale: 2256.994353
      }, {
        level: 19,
        resolution: 0.298582141647617,
        scale: 1128.497176
      }, {
        level: 20,
        resolution: 0.149291070823808,
        scale: 564.248588
      }]
    });
    this._overlayLayerNames = [{
      key: "traffic",
      minZoom: 9
    }, {
      key: "bicycling",
      minZoom: 10
    }];
    this._featureTypeNames = [{
      key: "poi",
      name: "point of interest"
    }, {
      key: "road.highway",
      name: "highway"
    }, {
      key: "road.arterial",
      name: "arterial road"
    }, {
      key: "road.local",
      name: "local road"
    }, {
      key: "transit"
    }, {
      key: "administrative"
    }, {
      key: "landscape"
    }, {
      key: "water"
    }];
    
    this.layerInfos = null;
    
    this.fullExtent = new esri.geometry.Extent({
      xmin: -20037508.34,
      ymin: -20037508.34,
      xmax: 20037508.34,
      ymax: 20037508.34,
      spatialReference: {
        wkid: 102100
      }
    });
    this.initialExtent = new esri.geometry.Extent({
      xmin: -20037508.34,
      ymin: -20037508.34,
      xmax: 20037508.34,
      ymax: 20037508.34,
      spatialReference: {
        wkid: 102100
      }
    });
    this.opacity = opts.opacity || 1;
    this._mapOptions = opts.mapOptions || {};
    this._apiOptions = dojo.mixin({
      sensor: false
    }, opts.apiOptions || {});
    
    if (this._mapOptions.streetViewControl == undefined) {
      this._mapOptions.streetViewControl = false;
    }
    // split the map style to vis and others such as hue etc.
    this._visibilityOptions; // the current vis opts;
    this._styleOptions;
    
    this._gmap = null;
    this._glayers = {};
    this.layerInfos = this._createLayerInfos();
    this.loaded = true;// it seems _setMap will only get called if loaded = true, so set it here first.
    this.onLoad(this);
    
  },
  
  /**
   * get the wrapped <code>google.maps.Map</code> for further customization.
   * @function
   * @name GoogleMapsLayer#getGoogleMapInstance
   * @return {google.maps.Map}
   */
  getGoogleMapInstance: function() {
    return this._gmap;
  },
  // override parent class abstract method
  _setMap: function(map, layersDiv, index, a, b, c) {
    //console.log('setmap');
    // This overrides an undocumented private method from ESRI API. 
    // It's possible not to do this, but it requires
    // map instance implicitly set to the layer instance, which is a little bit inconvenient.
    // this is likely called inside esriMap.addLayer()
    this._map = map;
    var style = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '0px',
      height: '0px'
    };
    var placeDiv = dojo.create('div', {}, layersDiv);
    if (this.id) {
      placeDiv.id = this.id;
    }
    dojo.style(placeDiv, style);
    this._placeDiv = placeDiv;
    var div = dojo.create('div', {}, placeDiv);
    dojo.style(div, style);
    dojo.style(div, 'width', (map.width || layersDiv.offsetWidth) + 'px');
    dojo.style(div, 'height', (map.height || layersDiv.offsetHeight) + 'px');
    this._div = div;
    this._layersDiv = layersDiv;
    this._visibilityChangeHandle = dojo.connect(this, 'onVisibilityChange', this, this._visibilityChangeHandler);
    this._opacityChangeHandle = dojo.connect(this, 'onOpacityChange', this, this._onOpacityChangeHandler);
    
    var tdiv = dojo.create('div', {}, map.id);
    tdiv.id = 'gmaps_top_' + div.id;
    dojo.style(tdiv, style);
    this._topDiv = tdiv;
    var cdiv = dojo.create('div', {}, map.id);
    cdiv.id = 'gmaps_controls_' + div.id;
    dojo.style(cdiv, dojo.mixin(style, {
      width: '0px',
      height: '0px',
      top: '5px',
      left: '5px'
    }));
    this._controlDiv = cdiv;
    
    
    this.visible = (this.visible === undefined) ? true : this.visible;
    if (this.visible) {
      this._initGMap();
    }
    return placeDiv;
  },
  _unsetMap: function(map, layersDiv) {
    // see _setMap. Undocumented method, but probably should be public.
    // console.log('unsetmap');
    if (this._streetView) {
      this._streetView.setVisible(false);
    }
    if (google && google.maps && google.maps.event) {
      if (this._gmapTypeChangeHandle) 
        google.maps.event.removeListener(this._gmapTypeChangeHandle);
      if (this._svVisibleHandle) 
        google.maps.event.removeListener(this._svVisibleHandle);
    }
    dojo.disconnect(this._extentChangeHandle);
    dojo.disconnect(this._panHandle);
    dojo.disconnect(this._resizeHandle);
    dojo.disconnect(this._visibilityChangeHandle);
    dojo.disconnect(this._opacityChangeHandle);
    dojo.destroy(this._div);
    dojo.destroy(this._controlDiv);
    this._map = null;
    this._div = null;
    this._controlDiv = null;
    this._gmap = null;
  },
  
  // delayed init and Api loading.
  _initGMap: function() {
    if (window.google && google.maps) {
      var ext = this._map.extent;
      var center = this._mapOptions.center || this._esriPointToLatLng(ext.getCenter());
      var level = this._map.getLevel();//+1;
      var myOptions = dojo.mixin({
        //disableDefaultUI: true,
        center: center,
        zoom: (level > -1) ? level : 1,
        panControl: false,
        mapTypeControl: false,
        zoomControl: false
      }, this._mapOptions);
      
      if (myOptions.mapTypeId) {
        myOptions.mapTypeId = this._getGMapTypeId(myOptions.mapTypeId);
      } else {
        myOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
      }
      if (this._mapOptions.styles) {
        // can be more complicated to split them but use simplified approach here.
        this._visibilityOptions = this._styleOptions = this._mapOptions.styles;
      }
      var gmap = new google.maps.Map(this._div, myOptions);
      if (level < 0) {
        dojo.connect(this._map, 'onLoad', dojo.hitch(this, function() {
          this._setExtent(ext);
        }));
      }
      this._gmap = gmap;
      this._setExtent(ext);
      
      this._extentChangeHandle = dojo.connect(this._map, 'onExtentChange', this, this._extentChangeHandler);
      this._panHandle = dojo.connect(this._map, 'onPan', this, this._panHandler);
      this._resizeHandle = dojo.connect(this._map, 'onResize', this, this._resizeHandler);
      //if (!(this._mapOptions.streetViewControl === false)) {// 45 deg need move up regardless of streetview
      this._mvHandle = dojo.connect(this._map, 'onMouseMove', dojo.hitch(this, this._moveControls));
      //}
      this._gmapTypeChangeHandle = google.maps.event.addListener(this._gmap, 'maptypeid_changed', dojo.hitch(this, this._mapTypeChangeHandler));
      this._gmapTiltChangeHandle = google.maps.event.addListener(this._gmap, 'tilt_changed', dojo.hitch(this, this._mapTiltChangeHandler));
      
    } else if (agsjs.onGMapsApiLoad) {
      // did another instance already started loading agsjs API but not done?
      // this should be very very rare because one instance of this layer would be sufficient with setMapTypeId.
      //dojo.connect(agsjs, 'onGMapsApiLoad', this, this._initGMap);
    } else {
      // this is the first instance that tries to load agsjs API on-demand
      agsjs.onGMapsApiLoad = function() {
        // do nothing, just needed to dispatch event.
      };
      dojo.connect(agsjs, 'onGMapsApiLoad', this, this._initGMap);
      var script = document.createElement('script');
      script.type = 'text/javascript';
      var pro = window.location.protocol;
      if (pro.toLowerCase().indexOf('http') == -1) {
        pro = 'http:';
      }
      var src = pro + '//maps.googleapis.com/maps/api/js?callback=agsjs.onGMapsApiLoad';
      this._apiOptions = dojo.mixin({
        sensor: false
      }, this._apiOptions);
      for (var x in this._apiOptions) {
        if (this._apiOptions.hasOwnProperty(x)) {
          src += '&' + x + '=' + this._apiOptions[x];
        }
      }
      script.src = src;
      if (document.getElementsByTagName('head').length > 0) {
        document.getElementsByTagName('head')[0].appendChild(script);
      } else {
        document.body.appendChild(script);
      }
    }
  },
  /**
   * set map type id. e.g <code>GoogleMapsLayer.MAP_TYPE_ROADMAP</code>
   * @name GoogleMapsLayer#setMapTypeId
   * @function
   * @param {String} mapTypeId one of GoogleMapsLayer.MAP_TYPE_ROADMAP|MAP_TYPE_HYBRID|MAP_TYPE_STELLITE|MAP_TYPE_TERRIAN
   */
  setMapTypeId: function(mapTypeId) {
    if (this._gmap) {
      this._gmap.setMapTypeId(this._getGMapTypeId(mapTypeId));
      this._mapTypeChangeHandler();
    } else {
      this._mapOptions.mapTypeId = mapTypeId;
    }
    return;
  },
  /**
   * set map style for customized base map. The style specs are available at <a href="https://code.google.com/apis/maps/documentation/javascript/styling.html">Google Documentation</a>.
   * This class privide a few pre-defined styles: MAP_STYLE_GRAY|MAP_STYLE_NIGHT.
   * @name GoogleMapsLayer#setMapStyle
   * @function
   * @param {Object[]} styles
   */
  setMapStyles: function(styles) {
    if (this._styleOptions) {
      // if has _styleOptions, set it null means clear it.
      styles = styles || [];
    }
    if (styles) { // avoid styled map if not needed. style map quota lower.
      if (this._gmap) {
        this._styleOptions = styles;
        this._gmap.setOptions({
          styles: styles.concat(this._visibilityOptions || [])
        });
      } else {
        this._mapOptions.styles = styles;
      }
    }
    
    return;
  },
  /**
   * Sets Opacity
   * @name GoogleMapsLayer#setOpacity
   * @function
   * @param {Number} opacity from 0-1
   */
  setOpacity: function(opacity) {
    // dojo core should have something do this
    if (this._div) {
      opacity = Math.min(Math.max(opacity, 0), 1);
      var st = this._div.style;
      if (typeof st.opacity !== 'undefined') {
        st.opacity = opacity;
      } else if (typeof st.filters !== 'undefined') {
        st.filters.alpha.opacity = Math.floor(100 * opacity);
      } else if (typeof st.filter !== 'undefined') {
        st.filter = "alpha(opacity:" + Math.floor(opacity * 100) + ")";
      }
    }
    this.opacity = opacity;
  },
  /**
   * Sets layer visibility.
   * @name GoogleMapsLayer#setVisibleLayers
   * @function
   * @param {Number[]} list of layerids that reference to ids in the <code>layerInfos</code> array.
   */
  setVisibleLayers: function(layerIds) {
    //console.log(layerIds.join(','));
    var i, j, item, layer;
    for (i = 0, j = this._overlayLayerNames.length; i < j; i++) {
      var ov = this._overlayLayerNames[i];
      layer = this._glayers[ov.key];
      if (dojo.indexOf(layerIds, '' + (i)) != -1) {
        // visible
        if (layer == null) {
          switch (ov.key) {
          case 'bicycling':
            layer = new google.maps.BicyclingLayer();
            break;
          case 'traffic':
            layer = new google.maps.TrafficLayer();
            break;
          case 'panoramio':
            layer = new google.maps.panoramio.PanoramioLayer();
            break;
          }
        }
        if (layer) {
          layer.setMap(this._gmap);
          this._glayers[ov.key] = layer;
        }
      } else {
        if (layer) {
          layer.setMap(null);
        }
        
      }
    }
    
    var styles = [];
    var atLeastOneFeature = false;
    for (i = 0, j = this._featureTypeNames.length; i < j; i++) {
      var style = {};
      item = this._featureTypeNames[i];
      var enabled = dojo.indexOf(layerIds, '' + (i + this._overlayLayerNames.length)) != -1;
      if (!enabled) {
        style['featureType'] = item.key;
        style['elementType'] = 'all';
        style['stylers'] = [{
          'visibility': (enabled ? 'on' : 'off')
        }];
        styles.push(style);
      } else {
        atLeastOneFeature = true;
      }
    }
    // if there is no feature is set to be on, ignore request.
    // This is typicall for cases when TOC only show overlays such as traffic
    this._visibilityOptions = styles;
    if (atLeastOneFeature) {
    
      this._gmap.setOptions({
        'styles': styles.concat(this._styleOptions || [])
      });
    }
  },
  /**
   * Fired when Google Map Type (ROAD, SATERLLITE etc) changed
   * @name GoogleMapsLayer#onMapTypeChange
   * @param {String} mapTypeId
   * @event
   */
  onMapTypeChange: function(mapTypeId) {
    // event
  },
  _getGMapTypeId: function(type) {
    // typically the constants is same, however, if google changes, 
    // and API is loaded dynamically but map type is specified before API load,
    // there is a slight chance they are out of sync, so fix here.
    if (google && google.maps) {
      switch (type) {
      case agsjs.layers.GoogleMapsLayer.MAP_TYPE_ROADMAP:
        return google.maps.MapTypeId.ROADMAP;
      case agsjs.layers.GoogleMapsLayer.MAP_TYPE_HYBRID:
        return google.maps.MapTypeId.HYBRID;
      case agsjs.layers.GoogleMapsLayer.MAP_TYPE_SATELLITE:
        return google.maps.MapTypeId.SATELLITE;
      case agsjs.layers.GoogleMapsLayer.MAP_TYPE_TERRAIN:
        return google.maps.MapTypeId.TERRAIN;
      }
    }
    return type;
  },
  _opacityChangeHandler: function(opacity) {
    // this probably should be handled in the core ESRI API using the div returned from _setMap().
    this.setOpacity(opacity);
  },
  
  _visibilityChangeHandler: function(v) {
    if (v) {
      esri.show(this._div);
      //if (!this._svDisabled) {
      esri.show(this._controlDiv);
      //}
      this.visible = true;
      if (this._gmap) {
        google.maps.event.trigger(this._gmap, 'resize');
        this._panHandle = this._panHandle || dojo.connect(this._map, "onPan", this, this._panHandler);
        this._extentChangeHandle = this._extentChangeHandle || dojo.connect(this._map, "onExtentChange", this, this._extentChangeHandler);
        this._setExtent(this._map.extent);
      } else {
        this._initGMap();
      }
    } else {
      if (this._div) {
        esri.hide(this._div);
        esri.hide(this._controlDiv);
        this.visible = false;
        if (this._gmap) {
          this._map.setExtent(this._latLngBoundsToEsriExtent(this._gmap.getBounds()));
        }
        if (this._streetView) {
          this._streetView.setVisible(false);
        }
        if (this._panHandle) {
          dojo.disconnect(this._panHandle);
          this._panHandle = null;
        }
        if (this._extentChangeHandle) {
          dojo.disconnect(this._extentChangeHandle);
          this._extentChangeHandle = null;
        }
      }
    }
  },
  _resizeHandler: function(extent, height, width) {
    dojo.style(this._div, {
      width: this._map.width + "px",
      height: this._map.height + "px"
    });
    google.maps.event.trigger(this._gmap, 'resize');
  },
  _extentChangeHandler: function(extent, delta, levelChange, lod) {
    if (levelChange) {
      this._setExtent(extent);
    } else {
      this._gmap.setCenter(this._esriPointToLatLng(extent.getCenter()));
    }
  },
  _panHandler: function(extent, delta) {
    //console.log('pan:'+extent.xmin+','+extent.ymin+','+extent.xmax+','+extent.ymax);
    if (this._gmap.getTilt() == 0) {
      this._gmap.setCenter(this._esriPointToLatLng(extent.getCenter()));
    }
  },
  _mapTypeChangeHandler: function() {
    this._checkZoomLevel();
    this.onMapTypeChange(this._gmap.getMapTypeId());
  },
  _checkZoomLevel: function() {
    var id = this._gmap.getMapTypeId();
    var types = this._gmap.mapTypes;
    var maptype = null;
    for (var x in types) {
      if (types.hasOwnProperty(x) && x == id) {
        maptype = types[x];
        break;
      }
    }
    // prevent the case when switch to terrain causing misalignment because terrain only up to level 15.
    if (maptype != null) {
      var mi = maptype.minZoom;
      var mx = maptype.maxZoom;
      var z = this._map.getLevel();
      if (mx !== undefined && z > mx) {
        this._map.setLevel(mx);
      }
      if (mi != undefined && z < mi) {
        this._map.setLevel(mi);
      }
    }
  },
  _setExtent: function(extent) {
    var ct = this._esriPointToLatLng(extent.getCenter());
    var lv = this._map.getLevel();
    /*
     
     if (lv >= 0) {
     this._gmap.setZoom(lv);
     
     } else {
     
     }*/
    // esrimap.getLevel is not reliable. result differnt if first layer is Bing Map vs arcgis tile layer.
    // Google maps fit always get a smaller zoom.
    this._gmap.fitBounds(this._esriExtentToLatLngBounds(extent.expand(0.5)));
    this._gmap.setCenter(ct);
    this._checkZoomLevel();
    
    //console.log('gmaps fit:'+this._gmap.getZoom()+' emap:'+lv);
  },
  // move the street view control on top of map container.
  // Esri API prevents mouse event progaginate to lower divs inside map container
  // this method sort of move it up so it can be dragged. A little bit hack, 
  // but as long as stick to a certain version, should still be workable.
  _moveControls: function() {
    if (this._mvHandle) {
      if (!this._gmap) {
        dojo.disconnect(this._mvHandle);
        this._mvHandle = null;
      } else {
        if (!this._svMoved) {
          this._streetView = this._gmap.getStreetView();
          if (this._streetView) {
            var sv = dojo.query('.gmnoprint img[src*="cb_scout_sprite"]', this._div);
            if (sv.length > 0) {
              dojo.forEach(sv, function(s, idx) {
                dojo.place(s.parentNode.parentNode, this._controlDiv);
              }, this);
              
              this._svMoved = true;
              this._svVisibleHandle = google.maps.event.addListener(this._streetView, 'visible_changed', dojo.hitch(this, this._streetViewVisibilityChangeHandler));
            }
          } else {
            this._svMoved = true;
          }
        }
        if (!this._rotateMoved) {
          var ob = dojo.query('.gmnoprint img[src*="rotate"]', this._div);
          if (ob.length > 0) {
            dojo.forEach(ob, function(s, idx) {
              dojo.place(s.parentNode.parentNode, this._controlDiv);
              dojo.style(s, 'position', 'absolute');
              dojo.style(s, 'left', '20px');
            }, this);
            this._rotateMoved = true;
          }
        }
        if (this._rotateMoved && this._svMoved) {
          dojo.disconnect(this._mvHandle);
          this._mvHandle = null;
        }
        
      }
      
    }
  },
  _streetViewVisibilityChangeHandler: function() {
    //console.log('_streetViewVisibilityChangeHandler');
    if (this._streetView) {
      var vis = this._streetView.getVisible();
      this._toggleEsriControl(vis);
      this.onStreetViewVisibilityChange(vis);
    }
    
  },
  // when oblique is shown, we should disable esri mouse events because the projection changes.
  _mapTiltChangeHandler: function() {
    //console.log('_mapTiltChangeHandler');
    var t = this._gmap.getTilt();
    if (t == 45) {
      //this._toggleEsriControl(true);
      //this._map._isPanGMaps = this._map.isPan;
      //this._map.disablePan();
      dojo.place(this._div, this._topDiv);
      this._map.disableMapNavigation();
    } else if (t == 0) {
      //this._toggleEsriControl(false);
      //if (this._map._isPanGMaps) this._map.enablePan();
      dojo.place(this._div, this._placeDiv);
      this._map.enableMapNavigation();
    }
    
  },
  _toggleEsriControl: function(turnOff) {
    if (turnOff) {
      this._isZoomSliderDefault = this._map.isZoomSlider;
      this._map.hideZoomSlider();
      // gmaps (as of v3.6) still dispatch events even street view is visible. so we disable it here.
      this._map.disableMapNavigation();
      
    } else {
      if (this._isZoomSliderDefault) {
        this._map.showZoomSlider();
      }
      this._map.enableMapNavigation();
    }
  },
  /**
   * Fired when Street View visibility changed.
   * @name GoogleMapsLayer#onStreetViewVisibilityChange
   * @param {boolean} visibility
   * @event
   */
  onStreetViewVisibilityChange: function(vis) {
    // attach events
  
  },
  _esriPointToLatLng: function(pt) {
    var ll = esri.geometry.webMercatorToGeographic(pt);
    return new google.maps.LatLng(ll.y, ll.x);
  },
  _esriExtentToLatLngBounds: function(ext) {
    var llb = esri.geometry.webMercatorToGeographic(ext);
    return new google.maps.LatLngBounds(new google.maps.LatLng(llb.ymin, llb.xmin, true), new google.maps.LatLng(llb.ymax, llb.xmax, true));
  },
  _latLngBoundsToEsriExtent: function(bounds) {
    var ext = new esri.geometry.Extent(bounds.getSouthWest().lng(), bounds.getSouthWest().lat(), bounds.getNorthEast().lng(), bounds.getNorthEast().lat());
    return esri.geometry.geographicToWebMercator(ext);
  },
  _createLayerInfos: function() {
    var layerInfo;
    var features = this._featureTypeNames;
    var overlays = this._overlayLayerNames;
    var layerInfos = [];
    dojo.forEach(overlays, function(ov, idx) {
      layerInfo = {
        defaultVisibility: false,
        id: idx,
        name: ov.name || ov.key,
        parentLayerId: -1,
        type: 'overlay'
      };
      if (ov.minZoom) {
        layerInfo.minScale = this.tileInfo.lods[ov.minZoom].scale * 1.5;
      }
      if (ov.maxZoom) {
        layerInfo.maxScale = this.tileInfo.lods[ov.maxZoom].scale * 0.75;
      }
      layerInfos.push(layerInfo)
    }, this);
    var groupLayer;
    var lastInfo;
    for (var i = 0, j = features.length; i < j; i++) {
      var feat = features[i];
      var id = i + overlays.length;
      var layerInfo = {
        defaultVisibility: true,
        name: feat.name || feat.key,
        id: id,
        type: 'feature',
        parentLayerId: -1
      }
      if (groupLayer == null) {
        groupLayer = layerInfo;
      } else {
        var lastDot = name.lastIndexOf('.');
        if (lastDot != -1) {
          if (name.substring(0, lastDot) != groupLayer.name) {
            groupLayer = lastInfo;
          }
          layerInfo.parentLayerId = groupLayer.id;
          groupLayer.subLayerIds = groupLayer.subLayerIds || [];
          groupLayer.subLayerIds.push(id);
        } else {
          groupLayer = layerInfo;
        }
      }
      lastInfo = layerInfo;
      //layerInfo.name = this._formatName(name);
      if (feat.minZoom) {
        layerInfo.minScale = this.tileInfo.lods[feat.minZoom].scale * 1.5;
      }
      if (feat.maxZoom) {
        layerInfo.maxScale = this.tileInfo.lods[feat.maxZoom].scale * 0.75;
      }
      layerInfos.push(layerInfo);
    }
    //console.log(dojo.toJson(layerInfos, true));
    return layerInfos;
  }
  
});

dojo.mixin(agsjs.layers.GoogleMapsLayer, {
  /**
   * @name GoogleMapsLayer#MAP_TYPE_SATELLITE
   * @constant
   */
  MAP_TYPE_SATELLITE: "satellite",
  /**
   * @constant
   */
  MAP_TYPE_HYBRID: "hybrid",
  /**
   * @constant
   */
  MAP_TYPE_ROADMAP: "roadmap",
  /**
   * @constant
   */
  MAP_TYPE_TERRAIN: "terrain",
  MAP_STYLE_GRAY: [{
    featureType: 'all',
    stylers: [{
      saturation: -80
    }, {
      lightness: 20
    }]
  }],
  MAP_STYLE_LIGHT_GRAY: [{
    featureType: 'all',
    stylers: [{
      saturation: -80
    }, {
      lightness: 60
    }]
  }],
  MAP_STYLE_NIGHT: [{
    featureType: 'all',
    stylers: [{
      invert_lightness: 'true'
    }]
  }]
});


// extend Esri gallery
if (esri.dijit.BasemapGallery){
  esri.dijit.BasemapGallery.prototype._original_postMixInProperties = esri.dijit.BasemapGallery.prototype.postMixInProperties;
  esri.dijit.BasemapGallery.prototype._original_startup = esri.dijit.BasemapGallery.prototype.startup;
}

dojo.extend(esri.dijit.BasemapGallery, {
  googleMapsApi: null,
  _googleLayers: [],
  toggleReference: false,
  postMixInProperties: function() {
    if (!this._OnSelectionChangeListenerExt) {
      this._onSelectionChangeListenerExt = dojo.connect(this, 'onSelectionChange', this, this._onSelectionChangeExt)
    }
    if (this.googleMapsApi != undefined && (this.showArcGISBasemaps || this.basemapsGroup)) {
      this.basemaps.push(new esri.dijit.Basemap({
        id: 'google_road',
        layers: [new esri.dijit.BasemapLayer({
          type: 'GoogleMapsRoad'
        })],
        title: "Google Road",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googleroad.png")
      }));
      this.basemaps.push(new esri.dijit.Basemap({
        id: 'google_satellite',
        layers: [new esri.dijit.BasemapLayer({
          type: 'GoogleMapsSatellite'
        })],
        title: "Google Satellite",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googlesatellite.png")
      }));
      this.basemaps.push(new esri.dijit.Basemap({
        id: 'google_hybrid',
        layers: [new esri.dijit.BasemapLayer({
          type: 'GoogleMapsHybrid'
        })],
        title: "Google Hybrid",
        thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googlehybrid.png")
      }));
      
    }
    if (this.loaded) {
      this._onLoadExt();
    } else {
      this._onLoadListenerExt = dojo.connect(this, 'onLoad', this, this._onLoadExt);
    }
    if (this._original_postMixInProperties) {
      this._original_postMixInProperties();
    }
    console.log('dom'+this.domNode);
  },
  startup: function() {
    // user have option of not calling startup for custom UI.
    // _startupCalled is used to flag if we need refresh UI for toggle reference layer
    this._startupCalled = true;
    this._original_startup();
    // move from _processReferenceLayersExt because domNode may not be available at the time if manual mode.
    if (!this._onGalleryClickListenerExt){
      this._onGalleryClickListenerExt = dojo.connect(this.domNode, 'click', this, this._onGalleryClickExt);
    }
  },
  _onLoadExt: function() {
    //console.log('inside _onLoad ');
    if (this._onLoadListenerExt) 
      dojo.disconnect(this._onLoadListenerExt);
    if (this.toggleReference) {
      dojo.forEach(this.basemaps, function(basemap) {
        var layers = basemap.getLayers();
        if (layers.length) {
          this._processReferenceLayersExt(basemap);
        } else {
          layers.then(dojo.hitch(this, this._processReferenceLayersExt, basemap));
        }
      }, this);
    }
  },
  _processReferenceLayersExt: function(basemap) {
    var layers = basemap.getLayers();
    var hasRef = false, vis = true;
    dojo.forEach(layers, function(layer) {
      if (layer.isReference) {
        hasRef = true;
        if (layer.visibility === false) {
          vis = false;
        }
      }
    });
    
    if (hasRef && this.toggleReference) {
      basemap.title += '<input type="checkbox"  disabled ' + (vis ? 'checked' : '') + '/>';
      basemap._hasReference = true;
    } else {
      basemap._hasReference = false;
    }
    
    var needsRefresh = 0;
    dojo.forEach(this.basemaps, function(b) {
      // make sure all basemaps are processed. it is decided by each basemap has a _hasReference property, regardless true or false.
      // if there is any basemap not processed, should not refresh.
      // if there are at least one ref layers for that basemap, will refresh.
      if (b._hasReference == undefined) {
        needsRefresh -= this.basemaps.length;
      }
      if (b._hasReference) {
        needsRefresh++;
      }
    }, this);
    if (needsRefresh >= 0) {
      if (needsRefresh > 0 && this._startupCalled) {
        // if startup is executed before all basemap are processed, need recall it. if not called yet, does not matter.
        this.startup();
      }
    }
  },
  _onSelectionChangeExt: function() {
    var selected = this.getSelected();
    if (selected) {
      if (this._googleLayers.length > 0) {
        dojo.forEach(this._googleLayers, function(lay) {
          this.map.removeLayer(lay);
        }, this);
        this._googleLayers.length = 0;
      }
      dojo.query('input', this.domNode).forEach(function(m) {
        m.disabled = true;
      });
      var layers = selected.getLayers();
      dojo.forEach(layers, function(blay) {
        if (blay.type && blay.type.indexOf("GoogleMaps") > -1) {
          var mtype = agsjs.layers.GoogleMapsLayer.MAP_TYPE_ROADMAP;
          if (blay.type == "GoogleMapsSatellite") {
            mtype = agsjs.layers.GoogleMapsLayer.MAP_TYPE_SATELLITE;
          } else if (blay.type == "GoogleMapsHybrid") {
            mtype = agsjs.layers.GoogleMapsLayer.MAP_TYPE_HYBRID;
          }
          var opts = {
            apiOptions: this.googleMapsApi,
            mapOptions: {
              mapTypeId: mtype,
              streetViewControl: this.googleMapsApi.streetView
            }
          };
          var layer = new agsjs.layers.GoogleMapsLayer(opts);
          this.map.addLayer(layer, 0);
          this._googleLayers.push(layer);
        }
      }, this);
    }
    // when the first basemap is selected, UI may already built, but at that time, 
    // nothing to mark as selected node because first onSelectionChange has not been fired yet.
    var hasSelectedNode = this._checkSelectedNode();
    if (!hasSelectedNode && this._startupCalled) {
      // mark selected basemap in UI.
      this.startup();
      // this enables checkbox;
      this._checkSelectedNode();
    }
    
  },
  _checkSelectedNode: function() {
    var hasSelectedNode = false;
    var layers = this.getSelected().getLayers();
    dojo.query('.esriBasemapGallerySelectedNode', this.domNode).forEach(function(n) {
      hasSelectedNode = true;
      dojo.query('input', n).forEach(function(m) {
        m.disabled = false;
        // jsapi fires onSelectionChange before reference layer updates, (should be a bug) so we can not set vis directly.
        //this._setReferenceVis(m.checked);
        dojo.forEach(layers, function(blay) {
          if (blay.isReference) {
            blay.visibility = m.checked;
          }
        }, this);
        
      }, this);
    }, this);
    return hasSelectedNode;
  },
  _onGalleryClickExt: function(evt) {
    console.log('_onGalleryClickExt');
    var t = evt.target;
    if (t.tagName.toLowerCase() == 'input') {
      this._setReferenceVis(t.checked);
    } else if (dojo.hasClass(t.parentNode, 'esriBasemapGalleryLabelContainer')) {
      // this allows basemap switch by clicking on label.
      t.parentNode.parentNode.firstChild.click();
    }
  },
  _setReferenceVis: function(visible) {
    //arcgis API does not associate the actual created esri.layers.Layer and esri.dijit.BasemapLayer
    // so have to use undocumented _basemapGalleryLayerType.
    dojo.forEach(this.map.layerIds, function(id) {
      var layer = this.map.getLayer(id);
      if (layer._basemapGalleryLayerType == "reference") {
        if (visible) {
          layer.show();
        } else {
          layer.hide();
        }
        
      }
    }, this);
  },
  /**
   * get array of active google layers. Typically there is only one layer in the array.
   * @return {GoogleMapsLayer[]}
   */
  getGoogleLayers: function() {
    return this._googleLayers;
  }
});
