wmd_options = { autostart: false };

$.couch.app(function(app) { 
  
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
  };
  
  app.destroyWmdInstance = function() {
      var inst = app.WmdInstances.pop();
  
      if (inst) {
  
          /***** destroy the editor and preview manager *****/
          inst.pm.destroy();
          inst.ed.destroy();
      
          // remove the dom elements
          inst.ta.parentNode.removeChild(inst.ta);
          inst.div.parentNode.removeChild(inst.div);
  
      }
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
    location.reload(true);
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


  // Create a top-level post
  $('#post').click(function(){
    // Get a clone of _post_form, and insert it after #session as #post_form
    var form = $('#_post_form').clone();
    form.attr('id','post_form');
    form.find('[preview=true]').attr('id','preview');
    $('#session').after(form);
    app.wirePostForm();
    $('#post_form').slideDown();
    app.createWmdInstance();
  });

  // Create a response post
  $('.doc').dblclick(function(){
      // get a clone of blank_post_form, and insert it after this doc as #post_form
      var form = $('#_post_form').clone();
      form.attr('id','post_form');
      form.find('[preview=true]').attr('id','preview');
      $(this).after(form);
      app.wirePostForm();
      form.slideDown();
      $('#post_form INPUT[name=path]').val(get_path_str_from_parent_obj($(this)));
      console.log(form);
      app.createWmdInstance();
  });

  app.session();

}); 