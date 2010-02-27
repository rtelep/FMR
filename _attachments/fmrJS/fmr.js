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
};

function get_title(doc){
    return doc.title?doc.title:'';
};

function get_path_str(doc){
    // comma-separated _id string
    return doc.path.join(',');
};

function get_path_from_str(str){
    // array from comma-separated str.
    return str.split(',');
};

function get_path_str_from_parent_obj(obj){
    // Given a parent doc div, return a path str for a child
    return obj.attr('path')?obj.attr('path')+','+obj.attr('id'):obj.attr('id');
};

function get_path_str_of_parent(doc){
    // Given a doc, return the path string of its parent
    return doc.path_str.split(',').slice(0,-1).join(',');
};

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
};

/**
 * Sorting
 */

function sort_docs_by_date_oldest_first(doc_a, doc_b){
    if (doc_a.date > doc_b.date) {
        return 1
    } else {
        return -1
    }
};

function sort_docs_by_date_newest_first(doc_a, doc_b){
    if (doc_a.date > doc_b.date) {
        return -1
    } else {
        return 1
    }
};


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
};

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0]; 
};

/**
 * Model a thread
 */

function Thread(rows){
    var Thread = this;
    Thread.rows = rows;
    Thread.docs = [];
    Thread.html = '';
    Thread.id = null;
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
            doc['attachment'] = new Attachment(doc)
            doc['attachment_html'] = doc.attachment.html; // simplify template rendering
        }
    };

    // Sort
    Thread.sort = function(){
        // Sort by date
        Thread.docs.sort(sort_docs_by_date_oldest_first);
        // Map ids to indexes
        Thread.map_ids_to_indexes();
        // Add fields including indexed_path for further sorting
        Thread.add_doc_fields();
        // Sort by indexed path
        Thread.docs.sort(sort_docs_by_indexed_path);
    };
    
    Thread.add_doc = function(doc){
        Thread.docs.push(doc);
        Thread.sort();
    };
    
    Thread.sort();  // phew
    
    Thread.id = Thread.docs[0]._id;
    
    return true;
};


/**
 * Model the index
 */

function Index(rows){
    var Index = this;
    Index.rows = rows;
    Index.docs = [];

    // Get docs from rows
    for (var i in Index.rows){
        var row = Index.rows[i];
        var doc = {
                author: row.value.author
            ,  _id: row.value._id
            ,  title: get_title(row.value)
            ,  permalink: get_permalink(row.value)
            ,  root: settings.root
            ,  date: row.value.date
            ,  responses: row.value.responses?row.value.responses:0
        }
        Index.docs.push(doc);
    }
    
    Index.docs.sort(sort_docs_by_date_newest_first);

    return true;
}

/**
 * Model an attachment
 */

function Attachment(doc){
    //{"Foo.jpg":{"stub":true,"content_type":"image/jpeg","length":32923,"revpos":2}}
    // only consider first attachment, we'll keep one att per doc.

    var Att = this;

    try{console.log(doc);}catch(e){};

    if (! doc.has_attachment){
        Att.html = ''; // no attachment on this doc, this object is a dummy.
    } else {
        
        // The doc may not be uploaded at this time, but it's coming.
        try{
            Att.fn = get_keys(doc._attachments)[0];
            Att.content_type = doc._attachments[Att.fn].content_type;
            Att.length = doc._attachments[Att.fn].length;
            Att.url = '/'+[settings.root.split('/')[1], doc._id, Att.fn].join('/');  // a hack
            if (Att.content_type.split('/')[0] == 'image'){
                Att.html = '<img class="attachment" src="'+Att.url+'" />';
            } else {
                Att.html = '<a href="'+ Att.url +'">attachment</a>'
            }
        } catch(e){
            Att.html = '<span class="attachment_pending"><img src="'+settings.root+'/img/spinner.gif" /> uploading</span>';
        }
    }
    
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

get_keys = function (l){
  var keys = [];
  for(i in l) if (l.hasOwnProperty(i)){
    keys.push(i);
  }
  return keys;
}

