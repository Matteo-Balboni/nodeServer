function showUser(uid) {
  $('#UserData').children().hide();
  $('#' + uid + 'Data').show();
}

function saveUserChanges(uid) {
  var userData = $('#' + uid + 'Form').serializeArray(); //[{name: 'username', value: 'username'}, {name: 'role', value:'role'}]
  userData = objectify(userData, 'object'); //{username: 'username', role: 'role'}
  userData._id = uid;
  userData = JSON.stringify(userData);
  console.log(userData);
  var client = new HttpClient();
  client.post('admin/updateUser', function(res) {
    //res = JSON.parse(res.body);
    console.log(res);
  }, userData);
}
