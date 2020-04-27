dojo.provide("iowadnr.dijit.CustomInfoWindow.InfoWindow");

dojo.require("esri.InfoWindowBase");
dojo.require("dojo.fx");
dojo.require("dojo.fx.Toggler");
/***************
 * MyInfoWindow
 ***************/
dojo.declare("iowadnr.dijit.CustomInfoWindow.InfoWindow", [ esri.InfoWindowBase ], {
  
  constructor: function(parameters) {
    dojo.mixin(this, parameters);
    //isContentShowing: false;  //uncomment to have closed by default   
    isContentShowing: true;
    
    dojo.addClass(this.domNode, "dnrInfoWindow");

    this._closeButton = dojo.create("div", { "class": "close", title: "Close" }, this.domNode);
    this._title = dojo.create("div", { "class": "title" }, this.domNode);
    this._content = dojo.create("div", { "class": "content" }, this.domNode);    
    this._toggleButton = dojo.create("div",{"class": "toggleOpen", title:"Toggle"},this.domNode);
    var toggler = new dojo.fx.Toggler({
        node: this._content,
        showFunc: dojo.fx.wipeIn,
        hideFunc: dojo.fx.wipeOut
      });
    //toggler.hide(); //uncomment to have close by default
    toggler.show();
    this._eventConnections = [
      dojo.connect(this._closeButton, "onclick", this, function(){
        this.hide();
        //hide the content when the window is closed so it displays in closed state next time it opens.
        if(this.isContentShowing){
          toggler.hide();
          this.isContentShowing = false;
          dojo.removeClass(this._toggleButton);
          dojo.addClass(this._toggleButton,"toggleOpen");
        }
      }),
      dojo.connect(this._toggleButton,"onclick",this,function(){
        //animate the display of content
        if(this.isContentShowing){
          toggler.hide();
          this.isContentShowing = false;
          dojo.removeClass(this._toggleButton);
          dojo.addClass(this._toggleButton,"toggleOpen");
        }else{
          toggler.show();
          this.isContentShowing=true;
          dojo.removeClass(this._toggleButton);
          dojo.addClass(this._toggleButton,"toggleClose");     
        }

      })
    ];

    // Hidden initially
    esri.hide(this.domNode);            
    this.isShowing = false;
  },
  
  /*****************************************
   * Override and implement methods defined  
   * by the base class: InfoWindowBase
   *****************************************/

  setMap: function(map) {
    // Run logic defined in the base class
    this.inherited(arguments);
    
    //  hide the info window when the user is focusing elsewhere.
    //this._eventConnections.push(dojo.connect(map, "onPanStart", this, this.hide));
    //this._eventConnections.push(dojo.connect(map, "onZoomStart", this, this.hide));
  },
  
  setTitle: function(title) {
    this.place(title, this._title);
  },
  
  setContent: function(content) {
    this.place(content, this._content);
  },
  
  show: function(location) {
    // Is location specified in map coordinates?
    if (location.spatialReference) {
      location = this.map.toScreen(location);
    }
    
    // Position 10x10 pixels away from the 
    // requested location
    dojo.style(this.domNode, {
      //left: "4px",
      //top: "4px"
      left: (location.x + 10) + "px",
      top: (location.y + 10) + "px"
    });
    
    // Display
    esri.show(this.domNode);
    this.isShowing = true;
    this.onShow();
  },
  hide: function() {
    esri.hide(this.domNode);
    this.isShowing = false;
    this.onHide();
  },
  
  resize: function(width, height) {
    dojo.style(this._content, {
      width: width + "px",
      height: height + "px"
    });
    dojo.style(this._title,{
      width: width + "px"
    });
  },
  
  /************************************
   * Defining some methods specific to
   * my info window
   ************************************/
  
  destroy: function() {
    dojo.forEach(this._eventConnections, dojo.disconnect);
    dojo.destroy(this.domNode);
    this._closeButton = this._title = this._content = this._eventConnections = null;
  }
  
});