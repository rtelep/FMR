/**
 * Show Function
 *  show a Post, use templates/post.html
 */

function(doc, req) {
    // !code helpers/template.js
    // !json templates.post
    if (doc) {
        return template(templates.post, {
                author: doc.author
            ,   title:  doc.title
            ,   body: doc.body
            ,   path: doc.path
        });
    } else {
        return "not found";
    }
}
