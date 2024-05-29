<template>
    <div class="container">
        <h1>Ruta privada!</h1>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in notas" :key="index">
                    <th scope="row">{{ item._id }}</th>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.descripcion }}</td>
                    <td>{{ item.date }}</td>
                    <td>
                        <b-button class="btn-warning btn-sm mx-2"
                            @click="activarEdicion(item._id)">Actualizar</b-button>
                        <b-button class="btn-danger btn-sm mx-2" @click="eliminarNota(item._id)">Eliminar</b-button>
                    </td>
                </tr>
            </tbody>
        </table>
        <nav aria-label="Page navigation example">
            <ul class="pagination">
                <li class="page-item" :class="{ 'disabled': paginaActual === 1 }">
                    <router-link class="page-link" :to="{ query: { pagina: paginaActual - 1 } }">Anterior</router-link>
                </li>
                <li class="page-item" :class="{ 'active': paginaActual === index + 1 }"
                    v-for="(item, index) in cantidadPaginas" :key="index">
                    <router-link :to="{ query: { pagina: index + 1 } }" class="page-link">{{ index + 1 }}</router-link>
                </li>
                <li class="page-item" :class="{ 'disabled': paginaActual === cantidadPaginas }">
                    <router-link class="page-link" :to="{ query: { pagina: paginaActual + 1 } }">Siguiente</router-link>
                </li>
            </ul>
        </nav>
        <p>Total notas: {{ totalNotas }} - Cantidad de páginas: {{ cantidadPaginas }}</p>
        <form @submit.prevent="agregarNota(nota)" v-if="agregar">
            <h3 class="text-center">Agregar nueva Nota</h3>
            <input type="text" placeholder="Ingrese un Nombre" class="form-control my-2" v-model="nota.nombre">
            <input type="text" placeholder="Ingrese una descripcion" class="form-control my-2"
                v-model="nota.descripcion">
            <b-button class="btn-sm btn-block btn-success" type="submit">Agregar</b-button>
        </form>
        <form @submit.prevent="editarNota(notaEditar)" v-else>
            <h3 class="text-center">Editar Nota</h3>
            <input type="text" placeholder="Ingrese un Nombre" class="form-control my-2" v-model="notaEditar.nombre">
            <input type="text" placeholder="Ingrese una descripcion" class="form-control my-2"
                v-model="notaEditar.descripcion">
            <b-button class="btn-sm btn-block mb-1 btn-warning" type="submit">Editar</b-button>
            <b-button class="btn-sm btn-block" @click="agregar = true">Cancelar</b-button>
        </form>
        <b-alert :show="dismissCountDown" dismissible :variant="mensaje.color" @dismissed="dismissCountDown = 0"
            @dismiss-count-down="countDownChanged">
            {{ mensaje.texto }}
        </b-alert>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    data() {
        return {
            totalNotas: 0,
            limite: 5,
            paginaActual: 1,
            notas: [],
            agregar: true,
            nota: {},
            notaEditar: {},
            mensaje: { color: 'success', texto: '' },
            dismissSecs: 5,
            dismissCountDown: 0
        };
    },
    computed: {
        ...mapState(["token"]),
        cantidadPaginas() {
            return Math.ceil(this.totalNotas / this.limite);
        }
    },
    methods: {
        ...mapActions(['getTareas']),
        countDownChanged(dismissCountDown) {
            this.dismissCountDown = dismissCountDown;
        },
        showAlert() {
            this.dismissCountDown = this.dismissSecs;
        },
        paginacion(pagina) {
            let config = {
                headers: {
                    token: this.token
                }
            };
            let skip = (pagina - 1) * this.limite;
            this.axios
                .get(`/nota?skip=${skip}&limit=${this.limite}`, config)
                .then(res => {
                    this.notas = res.data.notaDB;
                    this.totalNotas = res.data.totalNotas;
                })
                .catch(e => {
                    console.log(e.response);
                });
        },
        agregarNota() {
            let config = {
                headers: {
                    token: this.token
                }
            };
            this.axios.post('/nueva-nota', this.nota, config)
                .then(() => {
                    this.paginacion(this.paginaActual); // Recargar datos
                    this.nota.nombre = '';
                    this.nota.descripcion = '';
                    this.mensaje.color = 'success';
                    this.mensaje.texto = 'Nota Agregada!';
                    this.showAlert();
                })
                .catch(e => {
                    console.log(e.response);
                    if (e.response) {
                        if (e.response.data && e.response.data.error && e.response.data.error.errors && e.response.data.error.errors.nombre && e.response.data.error.errors.nombre.message) {
                            this.mensaje.texto = e.response.data.error.errors.nombre.message;
                        } else if (e.response.data && e.response.data.mensaje) {
                            this.mensaje.texto = e.response.data.mensaje;
                        } else {
                            this.mensaje.texto = 'Error de sistema';
                        }
                    } else {
                        this.mensaje.texto = 'Error de red';
                    }
                    this.mensaje.color = 'danger';
                    this.showAlert();
                });
        },
        activarEdicion(id) {
            this.agregar = false;
            this.axios.get(`nota/${id}`)
                .then(res => {
                    this.notaEditar = res.data;
                })
                .catch(e => {
                    console.log(e.response);
                });
        },
        editarNota(item) {
            this.axios.put(`nota/${item._id}`, item)
                .then(() => {
                    this.paginacion(this.paginaActual); // Recargar datos
                    this.notaEditar = {};
                    this.showAlert();
                    this.mensaje.texto = 'Nota Actualizada';
                    this.mensaje.color = 'success';
                })
                .catch(e => {
                    console.log(e);
                });
            this.agregar = true;
        },
        eliminarNota(id) {
            this.axios.delete(`nota/${id}`)
                .then(() => {
                    this.paginacion(this.paginaActual); // Recargar datos
                    this.showAlert();
                    this.mensaje.texto = 'Nota Eliminada!';
                    this.mensaje.color = 'danger';
                })
                .catch(e => {
                    console.log(e.response);
                });
        },
    },
    watch: {
        "$route.query.pagina": {
            immediate: true,
            handler(pagina) {
                pagina = parseInt(pagina) || 1;
                this.paginacion(pagina);
                this.paginaActual = pagina;
            }
        }
    },
    created() {
        this.getTareas();
        this.paginacion(this.paginaActual);
    }
}
</script>