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
    document.location = 'resin';
  }, JSON.stringify(form));
}
