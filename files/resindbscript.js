function resindbUpdate() {
  var form = $('#resindbform').serializeArray();
  var arr2 = [];

  for (var i = 0; i < form.length; i++) {
    if (form[i].value != '') {
      arr2.push({ name: form[i].value });
    }
  }
  form = {};
  form.id = $('#resindbform').attr('docid');
  form.rev = $('#resindbform').attr('docrev');
  form.resin = arr2;

  console.log(form);

  var client = new HttpClient();
  client.post('resin/update', function(response) {
    document.location = '/'; //vabbè questo è ovviamente da cambiare in caso voglia che vada su un altra pagina
  }, JSON.stringify(form));
}

function softwaredbUpdate() {
  var form = $('#softwaredbform').serializeArray();
  var arr2 = [];

  for (var i = 0; i < form.length; i++) {
    if (form[i].value != '') {
      arr2.push({ name: form[i].value });
    }
  }
  form = {};
  form.id = $('#softwaredbform').attr('docid');
  form.rev = $('#softwaredbform').attr('docrev');
  form.software = arr2;

  console.log(form);

  var client = new HttpClient();
  client.post('software/update', function(response) {
    document.location = '/'; //vabbè questo è ovviamente da cambiare in caso voglia che vada su un altra pagina
  }, JSON.stringify(form));
}

function devicesdbUpdate() {
  var form = $('#devicesdbform').serializeArray();
  var arr2 = [];

  for (var i = 0; i < form.length; i++) {
    if (form[i].value != '') {
      arr2.push({ name: form[i].value });
    }
  }
  form = {};
  form.id = $('#devicesdbform').attr('docid');
  form.rev = $('#devicesdbform').attr('docrev');
  form.devices = arr2;

  console.log(form);

  var client = new HttpClient();
  client.post('devices/update', function(response) {
    document.location = '/'; //vabbè questo è ovviamente da cambiare in caso voglia che vada su un altra pagina
  }, JSON.stringify(form));
}
