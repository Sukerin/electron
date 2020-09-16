import Vue from 'vue'
import Router from 'vue-router'
import Worker from '../components/Worker'
import Home from '../components/Home'


Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/home',//设置默认指向的路径
        },
        {
            name: 'worker',
            path: '/worker',
            component: Worker,
        },
        {
            name: 'home',
            path: '/home',
            component: Home,
        }

    ]
})
