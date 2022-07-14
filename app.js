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
const resindb = 'resindb';
const allUrl = '_design/all_resin/_view/all'
const resinUrl = '_design/all_resin/_view/resinView?key="d83ef8426b5175d49b501145b1001043"';
const tokenUrl = '_design/all_resin/_view/tokenSerialView?key="27c178f04e717b96b94d316bc200174b"'
const softwareUrl ='_design/all_resin/_view/softwareView?key="bda7c6faee2f1d25ffd9dcef370037e5"'
const devicesUrl = '_design/all_resin/_view/devicesView?key="5cc5e050c903f8137dbf0af46d00024c"'
const resinDocId = 'd83ef8426b5175d49b501145b1001043';
const tokenDocId = '27c178f04e717b96b94d316bc200174b';
const softwareDocId = 'bda7c6faee2f1d25ffd9dcef370037e5'
const devicesDocId = '5cc5e050c903f8137dbf0af46d00024c'

couch.listDatabases().then(function(dbs) {
  console.log(dbs);
   //importantissimo, serve per dare del gay a cristian
  console.log("\x1b[45m\x1b[37m\x1b[5m    ______     _      __  _                ______            \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m   / ____/____(_)____/ /_(_)___ _____     / ____/___ ___  __ \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m  / /   / ___/ / ___/ __/ / __ `/ __ \\   / / __/ __ `/ / / / \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m / /___/ /  / (__  ) /_/ / /_/ / / / /  / /_/ / /_/ / /_/ /  \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m \\____/_/  /_/____/\\__/_/\\__,_/_/ /_/   \\____/\\__,_/\\__, /   \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m                                                   /____/    \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m                                                             \x1b[0m");
  console.log("");
});

async function sanitize(req){
  //non è una buona sanificazione, ma dovrebbe prevenire il blocco accidentale del db
  req.NomeCliente = '' + req.NomeCliente;
  if (!req.Email)
    req.Email = '';

  if (!req.Telefono)
    req.Telefono = '';

  if (!req.Token || req.Token.TokenId == ''){
    req.Token = {};
    req.Token = await getToken(10);  //questo non credo di poterlo lasciare nel prodotto finito
  }

  if (!req.Resine || req.Resine.length == 0){
    req.Resine = [];
    req.Resine[0] = {};
    req.Resine[0].nome = '';
    req.Resine[0].numero = 0;
  }

  if (!req.Macchine || req.Macchine.length == 0){
    req.Macchine = [];
    req.Macchine[0] = {};
    req.Macchine[0].seriale = '';
    req.Macchine[0].modello = '';
    req.Macchine[0].info = '';
  }

  if (!req.Software || req.Software.length == 0) {
    req.Software = [];
    req.Software[0] = {};
    req.Software[0].nome = '';
  }

  if (!req.Assistenze) {
    req.Assistenze = '';
  }

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
  console.log('\x1b[46m Connesso   -> \x1b[0m \x1b[4m' + req.ip + '\x1b[0m');
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

app.get('/infocliente', function(req, res) {
  const cliente = req.query.c;
  const viewUrlfull = viewUrl + '?key="' + cliente + '"';
  var objcheck = req.query.o;
  objcheck ??= false; //lo setta a false se è null o undefined

  couch.get(dbName, viewUrlfull).then(
    function(data, headers, status){
      if (objcheck == false) {
        res.render('pages/infoClienteFlex', {customer:data.data.rows[0]});
      }
      else {
        res.send(data.data.rows[0]); //ristruttura questo in un altra funzione se ci sono problemi di prestazioni (facendo una view apposta sul db e mettendo questo in un altro app.get)
      }
  },
    function(err){
    res.send(err);
  });

  //res.render('pages/indexNo'); //non mettere lo slash prima delle cartelle
});

app.get('/modifica', function(req, res) {
  const cliente = req.query.c;
  const viewUrlfull = viewUrl + '?key="' + cliente + '"';
  var resin;

  couch.get(resindb, allUrl).then(
    function(data, headers, status) {
      devices = data.data.rows[1];
      software = data.data.rows[2]; //si lo so che è orribile fare così, ma funziona (e probabilmente mi creerà problemi in futuro)
      resin = data.data.rows[3];
      couch.get(dbName, viewUrlfull).then(
        function(data, headers, status){
          res.render('pages/modificaClienteFlex', {customer:data.data.rows[0], resindb:resin, softwaredb:software, devicedb:devices});
      },
        function(err){
        res.send(err);
      });
  },
    function(err) {
    res.send(err);
  });
});

app.post('/customer/update', async function(req, res) {
  var obj = await sanitize(req.body);
  couch.update(dbName, {
    _id: obj._id,
    _rev: obj._rev,
    NomeCliente: '' + obj.NomeCliente,
    Email: obj.Email,
    Telefono: obj.Telefono,
    token: obj.Token,
    Resine: obj.Resine,
    Macchine: obj.Macchine,
    Software: obj.Software,
    Assistenze: obj.Assistenze

  }).then(function(data, headers, status) {
    console.log("\x1b[43m Aggiornato -> \x1b[0m id:" + obj._id + " da: " + req.ip + "\x1b[0m");
    res.send("infoCliente?c=" + obj._id);
  },
  function(err) {
    res.send(err);
    console.log(err);
  });
});

app.post('/customer/add', async function(req, res) {
  var obj = await sanitize(req.body);

  couch.uniqid().then(async function(ids) {
    const id = ids[0];

    couch.insert(dbName, {
      _id: id,              //a sinistra il nome di quello che c'è sul db, a destra quello che c'è nel form, quindi ad esempio name, perchè lo chiamo così nella variabile sopra
      NomeCliente: obj.NomeCliente,
      Email: obj.Email,
      Telefono: obj.Telefono,
      token: await getToken(obj.Token),
      Resine: obj.Resine,
      Macchine: obj.Macchine,
      Software: obj.Software,
      Assistenze: ''

    }).then(
      function(data, headers, status){
        console.log("\x1b[42m Aggiunto   -> \x1b[0m " + obj.NomeCliente + " " + id + "\x1b[0m");
        res.send({name: obj.NomeCliente, id: id});
      },
      function(err) {
        res.send(err);
      });
  });
});

app.post('/customer/delete', function(req, res) {
  var id = req.body.id;
  var rev = req.body.rev;

  couch.del(dbName, id, rev).then(
    function(data, headers, status) {
      console.log("\x1b[41m Eliminato  -> \x1b[0m id: " + id + " rev: " + rev + "\x1b[0m");
      res.send(data);
    },
    function(err) {
      res.send(err);
    });
});

app.get('/resina?e?', function(req, res) {
  couch.get(resindb, resinUrl).then(
    function(data, headers, status) {
      data.data.rows[0].value.resin.sort((a, b) => {
          let fa = a.name.toLowerCase(),
              fb = b.name.toLowerCase();

          if (fa < fb) {
              return -1;
          }
          if (fa > fb) {
              return 1;
          }
          return 0;
      });
      res.render('pages/resin', {resina:data.data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/resin/update', function(req, res) {
  //niente mauro alla fine ho fatto un documento solo come dicevi tu perchè era troppo poco consistente
  couch.update(resindb, {
    _id: req.body.id,
    _rev: req.body.rev,
    resin: req.body.resin
  }).then(
    function(data, headers, status) {
      console.log("\x1b[43m Aggiornato RESINE-> \x1b[0m id:" + req.body.id + " da: " + req.ip + "\x1b[0m");
      res.send('/')
    },
    function(err) {
      console.log(err);
  });
});

app.get('/software', function(req, res) {
  couch.get(resindb, softwareUrl).then(
    function(data, headers, status) {
      data.data.rows[0].value.software.sort((a, b) => {
          let fa = a.name.toLowerCase(),
              fb = b.name.toLowerCase();

          if (fa < fb) {
              return -1;
          }
          if (fa > fb) {
              return 1;
          }
          return 0;
      });
      res.render('pages/software', {software:data.data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/software/update', function(req, res) {
  couch.update(resindb, {
    _id: req.body.id,
    _rev: req.body.rev,
    software: req.body.software
  }).then(
    function(data, headers, status) {
      console.log("\x1b[43m Aggiornato SOFTWARE-> \x1b[0m id:" + req.body.id + " da: " + req.ip + "\x1b[0m");
      res.send('/')
    },
    function(err) {
      console.log(err);
  });
});

app.get('/macchine', function(req, res) {
  couch.get(resindb, devicesUrl).then(
    function(data, headers, status) {
      data.data.rows[0].value.devices.sort((a, b) => {
          let fa = a.name.toLowerCase(),
              fb = b.name.toLowerCase();

          if (fa < fb) {
              return -1;
          }
          if (fa > fb) {
              return 1;
          }
          return 0;
      });
      res.render('pages/devices', {macchine:data.data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/devices/update', function(req, res) {
  couch.update(resindb, {
    _id: req.body.id,
    _rev: req.body.rev,
    devices: req.body.devices
  }).then(
    function(data, headers, status) {
      console.log("\x1b[43m Aggiornato MACCHINE-> \x1b[0m id:" + req.body.id + " da: " + req.ip + "\x1b[0m");
      res.send('/')
    },
    function(err) {
      console.log(err);
  });
});

function getToken(tokenquantity) {
  return couch.get(resindb, tokenUrl).then(
    async function(data, headers, status) {
      var date = new Date();
      const options = { year: '2-digit', month: '2-digit'};
      const dateArr = new Intl.DateTimeFormat('it-IT', options).formatToParts(date);
      const year = dateArr[2].value;
      const month = dateArr[0].value;
      var quantityLetter = '';

      switch (tokenquantity) {
        case 20:
          quantityLetter = 'V';
          break;
        case 50:
          quantityLetter = 'C';
          break;
        default:
          quantityLetter = 'D';
          break;
      }
      var serial = String(data.data.rows[0].value.tokenSerial);

      if (Number(year) > Number(String(data.data.rows[0].value.lastUpdated.year).slice(2))) {   //funzionerà a meno che non venga utilizzato per un secolo (letteralmente)
        serial = '0';
      }
      var tokenid = "T" + year + month + "-" + quantityLetter + serial.padStart(5, '0');
      date.setFullYear(date.getFullYear() + 1);
      const token = { TokenId: tokenid, ExpirationDate: date, Quantity: tokenquantity };
      const newSerial = Number(serial) + 1;

      await updateTokenSerial(data.data.rows[0].value.rev, newSerial);
      return token;
    },
    function(err) {
      console.log(err);
    }
  );
}

function updateTokenSerial(rev, newSerial) {
  var date = new Date();
  couch.update(resindb, {
    _id: tokenDocId,
    _rev: rev,
    tokenSerial: newSerial,
    lastUpdated: {
      year: date.getUTCFullYear(),  //ci metto utc giusto perchè non sono sicuro di quale vogliano e questo dovrebbe andare bene
      utcFullDate: date.getUTCDate()
    }

  }).then(function(data, headers, status) {
    console.log("\x1b[43m Aggiornato -> \x1b[0m SERIALE TOKEN\x1b[0m");
  },
  function(err) {
    console.log(err);
    return 'err';
  });
}

app.listen(80, function() {
  console.log("Server started on port 80");
});

app.get('script.js', function(req, res) {
  res.send('files/script.js');
});

app.get('resindbscript.js', function(req, res) {
  res.send('files/resindbscript.js');
});
