import SQLite from 'react-native-sqlite-storage'
class LocalDb{
  db: SQLite.SQLiteDatabase | null;
  //Callback functions
  constructor(){
    this.db = null;
    SQLite.openDatabase({name: "tunes.db", location: "default"}).then(database =>{
      this.db = database;
    });
  }
  errorCB(err) {
    console.log("SQLite Error: " + err);
  }
  successCB() {
    console.log("SQL execution OK");
  }
  openCB() {
    console.log("Database opened.");
  }
};

export default new LocalDb();
