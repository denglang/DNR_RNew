/**
 * @name Table of Contents (TOC) widget for ArcGIS Server JavaScript API
 * @author: Nianwei Liu (nianwei at gmail dot com)
 * @fileoverview
 * <p>A TOC (Table of Contents) widget for ESRI ArcGIS Server JavaScript API. The namespace is <code>agsjs</code></p>
 * @version 1.06
 */
// change log: 
// 2012-02-02: fix IE7&8 problem when there is "all other value"(default symbol) 
dojo.provide('iowadnr.dijit.Menu.TOC');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Slider');
dojo.require("dojo.fx");

(function() {
  var link = dojo.create("link", {
    type: "text/css",
    rel: "stylesheet",
	href: dojo.moduleUrl("iowadnr.dijit.Menu", "TOC.css")
  });
  dojo.doc.getElementsByTagName("head")[0].appendChild(link);
}());

/**
 * _TOCNode is a node, with 3 possible types: layer(service)|layer|legend
 * @private
 */
dojo.declare("iowadnr.dijit.Menu._TOCNode", [dijit._Widget, dijit._Templated], {
  //templateString: dojo.cache('agsjs.dijit', 'templates/tocNode.html'),
  templateString: '<div class="agsjsTOCNode">' +
  '<div data-dojo-attach-point="rowNode" data-dojo-attach-event="onclick:_onClick">' +
  '<span data-dojo-attach-point="contentNode" class="agsjsTOCContent">' +
  '<span data-dojo-attach-point="checkContainerNode"></span>' +
  '<img src="${_blankGif}" alt="" data-dojo-attach-point="iconNode" />' +
  '<span data-dojo-attach-point="labelNode">' +
  '</span></span></div>' +
  '<div data-dojo-attach-point="containerNode" style="display: none;"> </div></div>',
  rootLayer: null,
  layer: null,
  legend: null,
  rootLayerTOC: null,
  data: null,
  _childTOCNodes: [],
  constructor: function(params, srcNodeRef) {
    dojo.mixin(this, params);
  },
  // extension point. called automatically after widget DOM ready.
  postCreate: function() {

    dojo.style(this.rowNode, 'paddingLeft', '' + this.rootLayerTOC.toc.indentSize * this.rootLayerTOC._currentIndent + 'px');
    //Determine what to create by property availibility
    this.data = this.legend || this.layer || this.rootLayer;
    this.blank = this.iconNode.src;
    
    if (this.legend) {
    } else if (this.layer) {
      this._createLayerNode(this.layer);
      
    } else if (this.rootLayer) {
      this._createRootLayerNode(this.rootLayer);
    }
    if (this.containerNode) {
      this.toggler = new dojo.fx.Toggler({
        node: this.containerNode,
        showFunc: dojo.fx.wipeIn,
        hideFunc: dojo.fx.wipeOut
      })
    }
    
    if (!this._noCheckNode) {
      var chk;
      if (dijit.form && dijit.form.CheckBox) {
        chk = new dijit.form.CheckBox({ // looks a bug in dijit. image not renderered until mouse over. bug was closed but still exist.
          								// use attr('checked', true) not working either.
          checked: this.data.visible
        });
        chk.placeAt(this.checkContainerNode);//contentNode, 'first');
        chk.startup();
      } else {
        chk = dojo.create('input', {
          type: 'checkbox',
          checked: this.data.visible
        }, this.checkContainerNode);//this.contentNode, 'first');
      }
      this.checkNode = chk;
    }
    var show = this.data.visible;
    if (this.data._subLayerInfos) {
      var noneVisible = true;
      dojo.every(this.data._subLayerInfos, function(info) {
        if (info.visible) {
          noneVisible = false;
          return false;
        }
        return true;
      });
      if (noneVisible) 
        show = false;
    }
    
    if (this.data.collapsed) 
      show = false;
    if (this.iconNode && this.iconNode.src == this.blank) {
      dojo.addClass(this.iconNode, show ? 'dijitTreeExpandoOpened' : 'dijitTreeExpandoClosed');
    }
    if (this.containerNode) 
      dojo.style(this.containerNode, 'display', show ? 'block' : 'none');
    
    if (this.rootLayerTOC.toc.style == 'standard' && this.iconNode && this.checkNode) {
      dojo.place(this.iconNode, this.checkNode.domNode || this.checkNode, 'before');
    }
    
  },
  // root level node
  _createRootLayerNode: function(rootLayer) {
    dojo.addClass(this.rowNode, 'agsjsTOCRootLayer');
    dojo.addClass(this.labelNode, 'agsjsTOCRootLayerLabel');
    
    var title = this.rootLayerTOC.info.title;
    if (title === '') {
      esri.hide(this.rowNode);
      rootLayer.show();
      this.rootLayerTOC._currentIndent--;
    }
    rootLayer.collapsed = this.rootLayerTOC.info.collapsed;
    this._createChildrenNodes(rootLayer._tocInfos, 'layer');
    this.labelNode.innerHTML = title;
    dojo.attr(this.rowNode, 'title', title);
  },
  // a layer inside a map service.
  _createLayerNode: function(layer) {
    this.labelNode.innerHTML = layer.name;
    if (layer._subLayerInfos) {// group layer
      dojo.addClass(this.labelNode, 'agsjsTOCGroupLayerLabel');
      if (this.rootLayerTOC.info.showGroupCount) {
        this.labelNode.innerHTML = layer.name + ' (' + layer._subLayerInfos.length + ')';
      }
      this._createChildrenNodes(layer._subLayerInfos, 'layer');
    } else {
      dojo.addClass(this.labelNode, 'agsjsTOCLayerLabel');
      if (this.rootLayer.tileInfo) {
        this._noCheckNode = true;
      }
    }
  },
  _createChildrenNodes: function(chdn, type) {
    this.rootLayerTOC._currentIndent++;
    var c = [];

    for (var i = 0, n = chdn.length; i < n; i++) {
      var chd = chdn[i];
      var params = {
        rootLayerTOC: this.rootLayerTOC,
        rootLayer: this.rootLayer,
        layer: this.layer,
        //TODO: remove legend property?
        legend: this.legend
      };
      params[type] = chd;
      params.data = chd;
      var node = new iowadnr.dijit.Menu._TOCNode(params);
      node.placeAt(this.containerNode);
      
      c.push(node);
      
    }//, this);
    this._childTOCNodes = c;
    this.rootLayerTOC._currentIndent--;
  },
  _toggleContainer: function(on) {
    if (dojo.hasClass(this.iconNode, 'dijitTreeExpandoClosed') ||
    dojo.hasClass(this.iconNode, 'dijitTreeExpandoOpened')) {
      // make sure its not clicked on legend swatch
      if (on) {
        dojo.removeClass(this.iconNode, 'dijitTreeExpandoClosed');
        dojo.addClass(this.iconNode, 'dijitTreeExpandoOpened');
      } else if (on === false) {
        dojo.removeClass(this.iconNode, 'dijitTreeExpandoOpened');
        dojo.addClass(this.iconNode, 'dijitTreeExpandoClosed');
      } else {
        dojo.toggleClass(this.iconNode, 'dijitTreeExpandoClosed');
        dojo.toggleClass(this.iconNode, 'dijitTreeExpandoOpened');
      }
      if (this.toggler) {
        if (dojo.hasClass(this.iconNode, 'dijitTreeExpandoOpened')) {
          this.toggler.show();
        } else {
          this.toggler.hide();
        }
      }
    }
    legend.refresh();
  },
  _adjustToState: function() {
    if (this.checkNode) {
      var checked = this.legend ? this.legend.visible : this.layer ? this.layer.visible : this.rootLayer ? this.rootLayer.visible : false;
      if (this.checkNode.set) {
        this.checkNode.set('checked', checked);
      } else {
        this.checkNode.checked = checked;
      }
      
    }
    if (this.layer) {
      var scale = esri.geometry.getScale(this.rootLayerTOC.toc.map);
      var outScale = (this.layer.maxScale != 0 && scale < this.layer.maxScale) || (this.layer.minScale != 0 && scale > this.layer.minScale);
      if (outScale) {
        dojo.addClass(this.domNode, 'agsjsTOCOutOfScale');
      } else {
        dojo.removeClass(this.domNode, 'agsjsTOCOutOfScale');
      }
      if (this.checkNode) {
        if (this.checkNode.set) {
          this.checkNode.set('disabled', outScale);
          
        } else {
          this.checkNode.disabled = outScale;
          
        }
      }
    }
    if (this._childTOCNodes.length > 0) {
      dojo.forEach(this._childTOCNodes, function(child) {
        child._adjustToState();
      });
    }
    
  },
  _onClick: function(evt) {
	
    var t = evt.target;
    if (t == this.checkNode || dijit.getEnclosingWidget(t) == this.checkNode) {
      if (this.legend) {
        var renderer = this.layer.renderer;
        this.legend.visible = this.checkNode.checked;
        var def = [];
        if (renderer instanceof esri.renderer.UniqueValueRenderer) {
          // find type of attribute field and decide if need quote
          var q = '';
          if (this.layer.fields) {
            dojo.forEach(this.layer.fields, function(field) {
              if (field.name.toLowerCase() == renderer.attributeField.toLowerCase()) {
                switch (field.type) {
                case 'esriFieldTypeString':
                  q = '\'';
                }
              }
            });
          }
          dojo.forEach(renderer.infos, function(info) {
            if (info.visible) {
              def.push(q + info.value + q);
            }
            
          }, this);
          if (def.length == renderer.infos.length) {
            this.layer._definitionExpression = '';
          } else if (def.length == 0) {
            this.layer.visible = false;
          } else {
            this.layer.visible = true;
            this.layer._definitionExpression = renderer.attributeField + ' IN (' + def.join(',') + ')';// def.join(' OR ');
          }
        }
        
        this.rootLayer.setVisibleLayers(this._getVisibleLayers(), true);
        this.rootLayer.setLayerDefinitions(this._getLayerDefs(), true);
        this.rootLayerTOC._refreshLayer();
      } else if (this.layer) {
        this.layer.visible = this.checkNode && this.checkNode.checked;
        
        if (this.layer._parentLayerInfo && !this.layer._parentLayerInfo.visible) {
          this.layer._parentLayerInfo.visible = true;
        }
        if (this.layer.visible && !this.rootLayer.visible) {
          this.rootLayer.show();//.visible = true;
        }
        if (this.layer._subLayerInfos) {
          // this is a group layer;
          dojo.forEach(this.layer._subLayerInfos, function(info) {
            info.visible = this.layer.visible;
          }, this);
        }
        if (this.layer.renderer) {
          dojo.forEach(this.layer.renderer.infos, function(info) {
          
            info.visible = this.layer.visible;
            
          }, this);
          this.layer._definitionExpression = '';
        }
        this.rootLayer.setLayerDefinitions(this._getLayerDefs(), true);
        this.rootLayer.setVisibleLayers(this._getVisibleLayers(), true);
        this.rootLayerTOC._refreshLayer();
        
      } else if (this.rootLayer) {
        this.rootLayer.setVisibility(this.checkNode && this.checkNode.checked);
      }
      if (this.rootLayerTOC.toc.style == 'inline') {
        this._toggleContainer(this.checkNode && this.checkNode.checked);
      }
      this.rootLayerTOC._adjustToState();
      
    } else if (t == this.iconNode) {
      this._toggleContainer();
    }
  },
  _getVisibleLayers: function() {
    var vis = [];
    dojo.forEach(this.rootLayer.layerInfos, function(layerInfo) {
      if (layerInfo.subLayerIds) {
        return;
      } else if (layerInfo.visible) {
        vis.push(layerInfo.id);
      }
      
    });
    if (vis.length === 0) {
      vis.push(-1);
    } else if (!this.rootLayer.visible) {
      this.rootLayer.show();
    }
    return vis;
  },
  _getLayerDefs: function() {
    var defs = [];
    dojo.forEach(this.rootLayer.layerInfos, function(layerInfo, i) {
      if (layerInfo._definitionExpression) {
        defs[i] = layerInfo._definitionExpression;
      }
    });
    return defs;
  }
  
});

dojo.declare('iowadnr.dijit.Menu._RootLayerTOC', [dijit._Widget], {
  _currentIndent: 0,
  rootLayer: null,
  toc: null,
  constructor: function(params, srcNodeRef) {
    this.rootLayer = params.rootLayer;
    this.toc = params.toc;
    this.info = params.info || {};
  },
  // extenstion point called by framework
  postCreate: function() {
    this._getLayerInfos();
  },
  // retrieve sublayer/legend data
  _getLayerInfos: function() {
    if ((this.rootLayer instanceof (esri.layers.ArcGISDynamicMapServiceLayer) ||
    this.rootLayer instanceof (esri.layers.ArcGISTiledMapServiceLayer))) {
      if (this.info.title === undefined) {
        var start = this.rootLayer.url.toLowerCase().indexOf('/rest/services/');
        var end = this.rootLayer.url.toLowerCase().indexOf('/mapserver', start);
        this.info.title = this.rootLayer.url.substring(start + 15, end);
      }
    } else {
      this.info.noLayers = true;
    }
    if (!this.rootLayer.url || this.info.noLayers) {
      this._createRootLayerTOC();
    } else {
        this._getLayersInfo();
    }
  },
  _getLayersInfo: function() {
    var url = this.rootLayer.url + '/layers';
    var handle = esri.request({
      url: url,
      content: {
        f: "json"
      },
      callbackParamName: 'callback',
      handleAs: 'json',
      load: dojo.hitch(this, this._processLayersInfo),
      error: dojo.hitch(this, this._createRootLayerTOC)
    });
  },
  _processLayersInfo: function(json) {
    this.rootLayer._layersResponse = json;
    if (this.info.mode == 'layers' || this.rootLayer._legendResponse) {
      this._createRootLayerTOC();
    }
  },
  
  _createRootLayerTOC: function() {
    var layer = this.rootLayer;
    var initialvislayers = this.info.initialvislayers;
    var included = this.info.includedLayers;
    if (!layer._tocInfos) {
      var layerLookup = {};
      dojo.forEach(layer.layerInfos, function(layerInfo) {  	    
	      	if (dojo.indexOf(included, layerInfo.id) > -1 && dojo.indexOf(initialvislayers, layerInfo.id) > -1 ){
	        	layerLookup['' + layerInfo.id] = layerInfo;
	        	//layerInfo.visible = layerInfo.defaultVisibility;
	        	layerInfo.visible = true;
	       	}else
	       	{
	       		layerInfo.visible = false;
	       	}
      });
      
      if (layer._layersResponse) {
        dojo.forEach(layer._layersResponse.layers, function(layInfo) {
          var layerInfo = layerLookup['' + layInfo.id];
          if (layerInfo) {
            dojo.mixin(layerInfo, layInfo);// push fields info
            layerInfo.definitionExpression = layInfo.definitionExpression;
            if (layInfo.drawingInfo && layInfo.drawingInfo.renderer) {
              layerInfo.renderer = esri.renderer.fromJson(layInfo.drawingInfo.renderer);
            }
          }
        });
      }
      var tocInfos = [];
      dojo.forEach(layer.layerInfos, function(layerInfo) {6
         if (layerInfo.parentLayerId == -1 && (dojo.indexOf(included, layerInfo.id) > -1)) { //PWB added to utilize includedLayers:[] 
          tocInfos.push(layerInfo);
        }
      });
      layer._tocInfos = tocInfos;
    }
    this._rootLayerNode = new iowadnr.dijit.Menu._TOCNode({
      rootLayerTOC: this,
      rootLayer: layer
    });
    this._rootLayerNode.placeAt(this.domNode);
    this._visHandler = dojo.connect(layer, "onVisibilityChange", this, "_adjustToState");
    
    // this will make sure all TOC linked to a Map synchronized.
    this._visLayerHandler = dojo.connect(layer, "setVisibleLayers", this, "_adjustToState");
    this._adjustToState();
  },
  
  _refreshLayer: function() {
    var rootLayer = this.rootLayer;
    var timeout = this.toc.refreshDelay;
    if (this._refreshTimer) {
      window.clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
    this._refreshTimer = window.setTimeout(function() {
      rootLayer.setVisibleLayers(rootLayer.visibleLayers);
    }, 500);
  },
  _adjustToState: function() {
    this._rootLayerNode._adjustToState();
  },
  destroy: function() {
    dojo.disconnect(this._visHandler);
    dojo.disconnect(this._visLayerHandler);
    dojo.disconnect(this._maptypeIdHandler);
  }
});

dojo.declare("iowadnr.dijit.Menu.TOC", [dijit._Widget], {
  indentSize: 18,
  swatchSize: [30, 30],
  refreshDelay: 500,
  style: 'inline',
  layerInfos: null,
  slider: false,
  
  /**
   * @name TOCLayerInfo
   * @class This is an object literal that specify the options for each map rootLayer layer.
   * @property {esri.layers.ArcGISTiledMapServiceLayer | esri.layers.ArcGISDynamicMapServiceLayer} rootLayer: ArcGIS Server layer.
   * @property {string} [title] title. optional. If not specified, rootLayer name is used.
   * @property {Boolean} [slider] whether to show slider for each rootLayer to adjust transparency. default is false.
   * @property {Boolean} [noLegend] whether to skip the legend, and only display layers. default is false.
   * @property {Boolean} [collapsed] whether to collapsed the rootLayer layer at beginning. default is false, which means expand if visible, collapse if not.
   *
   */
  /**
   * @name TOCOptions
   * @class This is an object literal that specify the option to construct a {@link TOC}.
   * @property {esri.Map} [map] the map instance. required.
   * @property {Object[]} [layerInfos] a subset of layers in the map to show in TOC. each object is a {@link TOCLayerInfo}
   * @property {Number} [indentSize] indent size of tree nodes. default to 18.
   */
  /** 
   * Create a Table Of Contents (TOC)
   * @name TOC
   * @constructor
   * @class This class is a Table Of Content widget.
   * @param {ags.TOCOptions} opts
   * @param {DOMNode|id} srcNodeRef
   */
  constructor: function(params, srcNodeRef) {
    params = params || {};
    if (!params.map) {
      throw new Error('no map defined in params for TOC');
    }
    dojo.mixin(this, params);
    this._rootLayerTOCs = [];
    if (!this.layerInfos) {
      this.layerInfos = [];
      
      for (var i = this.map.layerIds.length - 1; i >= 0; i--) {
        var rootLayer = this.map.getLayer(this.map.layerIds[i]);
        // these properties defined in BasemapControl widget.
        // since the basemap control add/remove them requently, it's better not to show.
        if (!rootLayer._isBaseMap && !rootLayer._isReference) {
          this.layerInfos.push({
            layer: rootLayer
          });
        }
        
      }
      dojo.connect(this.map, 'onLayerAdd', this, function(layer) {
        this.layerInfos.push({
          layer: layer
        });
        this.refresh();
      });
      dojo.connect(this.map, 'onLayerRemove', this, function(layer) {
        for (var i = 0; i < this.layerInfos.length; i++) {
          if (this.layerInfos[i] == layer) {
            this.layerInfos.splice(i, 1);
            break;
          }
        }
        this.refresh();
      });
    }
  },
  // extension point
  postCreate: function() {
    var createdLayers = [];
    dojo.forEach(this.layerInfos, function(layerInfo) {
      if (!layerInfo.layer) {
        layerInfo.layer = this._createRootLayer(layerInfo);
        createdLayers.push(layerInfo.layer);
      }
    }, this);
    if (createdLayers.length == 0) {
      this._createTOC();
    } else {
    	console.error("something was configured incorrectly");
    }
  },
  _createRootLayer: function(lay) {
    var rootLayer = null;
    var type = lay.type || 'ArcGISDynamic';
    switch (type) {
	    case 'ArcGISDynamic':
	      rootLayer = new esri.layers.ArcGISDynamicMapServiceLayer(lay.url, lay);
	      break;
    }
    
    return rootLayer;
  },
  _createTOC: function() {
    dojo.empty(this.domNode);
    for (var i = 0, c = this.layerInfos.length; i < c; i++) {  
      var rootLayer = this.layerInfos[i].layer;
      var svcTOC = new iowadnr.dijit.Menu._RootLayerTOC({
        rootLayer: rootLayer,
        info: this.layerInfos[i],
        toc: this
      });
      this._rootLayerTOCs.push(svcTOC);
      svcTOC.placeAt(this.domNode);
    }
    if (!this._zoomHandler) {
      this._zoomHandler = dojo.connect(this.map, "onZoomEnd", this, "_adjustToState");
    }
    
  },
  _adjustToState: function() {
    dojo.forEach(this._rootLayerTOCs, function(widget) {
      widget._adjustToState();
    });
  },
  refresh: function() {
    this._createTOC();
  },
  destroy: function() {
    dojo.disconnect(this._zoomHandler);
    this._zoomHandler = null;
  }
});
