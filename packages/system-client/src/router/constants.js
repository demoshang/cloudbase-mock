import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/account/sign-in'),
    hidden: true
  },
  {
    path: '/signup',
    component: () => import('@/views/account/sign-up'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/account/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/applications',
    children: [
      {
        path: 'applications',
        component: () => import('@/views/application/index'),
        name: 'Application',
        meta: { title: '主页', icon: 'dashboard', affix: true, noCache: true }
      }
    ]
  }
]
