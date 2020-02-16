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

    function createCsv(recordes) {
      const csvWriter = createCsvWriter({
        path: output_dir + '/teste.csv',
        header: [
          { id: 'file_obj_id', title: 'file_obj_id' },
          { id: 'file_ctime', title: 'file_ctime' },
          { id: 'file_mtime', title: 'file_mtime' },
          { id: 'file_crtime', title: 'file_crtime' },
          { id: 'file_atime', title: 'file_atime' },
          { id: 'file_name', title: 'file_name' },
          { id: 'file_md5', title: 'file_md5' },
          { id: 'attribute_type_name', title: 'attribute_type_name' },
          { id: 'attribute_value', title: 'attribute_value' },
          { id: 'artifact_type_name', title: 'artifact_type_name' },
          { id: 'artifact_type_display_name', title: 'artifact_type_display_name' },
          { id: 'layout_byte_start', title: 'layout_byte_start' },
          { id: 'layout_byte_len', title: 'layout_byte_len' },
          { id: 'layout_sequence', title: 'layout_sequence' },
        ]
      });

      const records = [
        ...recordes
      ];

      csvWriter.writeRecords(records)       // returns a promise
        .then(() => {
          console.log('Sucess');
        });
    }

    let sql = 'select tsk_files.obj_id as file_obj_id, tsk_files.ctime as file_ctime, tsk_files.mtime as file_mtime, tsk_files.crtime as file_crtime, tsk_files.atime as file_atime, tsk_files.name as file_name, tsk_files.md5 as file_md5, blackboard_attribute_types.display_name as attribute_type_name, blackboard_attribute_types.type_name as attribute_type_name, blackboard_attributes.value_text as attribute_value, blackboard_artifact_types.type_name as artifact_type_name, blackboard_artifact_types.display_name as artifact_type_display_name, tsk_file_layout.byte_start as layout_byte_start, tsk_file_layout.byte_len as layout_byte_len, tsk_file_layout.sequence as layout_sequence from tsk_files inner join blackboard_artifacts on blackboard_artifacts.obj_id = tsk_files.obj_id inner join blackboard_artifact_types on blackboard_artifact_types.artifact_type_id = blackboard_artifacts.artifact_type_id inner join blackboard_attributes on blackboard_attributes.artifact_id = blackboard_artifacts.artifact_id inner join blackboard_attribute_types on blackboard_attribute_types.attribute_type_id = blackboard_attributes.attribute_type_id inner join tsk_file_layout on tsk_file_layout.obj_id = tsk_files.obj_id order by tsk_files.obj_id';

    db_sqlite.serialize(() => {
      db_sqlite.all(sql, (err, rows) => {
        if (err) {
          console.log(err)
        }
        // console.log(rows);
        createCsv(rows);
      })
    });
  }
}

module.exports = command;
