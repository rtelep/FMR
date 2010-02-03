// http://books.couchdb.org/relax/design-documents/lists

/**
 * List Function
 *  Show all top-level Posts; this is the index.  Use templates/index.html
 */

function(head, req){
    // !code helpers/template.js
    // !code _attachments/fmrJS/fmr.js
    // !json templates.index
    var row;
    start({"code": 200, "headers": {"Content-Type" : "text/html"}});
    send('<html><body>');
    while(row = getRow()) {
        send(template(templates.index, {
               author: row.value.author
            ,  title: get_title(row.value)
            ,  permalink: get_permalink(row.value)
        }));
    }
    send('</body></html>')
}