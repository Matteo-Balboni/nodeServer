const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDB = require('node-couchdb');

const couch = new NodeCouchDB({
  auth: {
    user: 'Matteo_dqube',
    password: 'Test123'
  }
});

const dbName = 'cristiangay';
const viewUrl = '_design/all_customers/_view/all';

couch.listDatabases().then(function(dbs) {
  console.log(dbs);
   //importantissimo, serve per dare del gay a cristian
  console.log("\x1b[45m\x1b[36m\x1b[5m    ______     _      __  _                ______            \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m   / ____/____(_)____/ /_(_)___ _____     / ____/___ ___  __ \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m  / /   / ___/ / ___/ __/ / __ `/ __ \\   / / __/ __ `/ / / / \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m / /___/ /  / (__  ) /_/ / /_/ / / / /  / /_/ / /_/ / /_/ /  \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m \\____/_/  /_/____/\\__/_/\\__,_/_/ /_/   \\____/\\__,_/\\__, /   \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m                                                   /____/    \x1b[0m");
  console.log("\x1b[45m\x1b[36m\x1b[5m                                                             \x1b[0m");
});

function sanificateInput(req){
  //non è una buona sanificazione, ma dovrebbe prevenire il blocco accidentale del db
  req.NomeCliente = '' + req.NomeCliente;
  if (!req.Email)
    req.Email = "Nessuna";

  if (!req.Telefono)
    req.Telefono = "Nessuno";

  if (!req.Token)
    req.Token = 0;

  if (!req.NomeResina)
    req.NomeResina = "Nessuna Resina";

  if (!req.Qta)
    req.Qta = null;

  if (!req.NomeMacchina)
    req.NomeMacchina = "Nessuna macchina";

  if (!req.Seriale)
    req.Seriale = null;

  return req;
}

const app = express();

//middleware, potrei cercarli per capire cosa fanno ma ora no
app.set('view engine', 'ejs'); //questo specifica che ejs è il view engine, senza questo non va un cazz
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'files'))); //serve per linkare il file js in modo che la pagina ci possa accedere

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  //res.render('index');
  console.log('Connesso: ' + req.ip);
  couch.get(dbName, viewUrl).then(
    function(data, headers, status){
      //sort magico che ho trovato da qualche parte
      data.data.rows.sort((a, b) => {
          let fa = a.value.name.toLowerCase(), //se mai questo non dovesse andare, probabilmente è perchè qualcosa non ha registrato bene il nome, eliminarlo dal db
              fb = b.value.name.toLowerCase();

          if (fa < fb) {
              return -1;
          }
          if (fa > fb) {
              return 1;
          }
          return 0;
      });
      res.render('index', {customers:data.data.rows});
  },
    function(err){
    res.send(err);
  });
});

app.get('/infoCliente', function(req, res) {
  const cliente = req.query.c;
  const viewUrlfull = viewUrl + '?key="' + cliente + '"';

  couch.get(dbName, viewUrlfull).then(
    function(data, headers, status){
      res.render('pages/infoCliente', {customer:data.data.rows[0]});
  },
    function(err){
    res.send(err);
  });

  //res.render('pages/indexNo'); //non mettere lo slash prima delle cartelle
});

app.get('/modifica', function(req, res) {
  const cliente = req.query.c;
  const viewUrlfull = viewUrl + '?key="' + cliente + '"';

  couch.get(dbName, viewUrlfull).then(
    function(data, headers, status){
      res.render('pages/modificaCliente', {customer:data.data.rows[0]});
  },
    function(err){
    res.send(err);
  });
});

app.post('/customer/update', function(req, res) {
  var obj = sanificateInput(req.body);
  couch.update(dbName, {
    _id: obj._id,
    _rev: obj._rev,
    NomeCliente: '' + obj.NomeCliente,
    Email: obj.Email,
    Telefono: obj.Telefono,
    token: obj.Token,
    Resine: obj.Resine,
    Macchine: [{
      seriale: obj.Seriale,
      modello: obj.NomeMacchina,
      assistenze: []          //verifica se questo funziona, secondo me non funziona
    }]

  }).then(function(data, headers, status) {
    console.log(" Aggiornato -> id:" + obj._id + " da: " + req.ip);
    res.send("infoCliente?c=" + obj._id);
  },
  function(err) {
    res.send(err);
  });
});

app.post('/customer/add', function(req, res) {
  var obj = sanificateInput(req.body);

  couch.uniqid().then(function(ids) {
    const id = ids[0];

    couch.insert(dbName, {
      _id: id,              //a sinistra il nome di quello che c'è sul db, a destra quello che c'è nel form, quindi ad esempio name, perchè lo chiamo così nella variabile sopra
      NomeCliente: obj.NomeCliente,
      Email: obj.Email,
      Telefono: obj.Telefono,
      token: obj.Token,
      Resine: [{
        nome: obj.NomeResina,
        numero: obj.Qta
        }
      ],
      Macchine: [{
        seriale: obj.Seriale,
        modello: obj.NomeMacchina,
        assistenze: []          //verifica se questo funziona, secondo me non funziona
      }]

    }).then(
      function(data, headers, status){
        console.log(" Aggiunto -> " + obj.NomeCliente + " " + id);
        res.send(obj.NomeCliente);
      },
      function(err) {
        res.send(err);
      });
  });
});

app.post('/customer/delete', function(req, res) {
  var id = req.body.id;
  var rev = req.body.rev;

  console.log(" Eliminato -> id: " + id + " rev: " + rev);
  couch.del(dbName, id, rev).then(
    function(data, headers, status) {
      res.send(data);
    },
    function(err) {
      res.send(err);
    });
});

app.listen(80, function() {
  console.log("Server started on port 80");
});

app.get('script.js', function(req, res) {
  res.send('files/script.js');
});
