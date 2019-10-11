<template>
  <q-page padding>
    <div class="row q-gutter-md">
      <div class="col-9">
        <div class="q-mb-md">
          <div class="text-h4">
            Produkte
            <q-btn icon="add" flat round color="positive" @click="addProduct" />
          </div>
        </div>
        <q-list bordered separator>
          <q-item>
            <q-item-section avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Name</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Preis</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Kategorie</q-item-label>
            </q-item-section>
            <q-item-section avatar>
            </q-item-section>
          </q-item>
          <draggable :list="products"
                     handle=".handle"
                     ghost-class="ghost"
                     @end="saveProducts">
            <q-item v-for="[idx, product] of products.entries()" :key="product.id" :class="{'bg-grey-2': idx % 2 === 0}">
              <q-item-section avatar class="handle"><q-icon name="swap_vert" /></q-item-section>
              <q-item-section>
                {{ product.label || 'Name eingeben' }}
                <q-popup-edit @save="saveProducts" v-model="product.label" title="Produktname eingeben">
                  <q-input v-model="product.label" dense autofocus />
                </q-popup-edit>
              </q-item-section>
              <q-item-section>
                {{ product.price | centToEur }}
                <q-popup-edit @save="saveProducts()" v-model="product.price" title="Preis in Cent eingeben">
                  <q-input type="number" v-model.number="product.price" dense autofocus />
                </q-popup-edit>
              </q-item-section>
              <q-item-section>
                <q-select :class="`bg-${getCategory(product.category).color}`"
                          v-model="product.category"
                          @input="saveProducts"
                          option-label="label"
                          option-value="id"
                          map-options
                          emit-value
                          dense
                          :options="categories" />
              </q-item-section>
              <q-item-section avatar>
                <q-btn color="negative" icon="delete" flat round @click="products.splice(idx, 1)" />
              </q-item-section>
            </q-item>
          </draggable>
        </q-list>
      </div>
      <div class="col">
        <div class="q-mb-md">
          <div class="text-h4">
            Kategorien
            <q-btn icon="add" flat round color="positive" @click="addCategory" />
          </div>
        </div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label class="text-h6">Name</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Farbe</q-item-label>
            </q-item-section>
            <q-item-section avatar>
            </q-item-section>
          </q-item>
          <q-item v-for="[idx, category] of categories.entries()" :key="category.id" :class="`bg-${category.color}`">
            <q-item-section>
              {{ category.label || 'Name eingeben' }}
              <q-popup-edit @save="saveCategories" v-model="category.label" title="Kategoriename eingeben">
                <q-input v-model="category.label" dense autofocus />
              </q-popup-edit>
            </q-item-section>
            <q-item-section>
              <q-select v-model="category.color" @input="saveCategories" dense :options="colors" />
            </q-item-section>
            <q-item-section avatar>
              <q-btn color="negative" icon="delete" flat round @click="categories.splice(idx, 1)" />
            </q-item-section>
          </q-item>
        </q-list>
        <div class="q-my-lg">
          Speicherort: {{ $store.path }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { uid } from 'quasar'
import draggable from 'vuedraggable'

export default {
  name: 'PageSettings',
  components: {
    draggable,
  },
  data () {
    let defaultProduct = {
      price: 0,
      label: '',
      category: '',
    }
    let products = this.$store.get('products', [])
    if (!Array.isArray(products)) {
      products = []
    }
    products = products.filter(p => typeof p === 'object')
    for (let p of products) {
      p = Object.assign({}, defaultProduct)
      p = Object.assign({}, p)
      if (!p.id) {
        p.id = uid()
      }
    }
    let categories = this.$store.get('categories', [])
    if (!Array.isArray(categories)) {
      categories = []
    }
    return {
      categories,
      products,
      defaultProduct,
      defaultCategory: {
        label: '',
        color: 'white',
      },
      colors: [
        'white',
        'blue',
        'red',
        'green',
        'orange',
        'purple',
        'deep-purple',
        'indigo',
        'pink',
        'teal',
        'deep-orange',
        'blue-grey',
      ],
    }
  },
  watch: {
    products: {
      handler (val) {
        this.saveProducts()
      },
    },
    categories: {
      handler (val) {
        this.saveCategories()
      },
    },
  },
  methods: {
    addProduct () {
      let p = Object.assign({ id: uid() }, this.defaultProduct)
      this.products.push(p)
    },
    addCategory () {
      let c = Object.assign({ id: uid() }, this.defaultCategory)
      this.categories.push(c)
    },
    getCategory (catId) {
      return this.categories.find(el => el.id === catId) || this.defaultCategory
    },
    saveProducts () {
      this.$store.set('products', this.products)
    },
    saveCategories () {
      this.$store.set('categories', this.categories)
    },
  },
}
</script>

<style lang="stylus">
  .ghost
    opacity 0.5
    background-color $light-blue-3 !important
</style>
