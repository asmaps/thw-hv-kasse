import Store from 'electron-store'

export default async ({ Vue }) => {
  Vue.prototype.$store = new Store()
}
