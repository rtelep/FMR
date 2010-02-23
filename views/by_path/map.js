/**
 * Map View Function
 *  organize posts by path
 */
function is_post(doc){
    return doc.author && doc.title;  // Enforce Title, not Body
}

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0]; 
}

function(doc){
    if (is_top_level_post(doc)){
        // Include the parent of them all;
        emit(doc._id, doc);
    } else {
        emit(doc.path[0], doc);
    }
}



