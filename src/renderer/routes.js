export default [{
  path: '/',
  name: 'Initialize',
  component: require('./components/initialize')
},
{
  path: '/login',
  name: 'Login',
  component: require('./components/login')
},
{
  path: '/main',
  component: require('./components/main'),
  children: [{
    path: '/',
    name: 'Dashboard',
    component: require('./components/dashboard')
  },
  {
    path: 'info',
    component: require('./components/info'),
    children: [{
      path: '/',
      name: 'Information',
      component: require('./components/dashboard/form')
    }, {
      path: 'customer',
      name: 'Customer',
      component: require('./components/dashboard/customer')
    }, {
      path: 'history',
      name: 'OrderHistory',
      component: require('./components/dashboard/history')
    }, {
      path: 'call',
      name: 'CallList',
      component: require('./components/dashboard/call')
    }, {
      path: 'giftCard',
      name: 'customerGiftCard',
      component: require('./components/dashboard/giftCard')
    }]
  },
  {
    path: 'table',
    name: "Table",
    component: require('./components/table')
  },
  {
    path: 'menu',
    name: 'Menu',
    component: require('./components/menu/menu')
  },
  {
    path: 'history',
    name: 'History',
    component: require('./components/history')
  },
  {
    path: 'lock',
    name: 'Lock',
    component: require('./components/lock')
  },
  {
    path: 'setting',
    component: require('./components/setting'),
    children: [{
      path: '/',
      name: 'Setting.index',
      component: require('./components/setting/index')
    }, {
      path: 'store',
      component: require('./components/setting/store/nav'),
      children: [{
        path: '/',
        name: 'Setting.store',
        component: require('./components/setting/store/index')
      }, {
        path: 'tax',
        name: 'Setting.tax',
        component: require('./components/setting/store/tax')
      }, {
        path: 'station',
        name: 'Setting.station',
        component: require('./components/setting/store/station')
      }, {
        path: 'dinein',
        name: 'Setting.dinein',
        component: require('./components/setting/store/dinein')
      }]
    }, {
      path: 'menu',
      component: require('./components/setting/menu/nav'),
      children: [{
        path: '/',
        name: 'Setting.menu',
        component: require('./components/setting/menu/index')
      }, {
        path: 'request',
        name: 'Setting.request',
        component: require('./components/setting/menu/request')
      }, {
        path: 'template',
        name: 'Setting.template',
        component: require('./components/setting/menu/template')
      }, {
        path: 'display',
        name: 'Setting.display',
        component: require('./components/setting/menu/display')
      }]
    }, {
      path: 'table',
      component: require('./components/setting/table/nav'),
      children: [{
        path: '/',
        name: 'Setting.table',
        component: require('./components/setting/table/index')
      }]
    }, {
      path: 'online',
      component: require('./components/setting/online/nav'),
      children: [{
        path: '/',
        name: 'Setting.online',
        component: require('./components/setting/online/index')
      }, {
        path: 'server',
        name: 'Setting.online.config',
        component: require('./components/setting/online/config')
      }, {
        path: 'menu',
        name: 'Setting.online.menu',
        component: require('./components/setting/online/menu')
      }]
    }, {
      path: 'print',
      name: 'Setting.print',
      component: require('./components/setting/print/index')
    }, {
      path: 'operator',
      name: 'Setting.operator',
      component: require('./components/setting/operator/index')
    }, {
      path: 'database',
      component: require('./components/setting/database/nav'),
      children: [{
        path: '/',
        name: 'Setting.database',
        component: require('./components/setting/database/index')
      }, {
        path: 'Address',
        name: 'Setting.address',
        component: require('./components/setting/database/address')
      },
      {
        path: 'Client',
        name: 'Setting.client',
        component: require('./components/setting/database/client')
      }, {
        path: 'Call',
        name: 'Setting.call',
        component: require('./components/setting/database/call')
      }]
    }]
  }]
},
{
  path: '*',
  redirect: '/'
}
]



/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * @param  {string}   name     the filename (basename) of the view to load.
 */

// function loadCMS(name) {
//     return function(resolve) {
//         require(['./views/' + name + '.vue'], resolve);
//     }
// };
