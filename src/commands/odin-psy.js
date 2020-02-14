const sqlite3 = require('sqlite3').verbose();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const command = {
  name: 'odin-psy',
  run: async toolbox => {
    const { print, parameters, filesystem } = toolbox

    const { input_dir, output_dir } = parameters.options;

    if (!input_dir || !output_dir) {
      print.error("--input_dir and --output_dir is required");
      return;
    }
    if (!filesystem.exists(input_dir)) {
      print.error('Dir input not found');
      return
    }

    if (!filesystem.exists(output_dir)) {
      print.error('Dir output not found');
      return
    }

    const arquives = filesystem.find(input_dir, { matching: ['*.aut', 'autopsy.db'], files: true });
    if (!arquives) {
      print.error("Dir input not found arquives");
    }

    let db_sqlite = new sqlite3.Database(path.resolve(input_dir, '..', arquives[1]), (err) => {
      if (err) {
        console.log(err.message);
      }
      console.log('connected to DB');
    });

    function createCsv(headers, recordes) {
      const csvWriter = createCsvWriter({
        path: output_dir + '/teste.csv',
        header: [
          { id: 'name', title: 'NAME' },
          { id: 'lang', title: 'LANGUAGE' }
        ]
      });

      const records = [
        { name: 'Bob', lang: 'French, English' },
        { name: 'Mary', lang: 'English' }
      ];

      csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
          console.log('...Done');
        });
    }

    db_sqlite.serialize(() => {
      db_sqlite.all('SELECT * FROM image_gallery_db_info', (err, rows) => {
        if (err) {
          console.log(err)
        }
        createCsv('teste', 'reste');
      })
    });
  }
}

module.exports = command
