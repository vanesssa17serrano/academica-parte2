<?php
include('../../Config/Config.php');
extract($_REQUEST);
$materias = isset($materias) ? $materias : '[]';
$accion = $accion ?? '';
$class_materias = new Materias($conexion);
echo json_encode($class_materias->recibir_datos($materias));

class Materias {
    private $datos = [];
    private $db;
    private $respuesta = ['msg' => 'ok'];

    public function __construct($db) {
        $this->db = $db;
    }

    public function recibir_datos($materias) {
        global $accion;
        if ($accion === 'consultar') {
            return $this->administrar_materias();
        } else {
            $this->datos = json_decode($materias, true);
            return $this->validar_datos();
        }
    }

    private function validar_datos() {
        if (empty($this->datos['idmateria'])) {
            $this->respuesta['msg'] = 'Por error no se pudo seleccionar la ID';
        }
        if (empty($this->datos['codigo'])) {
            $this->respuesta['msg'] = 'Por favor ingrese el código de la materia';
        }
        if (empty($this->datos['nombre'])) {
            $this->respuesta['msg'] = 'Por favor ingrese el nombre de la materia';
        }
        return $this->administrar_materias();
    }

    private function administrar_materias() {
        global $accion;
        if ($this->respuesta['msg'] === 'ok') {
            if ($accion === 'nuevo') {
                return $this->db->consultas('INSERT INTO materias VALUES(?,?,?)',
                    $this->datos['idmateria'], $this->datos['codigo'], $this->datos['nombre']);
            } elseif ($accion === 'modificar') {
                return $this->db->consultas('UPDATE materias SET codigo=?, nombre=? WHERE idmateria=?',
                    $this->datos['codigo'], $this->datos['nombre'], $this->datos['idmateria']);
            } elseif ($accion === 'eliminar') {
                return $this->db->consultas('DELETE FROM materias WHERE idmateria=?',
                    $this->datos['idmateria']);
            } elseif ($accion === 'consultar') {
                $this->db->consultas('SELECT * FROM materias');
                return $this->db->obtener_datos();
            }
        }
        return $this->respuesta;
    }
}
?>