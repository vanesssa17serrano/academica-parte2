<?php
include('../../Config/Config.php');
extract($_REQUEST);

$registros = isset($registros) ? $registros : '[]';
$accion=$accion ?? '';
$class_registros = new registros($conexion);
print_r( json_encode($class_registros->recibir_datos($registros)) );

class registros{
    private $datos=[], $db, $respuesta = ['msg'=>'ok'];
    public function __construct($db){
        $this->db = $db;
    }
    public function recibir_datos($registros){
        global $accion;
        if($accion==='consultar'){
            return $this->administrar_registros();
        }else{
            $this->datos = json_decode($registros, true);
            return $this->validar_datos();
        }
    }
    private function validar_datos(){
        if( empty($this->datos['idregistro']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if( empty($this->datos['materia']['id']) ){
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la materia';
        }
        if( empty($this->datos['codigo']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo del registro';
        }
        if( empty($this->datos['nombre']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el nombre del registro';
        }
        if( empty($this->datos['sede']) ){
            $this->respuesta['msg'] = 'Por favor ingrese la sede del registro';
        }
        if( empty($this->datos['modalidad']) ){
            $this->respuesta['msg'] = 'Por favor ingrese la modalidad del registro';
        }
        if( empty($this->datos['precio']) ){
            $this->respuesta['msg'] = 'Por favor ingrese el precio del registro';
        }
        return $this->administrar_registros();
    }
    private function administrar_registros(){
        global $accion;
        if( $this->respuesta['msg'] === 'ok' ){
            if( $accion==='nuevo' ){
                return $this->db->consultas('INSERT INTO registros VALUES(?,?,?,?,?,?,?,?)',
                $this->datos['idregistro'],$this->datos['materia']['id'],$this->datos['codigo'],
                    $this->datos['nombre'],$this->datos['sede'],$this->datos['modalidad'],$this->datos['precio'],$this->datos['foto']);
            }else if($accion==='modificar' ){
                return $this->db->consultas('UPDATE registros SET idmateria=?, codigo=?, nombre=?, sede=?, modalidad=?, precio=?, foto=? WHERE idregistro=?',
                $this->datos['materia']['id'], $this->datos['codigo'],$this->datos['nombre'], $this->datos['sede'], $this->datos['modalidad'], 
                $this->datos['precio'], $this->datos['foto'], $this->datos['idregistro']);
            }else if($accion==='eliminar'){
                return $this->db->consultas('DELETE registros FROM registros WHERE idregistro=?',
                $this->datos['idregistro']);
            }else if($accion==='consultar'){
                $this->db->consultas('
                    SELECT registros.idregistro, registros.idmateria, registros.codigo, registros.nombre, 
                        registros.sede, registros.modalidad, registros.precio, registros.foto, materias.nombre AS nomcat
                    FROM registros
                        INNER JOIN materias ON (registros.idmateria = materias.idmateria)
                ');
                return $this->db->obtener_datos();
            }
        }else{
            return $this->respuesta;
        }
    }
}
?>