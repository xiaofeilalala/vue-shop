<template>
  <div class="sort-wrapper">
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-plus" @click="addSort">添加分类</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodList" border stripe class="sort-table" row-key="cat_id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称" width="500"></el-table-column>
        <el-table-column prop="cat_deleted" label="是否有效">
          <template slot-scope="scope">
            <i class="el-icon-circle-check yes" v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-circle-close no" v-else></i>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="cat_level">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="danger" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
              <el-button type="primary" size="small" icon="el-icon-edit" @click="editSort(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteSort(scope.row)">删除</el-button>
           </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addSortdialogVisible"
      width="30%"
      @close="addSortFormClose">
      <el-form label-width="80px" :model="addSortForm" :rules="addSortRules" ref="addSortRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addSortForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKeys"
            :options="parentSortList"
            :props="addSortProp"
            @change="parentSortChange"
            class="cascader-box"
            clearable
            ref="cascaderRef">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addSortdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAddSort">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editSortdialogVisible"
      width="30%"
      @close="editSortFormClose">
      <el-form :model="editSortForm" label-width="80px" ref="editSortRef" :rules="editSortRules">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editSortForm.cat_name"></el-input>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editSortdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditSort">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类数据
      goodList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 新增分类弹窗
      addSortdialogVisible: false,
      // 编辑分类弹窗
      editSortdialogVisible: false,
      // 新增角色弹窗对象
      addSortForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 验证规则
      addSortRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      editSortRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentSortList: [],
      // 选中的父级分类
      selectKeys: [],
      // 父级分类prop
      addSortProp: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 编辑内容
      editSortForm: {
        cat_id: 0,
        cat_name: ''
      }
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    async getGoodList () {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    addSort () {
      this.addSortdialogVisible = true
      this.getParentSort()
    },
    async editSort (scope) {
      this.editSortdialogVisible = true
      const { data: res } = await this.$axios.get(`categories/${scope.cat_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editSortForm.cat_name = res.data.cat_name
      this.editSortForm.cat_id = res.data.cat_id
    },
    editSortFormClose () {
      this.editSortForm.cat_name = ''
    },
    saveEditSort () {
      this.$refs.editSortRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.put(`categories/${this.editSortForm.cat_id}`, {
          cat_name: this.editSortForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getGoodList()
        this.editSortdialogVisible = false
      })
    },
    deleteSort (scope) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`categories/${scope.cat_id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 重新获取用户列表
          this.getGoodList()
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    addSortFormClose () {
      this.$refs.addSortRef.resetFields()
      this.selectKeys = []
      this.addSortForm.cat_pid = 0
      this.addSortForm.cat_level = 0
    },
    // 获取父级分类数据列表
    async getParentSort () {
      const { data: res } = await this.$axios.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentSortList = res.data
    },
    parentSortChange () {
      // length > 0 选中父级分类
      if (this.selectKeys.length > 0) {
        this.addSortForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addSortForm.cat_level = this.selectKeys.length
      } else {
        this.addSortForm.cat_pid = 0
        this.addSortForm.cat_level = 0
      }
      this.$refs.cascaderRef.toggleDropDownVisible()
    },
    saveAddSort () {
      this.$refs.addSortRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.post('categories', this.addSortForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getGoodList()
        this.addSortdialogVisible = false
      })
    }
  }
}
</script>

<style lang="scss">
.sort-table {
  margin: 20px 0
}
.cascader-box {
  width: 100%;
}
</style>
