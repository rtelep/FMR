function(newDoc, savedDoc, userCtx) {
      log(userCtx);  // This is the rtelep user every time: {"db": "fmr","name": "rtelep","roles": ["_admin"]}
      log(savedDoc);  // That seems broken.
      if(userCtx.name == null){
            throw({forbidden: 'Please log in.'});
      } else if (0){
            throw({forbidden: "Author is " + userCtx.name})
      }
}
