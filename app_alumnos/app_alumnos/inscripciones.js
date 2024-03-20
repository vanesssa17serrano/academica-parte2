Vue.component('v-select-materia', VueSelect.VueSelect);
Vue.component('componente-inscripciones', {
    data() {
        return {
            valor:'',
            inscripciones:[],
            materias:[],
            accion:'nuevo',
            inscripcion:{
                materia:{
                    id:'',
                    label:''
                },
                idProducto: new Date().getTime(),
                codigo:'',
                nombre:'',
                marca:'',
                modalidad:'',
                cuota:0.0,
                foto:'',
            }
        }
    },
    methods:{
        buscarProducto(e){
            this.listar();
        },
        async eliminarProducto(idProducto){
            if( confirm(`Esta seguro de elimina el inscripcion?`) ){
                await db.inscripciones.where("idProducto").equals(idProducto).delete();
                this.inscripcion.foto = '';
                let respuesta = await fetch(`private/modulos/inscripciones/inscripciones.php?accion=eliminar&inscripciones=${JSON.stringify(this.inscripcion)}`),
                    data = await respuesta.json();
                this.nuevoProducto();
                this.listar();
            }
        },
        modificarProducto(inscripcion){
            this.accion = 'modificar';
            this.inscripcion = inscripcion;
        },
        async guardarProducto(){
            //almacenamiento del objeto inscripciones en indexedDB
            if( this.inscripcion.materia.id=='' ||
                this.inscripcion.materia.label=='' ){
                console.error("Por favor seleccione una materia");
                return;
            }
            await db.inscripciones.bulkPut([{...this.inscripcion}]);
            let respuesta = await fetch(`private/modulos/inscripciones/inscripciones.php?accion=${this.accion}&inscripciones=${JSON.stringify(this.inscripcion)}`),
                data = await respuesta.json();
            this.nuevoProducto();
            this.listar();
            
            /*query.onerror = e=>{
                console.error('Error al guardar en inscripciones', e);
                if( e.target.error.message.includes('uniqueness') ){
                    alertify.error(`Error al guardar en inscripciones, codigo ${this.inscripcion.codigo} ya existe`);
                    return;
                }
                alertify.error(`Error al guardar en inscripciones, ${e.target.error.message}`);
            };*/
        },
        nuevoProducto(){
            this.accion = 'nuevo';
            this.inscripcion = {
                materia:{
                    id:'',
                    label:''
                },
                idProducto: new Date().getTime(),
                codigo:'',
                nombre:'',
                marca:'',
                modalidad:'',
                cuota:0.0
            }
        },
        async listar(){
            let collections = db.materias.orderBy('nombre');
            this.materias = await collections.toArray();
            this.materias = this.materias.map(materia=>{
                return {
                    id: materia.idmateria,
                    label:materia.nombre
                }
            });
            let collection = db.inscripciones.orderBy('codigo').filter(
                inscripcion=>inscripcion.codigo.includes(this.valor) || 
                    inscripcion.nombre.toLowerCase().includes(this.valor.toLowerCase()) || 
                    inscripcion.marca.toLowerCase().includes(this.valor.toLowerCase()) || 
                    inscripcion.modalidad.toLowerCase().includes(this.valor.toLowerCase())
            );
            this.inscripciones = await collection.toArray();
            if( this.inscripciones.length<=0 ){
                let respuesta = await fetch('private/modulos/inscripciones/inscripciones.php?accion=consultar'),
                    data = await respuesta.json();
                this.inscripciones = data.map(inscripcion=>{
                    return {
                        materia:{
                            id:inscripcion.idmateria,
                            label:inscripcion.nomcat
                        }, 
                        idProducto : inscripcion.idProducto,
                        codigo: inscripcion.codigo,
                        nombre: inscripcion.nombre,
                        marca: inscripcion.marca,
                        modalidad: inscripcion.modalidad,
                        cuota: inscripcion.cuota,
                        foto:inscripcion.foto.split(' ').join('+')
                    }
                });
                db.inscripciones.bulkPut(this.inscripciones);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-5">
                <div class="card">
                    <div class="card-header text-bg-dark">REGISTRO DE inscripciones</div>
                    <div class="catd-body">
                        <form id="frmProducto" @reset.prevent.default="nuevoProduto" @submit.prevent.default="guardarProducto">
                            <div class="row p-1">
                                <div class="col col-md-2">materia</div>
                                <div class="col col-md-8">
                                    <v-select-materia required v-model="inscripcion.materia" 
                                        :options="materias">Por favor seleccione una materia</v-select-materia>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CODIGO</div>
                                <div class="col col-md-5">
                                    <input v-model="inscripcion.codigo" required pattern="[0-9]{2,25}" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">NOMBRE</div>
                                <div class="col col-md-10">
                                    <input v-model="inscripcion.nombre" required pattern="^[a-zA-ZáíéóúñÑ]{3,50}([a-zA-ZáíéóúñÑ ]{1,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">MARCA</div>
                                <div class="col col-md-8">
                                    <input v-model="inscripcion.marca" required pattern="^[a-zA-ZáíéóúñÑ]{3,50}([a-zA-ZáíéóúñÑ ]{1,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">MODALIDAD</div>
                                <div class="col col-md-10">
                                    <input v-model="inscripcion.modalidad" required pattern="^[a-zA-Z0-9áíéóúñÑ]{1,50}([a-zA-Z0-9áíéóúñÑ. ]{2,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CUOTA</div>
                                <div class="col col-md-3">
                                    <input v-model="inscripcion.cuota" required type="number" step="0.01" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">
                                    <img :src="inscripcion.foto" width="50"/>
                                </div>
                                <div class="col col-md-8">
                                    <div class="mb-3">
                                        <label for="formFile" class="form-label">Seleccione la foto</label>
                                        <input class="form-control" type="file" id="formFile" required 
                                            accept="image/*" onChange="seleccionarFoto(this)">
                                    </div>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col">
                                    <input type="submit" class="btn btn-success" value="GUARDAR"/>
                                    <input type="reset" class="btn btn-warning" value="NUEVO" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col col-md-7">
                <div class="card text-bg-dark">
                    <div class="card-header">LISTADO DE inscripciones</div>
                    <div class="card-body">
                        <form id="frmProducto">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="7">
                                            <input placeholder="codigo, nombre, marca, modalidad" type="search" v-model="valor" @keyup="buscarProducto" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>materia</th>
                                        <th>CODIGO</th>
                                        <th>NOMBRE</th>
                                        <th>MARCA</th>
                                        <th>MODALIDAD</th>
                                        <th>CUOTA</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarProducto(inscripcion)" v-for="inscripcion in inscripciones" :key="inscripcion.idProducto">
                                        <td>{{inscripcion.materia.label}}</td>
                                        <td>{{inscripcion.codigo}}</td>
                                        <td>{{inscripcion.nombre}}</td>
                                        <td>{{inscripcion.marca}}</td>
                                        <td>{{inscripcion.modalidad}}</td>
                                        <td>{{inscripcion.cuota}}</td>
                                        <td><img :src="inscripcion.foto" width="50"/></td>
                                        <td><button @click.prevent.default="eliminarProducto(inscripcion.idProducto)" class="btn btn-danger">del</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
});