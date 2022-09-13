function showUser(uid) {
  $('#UserData').children().hide();
  $('#' + uid + 'Data').show();
}

function alertFadeout() {
  setTimeout(function() {
    $('#UserAlerts').fadeOut('slow');
    setTimeout(function(){
        $('#EditSuccess').remove();
    },3000);
  },3000);
}

function changeModal(uid, username) {
  //this changes the save button's onclick attribute
  $("#resetPasswordHeader").text('Reset Password per ' + username);
  $("#modalSave").attr("onclick", "changePassword('"+ uid +"')");
  $("#resetPasswordForm").find("input").val('');
}

function saveUserChanges(uid) {
  var userData = $('#' + uid + 'Form').serializeArray(); //[{name: 'username', value: 'username'}, {name: 'role', value:'role'}]
  userData = objectify(userData, 'object'); //{username: 'username', role: 'role'}
  userData._id = uid;
  userData = JSON.stringify(userData);

  var client = new HttpClient();
  client.post('admin/updateUser', function(res) {
    res = JSON.parse(res);
    if (res.status == 'ok') {
      //show green alert and update the list
      $("#UserAlerts").append('<div class="alert alert-success mb-1" role="alert" id="EditSuccess">Utente '+ res.username +' Aggiornato</div>');
      $("#UserAlerts").fadeIn('fast');

      $('#button-' + uid).html(res.username + '<p class="fw-light" id="p-'+ uid +'">Ruolo: '+ res.role +'</p>');
      alertFadeout();
    } else {
      //show red danger alert
      $("#UserAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="EditSuccess">'+ res.message +' </div>');
      alertFadeout();
    }
  }, userData);
}

function deleteUser(uid) {
  if (confirm("Sei sicuro di voler eliminare questo utente?")) {
    var userData = {};
    userData.id = uid;
    userData = JSON.stringify(userData);

    var client = new HttpClient();
    client.delete('auth/deleteUser', function(res) {
      res = JSON.parse(res);
      if (res.status == 'ok') {
        $("#UserAlerts").append('<div class="alert alert-success mb-1" role="alert" id="EditSuccess">Utente '+ res.user.username +' Eliminato</div>');
        $("#UserAlerts").fadeIn('fast');

        $("#button-" + uid).remove();
        $("#" + uid + "Data").remove();
        alertFadeout();
      } else {
        $("#UserAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="EditSuccess">'+ res.message +'</div>');
        $("#UserAlerts").fadeIn('fast');
        alertFadeout();
      }
    }, userData);
  }
}

function newUser() {
  var userData = $('#newUserForm').serializeArray();
  userData = objectify(userData, 'object');
  //dovrei controllare che venga messa una password
  if (userData.password == '' || userData.username == '') {

  } else {
    userData = JSON.stringify(userData);

    var client = new HttpClient(); //riflettendoci bene così mando la password in chiaro... oh beh
    client.post('auth/register', function(res) {
      res = JSON.parse(res);
      if (res.status == 'ok') {
        $("#UserAlerts").append('<div class="alert alert-success mb-1" role="alert" id="EditSuccess">Utente '+ res.user.username +' Creato</div>');
        $("#UserAlerts").fadeIn('fast');

        var toAppend = $('<div id="'+ res.data.id +'Data" class="mt-2" style="display:none"><form id="'+ res.data.id +'Form"><div class="form-floating mb-1 text-truncate"><input type="text" class="form-control" id="unameInput" name="username" placeholder="" value="'+ res.user.username +'"><label for="unameInput">Username</label></div><div class="form-floating mb-1"><select class="form-select" id="roleInput" name="role"><option value="user">user</option><option value="admin">admin</option></select><label for="roleInput">Ruolo</label></div></form><div><button class="btn btn-outline-danger" name="button" data-bs-toggle="modal" data-bs-target="#resetPasswordModal" onclick="changeModal(`'+ res.data.id +'`, `'+ res.user.username +'`)">Reset Password</button></div><div class="d-flex flex-row-reverse mt-5 me-1 mb-2"><button type="button" class="btn btn-outline-success ms-auto" name="saveChanges" onclick="saveUserChanges(`'+ res.data.id +'`)">Salva</button><div class="align-self-end"><button type="button" class="btn btn-outline-danger" onclick="deleteUser(`'+ res.data.id +'`)">Elimina Utente</button></div></div></div>');

        $("#UserList").prepend('<button onclick="showUser(`' + res.data.id + '`)" class="fw-semibold list-group-item list-group-item-action" id="button-'+ res.data.id +'">' + res.user.username + '<p class="fw-light" id="p-'+ res.data.id +'">Ruolo: '+ res.user.role +'</p></button>');
        $("#UserData").append(toAppend);
        $("#" + res.data.id + "Data").append()
        $("#" + res.data.id + "Data").hide();

        alertFadeout();
      } else {
        $("#UserAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="EditSuccess">'+ res.message +'</div>');
        $("#UserAlerts").fadeIn('fast');
        alertFadeout();
      }
    }, userData);
  }
}

function changePassword(uid) {
  $("#pass1, #pass2").removeClass('is-invalid');
  var passData = $('#resetPasswordForm').serializeArray();
  passData = objectify(passData, 'object');


  if (passData.pass === passData.passConfirm) {
    var toSend = {};
    toSend.role = 'admin'; //current user role
    toSend.id = uid; //doc. id of target user
    toSend.password = passData.pass; //password specified in the form
    toSend = JSON.stringify(toSend);

    var client = new HttpClient();
    client.post('auth/update', function(res) {
      res = JSON.parse(res);
      if (res.status == 'ok') {
        $("#UserAlerts").append('<div class="alert alert-success mb-1" role="alert" id="EditSuccess">Password Modificata Correttamente</div>');
        alertFadeout();
        $('#modalClose').trigger('click'); //not very elegant, but works
      } else {
        console.log(res);
        $("#UserAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="EditFail">Errore</div>');
        alertFadeout();
      }
    }, toSend);
  } else {
    $("#pass1, #pass2").addClass('is-invalid');
    $("#UserAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="EditFail">Le password non corrispondono</div>');
    alertFadeout();
  }
}
