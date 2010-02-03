/**
 * Flanderous Music Repository
 */

function get_permalink(doc) {
    var uuid, anchor;
    if (!is_top_level_post(doc)){
        uuid = doc.path[0];
        anchor = doc._id;
    } else {
        uuid = doc._id;
    }
    url = '/fmr/_design/couchapp_fmr/_list/thread/by_path?key="'+uuid+'"';
    if (anchor){
        url += '#'+anchor;
    }
    return url
}

function get_title(doc){
    return doc.title?doc.title:'';
}

function get_body(doc){
    if (is_top_level_post(doc)){
        return doc.body;
    } else {
        return '<p>'+doc.body+'</p>';
    }
}

/**
 * Sorting
 */

function sort_rows_by_date_newest_first(row_a, row_b){
    if (row_a.value.ts_created > row_b.value.ts_created) {
        return 1
    } else {
        return -1
    }
}

function sort_rows_by_date_oldest_first(row_a, row_b){
    if (row_a.value.ts_created > row_b.value.ts_created) {
        return -1
    } else {
        return 1
    }
}

function sort_docs_by_indexed_path(doc_a, doc_b){
    // [1,2,3] , [1,2], [1], [1,4]  -> [1], [1,2], [1,2,3], [1,4]
    var a = doc_a.indexed_path;
    var b = doc_b.indexed_path;
    var p = a.length>b.length?a.length:b.length;
    for (var i=0; i<=p; i++){
        // Optimize this algorithm?
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
 */

function is_post(doc){
    return doc.author && doc.body;
}

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0]; 
}

