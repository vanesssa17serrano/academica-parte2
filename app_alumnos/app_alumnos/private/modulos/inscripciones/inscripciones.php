<?php
include('../../Config/Config.php');
extract($_REQUEST);

$inscripciones = isset($inscripciones) ? $inscripciones : '[]';
$accion=$accion ?? '';
$class_productos = new inscripciones($conexion);
print_r( json_encode($class_productos->recibir_datos($inscripciones)) );

class inscripciones{
    private $datos=[], $db, $respuesta = ['msg'=>'ok'];
    public function __construct($db){
        $this->db = $db;
    }
    public function recibir_datos($inscripciones){
        global $accion;
        if($accion==='consultar'){
            return $this->administrar_productos();
        }else{
            $this->datos = json_decode($inscripciones, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos(){
        if( empty($this->datos['idProducto']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if( empty($this->datos['materia']['id']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la materia';
        }
        if( empty($this->datos['codigo']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo del inscripcion';
        }
        if( empty($this->datos['nombre']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del inscripcion';
        }
        if( empty($this->datos['marca']) ){
            $this->respuesta['msg'] = 'Por favor ingrese la marca del inscripcion';
        }
        if( empty($this->datos['modalidad']) ){
            $this->respuesta['msg'] = 'Por favor ingrese la modalidad del inscripcion';
        }
        if( empty($this->datos['cuota']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el cuota del inscripcion';
        }
        return $this->administrar_productos();
    }
    private function administrar_productos(){
        global $accion;
        if( $this->respuesta['msg'] === 'ok' ){
            if( $accion==='nuevo' ){
                return $this->db->consultas('INSERT INTO inscripciones VALUES(?,?,?,?,?,?,?,?)',
                $this->datos['idProducto'],$this->datos['materia']['id'],$this->datos['codigo'],
                    $this->datos['nombre'],$this->datos['marca'],$this->datos['modalidad'],$this->datos['cuota'],$this->datos['foto']);
            }else if($accion==='modificar' ){
                return $this->db->consultas('UPDATE inscripciones SET idmateria=?, codigo=?, nombre=?, marca=?, modalidad=?, cuota=?, foto=? WHERE idProducto=?',
                $this->datos['materia']['id'], $this->datos['codigo'],$this->datos['nombre'], $this->datos['marca'], $this->datos['modalidad'], 
                $this->datos['cuota'], $this->datos['foto'], $this->datos['idProducto']);
            }else if($accion==='eliminar'){
                return $this->db->consultas('DELETE inscripciones FROM inscripciones WHERE idProducto=?',
                $this->datos['idProducto']);
            }else if($accion==='consultar'){
                $this->db->consultas('
                    SELECT inscripciones.idProducto, inscripciones.idmateria, inscripciones.codigo, inscripciones.nombre, 
                        inscripciones.marca, inscripciones.modalidad, inscripciones.cuota, inscripciones.foto, materias.nombre AS nomcat
                    FROM inscripciones
                        INNER JOIN materias ON (inscripciones.idmateria = materias.idmateria)
                ');
                return $this->db->obtener_datos();
            }
        }else{
            return $this->respuesta;
        }
    }
}
?>