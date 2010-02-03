/**
 * Map View Function
 *  organize posts by path
 */

function(doc){
    // !code _attachments/fmrJS/fmr.js
    if (is_top_level_post(doc)){
        // Include the parent of them all;
        emit([doc._id], doc);
    } else {
        emit(doc.path, doc);
    }
}



