const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nano = require('nano')({
  url: 'http://Admin:Admin@127.0.0.1:5984',
  requestDefaults: {
    jar: true
  }
});

const maindb = nano.db.use('cristiangay');
const designName = 'all_customers';
const viewName = 'all';
const resindb = nano.db.use('resindb');
const resinDes = 'all_resin'
const allView = 'all'
const resinUrl = 'resinView';
const tokenUrl = 'tokenSerialView';
const softwareUrl ='softwareView';
const devicesUrl = 'devicesView';
const resinDocId = 'd83ef8426b5175d49b501145b1001043';
const tokenDocId = '27c178f04e717b96b94d316bc200174b';
const softwareDocId = 'bda7c6faee2f1d25ffd9dcef370037e5';
const devicesDocId = '5cc5e050c903f8137dbf0af46d00024c';

nano.db.list().then(function(dbs) {
   //importantissimo, serve per dare del gay a cristian
  console.log("\x1b[45m\x1b[37m\x1b[5m    ______     _      __  _                ______            \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m   / ____/____(_)____/ /_(_)___ _____     / ____/___ ___  __ \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m  / /   / ___/ / ___/ __/ / __ `/ __ \\   / / __/ __ `/ / / / \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m / /___/ /  / (__  ) /_/ / /_/ / / / /  / /_/ / /_/ / /_/ /  \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m \\____/_/  /_/____/\\__/_/\\__,_/_/ /_/   \\____/\\__,_/\\__, /   \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m                                                   /____/    \x1b[0m");
  console.log("\x1b[45m\x1b[37m\x1b[5m                                                             \x1b[0m");
  console.log("");
  console.log(dbs);
},
function(err) {
  console.log(err);
});

async function sanitize(req){
  //non è una buona sanificazione, ma dovrebbe prevenire il blocco accidentale del db
  req.NomeCliente = '' + req.NomeCliente;
  if (!req.Email)
    req.Email = '';

  if (!req.Telefono)
    req.Telefono = '';

  if (!req.Token || req.Token.TokenId == '' || req.Token.Quantity == ''){
    let num = req?.Token?.Quantity;  //facendo così però non copro il caso in cui non abbia i token, forse dovrei implementare un qualche attributo che dice se li ha o no
    req.Token = await getToken(num || 10);  //no ok però così non può ritornare 0
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
  maindb.view(designName, viewName).then(
    function(data){
      //sort magico che ho trovato da qualche parte
      data.rows.sort((a, b) => {
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
      res.render('index', {customers:data.rows});
  },
    function(err){
    res.send(err);
  });
});

app.get('/infocliente', function(req, res) {
  const cliente = req.query.c;
  var objcheck = req.query.o;
  objcheck ??= false; //lo setta a false se è null o undefined

  maindb.view(designName, viewName, {key: cliente}).then(
    function(data){
      if (objcheck == false) {
        res.render('pages/infoClienteFlex', {customer:data.rows[0]});
      }
      else {
        res.send(data.rows[0]); //ristruttura questo in un altra funzione se ci sono problemi di prestazioni (facendo una view apposta sul db e mettendo questo in un altro app.get)
      }
  },
    function(err){
    res.send(err);
  });
});

app.get('/modifica', function(req, res) {
  const cliente = req.query.c;
  var resin;

  resindb.view(resinDes, allView).then(
    function(data) {
      devices = data.rows[1];
      software = data.rows[2]; //si lo so che è orribile fare così, ma funziona (e probabilmente mi creerà problemi in futuro)
      resin = data.rows[3];
      maindb.view(designName, viewName, {key: cliente}).then(
        function(data){
          res.render('pages/modificaClienteFlex', {customer:data.rows[0], resindb:resin, softwaredb:software, devicedb:devices});
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
  maindb.insert({
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

  }).then(function(data) {
    console.log("\x1b[43m Aggiornato -> \x1b[0m id:" + obj._id + " da: " + req.ip + "\x1b[0m");
    res.send("infoCliente?c=" + obj._id);
  },
  function(err) {
    res.send(err);
    console.log(err);
  });
});

// app.post('/fakeUpdate', async function(req, res) {
//   var obj = await sanitize(req.body);
//   console.log(obj);
// }); //questa andrà poi rimossa una volta fatti i test

app.post('/customer/add', async function(req, res) {
  var obj = await sanitize(req.body);

  nano.uuids().then(async function(ids) {
    const id = ids.uuids[0];
    maindb.insert({
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
      function(data){
        console.log("\x1b[42m Aggiunto   -> \x1b[0m " + obj.NomeCliente + " " + id + "\x1b[0m");
        res.send({name: obj.NomeCliente, id: id});
      },
      function(err) {
        console.log(err);
        res.send(err);
      });
  });
});

app.post('/customer/delete', function(req, res) {
  var id = req.body.id;
  var rev = req.body.rev;

  maindb.destroy(id, rev).then(
    function(data) {
      console.log("\x1b[41m Eliminato  -> \x1b[0m id: " + id + " rev: " + rev + "\x1b[0m");
      console.log(data);
      res.send(data);
    },
    function(err) {
      res.send(err);
    });
});

app.get('/resina?e?', function(req, res) {
  resindb.view(resinDes, resinUrl, {key: resinDocId}).then(
    function(data) {
      data.rows[0].value.resin.sort((a, b) => {
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
      res.render('pages/resin', {resina:data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/resin/update', function(req, res) {
  //niente mauro alla fine ho fatto un documento solo come dicevi tu perchè era troppo poco consistente
  resindb.insert({
    _id: req.body.id,
    _rev: req.body.rev,
    resin: req.body.resin
  }).then(
    function(data) {
      console.log("\x1b[43m Aggiornato RESINE-> \x1b[0m id:" + req.body.id + " da: " + req.ip + "\x1b[0m");
      res.send('/');
    },
    function(err) {
      console.log(err);
  });
});

app.get('/software', function(req, res) {
  resindb.view(resinDes, softwareUrl, {key: softwareDocId}).then(
    function(data) {
      data.rows[0].value.software.sort((a, b) => {
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
      res.render('pages/software', {software:data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/software/update', function(req, res) {
  resindb.insert({
    _id: req.body.id,
    _rev: req.body.rev,
    software: req.body.software
  }).then(
    function(data) {
      console.log("\x1b[43m Aggiornato SOFTWARE-> \x1b[0m id:" + req.body.id + " da: " + req.ip + "\x1b[0m");
      res.send('/')
    },
    function(err) {
      console.log(err);
  });
});

app.get('/macchine', function(req, res) {
  resindb.view(resinDes, devicesUrl, {key: devicesDocId}).then(
    function(data) {
      data.rows[0].value.devices.sort((a, b) => {
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
      res.render('pages/devices', {macchine:data.rows[0] });
    },
    function(err) {
      res.send(err);
  });
});

app.post('/devices/update', function(req, res) {
  resindb.insert({
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
  return resindb.view(resinDes, tokenUrl).then(
    async function(data) {
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
      var serial = String(data.rows[0].value.tokenSerial);

      if (Number(year) > Number(String(data.rows[0].value.lastUpdated.year).slice(2))) {   //funzionerà a meno che non venga utilizzato per un secolo (letteralmente)
        serial = '0';
      }
      var tokenid = "T" + year + month + "-" + quantityLetter + serial.padStart(5, '0');
      date.setFullYear(date.getFullYear() + 1);
      const token = { TokenId: tokenid, ExpirationDate: date, Quantity: tokenquantity };
      const newSerial = Number(serial) + 1;

      await updateTokenSerial(data.rows[0].value.rev, newSerial);
      return token;
    },
    function(err) {
      console.log(err);
    }
  );
}

function updateTokenSerial(rev, newSerial) {
  var date = new Date();
  resindb.insert({
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

app.get('*', function(req, res){
  res.status(404).render('pages/notFound');
});
