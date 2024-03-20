var db;
const funcdb = ()=>{
    db = new Dexie("db_sistema");
    db.version(1).stores({
        materias:'idmateria,codigo,nombre',
        registros:'idregistro,codigo,nombre,sede,modalidad'
      });
};
funcdb();