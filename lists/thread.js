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
        // Doc may have an attachment currently being uploaded, skip these.
        if (doc.has_attachment && !doc.html){
            continue
        }
        send(template(templates.doc,doc));
    }
    
    
    send(template(templates.tail, {root: settings.root}));
}