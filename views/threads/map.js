/**
 * Map View Function
 *  get all top-level posts
 */

function(doc){
    // !code _attachments/fmrJS/fmr.js
    if (is_top_level_post(doc)){
        emit(null, doc);
    }
}
