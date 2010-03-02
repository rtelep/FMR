/**
 * Show Function
 *  This isn't being used anywhere.
 */

function(doc, req) {
    // !code _attachments/fmrJS/settings.js
    // !code _attachments/lib/template.js
    // !json templates.doc
    if (doc) {
        return template(templates.doc, {
                author: doc.author
            ,   id:  doc._id
            ,   title:  doc.title
            ,   body: doc.body
            ,   path: doc.path
            ,   root: settings.root
        });
    } else {
        return "not found";
    }
}
