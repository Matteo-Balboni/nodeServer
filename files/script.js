function provajs() {
  alert("javascript collegato");
}

function topBar() {
  $('#TitleNav').addClass('border-bottom');
}

function toggleDelete(){
  $("#ListaClienti").toggleClass("d-none");
  $("#ListaClientiDel").toggleClass("d-none");
}

function tokenChecker() {
  if ($('#tokenCheck').prop('checked')) {
    $('#Token').prop( "disabled", false );
    $('#Token').val(10);
    $('#Token').attr('notoken', false);
  } else {
    $('#Token').prop( "disabled", true );
    $('#Token').val('');
    $('#Token').attr('notoken', true);
  }
}


var HttpClient = function() {
    this.post = function(aUrl, aCallback, reqBody) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "POST", aUrl, true );
        anHttpRequest.setRequestHeader("Content-Type", "application/json"); //questo è assolutamente necessario, non ti far neanche venire in mente di toglierlo
        anHttpRequest.setRequestHeader("Accept", "application/json");
        anHttpRequest.send(reqBody); //body della richiesta, cambia per cambiare i dati che arrivano al server IMPORTANTE: SEMBRA CHE I DATI DEBBANO ESSERE JSON STRINGIFICATO
    }
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}

function objectify(data, option) {
  var i = 0;
  var parsedData;

  if (option == 'array') {
    parsedData = [];
    data.forEach(function() {
      parsedData[i] = { [data[i].name] : data[i].value }; //array perchè array di oggetti
      i++;
    });
  }
  if (option == 'object') {
    parsedData = {};
    data.forEach(function() {
      parsedData[data[i].name] = data[i].value; //object perchè imposto i parametri dell'oggetto
      i++;
    });
  }
  return parsedData;
}


function deleteElement(customerID, customerREV, customerName) {

  if(confirm("Sei sicuro di voler eliminare questo cliente?")){
    $("#element-" + customerID).remove();
    $("#elementDelete-" + customerID).remove();

    const reqContent = '{ "id": "'+ customerID +'", "rev": "'+ customerREV +'" }';

    var client = new HttpClient();
    client.post('customer/delete', function(response) {
      resp = JSON.parse(response);
      keys = Object.keys(resp);
      if (keys[0] == 'ok') {

        $("#DeleteAlerts").append('<div class="alert alert-success mb-1" role="alert" id="DeleteSuccess">Cliente ' + customerName + ' Eliminato</div>');
        $("#DeleteAlerts").hide();
        $("#DeleteAlerts").fadeIn('fast');

        setTimeout(function(){
            $("#DeleteAlerts").fadeOut("slow");
            setTimeout(function(){
                $("#DeleteSuccess").remove();
            },3000);
        },3000);
      }
      else {
        console.log("errore nell'eliminazione del cliente");

        $("#DeleteAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="DeleteFail"></div>');
        $("#DeleteFail").text(resp.body.error + ": " + resp.body.reason);
        $("#DeleteAlerts").hide();
        $("#DeleteAlerts").fadeIn('fast');

        setTimeout(function(){
            $("#DeleteAlerts").fadeOut("slow");
            setTimeout(function(){
                $("#DeleteFail").remove();
            },3000);
        },3000);
      }
    }, reqContent);
  }
}

function formSubmit() {
  var formDump = $("#mainForm").serializeArray();
  var objCliente = objectify(formDump, 'object');

  objCliente.Token = {Quantity: objCliente.TokenN, NoToken: $('#Token').attr('notoken')}
  objCliente.Resine = [];
  objCliente.Resine[0] = {nome: objCliente.NomeResina, numero: objCliente.Qta};
  objCliente.Macchine = [];
  objCliente.Macchine[0] = {seriale: objCliente.Seriale, modello: objCliente.NomeMacchina, info: ''};
  objCliente.Software = [];

  delete objCliente.TokenN, delete objCliente.NomeResina, delete objCliente.Qta, delete objCliente.Seriale, delete objCliente.NomeMacchina;

  //console.log(objCliente);

  objCliente = JSON.stringify(objCliente); //la request accetta il json in versione stringa evidentemente
  if ($("#NomeCliente").val() != "") {
    var client = new HttpClient();

    client.post('customer/add', function(response) {
      response = JSON.parse(response);

      $("#NomeCliente").removeClass("is-invalid");
      $("#DeleteAlerts").append('<div class="alert alert-success mb-1" role="alert" id="DeleteSuccess">Cliente '+ response.name +' Aggiunto</div>');
      $("#DeleteAlerts").hide();
      $("#DeleteAlerts").fadeIn('fast');

      client.get('infocliente?c=' + response.id + '&o=true', function(respo) {
        respo = JSON.parse(respo);
        let tokenDisplay = '';
        let tokenDate = '';
        if (!respo.value.token.NoToken) {
          if(respo.value.token.ExpirationDate){
            tokenDate = new Date(respo.value.token.ExpirationDate).toLocaleString('it-IT', {day:'numeric', month:'numeric', year:'numeric'});
          }
          tokenDisplay = 'token: ' + respo.value.token.Quantity + ' | scadenza: ' + tokenDate;
        } else {
          tokenDisplay = 'No token';
        }
        console.log(tokenDisplay);
        $("#ListaClienti").prepend('<a href="infoCliente?c='+ respo.id +'" class="fw-semibold list-group-item list-group-item-action" id="element-'+ respo.id +'">'+ respo.value.name +'<p class="fw-light">'+ tokenDisplay +'</p></a>');
        $("#ListaClientiDel").prepend('<div class="d-flex" id="elementDelete-'+ respo.id +'"><div class="flex-grow-1 rounded-start"><a href="infoCliente?c='+ respo.id +'" class="fw-semibold list-group-item list-group-item-action" id="element-'+ respo.id +'">'+ respo.value.name +'<p class="fw-light">'+ tokenDisplay +'</p></a></div><div class="d-flex align-items-stretch float-end "><button type="button" class="btn btn-outline-danger list-group-item rounded-end border-start-0" name="delete" onclick="deleteElement(`'+ respo.id +'`, `'+ respo.value.rev +'`, `'+ respo.value.name +'`)">Elimina</button>');
      });

      setTimeout(function(){
          $("#DeleteAlerts").fadeOut("slow");
          setTimeout(function(){
              $("#DeleteSuccess").remove();
          },3000);
      },3000);
    }, objCliente);
  }
  else {

    $("#NomeCliente").addClass("is-invalid");
    $("#DeleteAlerts").append('<div class="alert alert-danger mb-1" role="alert" id="DeleteFail"></div>');
    $("#DeleteFail").text("Nome Cliente necessario");
    $("#DeleteAlerts").hide();
    $("#DeleteAlerts").fadeIn('fast');

    setTimeout(function(){
        $("#DeleteAlerts").fadeOut("slow");
        setTimeout(function(){
            $("#DeleteFail").remove();
        },3000);
    },3000);
  }
}

function formUpdate() {
  var mainF = $("#mainForm").serializeArray();
  var resinF = $("#resinForm").serializeArray();
  var softwareF = $("#softwareForm").serializeArray();
  var deviceF = $("#deviceForm").serializeArray();
  var txtarea = $("#assistenzeArea").val();
  var arr2 = [];
  var tokenExp = $("#TokenExpirationDate").attr("fulldate");
  console.log(tokenExp);

  mainF = objectify(mainF, 'object');
  resinF = objectify(resinF, 'array');
  deviceF = objectify(deviceF, 'array');

  for (var i = 0, j = 0; j < resinF.length; i++, j = j + 2) {
    if (Object.values(resinF[j])[0] != '' || Object.values(resinF[j+1])[0] > 0) {
      arr2.push({ nome: Object.values(resinF[j])[0], numero: Object.values(resinF[j+1])[0] });
    }
  }
  resinF = arr2;
  arr2 = [];

  for (var i = 0; i < softwareF.length; i++) {
    if (softwareF[i].value != '') {
      arr2.push({ nome: softwareF[i].value });
    }
  }
  softwareF = arr2;
  arr2 = [];

  for (var i = 0, j = 0; j < deviceF.length; i++, j = j + 3) {
    if (Object.values(deviceF[j])[0] != '' || Object.values(deviceF[j+1])[0] != '' || Object.values(deviceF[j+2])[0] != '' ) {
      arr2.push({ seriale: Object.values(deviceF[j])[0], modello: Object.values(deviceF[j+1])[0], info: Object.values(deviceF[j+2])[0] });
    }
  }
  deviceF = arr2;

  mainF.NomeCliente = $("#customerName").text();
  mainF._id = $("#customerName").attr("customerId");
  mainF._rev = $("#customerName").attr("customerRev");
  mainF.Token = { TokenId: mainF.TokenId, ExpirationDate: tokenExp, Quantity: mainF.TokenQty, NoToken: mainF.NoToken };
  mainF.Resine = resinF;
  mainF.Macchine = deviceF;
  mainF.Software = softwareF;
  mainF.Assistenze = txtarea;
  console.log(mainF);       //{Assistenze: "assistenze", Email: "email", Macchine: Array [ {…} ], NomeCliente: "nome cliente", Resine: Array [ {…} ], Software: Array [], Telefono: "telefono", Token: "token", _id: "d83ef8426b5175d49b501145b1019710", _rev: "4-88523ded1c1651c80ad6e24765447d92"
  mainF = JSON.stringify(mainF);
  console.log(mainF);

  var client = new HttpClient();
  client.post('customer/update', function(response) {
    document.location = response;
    console.log(response);
  }, mainF);
}

function addInput(formType) {
  const appended = $('');
}

function addResin() {
  const appended = $('<div class="row mb-2 gx-2"><div class="col-7"> <input type="text" class="form-control" list="resinDatalist" id="Resina" name="ResinaA" placeholder=""> </div> <div class="col-3 text-nowrap"> <input type="number" class="form-control" id="Resina" name="ResinaAnum" placeholder=""> </div> <div class="col text-center"> <button type="button" class="btn-close" aria-label="Delete"></button> </div> </div>');
  $("#resinForm").prepend(appended);
  $("#resinForm input").first().focus();
}
function addSoftware() {
  const appended = $('<div class="row mb-2"><div class="col-10"> <input type="text" class="form-control" id="Software" list="softwareDatalist" name="SoftwareA" placeholder=""> </div> <div class="col-2 text-center"> <button type="button" class="btn-close" aria-label="Delete"></button> </div> </div>');
  $("#softwareForm").prepend(appended);
  $("#softwareForm input").first().focus();
}
function addDevice() {
  const appended = $('<div class="row mb-2"><div class="col-10 border rounded"><div class="form-floating"> <input type="text" id="serialeMacchina" class="form-control mb-1 mt-2" name="MacchinaAseriale" placeholder="" value=""><label for="serialeMacchina">Seriale</label></div><div class="form-floating"><input type="text" id="modelloMacchina" list="deviceDatalist" class="form-control mb-1" name="MacchinaAmodello" placeholder="" value=""><label for="modelloMacchina">Modello</label></div><div class="form-floating"><textarea id="infoMacchina" class="form-control mt-2 mb-2" name="MacchinaAinfo" placeholder="" style="height: 100px" ></textarea><label for="infoMacchina">Informazioni Macchina</label></div></div><div class="col-2 text-center"><button type="button" class="btn-close" aria-label="Delete" title="Elimina macchina"></button></div></div>');
  $("#deviceForm").prepend(appended);
  $("#deviceForm input").first().focus();
}
