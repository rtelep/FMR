/**
 * List Function
 *  Show a thread; use templates/thread.html.
 */

function(head, req){
    // !code helpers/template.js
    // !code _attachments/fmrJS/fmr.js
    // !code _attachments/fmrJS/thread.js
    // !json templates.doc

    start({"code": 200, "headers": {"Content-Type" : "text/html"}});

    var rows = [];
    var row;
    while(row = getRow()) {
        rows.push(row);
    }

    var t = new Thread(rows);

    send('<html><body>');
    
    for (var i in t.docs){
        var doc = t.docs[i];
        send(template(templates.doc, {
               author: doc.author
            ,  title: get_title(doc)
            ,  permalink: get_permalink(doc)
            ,  body: doc.body
            ,  indentation: doc.indentation*20
        }));
    }
    
    
    send('</body></html>')
}