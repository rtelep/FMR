/**
 * List Function
 *  Show a thread;
 */

function(head, req){
    // !code _attachments/fmrJS/settings.js
    // !code _attachments/lib/template.js
    // !code _attachments/fmrJS/fmr.js
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
    send('<input type="hidden" name="thread_id" value="'+t.id+'" />');
    for (var i in t.docs){
        var doc = t.docs[i];
        send(template(templates.doc, {
               author: doc.author
            ,  _id: doc._id
            ,  title: get_title(doc)
            ,  permalink: doc.permalink
            ,  body: doc.body
            ,  indentation: doc.indentation
            ,  path: doc.path_str
            ,  root: settings.root
            ,  attachment_html: doc.attachment.html
        }));
    }
    
    
    send(template(templates.tail, {root: settings.root}));
}