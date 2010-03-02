function(newDoc, savedDoc, userCtx) {
      log(userCtx);  // {"db": "fmr","name": "rtelep","roles": ["_admin"]}
      log(savedDoc);  // 
      if(userCtx.name == null){
            throw({forbidden: 'Please log in.'});
      } else if (0){
            throw({forbidden: "Author is " + userCtx.name})
      }
}
