export default [{
  path: '/',
  name: 'Initialize',
  component: require('./components/bootstrap')
},
{
  path: '/login',
  name: 'Login',
  component: require('./components/login')
},
{
  path: '/Station/:reg',
  name: 'Station',
  props: true,
  component: require('./components/station')
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
    component: require('./components/dashboard/info'),
    children: [{
      path: '/',
      name: 'Information',
      component: require('./components/dashboard/form')
    }, {
      path: 'note',
      name: 'Note',
      component: require('./components/dashboard/notes')
    }, {
      path: 'profile',
      name: 'Profile',
      component: require('./components/dashboard/profile')
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
    component: require('./components/table/table')
  },
  {
    path: 'menu',
    name: 'Menu',
    component: require('./components/menu/menu')
  },
  {
    path: 'history',
    name: 'History',
    component: require('./components/history/index')
  },
  {
    path: 'lock',
    name: 'Lock',
    component: require('./components/lock')
  },
  {
    path: 'list',
    name: 'PickupList',
    component: require('./components/pickup')
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
        component: require('./components/setting/store/storeTab'),
        children: [{
          path: '/',
          name: 'Setting.store',
          component: require('./components/setting/store/store')
        }, {
          path: 'payment',
          name: 'Setting.store.payment',
          component: require('./components/setting/store/payment'),
        }, {
          path: 'tax',
          name: 'Setting.store.tax',
          component: require('./components/setting/store/sub/tax')
        }, {
          path: 'dinein',
          name: 'Setting.store.dinein',
          component: require('./components/setting/store/dinein')
        }, {
          path: 'surcharge',
          name: 'Setting.store.surcharge',
          component: require('./components/setting/store/sub/surcharge')
        }, {
          path: 'security',
          name: 'Setting.store.security',
          component: require('./components/setting/store/security')
        }, {
          path: 'others',
          name: 'Setting.store.others',
          component: require('./components/setting/store/others')
        }]
      }, {
        path: 'station',
        component: require('./components/setting/store/stationTab'),
        children: [{
          path: '/',
          name: 'Setting.station',
          component: require('./components/setting/store/station')
        }, {
          path: 'device',
          name: 'Setting.station.interface',
          component: require('./components/setting/store/interface')
        }, {
          path: 'cashdrawer',
          name: 'Setting.station.cashdrawer',
          component: require('./components/setting/store/sub/cashdrawer')
        }, {
          path: 'printers',
          name: 'Setting.station.printers',
          component: require('./components/setting/store/sub/printers')
        }, {
          path: 'callid',
          name: 'Setting.station.callid',
          component: require('./components/setting/store/sub/callid')
        }, {
          path: 'poleDisplay',
          name: 'Setting.station.poleDisplay',
          component: require('./components/setting/store/sub/poleDisplay')
        }]
      }, {
        path: 'promotion',
        component: require('./components/setting/store/promotionTab'),
        children: [{
          path: '/',
          name: 'Setting.promotion',
          component: require('./components/setting/store/promotion')
        }, {
          path: 'coupon',
          name: 'Setting.promotion.coupon',
          component: require('./components/setting/store/sub/coupon')
        }]
      }, {
        path: 'terminal',
        name: 'Setting.terminal',
        component: require('./components/setting/store/terminal')
      }]
    },
    {
      path: 'menu',
      component: require('./components/setting/menu/nav'),
      children: [{
        path: '/',
        name: 'Setting.menu',
        component: require('./components/setting/menu/menu')
      }, {
        path: 'request',
        name: 'Setting.request',
        component: require('./components/setting/menu/request')
      }, {
        path: 'submenu',
        name: 'Setting.submenu',
        component: require('./components/setting/menu/submenu')
      }, {
        path: 'template',
        name: 'Setting.template',
        component: require('./components/setting/menu/template')
      }]
    }, {
      path: 'table',
      component: require('./components/setting/table/nav'),
      children: [{
        path: '/',
        name: 'Setting.table',
        component: require('./components/setting/table/table')
      }]
    }, {
      path: 'printer',
      component: require('./components/setting/printer/nav'),
      children: [{
        path: '/',
        component: require('./components/setting/printer/tab'),
        children: [{
          path: '/',
          name: 'Setting.printer',
          component: require('./components/setting/printer/device')
        }, {
          path: 'config/:printer',
          props: true,
          name: 'Setting.printer.config',
          component: require('./components/setting/printer/config')
        }, {
          path: 'style/:printer',
          props: true,
          name: 'Setting.printer.style',
          component: require('./components/setting/printer/style')
        }, {
          path: 'option/:printer',
          props: true,
          name: 'Setting.printer.option',
          component: require('./components/setting/printer/option')
        }, {
          path: 'title/:printer',
          props: true,
          name: 'Setting.printer.title',
          component: require('./components/setting/printer/title')
        }, {
          path: 'preview/:printer',
          props: true,
          name: 'Setting.printer.preview',
          component: require('./components/setting/printer/preview')
        }]
      }]
    },
    {
      path: 'operator',
      component: require('./components/setting/operator/nav'),
      children: [{
        path: '/',
        component: require('./components/setting/operator/tab'),
        children: [{
          path: '/',
          name: 'Setting.operator',
          component: require('./components/setting/operator/index')
        }, {
          path: 'config/:operator',
          props: true,
          name: 'Setting.operator.config',
          component: require('./components/setting/operator/config')
        }, {
          path: 'timecard/:operator',
          props: true,
          name: 'Setting.operator.timecard',
          component: require('./components/setting/operator/timecard')
        }, {
          path: 'access/:operator',
          props: true,
          name: 'Setting.operator.access',
          component: require('./components/setting/operator/sub/access')
        }, {
          path: 'modify/:operator',
          props: true,
          name: 'Setting.operator.modify',
          component: require('./components/setting/operator/sub/modify')
        }, {
          path: 'view/:operator',
          props: true,
          name: 'Setting.operator.view',
          component: require('./components/setting/operator/sub/view')
        }, {
          path: 'permission/:operator',
          props: true,
          name: 'Setting.operator.permission',
          component: require('./components/setting/operator/sub/permission')
        }]
      }, {
        path: 'report',
        name: 'Setting.operator.report',
        component: require('./components/setting/operator/report')
      }]
    }, {
      path: 'database',
      component: require('./components/setting/database/nav'),
      children: [{
        path: '/',
        component: require('./components/setting/database/tab'),
        children: [{
          path: '/',
          name: 'Setting.database',
          component: require('./components/setting/database/index')
        }, {
          path: 'performance',
          name: 'Setting.database.performance',
          component: require('./components/setting/database/performance')
        }]
      }, {
        path: 'customer',
        component: require('./components/setting/database/customerTab'),
        children: [{
          path: '/',
          name: 'Setting.database.customer',
          component: require('./components/setting/database/customer')
        }, {
          path: 'profile:/profile',
          props: true,
          name: 'Setting.database.customer.profile',
          component: require('./components/setting/database/profile')
        }, {
          path: 'analyze',
          name: 'Setting.database.customer.analyze',
          component: require('./components/setting/database/analyze')
        }]
      }, {
        path: 'address',
        component: require('./components/setting/database/addressTab'),
        children: [{
          path: '/',
          name: 'Setting.database.address',
          component: require('./components/setting/database/address'),
        }, {
          path: 'detail/:address',
          props: true,
          name: 'Setting.database.address.detail',
          component: require('./components/setting/database/detail')
        }]
      }]
    }
    ]
  }
  ]
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