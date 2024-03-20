<?php
class DB{
    private $conexion, $preparado, $resultado;

    public function __construct($server, $user, $pass){
        $this->conexion = new PDO($server, $user, $pass, 
        array(PDO::ATTR_EMULATE_PREPARES => false, 
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)) or die("Error al conectar a la base de datos");
    }
    public function consultas($sql){
        try{
            $parametros = func_get_args();//Obtiene los parametros de la consulta
            array_shift($parametros);//Elimina el primer parametro que es la consulta

            $this->preparado = $this->conexion->prepare($sql);
            $this->resultado = $this->preparado->execute($parametros);
            return $this->resultado;
        }catch(Exception $e){
            echo 'Error: ' . $e->getMessage();
        }
    }
    public function obtener_datos(){
        return $this->preparado->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>