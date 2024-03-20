Vue.component('componente-alumnos', {
    data() {
        return {
            valor:'',
            alumnos:[],
            accion:'nuevo',
            alumno:{
                idalumno: new Date().getTime(),
                codigo:'',
                nombre:'',
                direccion:'',
                telefono:'',
                email:''
            }
        }
    },
    methods:{
        buscaralumno(e){
            this.listar();
        },
        eliminaralumno(idalumno){
            if( confirm(`Esta seguro de elimina el alumno?`) ){
                let store = abrirStore('alumnos', 'readwrite'),
                query = store.delete(idalumno);
            query.onsuccess = e=>{
                this.nuevoalumno();
                this.listar();
            };
            }
        },
        modificaralumno(alumno){
            this.accion = 'modificar';
            this.alumno = alumno;
        },
        guardaralumno(){
            //almacenamiento del objeto alumnos en indexedDB
            let store = abrirStore('alumnos', 'readwrite'),
                query = store.put({...this.alumno});
            query.onsuccess = e=>{
                this.nuevoalumno();
                this.listar();
            };
            query.onerror = e=>{
                console.error('Error al guardar en alumnos', e.message());
            };
        },
        nuevoalumno(){
            this.accion = 'nuevo';
            this.alumno = {
                idalumno: new Date().getTime(),
                codigo:'',
                nombre:'',
                direccion:'',
                telefono:'',
                email:''
            }
        },
        listar(){
            let store = abrirStore('alumnos', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp=>{
                this.alumnos = data.result
                    .filter(alumno=>alumno.codigo.includes(this.valor) || 
                    alumno.nombre.toLowerCase().includes(this.valor.toLowerCase()) || 
                    alumno.direccion.toLowerCase().includes(this.valor.toLowerCase()) || 
                    alumno.telefono.toLowerCase().includes(this.valor.toLowerCase()) ||
                    alumno.email.toLowerCase().includes(this.valor.toLowerCase()));
            };
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-6">
                <div class="card text-bg-dark">
                    <div class="card-header">REGISTRO DE ALUMNOS</div>
                    <div class="catd-body">
                        <div class="row p-1">
                            <div class="col col-md-2">CODIGO</div>
                            <div class="col col-md-3">
                                <input v-model="alumno.codigo" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">NOMBRE</div>
                            <div class="col col-md-5">
                                <input v-model="alumno.nombre" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">DIRECCION</div>
                            <div class="col col-md-3">
                                <input v-model="alumno.direccion" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">TELEFONO</div>
                            <div class="col col-md-3">
                                <input v-model="alumno.telefono" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col col-md-2">EMAIL</div>
                            <div class="col col-md-3">
                                <input v-model="alumno.email" type="email" class="form-control">
                            </div>
                        </div>
                        <div class="row p-1">
                            <div class="col">
                                <button @click.prevent.default="guardaralumno" class="btn btn-success">GUARDAR</button>
                                <button @click.prevent.default="nuevoalumno" class="btn btn-warning">NUEVO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col col-md-6">
                <div class="card text-bg-dark">
                    <div class="card-header">LISTADO DE ALUMNOS</div>
                    <div class="card-body">
                        <form id="frmalumno">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="5">
                                            <input placeholder="codigo, nombre, direccion, telefono, email" type="search" v-model="valor" @keyup="buscaralumno" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>NOMBRE</th>
                                        <th>DIRECCION</th>
                                        <th>TELEFONO</th>
                                        <th>EMAIL</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificaralumno(alumno)" v-for="alumno in alumnos" :key="alumno.idalumno">
                                        <td>{{alumno.codigo}}</td>
                                        <td>{{alumno.nombre}}</td>
                                        <td>{{alumno.direccion}}</td>
                                        <td>{{alumno.telefono}}</td>
                                        <td>{{alumno.email}}</td>
                                        <td><button @click.prevent.default="eliminaralumno(alumno.idalumno)" class="btn btn-danger">del</button></td>
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