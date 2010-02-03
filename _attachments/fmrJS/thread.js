/**
 * @fileoverview  Model a thread
 * @requires helpers/fmr.js
 */

function Thread(docs){
    var Thread = this;
    Thread.rows = docs.sort(sort_rows_by_date_oldest_first);
    Thread.doc_arrays_hash = {};
    Thread.path_index = []; // a sortable array of indices to doc_arrays_hash
    
    
    // Put like paths together
    var doc, parent;
    for (var i in Thread.rows){
        doc = Thread.rows[i].value;
        
        if (is_top_level_post(doc)){
            parent = 0;
        } else {
            parent = doc.path.join('-')
        }
        
        if (!Thread.doc_arrays_hash[parent]){
            Thread.doc_arrays_hash[parent] = [];
        }
        Thread.doc_arrays_hash[parent].push(doc);

        // Add the index
        if (! array_contains(parent, Thread.path_index)){
            Thread.path_index.push(parent);
        }

    }

    // Sort the doc_arrays by timestamp?

    // Sort the indices
    Thread.path_index.sort();
    
    Thread.render = function(){
    
    };
    
    return true;
}


function array_contains(item, l){
    for (var i in l){
        if (l[i] == item){
            return true
        }
    }
    return false
}