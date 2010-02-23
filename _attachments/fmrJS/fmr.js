/**
 * Flanderous Music Repository
 * ===========================
 */


/**
 * Utilities
 */

function get_permalink(doc) {
    var uuid, anchor;
    if (!is_top_level_post(doc)){
        uuid = doc.path[0];
        anchor = doc._id;
    } else {
        uuid = doc._id;
    }
    url = settings.root+'/_list/thread/by_path?key="'+uuid+'"';
    if (anchor){
        url += '#'+anchor;
    }
    return url
}

function get_title(doc){
    return doc.title?doc.title:'';
}

//function get_body(doc){
//    if (is_top_level_post(doc)){
//        return doc.body;
//    } else {
//        return '<p>'+doc.body+'</p>';
//    }
//}

function get_path_str(doc){
    // comma-separated _id string
    return doc.path.join(',');
}

function get_path_from_str(str){
    // array from comma-separated str.
    return str.split(',');
}

function get_path_str_from_parent_obj(obj){
    // Given a parent doc div, return a path str for a child
    return obj.attr('path')?obj.attr('path')+','+obj.attr('id'):obj.attr('id');
}

function get_path_str_of_parent(doc){
    // Given a doc, return the path string of its parent
    return doc.path_str.split(',').slice(0,-1).join(',');
}

function get_indexed_path(doc, id_to_index){
    var _id;
    var indexed_path = []
    for (var n in doc.path){
        _id = doc.path[n];
        if (! _id){continue};
        indexed_path.push(id_to_index[_id]);
    }
    indexed_path.push(id_to_index[doc._id]); // Each doc has its own id in its path
    return indexed_path;
}

/**
 * Sorting
 */

function sort_docs_by_date_newest_first(doc_a, doc_b){
    if (doc_a.date > doc_b.date) {
        return 1
    } else {
        return -1
    }
}

function sort_docs_by_indexed_path(doc_a, doc_b){
    // [1,2,3] , [1,2], [1], [1,4]  -> [1], [1,2], [1,2,3], [1,4]
    var a = doc_a.indexed_path;
    var b = doc_b.indexed_path;
    var p = a.length>b.length?a.length:b.length;
    for (var i=0; i<=p; i++){
        // Optimize this?
        if (a[i] == b[i]) {
            // undefined, undefined
            if (a[i]==undefined){
                return 0
            // 1, 1
            } else {
                continue
            }
        // undefined, 1
        } else if (a[i]==undefined){
            return -1
        // 1, undefined
        } else if (b[i]==undefined){
            return 1
        // 1, 2
        } else if (a[i]<b[i]){
            return -1
        // 2, 1
        } else {
            return 1
        }
    }

    return 0;

};


/**
 * Duck Typing for Posts
 *  These functions are duplicated in both view functions.
 */

function is_post(doc){
    return doc.author && doc.title;  // Enforce Title, not Body
}

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0]; 
}

/**
 * Model a thread
 */

function Thread(rows){
    var Thread = this;
    Thread.rows = rows;
    Thread.docs = [];
    Thread.html = '';    
    Thread.id_to_index = {};    

    // Get docs from rows
    for (var i in Thread.rows){
        Thread.docs.push(Thread.rows[i].value);
    }

    // Map _ids to indexes
    Thread.map_ids_to_indexes = function(){
        for (var i in Thread.docs){
            var doc = Thread.docs[i];
            Thread.id_to_index[doc._id] = i;
        }
    };
    
    Thread.add_doc_fields = function(){
        // Add indexed path to each doc:  [1], [1,3] etc.
        // also add useful fields
        for (var i in Thread.docs){
            var doc = Thread.docs[i];
            doc['indexed_path'] = get_indexed_path(doc, Thread.id_to_index);
            doc['indentation'] = (doc.indexed_path.length - 1) * 40;  // Indentation factor buried here.
            doc['permalink'] = get_permalink(doc);
            doc['path_str'] = get_path_str(doc);
        }
    };

    // Sort docs by indexed_path
    Thread.sort = function(){
        Thread.docs.sort(sort_docs_by_date_newest_first);
        Thread.docs.sort(sort_docs_by_indexed_path);
    };
    
    Thread.add_doc = function(doc){
        Thread.docs.push(doc);
        Thread.map_ids_to_indexes();
        Thread.sort();
    };
    
    Thread.map_ids_to_indexes();
    Thread.add_doc_fields();
    Thread.sort();
    
    return true;
}





try{window}catch(e){window={};};
try{console}catch(e){console={};};

if (!window.console || !console)
{
  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", 
               "dirxml", "group", "groupEnd", "time", "timeEnd", "count", 
               "trace", "profile", "profileEnd"];
  window.console = {};
  for (var i = 0; i < names.length; ++i)
    window.console[names[i]] = function() {}
}


