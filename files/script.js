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
      if (keys[0] == 'data') {

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
  //var formDump = $("#mainForm").serialize();  cambiando le parti commentate riporti alla richiesta nella query (customer/add? poi lo stringone), in teoria così è più adatto però
  var objCliente = JSON.stringify(objectify(formDump, 'object')); //la request accetta il json in versione stringa evidentemente

  if ($("#NomeCliente").val() != "") {
    var client = new HttpClient();

    //client.post('customer/add?' + formDump, function(response) {
    client.post('customer/add', function(response) {
      response = JSON.parse(response);

      $("#NomeCliente").removeClass("is-invalid");
      $("#DeleteAlerts").append('<div class="alert alert-success mb-1" role="alert" id="DeleteSuccess">Cliente '+ response.name +' Aggiunto</div>');
      $("#DeleteAlerts").hide();
      $("#DeleteAlerts").fadeIn('fast');

      client.get('infocliente?c=' + response.id + '&o=true', function(respo) {
        respo = JSON.parse(respo);
        var deleteElement = 'deleteElement()';
        $("#ListaClienti").prepend('<a href="infoCliente?c='+ respo.id +'" class="fw-semibold list-group-item list-group-item-action" id="element-'+ respo.id +'">'+ respo.value.name +'<p class="fw-light">token: '+ respo.value.token +'</p></a>');
        $("#ListaClientiDel").prepend('<div class="d-flex" id="elementDelete-'+ respo.id +'"><div class="flex-grow-1 rounded-start"><a href="infoCliente?c='+ respo.id +'" class="fw-semibold list-group-item list-group-item-action" id="element-'+ respo.id +'">'+ respo.value.name +'<p class="fw-light">token: '+ respo.value.token +'</p></a></div><div class="d-flex align-items-stretch float-end "><button type="button" class="btn btn-outline-danger list-group-item rounded-end border-start-0" name="delete" onclick="deleteElement(`'+ respo.id +'`, `'+ respo.value.rev +'`, `'+ respo.value.name +'`)">Elimina</button>');
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

  mainF = objectify(mainF, 'object');
  resinF = objectify(resinF, 'array');
  softwareF = objectify(softwareF, 'array');
  deviceF = objectify(deviceF, 'array');

  for (var i = 0, j = 0; j < resinF.length; i++, j = j + 2) {
    if (Object.values(resinF[j])[0] != '') {
      arr2.push({ nome: Object.values(resinF[j])[0], numero: Object.values(resinF[j+1])[0] });
    }
  }
  resinF = arr2;
  arr2 = [];

  for (var i = 0; i < softwareF.length; i++) { //dai un occhio a questo ciclo perchè ora non funziona bene credo
    if (Object.values(softwareF[i])[0] != '') {
      arr2.push({ nome: Object.values(softwareF[i])[0] });
    }
  }
  softwareF = arr2;
  arr2 = [];

  for (var i = 0, j = 0; j < deviceF.length; i++, j = j + 3) {
    if (Object.values(deviceF[j])[0] != '') {
      arr2.push({ seriale: Object.values(deviceF[j])[0], modello: Object.values(deviceF[j+1])[0], info: Object.values(deviceF[j+2])[0] });
    }
  }
  deviceF = arr2;

  mainF.NomeCliente = $("#customerName").text();
  mainF._id = $("#customerId").text();
  mainF._rev = $("#customerRev").text();
  mainF.Resine = resinF;
  mainF.Macchine = deviceF;
  mainF.Software = softwareF;
  mainF.Assistenze = txtarea;
  var mainF = JSON.stringify(mainF);
  console.log(mainF);
  console.log(JSON.stringify(resinF));

  var client = new HttpClient();
  client.post('customer/update', function(response) {
    document.location = response;
    console.log(response);
  }, mainF);
}

function addResin() {
  var appended = $('<div class="row mb-2"><div class="col-7"> <input type="text" class="form-control" list="resinDatalist" id="Resina" name="ResinaA" placeholder=""> </div> <div class="col-3"> <input type="number" class="form-control" id="Resina" name="ResinaAnum" placeholder=""> </div> <div class="col-2"> <button type="button" class="btn-close" aria-label="Delete"></button> </div> </div>');
  $("#resinForm").append(appended);
}
function addSoftware() {
  var appended = $('<div class="row mb-2"><div class="col-10"> <input type="text" class="form-control" id="Software" name="SoftwareA" placeholder=""> </div> <div class="col-2"> <button type="button" class="btn-close" aria-label="Delete"></button> </div> </div>');
  $("#softwareForm").append(appended);
}
function addDevice() {
  var appended = $('<div class="row mb-2"><div class="col-10 border rounded"><div class="form-floating"> <input type="text" id="serialeMacchina" class="form-control mb-1 mt-2" name="MacchinaAseriale" placeholder="" value=""><label for="serialeMacchina">Seriale</label></div><div class="form-floating"><input type="text" id="modelloMacchina" class="form-control mb-1" name="MacchinaAmodello" placeholder="" value=""><label for="modelloMacchina">Modello</label></div><div class="form-floating"><textarea id="infoMacchina" class="form-control mt-2 mb-2" name="MacchinaAinfo" placeholder="" style="height: 100px" ></textarea><label for="infoMacchina">Informazioni Macchina</label></div></div><div class="col-2"><button type="button" class="btn-close" aria-label="Delete" title="Elimina macchina"></button></div></div>');
  $("#deviceForm").append(appended);
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
