/**
 * @fileoverview  Model a thread
 * @requires _attachment/fmrJS/fmr.js
 */

function Thread(rows){
    var Thread = this;
    Thread.rows = rows.sort(sort_rows_by_date_newest_first);
    Thread.docs = [];
    Thread.html = '';    
    Thread.id_to_index = {};    

    // Get docs from rows
    for (var i in Thread.rows){
        Thread.docs.push(Thread.rows[i].value);
    }

    // Map _ids to indexes
    for (var i in Thread.docs){
        var doc = Thread.docs[i];
        Thread.id_to_index[doc._id] = i;
    }

    // Add indexed path to each doc:  [1], [1,3] etc.
    // also add an indentation factor
    for (var i in Thread.docs){
        var _id;
        var indexed_path = []
        var doc = Thread.docs[i];
        for (var n in doc.path){
            _id = doc.path[n];
            if (! _id){continue};
            indexed_path.push(Thread.id_to_index[_id]);
        }
        indexed_path.push(Thread.id_to_index[doc._id]);
        doc['indexed_path'] = indexed_path;
        doc['indentation'] = doc.indexed_path.length - 1;
    }


    // Now sort docs by indexed_path
    Thread.docs.sort(sort_docs_by_indexed_path);
    
    return true;
}



