<template>
  <div class="editgood-wrapper">
    <el-card>
      <el-alert title="编辑商品信息" center type="success" show-icon :closable="false"></el-alert>
      <el-steps class="step-box" simple :space="200" :active="activeIndex - 0" :align-center="true" finish-status="success">
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="编辑商品"></el-step>
    </el-steps>
    <el-form class="form-box" ref="editGoodRef" :model="editGoodList" :rules="editGoodRules" label-position="top">
      <el-tabs class="tab-box" v-model="activeIndex" tab-position="left" @tab-click="tabClick" :before-leave="beforeTabsLeave">
        <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editGoodList.goods_name" placeholder="请输入商品名称"></el-input>
            </el-form-item>
            <el-form-item label="商品价格（元）" prop="goods_price">
              <el-input-number v-model="editGoodList.goods_price" placeholder="请输入商品价格" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input-number v-model="editGoodList.goods_number" placeholder="请输入商品数量" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量（kg）" prop="goods_weight">
              <el-input-number v-model="editGoodList.goods_weight" placeholder="请输入商品重量" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_introduce">
            <el-cascader
              v-model="editGoodList.goods_cat"
              :options="cateList"
              :props="editGoodProp"
              @change="handleChange"
              ref="cascaderRef">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox border v-for="(list, index) in item.attr_vals" :label="list" :key="index"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
            class="upload-demo"
            drag
            :action="path"
            multiple
            :headers="header"
            list-type="picture"
            :on-success="handleSuccess"
            :on-remove="handleRemove"
            :on-preview="handlePreview">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <div style="border: 1px solid #ccc;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editor"
              :defaultConfig="toolbarConfig"
              :mode="mode"/>
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="editGoodList.goods_introduce"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="onCreated"/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="编辑商品" name="5">
          <el-button type="primary" icon="el-icon-plus" @click="editGood">编辑商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    </el-card>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: 0,
      editGoodList: {},
      editGoodRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cate: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      manyTabData: [],
      onlyTabData: [],
      editGoodProp: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 图片请求路径
      path: 'http://127.0.0.1:8888/api/private/v1/upload',
      header: {
        Authorization: window.sessionStorage.getItem('token')
      },
      imgDialogVisible: false,
      imgPath: '',
      editor: null,
      toolbarConfig: {},
      editorConfig: {
        placeholder: '请输入内容...',
        MENU_CONF: {
          uploadImage: {
            base64LimitSize: 10000 * 1024
          }
        }
      },
      mode: 'simple' // or 'simple'
    }
  },
  created () {
    this.getEditGoodList()
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
    },
    async getEditGoodList () {
      const { data: res } = await this.$axios.get(`goods/${this.$route.params.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editGoodList = res.data
      this.editGoodList.goods_cat = [this.editGoodList.cat_one_id, this.editGoodList.cat_two_id, this.editGoodList.cat_three_id]
    },
    handleChange () {
      if (this.editGoodList.goods_cat.length !== 3) {
        this.editGoodList.goods_cat = []
        this.$message.warning('请选择三级分类')
      }
      this.$refs.cascaderRef.toggleDropDownVisible()
    },
    beforeTabsLeave (activeTab, oldTab) {
      if (oldTab === '0' && this.editGoodList.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    async tabClick () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(`categories/${this.editGoodList.cat_three_id}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTabData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(`categories/${this.editGoodList.cat_three_id}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyTabData = res.data
      }
    },
    handleSuccess (res) {
      const picInfo = {
        pic: res.data.tmp_path
      }
      this.editGoodList.pics.push(picInfo)
    },
    handleRemove (file) {
      const filePath = file.response.data.tem_path
      const index = this.editGoodList.pics.findIndex(item => {
        return item.pics === filePath
      })
      this.editGoodList.pics.splice(index, 1)
    },
    handlePreview (res) {
      this.imgPath = res.response.data.url
      this.imgDialogVisible = true
    },
    onCreated (editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    editGood () {
      this.$refs.editGoodRef.validate(async bool => {
        if (!bool) return this.$message.error('请填写必要信息')
        // 深拷贝对象 lodash
        const cloneGood = _.cloneDeep(this.editGoodList)
        cloneGood.goods_cat = cloneGood.goods_cat.join(',')
        this.manyTabData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.editGoodList.attrs.push(newData)
        })
        this.onlyTabData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.editGoodList.attrs.push(newData)
        })
        cloneGood.attrs = this.editGoodList.attrs
        const { data: res } = await this.$axios.put(`goods/${this.$route.params.id}`, cloneGood)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品失败')
        }
        this.$message.success('编辑商品成功')
        this.$router.push('/goods')
      })
    }
  },
  beforeDestroy () {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  components: {
    Editor,
    Toolbar
  }
}
</script>

<style lang="scss">

</style>
