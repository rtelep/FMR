// http://books.couchdb.org/relax/design-documents/lists

/**
 * List Function
 *  Show all top-level Posts;  This is the index page.
 */

function(head, req){
    // !code _attachments/settings.js
    // !code helpers/template.js
    // !code _attachments/fmrJS/fmr.js
    // !json templates.head
    // !json templates.row
    // !json templates.tail

    var row;
    start({"code": 200, "headers": {"Content-Type" : "text/html"}});
    send(template(templates.head, {root: settings.root}));
    while(row = getRow()) {
        send(template(templates.row, {
               author: row.value.author
            ,  title: get_title(row.value)
            ,  permalink: get_permalink(row.value)
            ,  root: settings.root
        }));
    }
    send(template(templates.tail, {root: settings.root}));
}