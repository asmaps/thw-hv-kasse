import moment from 'moment'
import VueMoment from 'vue-moment'

function formatCentToEur (value) {
  if (typeof value !== 'number') {
    return value
  }
  let formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  })
  return formatter.format(value / 100)
}

export default async ({ Vue }) => {
  Vue.filter('centToEur', formatCentToEur)
  Vue.prototype.$utils = {
    formatCentToEur,
  }
  moment.locale('de-DE')
  Vue.use(VueMoment, { moment })
}
