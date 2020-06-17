<template lang="pug">
  .project-wrapper.container
    section.main-content.columns
      .container.column.project-seeds-container
        .media-content.project-seed(:class="selected_seed === index ? 'is-selected' : ''" v-for='(seed, index) in seeds' v-if="!seed.selected")
          .content(@click="selectSeed(index)")
            p.title.is-6.is-spaced
              | {{ seed.content }}
            p.subtitle.is-6
              |名前: {{ seed.name }}、　ID: {{ seed.id}}、　REF: {{ seed.ref}}
      .container.column.project-clusters-container
        .project-content-controller
          .project-indentation
            span ラベルの改行文字数：
            input(type="number" v-model="indentation")
            span 文字
          .media-content.project-cluster.add-cluster
            .add-cluster-item(@click="newCluster(1)")
              p
                |クラスターを1つ追加する＋
            .add-cluster-item(@click="newCluster(3)")
              p
                |クラスターを3つ追加する＋
        .project-clusters
          .media-content.project-cluster(v-for='(cluster, c_index) in clusters')
            p.project-cluster-no
              |No. {{c_index}}
            .content
              textarea.title.is-4(type="text" v-model="cluster.label" :rows="Math.floor(cluster.label.length / indentation) + 1" @change="updateLabel(c_index, cluster.label)")
              .media-content.project-seed.add-seed(@click="addSeed(c_index)")
                |選択したものを追加する＋
              .media-content.project-seed(v-for="(c_seed, c_seed_index) in cluster.seeds.map(id => seeds[id])")
                .content
                  p.project-seed-remove(@click="removeSeed(c_index, c_seed_index)")
                    |✖
                  p.title.is-6.is-spaced
                    | {{ c_seed.content }}
                  p.subtitle.is-6
                    |名前: {{ c_seed.name }}、　ID: {{ c_seed.id}}、　REF: {{ c_seed.ref}}

    .project-data-controller(v-if="this.host")
      p(@click="saveData")
        |保存する
      p(@click="downloadCSV")
        |CSVをダウンロード

    button.project-host-button(v-shortkey="['ctrl', 'alt', 'h']" @shortkey="beHost()")

    b-loading(:is-full-page='false' :active.sync='isLoading' :can-cancel='false')
    
</template>

<script>
import io from 'socket.io-client'
import axios from 'axios'

export default {
  head: {
    htmlAttrs: {
      style: 'overflow: hidden'
    },
    bodyAttrs: {
      style: 'overflow: hidden'
    }
  },
  data() {
    return {
      message: '',
      messages: [],
      socket: null,
      isLoading: true,
      seeds: [],
      clusters: [],
      selected_seed: null,
      indentation: 26,
      host: false
    }
  },
  computed: {
    // 配列の後ろ（新しいもの）から順に表示させたいので反転させる
    reverseMessages: function() {
      return this.messages.slice().reverse()
    },
  },
  mounted() {
    const projectSeed = require('~/project_json/seed_' + this.$route.params.id + '.json')
    const projectCluster = require('~/project_json/cluster_' + this.$route.params.id + '.json')
    this.seeds = projectSeed
    this.clusters = projectCluster
    // VueインスタンスがDOMにマウントされたらSocketインスタンスを生成する
    this.socket = io()
    this.sendMessage('enternewuser', 'hello')

    // サーバー側で保持しているメッセージを受信する
    this.socket.on('new-message', message => {
      switch (message.type) {
        case 'selectseed':
          this.selected_seed = message.data.id
          break;
        case 'addseed':
          this.clusters[message.data.cluster].seeds.push(message.data.seed)
          this.seeds[message.data.seed].selected = true
          break
        case 'removeseed':
          const c_index = message.data.c_index
          const s_index = message.data.s_index
          this.seeds[this.clusters[c_index].seeds[s_index]].selected = false
          const s = [...this.clusters[c_index].seeds]
          s.splice(s_index, 1)
          this.clusters[c_index].seeds = s
          break
        case 'newcluster':
          this.clusters = [...this.clusters].concat(message.data)
          break
        case 'updateLabel':
          this.clusters[message.data.index].label = message.data.label
          break
        case 'dataparallelization':
          this.seeds = message.data.seeds
          this.clusters = message.data.clusters
          break
        case 'enternewuser':
          if (this.host) {
            this.sendMessage('dataparallelization', {seeds: this.seeds, clusters: this.clusters})
          }
          break
        case 'requestload':
          this.isLoading = true
          break
        case 'requeststopload':
          this.isLoading = false
          break
        case 'changehost':
          if (this.host) {
            this.host = false
          }
          break
      }
    })

    // コンポーネントがマウントされてから1秒間はローディングする
    setTimeout(() => {
      this.isLoading = false
    }, 1000)

    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = '';
    });
  },
  beforeDestroy() {
    this.socket.disconnect()
  },
  methods: {
    newCluster (i) {
      const n = []
      for (let index = 0; index < i; index++) {
        n.push({label: '未入力', seeds: []})
      }
      this.clusters = [...this.clusters].concat(n)
      this.sendMessage('newcluster', n)
    },
    addSeed (i) {
      this.clusters[i].seeds.push(this.selected_seed)
      this.seeds[this.selected_seed].selected = true
      this.sendMessage('addseed', {cluster: i, seed: this.selected_seed})
      this.selected_seed = null
      this.sendMessage('selectseed', {id: null})
    },
    removeSeed (c_index, s_index) {
      this.seeds[this.clusters[c_index].seeds[s_index]].selected = false
      const s = [...this.clusters[c_index].seeds]
      s.splice(s_index, 1)
      this.clusters[c_index].seeds = s
      this.sendMessage('removeseed', {c_index: c_index, s_index: s_index})
    },
    updateLabel (i, l) {
      this.sendMessage('updateLabel', {label: l, index: i})
    },
    selectSeed (i) {
      this.selected_seed = i
      this.sendMessage('selectseed', {id: i})
    },
    sendMessage (t, d) {
      let message = {
        type: t,
        data: d
      }
      this.socket.emit('send-message', message)
    },
    saveData () {
      //this.isLoading = true
      this.sendMessage('requestload', 'please load')
      this.$axios.$post('/api/save_data', {
        seeds: this.seeds,
        clusters: this.clusters,
        name: this.$route.params.id
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        //this.isLoading = false
        this.sendMessage('requeststopload', 'please stop load')
      })
    },
    downloadCSV () {

    },
    beHost() {
      this.host = !this.host
      this.sendMessage('changehost', 'pleasechangehost')
    }
  }
}
</script>

<style lang="sass">
.project-wrapper
  margin-top: 20px
.project-seeds-container
  height: calc( 100vh - 65px )
  overflow: auto
.project-seeds-container
  flex: none
  width: calc( 50% - 50px )
.project-seed
  padding: 15px
  background: white
  box-shadow: 0 0 5px 2px #dcdcdc
  border-radius: 3px
  margin-bottom: 20px
  cursor: pointer
  position: relative
  &.is-selected
    background: #fff0b4
  &:last-of-type
    margin-bottom: 0
  &.add-seed
    text-align: center
    background: lightgray
    box-shadow: none
    padding: 7px
    font-size: 14px
  .title.is-6
    margin-bottom: 10px
    margin-right: 15px
    line-height: 1.3
.project-seed-remove
  font-size: 18px
  position: absolute
  right: 10px
  top: 5px
.project-clusters-container
  flex: none
  width: 50%
  margin-left: 50px
.project-indentation
  margin-bottom: 5px
  font-size: .8rem
  input
    font-size: .8rem
    width: 40px
    border: none
.project-clusters
  height: calc( 100vh - 160px )
  overflow: auto
.project-cluster
  padding: 40px 20px 20px
  border: 2px gray solid
  margin-bottom: 25px
  position: relative
  &.add-cluster
    display: flex
    justify-content: space-between
    padding: 0
    border: none
    cursor: pointer
    margin-bottom: 20px
    .add-cluster-item
      width: 49%
      text-align: center
      background: lightgray
      padding: 5px
      border: 2px solid gray
      &:first-of-type
        background: white
      p
        font-size: .8rem
  textarea
    width: 100%
    border: none
    border-bottom: 2px solid lightgray
    overflow: hidden
    margin-bottom: .5rem
    &:focus
      outline: none
.project-cluster-no
  position: absolute
  top: 0
  left: 0
  background: #fdf1c2
  border-right: 2px solid gray
  border-bottom: 2px solid gray
  padding: 3px 10px
.project-data-controller
  position: fixed
  top: 14px
  right: 10px
  display: flex
  z-index: 100
  p
    padding-left: 10px
    cursor: pointer
    &:hover
      text-decoration: underline
.project-host-button
  display: none
</style>