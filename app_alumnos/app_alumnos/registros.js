Vue.component('v-select-materia', VueSelect.VueSelect);
Vue.component('componente-registros', {
    data() {
        return {
            valor:'',
            registros:[],
            materias:[],
            accion:'nuevo',
            registro:{
                materia:{
                    id:'',
                    label:''
                },
                idregistro: new Date().getTime(),
                codigo:'',
                nombre:'',
                sede:'',
                modalidad:'',
                precio:0.0,
                foto:'',
            }
        }
    },
    methods:{
        buscarregistro(e){
            this.listar();
        },
        async eliminarregistro(idregistro){
            if( confirm(`Esta seguro de elimina el registro?`) ){
                await db.registros.where("idregistro").equals(idregistro).delete();
                this.registro.foto = '';
                let respuesta = await fetch(`private/modulos/registros/registros.php?accion=eliminar&registros=${JSON.stringify(this.registro)}`),
                    data = await respuesta.json();
                this.nuevoregistro();
                this.listar();
            }
        },
        modificarregistro(registro){
            this.accion = 'modificar';
            this.registro = registro;
        },
        async guardarregistro(){
            //almacenamiento del objeto registros en indexedDB
            if( this.registro.materia.id=='' ||
                this.registro.materia.label=='' ){
                console.error("Por favor seleccione una materia");
                return;
            }
            await db.registros.bulkPut([{...this.registro}]);
            let respuesta = await fetch(`private/modulos/registros/registros.php?accion=${this.accion}&registros=${JSON.stringify(this.registro)}`),
                data = await respuesta.json();
            this.nuevoregistro();
            this.listar();
            
            /*query.onerror = e=>{
                console.error('Error al guardar en registros', e);
                if( e.target.error.message.includes('uniqueness') ){
                    alertify.error(`Error al guardar en registros, codigo ${this.registro.codigo} ya existe`);
                    return;
                }
                alertify.error(`Error al guardar en registros, ${e.target.error.message}`);
            };*/
        },
        nuevoregistro(){
            this.accion = 'nuevo';
            this.registro = {
                materia:{
                    id:'',
                    label:''
                },
                idregistro: new Date().getTime(),
                codigo:'',
                nombre:'',
                sede:'',
                modalidad:'',
                precio:0.0
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
            let collection = db.registros.orderBy('codigo').filter(
                registro=>registro.codigo.includes(this.valor) || 
                    registro.nombre.toLowerCase().includes(this.valor.toLowerCase()) || 
                    registro.sede.toLowerCase().includes(this.valor.toLowerCase()) || 
                    registro.modalidad.toLowerCase().includes(this.valor.toLowerCase())
            );
            this.registros = await collection.toArray();
            if( this.registros.length<=0 ){
                let respuesta = await fetch('private/modulos/registros/registros.php?accion=consultar'),
                    data = await respuesta.json();
                this.registros = data.map(registro=>{
                    return {
                        materia:{
                            id:registro.idmateria,
                            label:registro.nomcat
                        }, 
                        idregistro : registro.idregistro,
                        codigo: registro.codigo,
                        nombre: registro.nombre,
                        sede: registro.sede,
                        modalidad: registro.modalidad,
                        precio: registro.precio,
                        foto:registro.foto.split(' ').join('+')
                    }
                });
                db.registros.bulkPut(this.registros);
            }
        }
    },
    template: `
        <div class="row">
            <div class="col col-md-5">
                <div class="card">
                    <div class="card-header text-bg-dark">REGISTRO DE MATRICULAS</div>
                    <div class="catd-body">
                        <form id="frmregistro" @reset.prevent.default="nuevoProduto" @submit.prevent.default="guardarregistro">
                            <div class="row p-1">
                                <div class="col col-md-2">MATERIA</div>
                                <div class="col col-md-8">
                                    <v-select-materia required v-model="registro.materia" 
                                        :options="materias">Por favor seleccione una materia</v-select-materia>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">CODIGO</div>
                                <div class="col col-md-5">
                                    <input v-model="registro.codigo" required pattern="[0-9]{2,25}" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">NOMBRE</div>
                                <div class="col col-md-10">
                                    <input v-model="registro.nombre" required pattern="^[a-zA-ZáíéóúñÑ]{3,50}([a-zA-ZáíéóúñÑ ]{1,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">SEDE</div>
                                <div class="col col-md-8">
                                    <input v-model="registro.sede" required pattern="^[a-zA-ZáíéóúñÑ]{3,50}([a-zA-ZáíéóúñÑ ]{1,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">Modalidad</div>
                                <div class="col col-md-10">
                                    <input v-model="registro.modalidad" required pattern="^[a-zA-Z0-9áíéóúñÑ]{1,50}([a-zA-Z0-9áíéóúñÑ. ]{2,50})$" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">PRECIO</div>
                                <div class="col col-md-3">
                                    <input v-model="registro.precio" required type="number" step="0.01" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col col-md-2">
                                    <img :src="registro.foto" width="50"/>
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
                    <div class="card-header">LISTADO DE MATRICULAS</div>
                    <div class="card-body">
                        <form id="frmregistro">
                            <table class="table table-dark table-hover">
                                <thead>
                                    <tr>
                                        <th>BUSCAR</th>
                                        <th colspan="7">
                                            <input placeholder="codigo, nombre, sede, modalidad" type="search" v-model="valor" @keyup="buscarregistro" class="form-control">
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>materia</th>
                                        <th>CODIGO</th>
                                        <th>NOMBRE</th>
                                        <th>SEDE</th>
                                        <th>MODALIDAD</th>
                                        <th>PRECIO</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr @click="modificarregistro(registro)" v-for="registro in registros" :key="registro.idregistro">
                                        <td>{{registro.materia.label}}</td>
                                        <td>{{registro.codigo}}</td>
                                        <td>{{registro.nombre}}</td>
                                        <td>{{registro.sede}}</td>
                                        <td>{{registro.modalidad}}</td>
                                        <td>{{registro.precio}}</td>
                                        <td><img :src="registro.foto" width="50"/></td>
                                        <td><button @click.prevent.default="eliminarregistro(registro.idregistro)" class="btn btn-danger">del</button></td>
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