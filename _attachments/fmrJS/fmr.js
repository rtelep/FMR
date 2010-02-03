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
    url = '/fmr/_design/couchapp_fmr/_list/thread/by_path?key=["'+uuid+'"]';
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

function sort_rows_by_date_newest_first(doc_a, doc_b){
    if (doc_a.ts_created > doc_b.ts_created) {
        return 1
    } else {
        return -1
    }
}

function sort_rows_by_date_oldest_first(doc_a, doc_b){
    if (doc_a.ts_created > doc_b.ts_created) {
        return -1
    } else {
        return 1
    }
}

function sort_by_path(doc_a, doc_b){
    if (doc_a.path.length > doc_b.path.length){
        return -1
    } else if (doc_a.path.length == doc_b.path.length) {
        return 0
    } else {
        return 1
    }
}



/**
 * Duck Typing for Posts
 */

function is_post(doc){
    return doc.author && doc.body;
}

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0];
}

