import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import router from '../router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        token: '',
        usuarioDB: '',
        notas: []
    },
    mutations: {
        setNotas(state, notas) {
            state.notas = notas;
        },
        setToken(state, token) {
            state.token = token;
        },
        obtenerUsuario(state, payload) {
            state.token = payload;
            if (payload === '') {
                state.usuarioDB = ''
            } else {
                state.usuarioDB = jwtDecode(payload);
                router.push({ name: 'nota' })
            }
        }
    },
    actions: {
        async getTareas({ commit, state }) {
            try {
                let config = {
                    headers: {
                        token: state.token
                    }
                };
                let response = await axios.get('/nota', config);
                commit('setNotas', response.data);
            } catch (error) {
                console.error(error);
            }
        },
        guardarUsuario({ commit }, payload) {
            localStorage.setItem('token', payload);
            commit('obtenerUsuario', payload)
        },
        cerrarSesion({ commit }) {
            commit('obtenerUsuario', '');
            localStorage.removeItem('token');
            router.push({ name: 'login' });
        },
        leerToken({ commit }) {

            const token = localStorage.getItem('token');
            if (token) {
                commit('obtenerUsuario', token);
            } else {
                commit('obtenerUsuario', '');
            }

        }
    },
    getters: {
        estaActivo: state => !!state.token
    }
})