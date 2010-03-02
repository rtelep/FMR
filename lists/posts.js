// http://books.couchdb.org/relax/design-documents/lists

/**
 * List Function
 *  Show all top-level Posts;  This is the index page.
 */

function(head, req){
    // !code _attachments/fmrJS/settings.js
    // !code _attachments/lib/template.js
    // !code _attachments/fmrJS/fmr.js
    // !json templates.head
    // !json templates.row
    // !json templates.tail

    start({"code": 200, "headers": {"Content-Type" : "text/html"}});
    
    var row;
    var rows = [];
    while(row = getRow()) {
        rows.push(row);
    }

    var index = new Index(rows);

    send(template(templates.head, {root: settings.root}));

    for (var i in index.docs) {
        var doc = index.docs[i];
        if (doc.attachment_pending){
            continue
        }
        send(template(templates.row, doc));
    }
    
    send(template(templates.tail, {root: settings.root}));
}