
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', name: 'index', component: () => import('pages/Index.vue') },
      { path: 'orders', name: 'orders', component: () => import('pages/Orders.vue') },
      { path: 'ordering', name: 'ordering', component: () => import('pages/Ordering.vue') },
      { path: 'settings', name: 'settings', component: () => import('pages/Settings.vue') },
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
