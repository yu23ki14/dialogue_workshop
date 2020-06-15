<template lang="pug">
.project-new-wrapper.container
  section.main-content.columns
    .container.column.is-5
      p.title.is-4
        |新規プロジェクトを作成
      input.input(v-model='name' type='text' placeholder='半角英数字でプロジェクト名を入力してください。')
      .file.has-name.is-boxed.project-new-file
        label.file-label
          input.file-input(type='file' name='csv' accept='.csv' @change='uploadfilechange')
          span.file-cta
            span.file-icon
              img(src='~/assets/download-arrow.svg' alt='')
            p
              |アップロードするCSVファイルを選択してください
          span.file-name
            | {{uploadfiletxt}}
      label.shuffle
        span
          |シャッフルする
        input(v-model="shuffle" type="checkbox")

      button.button.is-success.is-fullwidth(@click='upload')
        |作成

</template>

<script>
export default {
  data() {
    return {
      uploadfiletxt: '',
      file: null,
      name: '',
      shuffle: false
    }
  },
  methods: {
   uploadfilechange (e) {
      this.uploadfiletxt = e.target.files[0].name
      this.file = e.target.files[0]
    },
    upload () {
      if (this.file != null) {
        let formData = new FormData
        formData.append('name', this.name)
        formData.append('file', this.file)
        formData.append('shuffle', this.shuffle)
        this.$axios.$post('/api/upload_csv',
          formData,
          {
            headers: {
              'Content-type': 'multipart/form-data'
            }
          }
        ).then(res => {
          this.$router.push('/project/' + this.name)
        })
      }
    }
  }
}
</script>

<style lang="sass">
.project-new-wrapper
  margin-top: 20px
  .file-label
    width: 100%
    span
      max-width: 100%
      width: 100%
  .project-new-file
    margin: 20px 0

  .shuffle
    display: flex
    align-items: center
    margin-bottom: 20px

  .shuffle span
    padding-right: 10px

  .shuffle input
    width: 18px
    height: 18px

</style>