function(newDoc, savedDoc, userCtx) {
      log(userCtx);  // {"db": "fmr","name": "rtelep","roles": ["_admin"]}
      if(userCtx.name == null){
            throw({forbidden: 'Please log in.'});
      } else if (savedDoc && userCtx.name != newDoc.author){
            throw({forbidden: "Author is " + userCtx.name})
      }
}
