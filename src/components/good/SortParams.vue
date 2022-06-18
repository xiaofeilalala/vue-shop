<template>
  <div class="params-wrapper">
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false">
      </el-alert>
      <el-row class="good-option">
        <el-col :span="6">
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="selectProp"
            @change="paramsHandleChange"
            ref="cascaderRef"
            clearable>
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态参数pannel -->
          <el-button
          type="primary"
          :disabled="isDisabled"
          icon="el-icon-plus"
          @click="addParamsDialogVisible = true"
          size="mini">动态参数</el-button>
          <el-table :data="manyTableList" border stripe class="params-table" v-if="activeName === 'many'">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  @close="handleClose(scope.row, index)"
                  closable v-for="(item, index) in scope.row.attr_vals"
                  :key="index">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="editParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性"  name="only">
          <!-- 静态属性pannel -->
          <el-button
          type="primary"
          :disabled="isDisabled"
          icon="el-icon-plus"
          size="mini"
          @click="addParamsDialogVisible = true">静态属性</el-button>
          <el-table :data="onlyTableList" border stripe class="params-table" v-if="activeName === 'only'">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  @close="handleClose(scope.row, index)"
                  closable v-for="(item, index) in scope.row.attr_vals"
                  :key="index">{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="editParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
       </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数 静态属性 -->
    <el-dialog
      :title="'新增' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="30%"
      @close="addParamsClose">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改动态参数 静态属性 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="30%"
      @close="editParamsClose">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 参数列表数据
      cateList: [],
      // 级联选择器配置对象
      selectProp: {
        checkStrictly: true,
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 绑定数据
      selectKeys: [],
      // 当前激活的tab
      activeName: 'many',
      // 获取参数列表
      paramsList: [],
      // 动态参数
      manyTableList: [],
      // 静态属性
      onlyTableList: [],
      // 添加
      addParamsDialogVisible: false,
      // 添加表单验证规则
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 添加表单数据对象
      addParamsForm: {
        attr_name: ''
      },
      // 编辑
      editParamsDialogVisible: false,
      // 编辑表单数据
      editParamsForm: {}
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
    async paramsHandleChange () {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableList = []
        this.onlyTableList = []
        this.$message.warning('请选择三级分类')
        this.$refs.cascaderRef.toggleDropDownVisible()
      } else {
        this.getParamsData()
        this.$refs.cascaderRef.toggleDropDownVisible()
      }
    },
    // 获取参数列表数据
    async getParamsData () {
      // 根据选择的参数获取数据
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      this.activeName === 'many' ? this.manyTableList = res.data : this.onlyTableList = res.data
    },
    // tab事件触发
    handleTabClick () {
      if (this.selectKeys.length !== 3) {
        return false
      }
      this.getParamsData()
    },
    addParamsClose () {
      this.$refs.addParamsRef.resetFields()
    },
    saveAddParams () {
      this.$refs.addParamsRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.addParamsDialogVisible = false
          // 重新获取参数列表
          this.getParamsData()
        }
      })
    },
    editParamsClose () {
      this.$refs.editParamsRef.resetFields()
    },
    async editParams (attrId) {
      this.editParamsDialogVisible = true
      const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editParamsForm = res.data
    },
    async saveEditParams () {
      this.$refs.editParamsRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.editParamsDialogVisible = false
          // 重新获取参数列表
          this.getParamsData()
        }
      })
    },
    deleteParams (id) {
      this.$confirm(`此操作将永久删除该${this.titleText}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 重新获取参数列表
          this.getParamsData()
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputVisible = false
        row.inputValue = ''
        this.saveHandleParams(row)
      }
    },
    async saveHandleParams (row) {
      const { data: res } = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    showInput (value) {
      value.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose (row, index) {
      row.attr_vals.splice(index, 1)
      this.saveHandleParams(row)
    }
  },
  computed: {
    isDisabled () {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    // 分类id
    cateId () {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.good-option {
  margin: 20px 0;
}
.params-table {
  margin-top: 20px;
}
.el-tag {
  margin: 8px;
}
.input-new-tag {
  width: 100px;
}
</style>
