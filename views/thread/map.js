/**
 * Map View Function
 *  get all descendants
 */

function(doc){
    // !code _attachments/fmrJS/fmr.js
    if (is_top_level_post(doc)){
        emit(doc.title, doc);
    } else {
        for (var i in doc.path){
            emit([doc.path[i], doc.path], doc);
        }
    }
}



