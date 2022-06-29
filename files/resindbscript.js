function resindbUpdate() {
  var form = $('#resindbform').serializeArray();
  var revs = [];
  $('#resindbform').find('input').each(function() {
    revs.push($( this ).attr('rev'));
  });

  form.forEach((item, index) => {
    item['rev'] = revs[index];
  });

  console.log(form);
  var client = new HttpClient();
  form.forEach((item, i) => {
    if (item.name == 'added') {
      client.post('resin/add', function(response) {
        console.log(response);
      }, JSON.stringify(item));
    }
    else {
      client.post('resin/update', function(response) {
        console.log(response);
      }, JSON.stringify(item));
    }
  });

}
