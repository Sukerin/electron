import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import Charts from '../components/Charts'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        redirect: '/home',//设置默认指向的路径
    }, {
        path: '/home',
        component: Home,
    }, {
        path: '/charts/:filePath',
        component: Charts,
        props: true
    }

    ]
})