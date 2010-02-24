wmd_options = { autostart: false };
fmr_app= {};

$.couch.app(function(app) { 
  fmr_app = app;
  
  app.live_session = false;
  app.is_threaded_view = false;
  app.this_thread_id = $('INPUT[name=thread_id]').val();
  app.thread = null;
  app.index = null;
  app.exposed = null;

  // By_path view
  app.thisThread = function(parent_id, fn) {
    app.view("by_path",{
      key : parent_id,
      success: function(json) {
        fn(json);
      }
    });
  };

  // Threads view
  app.theseThreads = function(fn){
    app.view("threads",{
      limit : 25,
      descending: true,
      success: function(json) {
        fn(json);
      }
    });
  };

  if (app.this_thread_id) {
    app.is_threaded_view = true;
    app.thisThread(app.this_thread_id, function(json){
      app.thread = new Thread(json.rows);
    });
  } else {
    app.theseThreads(function(json){
      app.index = new Index(json.rows);
    });
  }

  
  app.getTemplate = function(template_name, fn){
    // Synchronously get a template from the design doc.
    //  We're doing this so we can use the same template here and on the server.
    var template;
    $.ajax({
          url: settings.root
        , async: false
        , success: function(data){
          template = data.templates[template_name];
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
      if (app.is_threaded_view){
        $('#post').remove();
      };
      $('#session #logged_out').hide();
      $('#session #logged_in').show();
      if (app.is_threaded_view){
        $('#respond_inline').show();
      }
  };

  app.showLoggedOut = function(){
      $('#session #logged_in').hide();
      $('#session #logged_out').show();
      $('#respond_inline').hide();
  };

  app.session = function(){
    $.getJSON('/_session/', function(data){
      if (data.name) {
        app.live_session = true;
        app.showLoggedIn(data.name);
        app.turnOnDocs();
      } else {
        app.live_session = false;
        app.showLoggedOut();
        app.turnOffDocs();
      }
    })  
  };

  app.modalMessage = function(message){
    // get jquery.modal.js for this?
    alert(message);
  }
  
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
      app.wmdInstance = ({ta:textarea, div:previewDiv, ed:editor, pm:previewManager});
  
      app.exposed = $('#post_form').expose({api: true, color: '#B9C7C9'}).load();
      app.exposed.onClose(app.destroyWmdInstance);
      $(window).scroll(app.exposed.fit);
  };
  
  app.destroyWmdInstance = function() {
      if (app.wmdInstance) {
          /***** destroy the editor and preview manager *****/
          app.wmdInstance.pm.destroy();
          app.wmdInstance.ed.destroy();
          app.wmdInstance = null;
      }

      $('#post_form').remove();
      
      // massage expose to fully close in some cases, I don't know why.
      //console.log('triggering esc key');
      //var e = $.Event('keydown');
      //e.which = '27';  // esc key
      //$('BODY').trigger(e);
      
  };

  app.wirePostForm = function(){
    // Post Form, used to create new posts, and *also* to respond to posts.
    // We get to it when we clone #blank_post_form, and insert it as #post_form somewhere else.
    // We need to have the hidden input name=path set to the path value for the new doc.
    // Each doc on the DOM in a threaded view has a path attr. which encodes the path array as a comma-separated str.
    
    $('#post_form INPUT[value=submit]').click(function(){
      
      // Require title.  Any other validation here?
      if (! $('#post_form INPUT[name=title]').val()){
        app.modalMessage('The title field is required.');
        return;
      }
      
      var uuid = $.couch.newUUID();  // Do we want to think about using nicer _ids?  
      var date = new Date().getTime(); // For now we are not allowing changing posts, just create new date each time.
      var doc = {
          author: $('#username').html()
        , title: $('#post_form [name=title]').val()
        , body: $('#preview').html()  // This is awesome, thanks Attacklab!
        , path: get_path_from_str($('#post_form [name=path]').val())
        , date: date
        , _id: uuid
      }
      app.db.saveDoc(doc, {success: function(resp){
        app.exposed.close();
        
        // If threaded view Top the top-level parent post by changing its date
        if (app.is_threaded_view){
          app.db.openDoc(app.this_thread_id, {
            success: function(doc){
                doc.date = new Date().getTime();
                doc.FOO = "BAR";
                app.db.saveDoc(doc);
            }
          });
        };
        
      }});
    });
  };

  // Logout Button
  $('#logout').click(function(){
    $.couch.logout({success: function(){
      app.session();
    }});
  });

  // Login Button
  $('INPUT[value=login]').click(function(){
    if ($('[name=username]').val() && $('[name=password]').val()){
      $.couch.login({
          name: $('[name=username]').val()
        , password: $('[name=password]').val()
        , success: function(resp){
            app.session();
        }
        , error: function(status, error, reason){
            app.modalMessage(reason);
        }
      })
    } else {
      app.modalMessage('Please provide username and password.');
    }
  });

  // Respond inline button
  if (app.is_threaded_view) {
    $('#respond_inline').click(function(){
      // Effectively a double click on the top-level doc
      $('#'+app.this_thread_id).trigger('dblclick');
    });
  };

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
        console.log('Parent ID -> '+$(this).attr('id'));
        app.destroyWmdInstance();
        // Find the correct position for the form, by using Thread logic with a dummy response doc
        var this_path_str = get_path_str_from_parent_obj($(this));
        var dummy = {
            path: get_path_from_str(this_path_str)
          , _id: 'dummy'
          , title: 'dummy'
          , date: new Date()
        };
        var rows = app.thread.rows.slice(0);
        rows.push({value: dummy});  // don't forget that we instantiate Thread with an array of rows, not docs
        dummy_thread = new Thread(rows);
        var insertion_point = dummy_thread.docs.indexOf(dummy) - 1;  // find it in thread.docs
        var insertion_id = dummy_thread.docs[insertion_point]._id;
      
        // get a clone of blank_post_form, and insert it after in correct spot as #post_form
        var form = $('#_post_form').clone();
        form.attr('id','post_form');
        form.find('[preview=true]').attr('id','preview');
        $('#'+insertion_id).after(form);
        app.wirePostForm();
        form.slideDown();
        $('#post_form INPUT[name=path]').val(this_path_str);
        app.createWmdInstance();
      });
    })
  }


  // Wire existing docs for dblclick
  app.turnOnDocs = function(){
    app.wireDoubleClick('.doc');
  };

  // Undo dblclick wiring for docs
  app.turnOffDocs = function(){
    $('.doc').unbind('dblclick');
  };

  // Handle the session
  app.session();

  // _changes!
  connectToChanges(app, function(foo){

    // Handle a change on a thread
    if (app.is_threaded_view) {
      app.thisThread(app.this_thread_id, function(json){
        // Rebuild this thread.
        app.thread = new Thread(json.rows);
        // Find the new doc and insert it.
        for (var i in app.thread.docs){
          var doc = app.thread.docs[i];
          if (! $('#'+doc._id).length){
            var html = template(app.doc_template, doc);
            // Stick the new doc in after the doc before it.
            var insertion_index = app.thread.docs.indexOf(doc) - 1;
            var insertion_id = app.thread.docs[insertion_index]._id;
            $('#'+insertion_id).after(html);
            app.wireDoubleClick('#'+doc._id); // add double click to create child post
          }
        }
      });
      
    // Handle a change on the index page.
    } else {
      app.theseThreads(function(json){
        // Just redraw all docs
        $('.row').hide();
        $('.row').remove();
        app.index = new Index(json.rows);
        for (var i in app.index.docs){
          var doc = app.index.docs[i];
          var html = template(app.row_template, doc);
          $('#wrapper').append(html);
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
