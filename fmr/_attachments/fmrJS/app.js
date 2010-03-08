wmd_options = { autostart: false };
fmr_app= {};

$.couch.app(function(app) { 
  fmr_app = app;
  
  app.live_session = false;
  app.is_threaded_view = false;
  app.this_thread_id = $('INPUT[name=thread_id]').val();  // crappy way to communicate this from the server
  app.thread = null;
  app.index = null;
  app.exposed = null;

  /**
   * Views
   * ****************************************************
   */

  // By_path view
  app.thisThread = function(fn) {
    app.view("by_path",{
      key : app.this_thread_id,
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

  /**
   * Fork this app for Thread or Index
   * ****************************************************
   */

  if (app.this_thread_id) {
    app.is_threaded_view = true;
    app.thisThread(function(json){
      app.thread = new Thread(json.rows);
    });
  } else {
    app.theseThreads(function(json){
      app.index = new Index(json.rows);
    });
  }

  /**
   *  Templates
   * ****************************************************
   */

  app.getTemplate = function(template_name){
    // Synchronously get a template from the design doc.
    //  We're doing this so we can use the same template here and on the server.
    var template;
    $.ajax({
          url: settings.root
        , async: false
        , success: function(data){
          template = data.templates[template_name];
        }
        , dataType: 'json'
    });
    return template;
  }

  app.doc_template = app.getTemplate('doc');  // doc in a threaded view
  app.row_template = app.getTemplate('row');  // doc on index page, top-level posts only.
  
  /**
   * Session
   * ****************************************************
   */
  
  app.login = function(username, password){
    $.couch.login({
        name: username
      , password: password
      , success: function(resp){
          app.session();
      }
      , error: function(status, error, reason){
          app.modalMessage(reason);
      }
    })
  };

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

  // Logout Button
  $('#logout').click(function(){
    $.couch.logout({success: function(){
      app.session();
    }});
  });

  // Login Button
  $('INPUT[value=login]').click(function(){
    var username = $('[name=username]').val();
    var password = $('[name=password]').val();
    if (username && password){
      app.login(username, password);
    } else {
      app.modalMessage('Please provide username and password.');
    }
  });

  /**
   * Signup
   * 
   * Borrows very heavily from Nymphormation:
   * http://github.com/benoitc/nymphormation/blob/master/nymphormation/_attachments/js/nymphormation.js
   * ****************************************************
   */
  function checkLength(o, n, min, max) {
      if (o.val().length > max || o.val().length < min) {
          o.addClass('ui-state-error');
          updateTips("Length of " + n + " must be between " + min + " and " + max + ".");
          return false;
      } else {
          return true;
      }
  }
 
  function checkRegexp(o, regexp, n) {
      if (! (regexp.test(o.val()))) {
          o.addClass('ui-state-error');
          updateTips(n);
          return false;
      } else {
          return true;
      }
  }
  function updateTips(t) {
      $('#tips').text(t).fadeIn(1500);
  }
  $('#signup').click(function(){
    var signup_form = app.getTemplate('signup');
    $.blockUI({
          message: signup_form
        , overlayCSS: {
            backgroundColor: '#A3A6A8'
          } 
    });

    $('INPUT[value=signup]').click(function(){
      app.signup();
    });

    $('#close_button').click(function(){
      $.unblockUI();
    });
    
  });
  
  app.signup = function() {
    var bValid = true,
        username = $("INPUT[name=signup_username]"),
        email = $("INPUT[name=email]"),
        password = $("INPUT[name=signup_password]"),
        allFields = $([]).add(username).add(email).add(password);
    
    allFields.removeClass('ui-state-error');

    bValid = bValid && checkLength(username, "username", 3, 16);
    bValid = bValid && checkLength(password, "password", 5, 16);
    bValid = bValid && checkLength(email, "email", 6, 80);
    
    bValid = bValid && checkRegexp(username, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter.");
    bValid = bValid && checkRegexp(password,/^([0-9a-zA-Z])+$/,"Password field only allow : a-z 0-9");
	bValid = bValid && checkRegexp(email,/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,"This is not a valid email address.");
    
    if (bValid) {
      var user = {
        username: username.val(),
        email: email.val(),
        password: password.val(),
        active: "true"
      };
      
      $.ajax({
        type: "POST",
        url: "/_user",
        data: user,
        success: function(resp) {
          app.login(username.val(), password.val());
          $.unblockUI();
        },
        error: function(a,b,error) {
          updateTips("Username already exist");
        }
      });
      
    }
    return false;
  };
  

  /**
   * Dialog
   * http://malsup.com/jquery/block/
   * ****************************************************
   */

  app.modalMessage = function(message){
    $.blockUI({
          message:
                '<p>'+message+'</p>'
              + '<div id="close_button"></div>'
        , overlayCSS: {
            backgroundColor: '#A3A6A8'
          } 
    });
    $('#close_button').click(function(){
      $.unblockUI();
    })
  }

  /**
   * WMD editor
   * http://wmd-editor.com/
   * ****************************************************
   */
  
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
  
      app.exposed = $('#post_form').expose({
          api: true
        , color: '#A3A6A8'
        , zIndex: 800
        , onClose: app.destroyWmdInstance
      }).load();
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
      
  };


  /**
   * Posting
   * ****************************************************
   */

  app.wirePostForm = function(){
    // Post Form, used to create new posts, and *also* to respond to posts.
    // We get to it when we clone #blank_post_form, and insert it as #post_form somewhere else.
    // We need to have the hidden input name=path set to the path value for the new doc.
    // Each doc on the DOM in a threaded view has a path attr. which encodes the path array as a comma-separated str.
    
    $('#post_form_submit').click(function(){
      
      // Require title.  Any other validation here?
      if (! $('#post_form INPUT[name=title]').val()){
        app.modalMessage('The title field is required.');
        return;
      }

      // attachment?        
      var attachment = $('#file_form INPUT[type=file]').val();
      
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

      if (attachment){
        doc.has_attachment = true;
      }
      
      app.db.saveDoc(doc, {success: function(resp){
        app.exposed.close();
        
        // If threaded view, top the top-level parent post by changing its date
        if (app.is_threaded_view){
          app.db.openDoc(app.this_thread_id, {
            success: function(doc){
                doc.date = new Date().getTime();
                // Count responses, why not?                
                if (doc.responses){
                  doc.responses += 1;
                } else {
                  doc.responses = 1;
                }
                app.db.saveDoc(doc);
            }
          });
        };

        // add the attachment
        if (attachment){
          
          // Begin the wait-for-upload dialog
          $.blockUI({
                message:    'Please wait for your attachment to finish uploading.'
                          + '<img src="'+settings.root+'/img/spinner.gif" />'
                          + '<div id="close_button"></div>'
          });
      
          // If the user clicks cancel, then remove the original doc
          $('#close_button').click(function(){
            $.unblockUI();
            app.db.removeDoc(doc);
          });

          // Submit #file_form
          $('#file_form INPUT[name=_rev]').val(resp.rev);
          var url = app.db.uri+resp.id;
          $('#file_form').ajaxSubmit({
              url: url
            , beforeSubmit: function(){
            }
            , complete: function(xhr){
            }
            , error: function(a, b, c){
            }
            , success: function(resp){
              // resp ->  <pre>{"ok":true,"id":"<id>","rev":"<rev>"}</pre>
              $.unblockUI();
            }
          });
        };
      }});
    });
  };


  // clone #_post_form, return it as #post_form html
  app.getPostForm = function(){
    var form = $('#_post_form').clone();
    form.attr('id','post_form');
    form.find('[preview=true]').attr('id','preview');
    form.find('[file_form=true]').attr('id','file_form');
    form.find('[post_form_submit=true]').attr('id','post_form_submit');
    // we are doing all of this because #_post_form remains on the DOM
    return form
  };

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
    var form = app.getPostForm();
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
      
        var form = app.getPostForm();
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


  /**
   * Changes
   * ****************************************************
   */

  // Rebuild this thread
  app.updateThread = function(json){
    app.thread = new Thread(json.rows);

    for (var i in app.thread.docs){
      var doc = app.thread.docs[i];
      if (doc.attachment.pending){continue};
      
      // Find the new doc and insert it in the proper location,
      if (! $('#'+doc._id).length){
        var html = template(app.doc_template, doc);
        // Stick the new doc in after the doc before it.
        var insertion_index = app.thread.docs.indexOf(doc) - 1;
        var insertion_id = app.thread.docs[insertion_index]._id;
        $('#'+insertion_id).after(html);
        app.wireDoubleClick('#'+doc._id); // add double click to create child post
      }
      
    }

  };

  // Rebuild the index
  app.updateIndex = function(json){
    // Just redraw all docs
    $('.row').hide();
    $('.row').remove();
    app.index = new Index(json.rows);
    for (var i in app.index.docs){
      var doc = app.index.docs[i];
      if (doc.attachment.pending){continue};
      var html = template(app.row_template, doc);
      $('#wrapper').append(html);
    }
  };




  /**
   * Put things into motion
   * ****************************************************
   */

  // Begin the session
  app.session();

  // Connect to _changes!
  connectToChanges(app, function(foo){
    // Handle a change on a thread
    if (app.is_threaded_view) {
      app.thisThread(app.updateThread);

    // Handle a change on the index page.
    } else {
      app.theseThreads(app.updateIndex);
    }
  });

});

  
// From CouchDB Toast:  http://github.com/jchris/toast/blob/master/_attachments/app.js
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
