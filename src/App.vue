<template>
  <v-app>
    <v-app-bar
      app
      dense
      clipped-left
      style="-webkit-app-region:drag;"
    >
      <div class="d-flex align-center">
        <v-img
          alt="Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/guier.png')"
          transition="scale-transition"
          width="40"
        />

        <span class="unselectable">Guier</span>
      </div>

      <v-col flex-grow-1 flex-shrink-0 />
      <v-btn icon width="30" height="30" v-on:click.stop="minimize" style="-webkit-app-region: no-drag">
        <v-icon>mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn icon width="30" height="30" v-on:click.stop="maximize" style="-webkit-app-region: no-drag">
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
      <v-btn icon color="red" width="30" height="30" v-on:click.stop="close" style="-webkit-app-region: no-drag">
        <v-icon>mdi-window-close</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped
      permanent
    >
      <v-list nav :key="selectedProgram">
        <v-list-item-group mandatory v-model="selectedProgram">
          <v-list-item
          v-for="(program, i) in programs"
          :key="i"
          v-on:click.self.stop
          >
            <v-list-item-content>
              <v-list-item-title v-html="program.title"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon v-on:click.stop="deleteProgram(i)">
                <v-icon color="red darken-4">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-container
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-btn color="green" @click="addProgram">
            <v-icon>mdi-plus</v-icon> Add...
          </v-btn>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <v-main>
      <v-container v-if="selectedProgram != null">
        <v-expansion-panels multiple flat v-model="expandedPanels">
          <v-expansion-panel>
            <v-expansion-panel-header>Program Settings</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-text-field
                label="Title"
                v-model="programs[selectedProgram].title"
                @change="setTitle(selectedProgram, programs[selectedProgram].title)"
              />
              <v-text-field
                label="Path"
                v-model="programs[selectedProgram].path"
                @change="setPath(selectedProgram, programs[selectedProgram].path)"
              />
              <v-text-field
                label="Open with"
                v-model="programs[selectedProgram].openwith"
                @change="setOpenWith(selectedProgram, programs[selectedProgram].openwith)"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>Arguments</v-expansion-panel-header>
            <v-expansion-panel-content>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
const { ipcRenderer, config } = window;

let vuedata = config.all();
Object.assign(vuedata, {
  selectedProgram: null,
  expandedPanels: [0,1]
});

export default {
  name: 'App',

  components: {
  },
  data: () => vuedata,
  methods: {
    deleteProgram: function(i) {
      this.programs.splice(i, 1);
      config.set('programs', this.programs);
      this.selectedProgram = null;
    },
    addProgram: function() {
      this.programs.push({title: 'New Program', openwith: '', path: ''});
      config.set('programs', this.programs);
      this.selectedProgram = this.programs.length - 1;
    },
    setTitle: function(i, v) {
      config.set(`programs[${i}].title`, v);
    },
    setOpenWith: function(i, v) {
      config.set(`programs[${i}].openwith`, v);
    },
    setPath: function(i, v) {
      config.set(`programs[${i}].path`, v);
    },
    minimize: function() {
      ipcRenderer.sendSync('minimize')
    },
    maximize: function() {
      ipcRenderer.sendSync('maximize')
    },
    close: function() {
      ipcRenderer.sendSync('closewin')
    },
  }
};
</script>
<style src="./app.css"></style>
