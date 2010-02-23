/**
 * Map View Function
 *  get all top-level posts
 */
function is_post(doc){
    return doc.author && doc.title;  // Enforce Title, not Body
}

function is_top_level_post(doc){
    return is_post(doc) && !doc.path[0]; 
}

function(doc){
    if (is_top_level_post(doc)){
        emit(null, doc);
    }
}
