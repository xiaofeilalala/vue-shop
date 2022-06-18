<template>
  <div class="addgood-wrapper">
    <el-card>
      <el-alert title="添加商品信息" center type="success" show-icon :closable="false"></el-alert>
      <el-steps class="step-box" simple :space="200" :active="activeIndex - 0" :align-center="true" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="添加商品"></el-step>
      </el-steps>
      <el-form class="form-box" ref="addGoodRef" :model="addGoodForm" :rules="addGoodRules" label-position="top">
        <el-tabs class="tab-box" v-model="activeIndex" tab-position="left" @tab-click="tabClick" :before-leave="beforeTabsLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name" placeholder="请输入商品名称"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input-number v-model="addGoodForm.goods_price" placeholder="请输入商品价格" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input-number v-model="addGoodForm.goods_number" placeholder="请输入商品数量" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input-number v-model="addGoodForm.goods_weight" placeholder="请输入商品重量" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_introduce">
              <el-cascader
              v-model="addGoodForm.goods_cat"
              :options="cateList"
              :props="addGoodProp"
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
              v-model="addGoodForm.goods_introduce"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="onCreated"/>
            </div>
          </el-tab-pane>
          <el-tab-pane label="新增商品" name="5">
            <el-button type="primary" icon="el-icon-plus" @click="addGood">新增商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
      :visible.sync="imgDialogVisible"
      width="30%">
      <img :src="imgPath" alt="">
      <span slot="footer" class="dialog-footer">
        <el-button @click="imgDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="imgDialogVisible = false">确 定</el-button>
     </span>
    </el-dialog>
  </div>
</template>

<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      addGoodForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addGoodRules: {
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
      addGoodProp: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      cateList: [],
      manyTabData: [],
      onlyTabData: [],
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
    handleChange () {
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
        this.$message.warning('请选择三级分类')
      }
      this.$refs.cascaderRef.toggleDropDownVisible()
    },
    beforeTabsLeave (activeTab, oldTab) {
      if (oldTab === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    async tabClick () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(`categories/${this.addGoodForm.goods_cat[2]}/attributes`, {
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
        const { data: res } = await this.$axios.get(`categories/${this.addGoodForm.goods_cat[2]}/attributes`, {
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
      this.addGoodForm.pics.push(picInfo)
    },
    handleRemove (file) {
      const filePath = file.response.data.tem_path
      const index = this.addGoodForm.pics.findIndex(item => {
        return item.pics === filePath
      })
      this.addGoodForm.pics.splice(index, 1)
    },
    handlePreview (res) {
      this.imgPath = res.response.data.url
      this.imgDialogVisible = true
    },
    onCreated (editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    addGood () {
      this.$refs.addGoodRef.validate(async bool => {
        if (!bool) return this.$message.error('请填写必要信息')
        // 深拷贝对象 lodash
        const cloneGood = _.cloneDeep(this.addGoodForm)
        cloneGood.goods_cat = cloneGood.goods_cat.join(',')
        this.manyTabData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addGoodForm.attrs.push(newData)
        })
        this.onlyTabData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodForm.attrs.push(newData)
        })
        cloneGood.attrs = this.addGoodForm.attrs
        const { data: res } = await this.$axios.post('goods', cloneGood)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
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

<style src="@wangeditor/editor/dist/css/style.css"></style>
<style lang="scss">
.step-box {
  margin: 20px 0;
}
.form-box .el-form-item,
.form-box .el-input-number,
.form-box .el-cascader{
  width: 500px;
}

.tab-box.el-tabs--left .el-tabs__header.is-left{
  margin-right: 36px;
}
.tab-box .el-tabs__item {
  padding: 0 36px;
}
</style>
