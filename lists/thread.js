/**
 * List Function
 *  Show a thread;
 */

function(head, req){
    // !code _attachments/settings.js
    // !code helpers/template.js
    // !code _attachments/fmrJS/fmr.js
    // !code _attachments/fmrJS/thread.js
    // !json templates.head
    // !json templates.doc
    // !json templates.tail

    start({"code": 200, "headers": {"Content-Type" : "text/html"}});

    var rows = [];
    var row;
    while(row = getRow()) {
        rows.push(row);
    }

    var t = new Thread(rows);

    send(template(templates.head, {root: settings.root}));
    
    for (var i in t.docs){
        var doc = t.docs[i];
        send(template(templates.doc, {
               author: doc.author
            ,  id: doc._id
            ,  title: get_title(doc)
            ,  permalink: get_permalink(doc)
            ,  body: doc.body
            ,  indentation: doc.indentation * settings.indendation_factor
            ,  path: get_path_string(doc)
            ,  root: settings.root
        }));
    }
    
    
    send(template(templates.tail, {root: settings.root}));
}