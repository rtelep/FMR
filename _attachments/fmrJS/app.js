wmd_options = { autostart: false };

$.couch.app(function(app) { 
  
  app.getTemplate = function(template, fn){
    // Asynchronously get a template from the design doc.
    //  We're doing this so we can use the same template here and on the server.
    var template;
    $.ajax({
          url: '/fmr/_design/couchapp_fmr/'
        , async: false
        , success: function(data){
          template = data.templates[template];
          //fn(data.templates[template])
        }
        , dataType: 'json'
    });
    return template;
  }

  app.doc_template = app.getTemplate('doc');  // doc in a threaded view
  app.row_template = app.getTemplate('row');  // doc on index page, top-level posts only.
  
  app.showLoggedIn = function(name){
      $('#username').html(name);
      $('#session #logged_out').hide();
      $('#session #logged_in').show();
  };

  app.showLoggedOut = function(){
      $('#session #logged_in').hide();
      $('#session #logged_out').show();
  };

  app.session = function(){
    $.getJSON('/_session/', function(data){
      if (data.name) {
        app.showLoggedIn(data.name);
      } else {
        app.showLoggedOut();
      }
    })  
  };

  $('#test').click(function(){
    var doc = {name: 'testing', foo: 'bar'}
    var uuid = app.db.saveDoc(doc, {
          success: function(resp){
            console.log(resp);
          },
          error: function(status, error, reason){
            console.log(status);  // 403
            console.log(error);   // forbidden
            console.log(reason);  // Please log in
          }
      });
  });

  
  app.WmdInstances = [];
  
  app.createWmdInstance = function () {
  
      /***** Make sure WMD has finished loading *****/
      if (!Attacklab || !Attacklab.wmd) {
          alert("WMD hasn't finished loading!");
          return;
      }
  
      var textarea = $('#post_form TEXTAREA')[0];
      var previewDiv = $('#preview')[0];
  
      /***** build the preview manager *****/
      var panes = {input:textarea, preview:previewDiv, output:null};
      var previewManager = new Attacklab.wmd.previewManager(panes);
  
      /***** build the editor and tell it to refresh the preview after commands *****/
      var editor = new Attacklab.wmd.editor(textarea, previewManager.refresh);
  
      // save everything so we can destroy it all later
      app.WmdInstances.push({ta:textarea, div:previewDiv, ed:editor, pm:previewManager});
  
      app.exposed = $('#post_form').expose({api: true, color: '#B9C7C9'}).load();
      app.exposed.onClose(app.destroyWmdInstance);
  };
  
  app.destroyWmdInstance = function() {
      var inst = app.WmdInstances.pop();
      if (inst) {
          /***** destroy the editor and preview manager *****/
          inst.pm.destroy();
          inst.ed.destroy();
      }

      $('#post_form').hide();
      $('#post_form').remove();

  };

  app.wirePostForm = function(){
    // Post Form, used to create new posts, and *also* to respond to posts.
    // We get to it when we clone #blank_post_form, and insert it as #post_form somewhere else.
    // We need to have the hidden input name=path set to the path value for the new doc.
    // Each doc on the DOM in a threaded view has a path attr. which encodes the path array as a comma-separated str.
    $('#post_form INPUT[value=submit]').click(function(){
      var uuid = $.couch.newUUID();  // Do we want to think about using nicer _ids?  
      var date = new Date(); // For now we are not allowing changing posts, just create new date each time.
      var doc = {
          author: $('#username').html()
        , title: $('#post_form [name=title]').val()
        , body: $('#preview').html()  // This is awesome, thanks Attacklab!
        , path: get_path_from_str($('#post_form [name=path]').val())
        , date: date
        , _id: uuid
      }
      app.db.saveDoc(doc, {success: function(resp){
        app.resetPostForm();
        app.refreshPage();
      }});
    });
  };

  app.resetPostForm = function(){
    $('#post_form [name=title]').val('');
    $('#post_form [name=body]').val('');
    app.destroyWmdInstance();
  };
  
  app.refreshPage = function(){
    // When we get _changes this will change.
    // location.reload(true);
    app.exposed.close();
  };


  // Logout Button
  $('#logout').click(function(){
    $.couch.logout({success: function(){
      app.showLoggedOut();
    }});
  });

  // Login Button
  $('#login').click(function(){
    $('#session FORM').submit();
  });
  

  // Login Form
  var login_form_options = {
    success: function(resp){
      app.session();
    },
    complete: function(xhr){
    }
  };

  $('#session FORM').ajaxForm(login_form_options); 


  // Button to create a top-level post; Do this only once per page
  $('#post').click(function(){
    app.destroyWmdInstance();
    // Get a clone of _post_form, and insert it after #session as #post_form
    var form = $('#_post_form').clone();
    form.attr('id','post_form');
    form.find('[preview=true]').attr('id','preview');
    $('#session').after(form);
    app.wirePostForm();
    $('#post_form').slideDown();
    app.createWmdInstance();
  });

  // Double click to create a child post
  app.wireDoubleClick = function(selector){
    $(selector).each(function(){
      $(this).bind('dblclick', function(){
        app.destroyWmdInstance();
        // get a clone of blank_post_form, and insert it after this doc as #post_form
        var form = $('#_post_form').clone();
        form.attr('id','post_form');
        form.find('[preview=true]').attr('id','preview');
        $(this).after(form);
        app.wirePostForm();
        form.slideDown();
        $('#post_form INPUT[name=path]').val(get_path_str_from_parent_obj($(this)));
        app.createWmdInstance();
      });
    })
  }

  // By_path view
  app.thisThread = function(parent_id, fn) {
    app.view("by_path",{
      //reduce: false, 
      key : parent_id,
      limit : 25,
      descending : true,
      success: function(json) {
        fn(json);
      }
    });
  };

  // Threads view
  app.theseThreads = function(fn){
    app.view("threads",{
      limit : 25,
      success: function(json) {
        fn(json);
      }
    });
  };

  // Wire existing docs for double click
  app.wireDoubleClick('.doc');

  // Handle the session
  app.session();

  // _changes!
  connectToChanges(app, function(){
    //Ugly hack to get the id of the parent for this thread.  Anything else we can do?
    try {
      var id = document.location.search.split('=')[1].replace(/%22/g,'');
    } catch(e){
      var id = null;
    }

    // Handle a change on a thread
    if (id) {
      app.thisThread(id, function(json){
        var t = new Thread(json.rows);
        // Find the new doc and insert it.
        for (var i in t.docs){
          var doc = t.docs[i];
          if (! $('#'+doc._id).length){
            var html = template(app.doc_template, doc);
            var parent_path_str = get_path_str_of_parent(doc);
            $('[path="'+parent_path_str+'"]').after(html);  // Stick it in after the doc with path = doc.path_str
            app.wireDoubleClick('[path="'+doc.path_str+'"]'); // add double click to create child post
          }
        }
      });
      
    // Handle a change on the index page.
    } else {
      app.theseThreads(function(json){
        for (var i in json.rows){
          var doc = json.rows[i].value;
          if (! $('#'+doc._id).length){
            doc['permalink'] = get_permalink(doc);
            var html = template(app.row_template, doc);
            console.log(json.rows[0].value._id);
            $('#'+json.rows[0].value._id).before(html); // Insert before the first doc
          }
        }
      });
    }

  });



});

  

function connectToChanges(app, fn) {
  function resetHXR(x) {
    x.abort();
    connectToChanges(app, fn);    
  };
  app.db.info({success: function(db_info) {  
    var c_xhr = jQuery.ajaxSettings.xhr();
    c_xhr.open("GET", app.db.uri+"_changes?feed=continuous&since="+db_info.update_seq, true);
    c_xhr.send("");
    c_xhr.onreadystatechange = fn;
    setTimeout(function() {
      resetHXR(c_xhr);      
    }, 1000 * 60);
  }});
};
