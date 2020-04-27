dojo.provide("tmpdir.CheckBox");
dojo.provide("tmpdir.CheckBoxTree");
dojo.provide("tmpdir.CheckBoxStoreModel");

// http://www.thejekels.com/
// THIS WIDGET IS BASED ON DOJO/DIJIT 1.4.0 AND WILL NOT WORK WITH PREVIOUS VERSIONS
//
//	Release date: 02/12/2010
//

dojo.require("dijit.Tree");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.tree.ForestStoreModel");

dojo.declare("tmpdir.CheckBox", dijit.form.CheckBox, {
    // baseClass: [protected] String
    //		Root CSS class of the widget (ex: tmpdirCheckBox), used to add CSS classes of widget
    //		(ex: "tmpdirCheckBox tmpdirCheckBoxChecked tmpdirCheckBoxFocused tmpdirCheckBoxMixed")
    //		See _setStateClass().
    baseClass: "tmpdirCheckBox",
    
    // value: String
    //		As an initialization parameter, equivalent to value field on normal checkbox
    //		(if checked, the value is passed as the value when form is submitted).
    //
    //		However, attr('value') will return either the string or false depending on
    //		whether or not the checkbox is checked.
    //
    value: "unchecked",
    
    _setStateClass: function(){
        // summary:
        //		Update the visual state of the widget by setting the css classes on this.domNode
        //		(or this.stateNode if defined) by combining this.baseClass with	various suffixes 
        //		that represent the current widget state(s).
        //		Overwrites the default _setStateClass method.
        //
        // description:
        //		In the case where a widget has multiple	states, it sets the class based on all 
        //		possible combinations.  For example, an invalid form widget that is being hovered
        //		will be "dijitInput dijitInputInvalid dijitInputHover dijitInputInvalidHover".
        //
        var newStateClasses = this.baseClass.split(" ");
        
        function multiply(modifier){
            newStateClasses = newStateClasses.concat(dojo.map(newStateClasses, function(c){
                return c + modifier;
            }), "dijit" + modifier);
        }
        
        if (this.state) {
            multiply(this.state);
        }
        if (this.attr('value') == "mixed") {
            multiply("Mixed");
        }
        else 
            if (this.checked) {
                multiply("Checked");
            }
        if (this.disabled) {
            multiply("Disabled");
        }
        else 
            if (this._active) {
                multiply(this.stateModifier + "Active");
            }
            else {
                if (this._focused) {
                    multiply("Focused");
                }
                if (this._hovering) {
                    multiply(this.stateModifier + "Hover");
                }
            }
        
        // Remove old state classes and add new ones.
        // For performance concerns we only write into domNode.className once.
        var tn = this.stateNode || this.domNode, classHash = {}; // set of all classes (state and otherwise) for node
        dojo.forEach(tn.className.split(" "), function(c){
            classHash[c] = true;
        });
        
        if ("_stateClasses" in this) {
            dojo.forEach(this._stateClasses, function(c){
                delete classHash[c];
            });
        }
        
        dojo.forEach(newStateClasses, function(c){
            classHash[c] = true;
        });
        
        var newClasses = [];
        for (var c in classHash) {
            newClasses.push(c);
        }
        tn.className = newClasses.join(" ");
        
        this._stateClasses = newStateClasses;
    },
    
    _setValueAttr: function(/*String or Boolean*/newValue){
        // summary:
        //		Handler for value= attribute to constructor, and also calls to attr('value', val).
        //		Overwrites the default '_setValueAttr' function as we will handle the Checkbox 
        //		checked attribute explictly.
        // description:
        //		If passed a string, changes the value attribute of the CheckBox (the one specified 
        //		as "value" when the CheckBox was constructed.
        
        if (typeof newValue == "string") {
            this.value = newValue;
            dojo.attr(this.focusNode, 'value', newValue);
        }
    },
    
    _getValueAttr: function(){
        // summary:
        //		Hook so attr('value') works.
        // description:
        //		Returns the value attribute.
        return this.value;
    }
    
});

dojo.declare("tmpdir.CheckBoxStoreModel", dijit.tree.ForestStoreModel, {
    // checkboxAll: Boolean
    //		If true, every node in the tree will receive a checkbox regardless if the 'checkbox' attribute 
    //		is specified in the dojo.data.
    checkboxAll: true,
    
    // checkboxState: Boolean
    // 		The default state applied to every checkbox unless otherwise specified in the dojo.data.
    //		(see also: checkboxIdent)
    checkboxState: false,
    
    // checkboxRoot: Boolean
    //		If true, the root node will receive a checkbox eventhough it's not a true entry in the store.
    //		This attribute is independent of the showRoot attribute of the tree itself. If the tree
    //		attribute 'showRoot' is set to false the checkbox for the root will not show either.  
    checkboxRoot: false,
    
    // checkboxStrict: Boolean
    //		If true, a strict parent-child checkbox relation is maintained. For example, if all children 
    //		are checked the parent will automatically be checked or if any of the children are unchecked
    //		the parent will be unchecked. 
    checkboxStrict: true,
    
    // checkboxIdent: String
    //		The attribute name (attribute of the dojo.data.item) that specifies the items checkbox initial
    //		state. Example:	{ name:'Egypt', type:'country', checkbox: true }
    //		If a dojo.data.item has no 'checkbox' attribute specified it will depend on the attribute
    //		'checkboxAll' if one will be created automatically and if so what the initial state will be as
    //		specified by 'checkboxState'. 
    checkboxIdent: "checkbox",
    
    // checkboxMState: String
    //		The attribute name (attribute of the dojo.data/item) that will hold the checkbox mixed state. 
    //		The mixed state is seperate from the default checked/unchecked state of a checkbox. The mixed 
    //		state attribute will be either true or false.
    checkboxMState: "mixed",
    
    updateCheckbox: function(/*dojo.data.Item*/storeItem, /*Boolean*/ newState){
        // summary:
        //		Update the checkbox state (true/false) for the store item and the associated parent
        //		and child checkboxes if any. 
        // description:
        //		Update a single checkbox state (true/false) for the store item and the associated parent 
        //		and child checkboxes if any. This function is called from the tree if a user checked
        //		or unchecked a checkbox on the tree. The parent and child tree nodes are updated to 
        //		maintain consistency if 'checkboxStrict' is set to true.
        //	storeItem:
        //		The item in the dojo.data.store whos checkbox state needs updating.
        //	newState:
        //		The new state of the checkbox: true or false
        //	example:
        //	| model.updateCheckboxState(item, true);
        //
        if (!this.checkboxStrict) {
            this._setCheckboxState(storeItem, newState, false); // Just update the checkbox state
        }
        else {
            this._updateChildCheckbox(storeItem, newState); // Update children and parent(s).
        }
    },
    
    getCheckboxState: function(/*dojo.data.Item*/storeItem){
        // summary:
        //		Get the current checkbox state from the dojo.data.store.
        // description:
        //		Get the current checkbox state from the dojo.data store. A checkbox can have three
        //		different states: true, false or undefined. Undefined in this context means no
        //		checkbox identifier (checkboxIdent) was found in the dojo.data store. Depending on
        //		the checkbox attributes as specified above the following will take place:
        //		a) 	If the current checkbox state is undefined and the checkbox attribute 'checkboxAll' or
        //			'checkboxRoot' is true one will be created and the default state 'checkboxState' will
        //			be applied.
        //		b)	If the current state is undefined and 'checkboxAll' is false the state undefined remains
        //			unchanged and is returned. This will prevent any tree node from creating a checkbox.
        //
        //	storeItem:
        //		The item in the dojo.data.store whos checkbox state is returned.
        //	example:
        //	| var currState = model.getCheckboxState(item);
        //		
        var state = {
            checked: undefined,
            mixed: false
        }; // create and initialize state object
        // Special handling required for the 'fake' root entry (the root is NOT a dojo.data.item).
        if (storeItem == this.root) {
            if (typeof(storeItem.checkbox) == "undefined") {
                this.root.checkbox = undefined; // create a new checbox reference as undefined.
                this.root.mixedState = false;
                if (this.checkboxRoot) {
                    this._setCheckboxState(storeItem, this.checkboxState, false);
                    state.checked = this.checkboxState;
                }
            }
            else {
                state.checked = this.root.checkbox;
                state.mixed = this.root.mixedState;
            }
        }
        else { // a valid dojo.store.item
            state.checked = this.store.getValue(storeItem, this.checkboxIdent);
            state.mixed = this.store.getValue(storeItem, this.checkboxMState);
            if (state.checked == undefined && this.checkboxAll) {
                this._setCheckboxState(storeItem, this.checkboxState, false);
                state.checked = this.checkboxState;
            }
        }
        return state // the current state of the checkbox (true/false or undefined)
    },
    
    _setCheckboxState: function(/*dojo.data.Item*/storeItem, /*Boolean*/ newState, /*Boolean*/ mixedState){
        // summary:
        //		Set/update (stores) the checkbox state on the dojo.data store.
        // description:
        //		Set/update the checkbox state on the dojo.data.store. Retreive the current
        //		state of the checkbox and validate if an update is required, this will keep 
        //		update events to a minimum. On completion a 'onCheckboxChange' event is
        //		triggered if required. 
        //		If the current state is undefined (ie: no checkbox attribute specified for 
        //		this dojo.data.item) the 'checkboxAll' attribute is checked	to see if one 
        //		needs to be created. In case of the root the 'checkboxRoot' attribute is checked.
        //		NOTE: the store.setValue function will create the 'checkbox' attribute for the 
        //		item if none exists.   
        //	storeItem:
        //		The item in the dojo.data.store whos checkbox state is updated.
        //	newState:
        //		The new state of the checkbox: true or false
        //	mixedState:
        //		Indicates if a parent checkbox has a mixed state (i.e some children checked but not all)
        //	example:
        //	| model.setCheckboxState(item, true, false);
        //
        var stateChanged = true;
        
        if (storeItem != this.root) {
            var currState = this.store.getValue(storeItem, this.checkboxIdent);
            var currMixed = this.store.getValue(storeItem, this.checkboxMState);
            if ((currState != newState || currMixed != mixedState) && (currState !== undefined || this.checkboxAll)) {
                this.store.setValue(storeItem, this.checkboxIdent, newState);
                this.store.setValue(storeItem, this.checkboxMState, mixedState);
            }
            else {
                stateChanged = false;
            }
        }
        else { // Tree root instance
            if ((this.root.checkbox != newState || this.root.mixedState != mixedState) &&
            (this.root.checkbox !== undefined || this.checkboxRoot)) {
                this.root.checkbox = newState;
                this.root.mixedState = mixedState;
            }
            else {
                stateChanged = false;
            }
        }
        if (stateChanged) { // In case of any changes trigger the update event.
            this.onCheckboxChange(storeItem, mixedState);
        }
        return stateChanged;
    },
    
    _updateChildCheckbox: function(/*dojo.data.Item*/storeItem, /*Boolean*/ newState){
        //	summary:
        //		Set the parent (storeItem) and all child checkboxes to true/false
        //	description:
        //		If a parent checkbox changes state, all child and grandchild checkboxes will be 
        //		updated to reflect the change. For example, if the parent state is set to true, 
        //		all child and grandchild checkboxes will receive that same 'true' state.
        //		If a child checkbox changes state all of its parents need to be re-evaluated.
        //	storeItem:
        //		The parent dojo.data.item whos child/grandchild checkboxes require updating.
        //	newState:
        //		The new state of the checkbox: true or false
        
        if (this.mayHaveChildren(storeItem)) {
            this.getChildren(storeItem, dojo.hitch(this, function(children){
                dojo.forEach(children, function(child){
                    this._updateChildCheckbox(child, newState);
                }, this);
            }), function(err){
                console.error(this, ": updating child checkboxes: ", err);
            });
        }
        else {
            if (this._setCheckboxState(storeItem, newState, false)) {
                this._updateParentCheckbox(storeItem);
            }
        }
    },
    
    _updateParentCheckbox: function(/*dojo.data.Item*/storeItem){
        //	summary:
        //		Update the parent checkbox states depending on the state of all child checkboxes.
        //	description:
        //		Update the parent checkbox states depending on the state of all child checkboxes.
        //		The parent checkbox automatically changes state if ALL child checkboxes are true
        //		or false. If, as a result, the parent checkbox changes state, we will check if 
        //		its parent needs to be updated as well, all the way upto the root. 
        //		NOTE: 	If any of the children have a mixed state, the parent must get a mixed 
        //				state too
        //	storeItem:
        //		The dojo.data.item whos parent checkboxes require updating.
        //
        var parents = this._getParentsItem(storeItem);
        dojo.forEach(parents, function(parentItem){
            this.getChildren(parentItem, dojo.hitch(this, function(children){
                var hasChecked = false, hasUnChecked = false, isMixed = false;
                dojo.some(children, function(child){
                    state = this.getCheckboxState(child);
                    isMixed |= state.mixed;
                    switch (state.checked) { // ignore 'undefined' state
                        case true:
                            hasChecked = true;
                            break;
                        case false:
                            hasUnChecked = true;
                            break;
                    }
                    return isMixed;
                }, this);
                isMixed |= !(hasChecked ^ hasUnChecked);
                // If the parent has a mixed state its checked state is always true.
                if (this._setCheckboxState(parentItem, isMixed ? true : hasChecked, isMixed ? true : false)) {
                    this._updateParentCheckbox(parentItem);
                }
            }), function(err){
                console.error(this, ": fetching mixed state: ", err);
            });
        }, this);
    },
    
    _getParentsItem: function(/*dojo.data.Item*/storeItem){
        // summary:
        //		Get the parent(s) of a dojo.data item.  
        // description:
        //		Get the parent(s) of a dojo.data item. The '_reverseRefMap' entry of the item is
        //		used to identify the parent(s). A child will have a parent reference if the parent 
        //		specified the '_reference' attribute. 
        //		For example: children:[{_reference:'Mexico'}, {_reference:'Canada'}, ...
        //	storeItem:
        //		The dojo.data.item whos parent(s) will be returned.
        //
        var parents = [];
        
        if (storeItem != this.root) {
            var references = storeItem[this.store._reverseRefMap];
            for (itemId in references) {
                parents.push(this.store._itemsByIdentity[itemId]);
            }
            if (!parents.length) {
                parents.push(this.root);
            }
        }
        return parents // parent(s) of a dojo.data.item (Array of dojo.data.items)
    },
    
    validateData: function(/*dojo.data.Item*/storeItem, /*thisObject*/ scope){
        // summary:
        //		Validate/normalize the parent-child checkbox relationship if the attribute
        //		'checkboxStrict' is set to true. This function is called as part of the post 
        //		creation of the Tree instance. First we try a forced synchronous load of the
        //		Json datafile dramatically improving the startup time.
        //	storeItem:
        //		The element to start traversing the dojo.data.store, typically the tree root
        //	scope:
        //		The scope to use when executing this method.
        
        if (scope.checkboxStrict) {
            try {
                scope.store._forceLoad(); // Try a forced synchronous load
            } 
            catch (e) {
                console.log(e);
            }
            dojo.hitch(scope, scope._validateStore)(storeItem);
        }
    },
    
    _validateStore: function(/*dojo.data.Item*/storeItem){
        // summary:
        //		Validate/normalize the parent(s) checkbox data in the dojo.data store.
        // description:
        //		All parent checkboxes are set to the appropriate state according to the actual 
        //		state(s) of their children. This will potentionally overwrite whatever was 
        //		specified for the parent in the	dojo.data store. This will garantee the tree 
        //		is in a consistent state after startup.
        //	storeItem:
        //		The element to start traversing the dojo.data.store, typically model.root
        //	example:
        //	| this._validateStore( storeItem );
        //
        this.getChildren(storeItem, dojo.hitch(this, function(children){
            var hasGrandChild = false, oneChild = null;
            dojo.forEach(children, function(child){
                if (this.mayHaveChildren(child)) {
                    this._validateStore(child);
                    hasGrandChild = true;
                }
                else {
                    oneChild = child;
                }
            }, this);
            if (!hasGrandChild && oneChild) { // Find a child on the lowest branches
                this._updateParentCheckbox(oneChild);
            }
        }), function(err){
            console.error(this, ": validating checkbox data: ", err);
        });
    },
    
    onCheckboxChange: function(/*dojo.data.Item*/storeItem){
        // summary:
        //		Callback whenever a checkbox state has changed state, so that 
        //		the Tree can update the checkbox.  This callback is generally
        //		triggered by the '_setCheckboxState' function. 
        // tags:
        //		callback
    }
    
});

dojo.declare("tmpdir._CheckBoxTreeNode", dijit._TreeNode, {
    // _checkbox: [protected] dojo.doc.element
    //		Local reference to the dojo.doc.element of type 'checkbox'
    _checkbox: null,
    
    _createCheckbox: function(){
        // summary:
        //		Create a checkbox on the CheckBoxTreeNode
        // description:
        //		Create a checkbox on the CheckBoxTreeNode. The checkbox is ONLY created if a
        //		valid checkbox attribute was found in the dojo.data store or the attribute 
        //		'checkboxAll' is set to true. 
        //		If the 'checked' property of the state is 'undefined' no reference was found
        //		and if 'checkboxAll' is set to false no checkbox will be created.
        //		NOTE: the attribute 'checkboxAll' is validated by the _getCheckboxState function
        //			  therefore no need to do it here. (see _getCheckboxState for details).
        //		
        var state = this.tree.model.getCheckboxState(this.item);
        if (state.checked !== undefined) {
            if (this.tree.checkboxStyle == "dijit") {
                this._checkbox = new tmpdir.CheckBox().placeAt(this.expandoNode, 'after');
            }
            else {
                this._checkbox = dojo.doc.createElement('input');
                this._checkbox.className = 'tmpdirHTMLCheckBox';
                this._checkbox.type = 'checkbox';
                dojo.place(this._checkbox, this.expandoNode, 'after');
            }
            this._setCheckedState(state);
        }
        if (this.isExpandable) {
            if (!this.tree.branchIcons) {
                dojo.removeClass(this.iconNode, "dijitTreeIcon");
            }
        }
        else {
            if (!this.tree.nodeIcons) {
                dojo.removeClass(this.iconNode, "dijitTreeIcon");
            }
        }
    },
    
    _setCheckedState: function( /*Object*/state){
        // summary:
        //		Update the 'checked' and 'value' attributes of a HTML or dijit checkbox.
        // description:
        //		Update the checkbox 'checked' state and 'value'. Considering a checkbox can only have a
        //		'checked/unchecked' state the thru state 'checked/unchecked/mixed' is store in the value
        //		property of the checkbox. The visual aspect of a mixed checkbox state is only supported
        //		when using the dijit style checkbox (default).
        //	state:
        //		The state argument is an object with two properties: 'checked' and 'mixed' 
        
        if (this.tree.checkboxStyle == "dijit") {
            if (this.tree.checkboxMultiState) {
                this._checkbox.attr('value', state.mixed ? "mixed" : state.checked ? "checked" : "unchecked");
            }
            else {
                this._checkbox.attr('value', state.checked ? "checked" : "unchecked");
            }
            this._checkbox.attr('checked', state.checked);
        }
        else { // HTML native checkbox
            if (this.tree.checkboxMultiState) {
                this._checkbox.value = state.mixed ? "mixed" : state.checked ? "checked" : "unchecked";
            }
            else {
                this._checkbox.value = state.checked ? "checked" : "unchecked";
            }
            this._checkbox.checked = state.checked;
        }
    },
    
    _getCheckedState: function(){
        // summery:
        //		Get the current checked state of the checkbox.
        // description:
        //		Get the current checked state of the checkbox. It returns true or false.
        
        return this._checkbox.checked;
    },
    
    postCreate: function(){
        // summary:
        //		Handle the creation of the checkbox after the CheckBoxTreeNode has been instanciated.
        // description:
        //		Handle the creation of the checkbox after the CheckBoxTreeNode has been instanciated.
        this._createCheckbox();
        this.inherited(arguments);
    }
    
});

dojo.declare("tmpdir.CheckBoxTree", dijit.Tree, {
    // checkboxStyle: String
    //		Sets the style of the checkbox to be used. The default is "dijit" anything else will force the
    //		use of the native HTML style checkbox. The visual representation of a mixed state checkbox is
    //		only supported with a dijit style checkbox. 
    checkboxStyle: "dijit",
    
    // checkboxMultiState: Boolean
    //		Determines if Multi State checkbox behaviour is required, default is true. If set to false the
    //		value property of a checkbox will only be 'checked' or 'unchecked'. If true the value can be
    //		'checked', 'unchecked' or 'mixed'
    checkboxMultiState: true,
    
    // branchIcons: Boolean
    //		Determines if the FolderOpen/FolderClosed icon is displayed.
    branchIcons: true,
    
    // nodeIcons: Boolean
    //		Determines if the Leaf icon is displayed.
    nodeIcons: true,
    
    onNodeChecked: function(/*dojo.data.Item*/storeItem, /*treeNode*/ treeNode){
        // summary:
        //		Callback when a checkbox tree node is checked
        // tags:
        //		callback
    },
    
    onNodeUnchecked: function(/*dojo.data.Item*/storeItem, /* treeNode */ treeNode){
        // summary:
        //		Callback when a checkbox tree node is unchecked
        // tags:
        //		callback
    },
    
    _onClick: function(/*TreeNode*/nodeWidget, /*Event*/ e){
        // summary:
        //		Translates click events into commands for the controller to process
        // description:
        //		the _onClick function is called whenever a 'click' is detected. This
        //		instance of _onClick only handles the click events associated with
        //		the checkbox whos DOM name is INPUT.
        // 
        var domElement = e.target;
        
        // Only handle checkbox clicks here
        if (domElement.nodeName != 'INPUT') {
            return this.inherited(arguments);
        }
        this._publish("execute", {
            item: nodeWidget.item,
            node: nodeWidget
        });
        // Go tell the model to update the checkbox state
        this.model.updateCheckbox(nodeWidget.item, nodeWidget._getCheckedState());
        // Generate some additional events
        this.onClick(nodeWidget.item, nodeWidget, e);
        if (nodeWidget._getCheckedState()) {
            this.onNodeChecked(nodeWidget.item, nodeWidget);
        }
        else {
            this.onNodeUnchecked(nodeWidget.item, nodeWidget);
        }
        this.focusNode(nodeWidget);
        if (this.checkboxStyle == "dijit") 
            dojo.stopEvent(e);
    },
    
    _onCheckboxChange: function(/*dojo.data.Item*/storeItem){
        // summary:
        //		Process notification of a change to a checkbox state (triggered by the model).
        // description:
        //		Whenever the model changes the state of a checkbox in the dojo.data.store it will 
        //		trigger the 'onCheckboxChange' event allowing the Tree to make the same changes 
        //		on the tree Node. There is a condition however when we get a checkbox update but 
        //		the associated tree node does not exist:
        //		- The node has not been created yet because the user has not expanded the tree/branch
        //		  or the initial data validation triggered the update in which case there are no
        //		  tree nodes at all.
        // tags:
        //		callback
        
        var model = this.model, state = model.getCheckboxState(storeItem), identity = model.getIdentity(storeItem), nodes = this._itemNodesMap[identity];
        
        // As of dijit.Tree 1.4 multiple references (parents) are supported, therefore we may have
        // to update multiple nodes which are all associated with the same dojo.data.item.
        if (nodes) {
            dojo.forEach(nodes, function(node){
                if (node._checkbox != null) 
                    node._setCheckedState(state);
            }, this);
        }
    },
    
    postCreate: function(){
        // summary:
        //		Handle any specifics related to the tree and model after the instanciation of the Tree. 
        // description:
        //		Validate if we have a 'write' store first. Subscribe to the 'onCheckboxChange' event 
        //		(triggered by the model) and kickoff the initial checkbox data validation.
        //
        var store = this.model.store;
        if (!store.getFeatures()['dojo.data.api.Write']) {
            throw new Error("tmpdir.CheckboxTree: store must support dojo.data.Write");
        }
        this.connect(this.model, "onCheckboxChange", "_onCheckboxChange");
        this.model.validateData(this.model.root, this.model);
        this.inherited(arguments);
    },
    
    _createTreeNode: function(args){
        // summary:
        //		Create a new CheckboxTreeNode instance.
        // description:
        //		Create a new CheckboxTreeNode instance.
        return new tmpdir._CheckBoxTreeNode(args);
    }
    
});
