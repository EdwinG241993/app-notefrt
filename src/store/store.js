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
        setUser(state, usuarioDB) {
            state.usuarioDB = usuarioDB;
        },
        obtenerUsuario(state, payload) {
            state.token = payload;
            if (payload === '') {
                state.usuarioDB = ''
            } else {
                state.usuarioDB = jwtDecode(payload);
                router.push({ name: 'nota' })
            }
        },
        logout(state) {
            state.token = '';
            state.usuarioDB = null;
        },
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
        async leerToken({ commit }) {
            const token = localStorage.getItem('token');
            if (token) {
                commit('setToken', token);
                try {
                    const response = await axios.get('/usuario', { headers: { token } });
                    console.log(response);
                    commit('setUser', response.data.user);
                } catch (error) {
                    commit('logout');
                }
            } else {
                commit('logout');
            }
        },
    },
    getters: {
        nombreUsuario: state => state.usuarioDB ? state.usuarioDB.nombre : '',
        estaActivo: state => !!state.token
    }
})