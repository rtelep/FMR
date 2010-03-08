function (doc) {
    if (doc.type == 'user') {
        emit(doc.username, {password_sha: doc.password_sha, salt: doc.salt, secret: '', roles: ['user']});
    }
}
