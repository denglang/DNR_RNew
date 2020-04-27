var worldgroupedVisibleLayers = new dojox.collections.ArrayList();
var worldgroupedStore, worldgroupedModel, worldgroupedTree;
function initWorldGroupedTree(){
    worldgroupedStore = new dojo.data.ItemFileWriteStore({
        url: "./datastore/worldgrouped.json"
    });
    worldgroupedModel = new tmpdir.CheckBoxStoreModel({
        store: worldgroupedStore,
        // query: {
        //     // type: 'grouplayer'
        //     type: 'layer'
        // },
        rootLabel: 'WorldGrouped',
        checkboxAll: true,
        checkboxRoot: false,
        checkboxState: true,
        // TODO
        checkboxStrict: false,
        checkboxIdent: "visible"
    });
    worldgroupedTree = new tmpdir.CheckBoxTree({
        model: worldgroupedModel,
        id: "worldgroupedMenuTree"
    }, "worldgroupedCheckboxTree");
    dojo.connect(worldgroupedTree, "onNodeChecked", function(storeItem, nodeWidget){
        // console.debug(storeItem.name + "[" + storeItem.id + "] got checked..");
        worldgroupedCheckLayer(storeItem, nodeWidget);
    });
    dojo.connect(worldgroupedTree, "onNodeUnchecked", function(storeItem, nodeWidget){
        // console.debug(storeItem.name + "[" + storeItem.id + "] got unchecked..");
        worldgroupedCheckLayer(storeItem, nodeWidget);
    });
}

/**
 *
 * @param {Object} storeItem
 * @param {Object} nodeWidget
 */
function worldgroupedCheckLayer(storeItem, nodeWidget){
    var storeItemId = storeItem.id;
    worldgroupedStore.fetch({
        query: {},
        queryOptions: {
            deep: true
        },
        onBegin: worldgroupedFetchPrepare,
        onComplete: worldgroupedCheckFetchCompleted,
        onError: worldgroupedFetchFailed
    });
}


/**
 *
 * @param {Object} items
 * @param {Object} request
 */
function worldgroupedCheckFetchCompleted(items, request){
    // AGS 10: check if any layer is checked, otherwise push ID '-1'
    // debugger;
    dojo.forEach(items, function(item){
        // alert("RI: " + item._RI)
        if (item._RI != null && item._RI == true) {
            recursiveChildren(item);
        }
    });
    
    console.debug("Check/Uncheck Completed: " + worldgroupedVisibleLayers.toArray());
    
    // debugger;
    if (worldgroupedVisibleLayers.count == 0) {
        worldgroupedService.setVisibleLayers([-1]);
    }
    else {
        worldgroupedService.setVisibleLayers(worldgroupedVisibleLayers.toArray());
    }
}

function recursiveChildren(item){
    // debugger;
    if (item.type == "grouplayer") {
        if (item.visible[0] == true) {
            dojo.forEach(item.children, function(child){
                recursiveChildren(child);
            });
        }
        // else nothing.
    }
    else { // leaves
        if (item.visible[0] == true) {
            worldgroupedVisibleLayers.add(item.id);
        }
    }
    
}

/**
 *
 * @param {Object} size
 * @param {Object} request
 */
function worldgroupedFetchPrepare(size, request){
    worldgroupedVisibleLayers.clear();
}


/**
 *
 * @param {Object} error
 * @param {Object} request
 */
function worldgroupedFetchFailed(error, request){
    alert("lookup failed.");
    alert(error);
}
