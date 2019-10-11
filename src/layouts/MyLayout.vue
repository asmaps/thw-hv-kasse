<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          :to="{ name: 'index' }"
          icon="home"
          aria-label="Home"
        />

        <q-toolbar-title>
          HV Kasse
        </q-toolbar-title>

        <q-btn :to="{ name: 'settings' }" flat round icon="settings" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',

  data () {
    return {
      leftDrawerOpen: false
    }
  }
}
</script>
