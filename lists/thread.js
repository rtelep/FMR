/**
 * List Function
 *  Show a thread; use templates/thread.html.
 */

function(head, req){
    // !code helpers/template.js
    // !code _attachments/fmrJS/fmr.js
    // !json templates.thread

    start({"code": 200, "headers": {"Content-Type" : "text/html"}});

    var rows = [];
    var row;
    while(row = getRow()) {
        rows.push(row.value);
    }

    // Sort
    rows.sort(sort_by_date);

    send('<html><body>');
    for (var i in rows) {
        var doc = rows[i]
        send(template(templates.thread, {
               author: doc.author
            ,  title: get_title(doc)
            ,  body: get_body(doc)
            ,  permalink: get_permalink(doc)
        }));
    }
    send('</body></html>')
}