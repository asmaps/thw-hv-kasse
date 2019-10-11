<template>
  <q-page padding class="flex flex-center">
    <div class="text-center">
      <q-btn :to="{ name: 'ordering' }" label="Starten" size="lg" class="full-width q-my-sm" />
      <q-btn :to="{ name: 'orders' }" label="Übersicht" size="lg" class="full-width q-my-sm" />
      <q-btn :to="{ name: 'settings' }" label="Einstellungen" size="lg" class="full-width q-my-sm" />
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
