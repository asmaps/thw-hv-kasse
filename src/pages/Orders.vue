<template>
  <q-page padding>
    <div class="row justify-between">
      <div ref="overview">
        <div class="text-h4 q-mb-md">Übersicht</div>
        <div class="text-h5">Bestellungen: {{ orders.length }}</div>
        <div class="text-h5">Einnahmen: {{ total | centToEur }}</div>
        <div class="text-h5">Verkaufte Produkte:</div>
        <div v-for="p of productCounts" :key="p.product.id">
          {{ p.count }} {{ p.product.label }}
        </div>
      </div>
      <div>
        <div class="text-h4 q-mb-md">Bestellungen</div>
        <q-list bordered separator>
          <q-item v-if="orders.length === 0">
            <q-item-section>Noch keine Bestellungen</q-item-section>
          </q-item>
          <template v-for="[idx, o] of orders.entries()">
            <q-expansion-item :label="`${$moment(o.time).format('HH:mm')}, ${$utils.formatCentToEur(o.total)}, ${o.products.reduce((p, c) => p + c.count, 0)} Produkte`"
                              v-if="o.id"
                              :key="o.id">
              <div class="q-ma-lg">
                <dl>
                  <dt>Total:</dt>
                  <dd>{{ o.total | centToEur }}</dd>
                  <dt>Zeit:</dt>
                  <dd>{{ $moment(o.time).format('LLLL') }}</dd>
                  <dt>Produkte:</dt>
                  <dd>
                    <div v-for="p of o.products" :key="`${o.id}-${p.id}`">{{ p.count }} {{ p.label }}</div>
                  </dd>
                </dl>
              </div>
            </q-expansion-item>
          </template>
        </q-list>
      </div>
      <div class="col-3">
        <q-btn color="info" class="q-my-md full-width" label="Übersicht drucken" @click="print" />
        <q-btn color="negative" class="q-my-md full-width" label="Kasse zurücksetzen" @click="emptyOrders" />
      </div>
    </div>
  </q-page>
</template>

<script>
import fs from 'fs'
import path from 'path'
import { remote } from 'electron'

export default {
  name: 'PageOrders',
  data () {
    return {
      categories: this.$store.get('categories', []),
      products: this.$store.get('products', []),
      orders: this.$store.get('orders', []),
    }
  },
  computed: {
    total () {
      return this.orders.reduce((p, c) => p + c.total, 0)
    },
    productCounts () {
      let initProducts = {}
      for (let p of this.products) {
        initProducts[p.id] = {
          count: 0,
          product: Object.assign({}, p),
        }
      }
      return this.orders.reduce((total, order) => {
        for (let p of order.products) {
          if (!total[p.id]) {
            total[p.id] = {
              count: 0,
              product: p,
            }
          }
          total[p.id].count += p.count
        }
        return total
      }, initProducts)
    },
  },
  methods: {
    emptyOrders () {
      this.$q.dialog({
        title: 'Kasse zurücksetzen?',
        message: 'Kasse wirklich zurücksetzen? Alle Bestellungen werden dadurch gelöscht und die Kasse auf 0 gesetzt. Dies lässt sich nicht rückgängig machen!',
        cancel: true,
      }).onOk(() => {
        this.orders = []
        this.$store.set('orders', [])
      })
    },
    async print () {
      const filePath = path.join(remote.app.getPath('userData'), '/overview.html')
      let printWindow = new remote.BrowserWindow({ width: 400, height: 600, show: false })
      let content = '<body style="margin: 0; padding: 0">'
      content += `<div>${this.$moment().format('LLL')}<br><br></div>`
      content += this.$refs.overview.innerHTML
      content += '<div style="font-size: 40px">_</div>'
      content += '</body>'
      await fs.promises.writeFile(filePath, content)
      printWindow.loadURL(`file://${filePath}`)
      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({ silent: false }, (success, error) => {
          if (!success) {
            this.$q.notify(`Fehler beim Drucken: ${error}`)
          }
          printWindow.close()
          printWindow = null
        })
      })
    }
  },
}
</script>
