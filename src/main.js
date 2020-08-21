const fs = require('fs');
const { dialog, app } = require('electron').remote;
const electron = require('electron');

window.$ = require('jquery');
window.jQuery = require('jquery');
require('jquery-serializejson');
const ipc = electron.ipcRenderer;
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite',
  },
});

document.getElementById('save').addEventListener(
  'click',
  () => {
    let content = 'Hello, this is the content of the file';

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = dd + '_' + mm + '_' + yyyy;

    const options = {
      title: 'Сохранить отчет в JSON файл',
      buttonLabel: 'Сохранить отчет',
      defaultPath:
        app.getPath('documents') + '/Отчет_' + today.toString() + '.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    };
    var filename = dialog
      .showSaveDialog(null, options)
      .then((result) => {
        filename = result.filePath;
        if (filename === undefined) {
          alert('Отчет не сохранен');
          return;
        }
        createJSON();
        fs.writeFile(filename, content, (err) => {
          if (err) {
            alert('Отчет не был сохранен');
            return;
          }
          alert('Отчет успешно сохранен!');
        });
      })
      .catch((err) => {
        alert(err);
      });
  },
  false
);

document.getElementById('open').addEventListener(
  'click',
  () => {
    const options = {
      title: 'Открыть отчет',
      buttonLabel: 'Открыть отчет',
      defaultPath: app.getPath('documents'),
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    };
    dialog
      .showOpenDialog(options)
      .then((fileNames) => {
        if (fileNames === undefined) {
          alert('Отчет не открыт');
          return;
        }

        fs.readFile(fileNames.filePaths[0], 'utf-8', (err, data) => {
          if (err) {
            alert('Невозможно прочитать файл' + err);
            return;
          }
          alert(data);
        });
      })
      .catch((err) => {
        alert(err);
      });
  },
  false
);

function createJSON() {
  var obj = $('input').serializeJSON();
  var jsonString = JSON.stringify(obj);
  console.log(jsonString);
}

document.addEventListener(
  'focus',
  () => {
    console.log('focus');
    var inputId = new String(event.target.id);
    var classname = event.target.classname;
    console.log(classname);
    var id = getId(inputId);
    $.each($("input[id$='" + id + "']"), () => {
      console.log($(this));
      $(this).css('background-color', '#000000');
    });
    $('.' + classname).css('background-color', function () {
      return '#000000';
    });
  },
  true
);

document.addEventListener(
  'change',
  () => {
    var inputId = new String(event.target.id);
    if (inputId.includes('dish-name')) {
      var id = 'number-' + getId(inputId);
      getNumber(document.getElementById(event.target.id).value.toString(), id);
      //Make yellow background for number input
      document.getElementById(id).style.backgroundColor = '#f3f6d0';
    }
    if (inputId.includes('mb')) {
      getBenefitsSum(
        'mb',
        'detalization-input-mb-20-1-price',
        event.target.value
      );
    }
    if (inputId.includes('uszn')) {
      getBenefitsSum(
        'uszn',
        'detalization-input-uszn-1-price',
        event.target.value
      );
    }
    if (inputId.includes('ovz')) {
      getBenefitsSum('ovz', 'detalization-input-ovz-price', event.target.value);
    }
    if (inputId.includes('sport')) {
      getBenefitsSum(
        'sport',
        'detalization-input-sport-1-price',
        event.target.value
      );
    }
  },
  false
);

function getId(inputId) {
  var arr = inputId.split('-');
  return arr[arr.length - 1].toString();
}

function getBenefitsSum(classname, benefitField, value) {
  var sum = new Number();
  var elements = document.getElementsByClassName(classname);
  for (var i = 0; i < elements.length; i++) {
    const price = Math.round(Number(elements[i].value * 100));
    sum += price;
  }
  sum = sum / 100;
  document.getElementById(benefitField).value = sum;
  document.getElementById(benefitField).style.backgroundColor = '#f3f6d0';
}

function getNumber(dishname, number) {
  var promise = new Promise((resolve, reject) => {
    var num;
    knex('dishes')
      .where({
        name: dishname,
      })
      .select('number')
      .then(function (result) {
        num = result[0].number;

        resolve(num);
      });
  });
  promise.then(
    (result) => {
      document.getElementById(number).value = result;
    },
    (error) => alert('Rejected: ' + error.message)
  );
}

document.addEventListener('DOMContentLoaded', function () {
  ipc.send('mainWindowLoaded');
  ipc.on('resultSent', function (evt, result) {
    let datalist = document.getElementById('datalist');
    console.log(result);
    for (var i = 0; i < result.length; i++) {
      datalist.innerHTML +=
        '<option>' + result[i].name.toString() + '</option>';
    }
  });
});

$('.arrow').on('click', function () {
  $(this).toggleClass('active');
  console.log(this.parentElement.nextSibling.nextSibling);
  var content = this.parentElement.nextSibling.nextSibling;
  if (content.style.display === 'block') {
    content.style.display = 'none';
  } else {
    content.style.display = 'block';
  }
});
