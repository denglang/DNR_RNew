function createBookmarks(){
	 var static_bookmarks = [{                                            
          "extent": {                                                                                                       
            "xmin":-10895427,                                               
            "ymin":4735201,                                                 
            "xmax":-9893796,                                                
            "ymax":5554606,
            "spatialReference":{                                           
                "wkid": 102100}},"name":"State of Iowa"},
          {                                                   
          "extent":{ "xmin":-10454882,                                               
            "ymin":5071676,                                                 
            "xmax":-10392280,                                               
            "ymax":5122889,
             "spatialReference": {"wkid":102100}},                                                
          "name": "Des Moines Metro"}];
        
	    COOKIE_NAME = "IowaDNR_UserBookmarks";
	    if (dojo.cookie(COOKIE_NAME)){
	    	locations = dojo.fromJson(dojo.cookie(COOKIE_NAME));
	        var bookmarklist = new esri.dijit.Bookmarks({                         
		          map: map,                                                         
		          bookmarks: locations,                                                    
		          editable: true                                                    
		        }, dojo.create("div"));    
	    }else{
	      var bookmarklist = new esri.dijit.Bookmarks({                           
          map: map,                                                                                                     
          editable: true,
          bookmarks: static_bookmarks                                                 
        }, dojo.create("div"));                                        
       	locations = bookmarklist.toJson();                
	       bookmark_cookie = dojo.cookie(COOKIE_NAME,dojo.toJson(locations),{expires:5});
	    }
        dojo.connect(bookmarklist, "onClick", function () {
				dijit.byId('bookmarkButton').closeDropDown();
   		});  
  var bmpane = new dijit.layout.ContentPane({
      id: 'bookmarkView',
      baseClass: "dnrContentPane"
    });
    bmpane.set('content', bookmarklist.bookmarkDomNode);
  var button = new dijit.form.DropDownButton({
    label: "Bookmarks",
    id: "bookmarkButton",
    iconClass: "dnrMapBookmarkIcon",
    baseClass: "dnrToolButton",
    title: "Bookmarks", 
    dropDown: bmpane
  });
     dojo.byId('header-toolbar').appendChild(button.domNode);                           
      dojo.connect(bookmarklist,'onEdit', 
		  function(){
		  		bookmark_cookie = dojo.cookie(COOKIE_NAME,dojo.toJson(bookmarklist.toJson()),{expires:5});
		  	});
	         dojo.connect(bookmarklist,'onRemove', 
		  function(){
		  		bookmark_cookie = dojo.cookie(COOKIE_NAME,dojo.toJson(bookmarklist.toJson()),{expires:5});
		  	});   
 return bookmarklist;                                                      
}                                                                               