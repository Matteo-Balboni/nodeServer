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
      parsedData[i] = { [data[i].name] : data[i].value };
      i++;
    });
  }
  if (option == 'object') {
    parsedData = {};
    data.forEach(function() {
      parsedData[data[i].name] = data[i].value;
      i++;
    });
  }

  return parsedData;
}


function deleteElement(customerID, customerREV) {

  if(confirm("Sei sicuro di voler eliminare questo cliente?")){
    $("#element-" + customerID).addClass("d-none");
    $("#elementDelete-" + customerID).addClass("d-none");

    const reqContent = '{ "id": "'+ customerID +'", "rev": "'+ customerREV +'" }';

    var client = new HttpClient();
    client.post('customer/delete', function(response) {
      resp = JSON.parse(response);
      keys = Object.keys(resp);
      if (keys[0] == 'data') {

        $("#DeleteAlerts").append('<div class="alert alert-success mb-1" role="alert" id="DeleteSuccess">Cliente Eliminato</div>');
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
      console.log(response);

      $("#NomeCliente").removeClass("is-invalid");
      $("#DeleteAlerts").append('<div class="alert alert-success mb-1" role="alert" id="DeleteSuccess">Cliente '+ response +' Aggiunto</div>');
      $("#DeleteAlerts").hide();
      $("#DeleteAlerts").fadeIn('fast');

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
  var res2 = [];

  mainF = objectify(mainF, 'object');
  resinF = objectify(resinF, 'array');

  for (var i = 0, j = 0; j < resinF.length; i++, j = j + 2) {
    if (Object.values(resinF[j])[0] != '') {
      res2.push({ nome: Object.values(resinF[j])[0], numero: Object.values(resinF[j+1])[0] });
    }
  }
  resinF = res2;

  mainF.NomeCliente = $("#customerName").text();
  mainF._id = $("#customerId").text();
  mainF._rev = $("#customerRev").text();
  mainF.Resine = resinF;
  var mainF = JSON.stringify(mainF);
  console.log(JSON.stringify(resinF));

  var client = new HttpClient();
  client.post('customer/update', function(response) {
    document.location = response;
    console.log(response);
  }, mainF);
}

function addResin() {
  var appended = $('<div class="row mb-2"><div class="col-7"> <input type="text" class="form-control" id="Resina" name="ResinaA" placeholder=""> </div> <div class="col-4"> <input type="number" class="form-control" id="Resina" name="ResinaAnum" placeholder=""> </div> <button type="button" class="btn-close" aria-label="Delete"></button> </div>')
  $("#resinForm").append(appended);
}

function funzione inutile() {

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
