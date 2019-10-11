<template>
  <q-page padding>
    <div class="row q-gutter-lg">
      <div class="col-9">
        <div class="row q-gutter-md items-stretch">
          <div class="col-2" v-for="p of products" :key="p.id">
            <q-btn size="xl"
                   :color="getCategory(p.category).color"
                   no-caps
                   class="full-width full-height"
                   :label="p.label"
                   @click="addToOrder(p)" />
          </div>
        </div>
      </div>
      <div class="col">
        <div class="text-h4 q-mb-sm">Bestellung</div>
        <q-list v-if="currentOrder.length > 0" bordered separator>
          <q-item v-for="[idx, p] of currentOrder.entries()" :key="p.id" :class="{'bg-grey-2': idx % 2 === 0}">
            <q-item-section avatar>
              <q-avatar>{{ p.count }}</q-avatar>
            </q-item-section>
            <q-item-section>
              {{ p.label }}
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ p.price * p.count | centToEur }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-btn color="negative" icon="remove" flat round @click="removeFromOrder(p)" />
            </q-item-section>
          </q-item>
        </q-list>
        <div class="q-my-md text-h5">
          Total: {{ total | centToEur }}
        </div>
        <q-btn :disable="currentOrder.length === 0"
               class="full-width q-my-lg"
               @click="cashDialog = true"
               size="lg"
               color="positive"
               label="Kassieren" />
        <q-btn :disable="currentOrder.length === 0"
               class="full-width q-my-lg"
               @click="currentOrder = []"
               size="lg"
               color="negative"
               label="Stornieren" />
      </div>
    </div>

    <q-dialog v-model="cashDialog">
      <q-layout view="Lhh lpR fff" container class="bg-white">
        <q-header class="bg-positive">
          <q-toolbar>
            <q-toolbar-title>Kassieren</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <div>
              <q-input prefix="€" autofocus outlined clearable type="number" v-model.number="amountGiven" label="Gegeben (in Cent)" />
            </div>
            <div class="text-h4 q-pa-sm">Zu zahlen: {{ total | centToEur }}</div>
            <div class="text-h4 q-pa-sm">Gegeben: {{ amountGiven | centToEur }}</div>
            <q-separator class="q-my-sm" />
            <div class="text-h4 q-pa-sm" v-if="returnAmount >= 0">Rückgeld: {{ returnAmount | centToEur }}</div>
            <div class="text-h4 q-pa-sm" v-else>Noch zu zahlen: {{ returnAmount * -1 | centToEur }}</div>
            <q-btn class="q-mt-xl full-width"
                   size="xl"
                   label="Kassiert"
                   :disable="returnAmount < 0"
                   :color="returnAmount >= 0 ? 'positive' : 'negative'"
                   @click="print" />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </q-page>
</template>

<script>
import fs from 'fs'
import path from 'path'
import { remote } from 'electron'
import { uid } from 'quasar'

export default {
  name: 'PageOrdering',
  data () {
    return {
      categories: this.$store.get('categories', []),
      products: this.$store.get('products', []),
      orders: this.$store.get('orders', []),
      currentOrder: [],
      cashDialog: false,
      amountGiven: '',
    }
  },
  computed: {
    returnAmount () {
      return (this.amountGiven || 0) - this.total
    },
    total () {
      return this.currentOrder.reduce((p, c) => p + c.price * c.count, 0)
    },
  },
  methods: {
    addToOrder (p) {
      let o = this.currentOrder.findIndex(el => el.id === p.id)
      if (o >= 0) {
        this.currentOrder[o].count++
      }
      else {
        this.currentOrder.push(Object.assign({ count: 1 }, p))
      }
    },
    removeFromOrder (p) {
      let o = this.currentOrder.findIndex(el => el.id === p.id)
      this.currentOrder[o].count--
      if (this.currentOrder[o].count <= 0) {
        this.currentOrder.splice(o, 1)
      }
    },
    finishOrder () {
      this.orders.push({
        total: this.total,
        time: this.$moment().toISOString(),
        id: uid(),
        products: this.currentOrder.slice(),
      })
      this.saveOrders()
      this.cashDialog = false
      this.currentOrder = []
      this.amountGiven = ''
    },
    getCategory (catId) {
      return this.categories.find(el => el.id === catId) || this.defaultCategory
    },
    saveOrders () {
      this.$store.set('orders', this.orders)
    },
    async print () {
      const filePath = path.join(remote.app.getPath('userData'), '/receipt.html')
      let printWindow = new remote.BrowserWindow({ width: 400, height: 600, show: false })
      let content = '<body style="margin: 0; padding: 0">'
      for (let [idx, row] of this.currentOrder.entries()) {
        content += `<div style="font-size: 30px; ${idx > 0 ? 'page-break-before: always' : ''}">${row.count}x ${row.label}</div>`
      }
      content += '<div style="font-size: 40px">_</div>'
      content += '</body>'
      await fs.promises.writeFile(filePath, content)
      printWindow.loadURL(`file://${filePath}`)
      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({ silent: false }, (success, error) => {
          if (!success) {
            this.$q.notify(`Fehler beim Drucken: ${error}`)
          }
          else {
            this.finishOrder()
          }
          printWindow.close()
          printWindow = null
        })
      })
    }
  }
}
</script>
