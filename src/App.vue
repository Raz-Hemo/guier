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
                @change="updateConfig()"
              />
              <v-text-field
                label="Path"
                v-model="programs[selectedProgram].path"
                @change="updateConfig()"
              />
              <v-text-field
                label="Open with"
                v-model="programs[selectedProgram].openwith"
                @change="updateConfig()"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>Arguments</v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-switch
                v-for="(item, k) in programs[selectedProgram].opts"
                :key="k"
                v-model="programs[selectedProgram].opts[k]"
                :label="k"
                class= "px-4"
                @change="updateConfig()"
              ></v-switch>
              <v-text-field
                v-for="(item, k) in programs[selectedProgram].reqvals"
                :key="k"
                :label="k"
                v-model="programs[selectedProgram].reqvals[k]"
                class= "px-4"
                @change="updateConfig()"
              />
              <v-text-field
                v-for="(item, k) in programs[selectedProgram].optvals"
                :key="k"
                :label="k"
                v-model="programs[selectedProgram].optvals[k]"
                class= "px-4"
                @change="updateConfig()"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-row
          align="center"
          justify="center"
          class="pa-4"
        >
          <v-btn color="green" @click="runProgram">
            <v-icon>mdi-play</v-icon> Run
          </v-btn>
          <v-btn color="green" @click="refreshArgs" class="mx-4">
            <v-icon>mdi-refresh</v-icon> Refresh Args
          </v-btn>
        </v-row>
        <v-textarea disabled solo class="monospace" v-model="programOutput" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
const { ipcRenderer, config, spawnProcess } = window;

let vuedata = config.all();
Object.assign(vuedata, {
  selectedProgram: null,
  expandedPanels: [0,1],
  programOutput: '',
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
      this.programs.push({title: 'New Program', openwith: '', path: '', opts: {}, optvals: {}, reqvals: {}});
      config.set('programs', this.programs);
      this.selectedProgram = this.programs.length - 1;
    },
    updateConfig: function() {
      config.set('programs', this.programs);
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
    refreshArgs: function() {
      const prog = this.programs[this.selectedProgram];
      const proc = this.runProgramInner(true);
      let testedOutput = '';
      proc.stdout.on("data", (data) => {
        testedOutput += data;
      });
      proc.stderr.on("data", (data) => {
        testedOutput += data;
      });

      proc.on("close", (code) => {
        code;
        // usage line
        const match = testedOutput.match(/usage: \S+ \[-h\] (\[--\S+ \S+\] ?|\[--\S+?\] ?|--\S+ \S+ ?|--\S+ \S+ ?)+/g)[0];
        // optional value arg -> optional textfield
        prog.optvals = {};
        for (const m of match.matchAll(/\[--(\S+) \S+\]\s?/g)) {
          prog.optvals[m[1]] = '';
        }

        // optional arg -> checkbox
        prog.opts = {};
        for (const m of match.matchAll(/\[--(\S+?)\]\s?/g)) {
          prog.opts[m[1]] = false;
        }

        // required value arg -> required text field
        prog.reqvals = {};
        for (const m of match.matchAll(/[^[]--(\S+) \S+[^\]]\s?/g)) {
          prog.reqvals[m[1]] = '';
        }
        this.testedOutput = '';
      });
    },
    runProgram: function() {
      const proc = this.runProgramInner(false);
      proc.stdout.on("data", (data) => {
        this.programOutput += data;
      });
      proc.stderr.on("data", (data) => {
        this.programOutput += data;
      });
    },
    runProgramInner: function(showHelp) {
      this.programOutput = '';
      const prog = this.programs[this.selectedProgram];

      let args = ["/c"];
      if (prog.openwith) {
        args.push(prog.openwith);
      }
      args.push(prog.path);
      if (showHelp) {
        args.push("-h");
      } else {
        for (const opt of Object.keys(prog.opts)) {
          if (prog.opts[opt]) {
            args.push(`--${opt}`);
          }
        }
        for (const reqval of Object.keys(prog.reqvals)) {
          args.push(`--${reqval}`);
          args.push(prog.reqvals[reqval]);
        }
        for (const optval of Object.keys(prog.optvals)) {
          if (prog.optvals[optval] !== '') {
            args.push(`--${optval}`);
            args.push(prog.optvals[optval]);
          }
        }
      }
      return spawnProcess("cmd.exe", args);
    },
  }
};
</script>
<style src="./app.css"></style>
