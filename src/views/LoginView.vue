<template>
    <div class="container">
        <h1>Login</h1>
        <form @submit.prevent="login">
            <input type="text" class="form-control my-2" placeholder="email" v-model="usuario.email" />
            <input type="password" class="form-control my-2" placeholder="pass" v-model="usuario.pass" />
            <b-button type="submit">Acceder</b-button>
        </form>
        <div v-if="mensaje !== ''">
            <p>{{ mensaje }}</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapMutations, mapActions } from "vuex";

export default {
    data() {
        return {
            usuario: { email: 'prueba1@bluuweb.cl', pass: '123123' },
            mensaje: ''
        }
    },
    methods: {
        ...mapMutations(['obtenerUsuario']),
        ...mapActions(['guardarUsuario', 'leerToken', 'cerrarSesion']),
        login() {
            axios.post('/login', this.usuario)
                .then(res => {
                    if (res.data && res.data.token) {
                        const token = res.data.token;
                        this.guardarUsuario(token);
                    } else {
                        this.mensaje = 'Token no encontrado en la respuesta';
                    }
                })
                .catch(err => {
                    console.log(err);
                    if (err.response && err.response.data && err.response.data.mensaje) {
                        this.mensaje = err.response.data.mensaje;
                    } else {
                        this.mensaje = 'Error al realizar la solicitud';
                    }
                })
        }
    }
}
</script>
