<template>
  <div class="user-wrapper">
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 搜索与添加 -->
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" icon="el-icon-plus" @click="addUser">新增用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe class="user-table">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="switchStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
           <template slot-scope="scope">
              <el-button type="primary" size="small" icon="el-icon-edit" @click="editUser(scope.row.id)">编辑</el-button>
              <el-button type="danger" size="small" icon="el-icon-delete" @click="removeUser(scope.row.id)">删除</el-button>
              <el-button type="warning" size="small" icon="el-icon-setting" @click="settingUser(scope.row)">设置</el-button>
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
    <!-- 新增用户弹窗 -->
    <el-dialog title="新增用户" width="30%" :visible.sync="userAddDialogVisible" @close="userAddDialogClose">
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userAddDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户弹窗 -->
    <el-dialog title="编辑用户" width="30%" :visible.sync="userEditDialogVisible" @close="userEditDialogClose">
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 设置用户弹窗 -->
    <el-dialog title="设置权限" width="30%" :visible.sync="userSettingDialogVisible" @close="userSettingDialogClose">
      <el-form :model="settingUserForm" ref="settingUserRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="settingUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="settingUserForm.role_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userSettingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettingUser">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义校验规则
    const checkEmail = (rule, value, callback) => {
      // 邮箱校验规则
      const emailRegexp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (emailRegexp.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }

    const checkMobile = (rule, value, callback) => {
      const mobileRegexp = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/
      if (mobileRegexp.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      // 用户列表
      userList: [],
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        // 页面显示数据条数
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 新增用户弹窗
      userAddDialogVisible: false,
      // 表单验证规则对象
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 编辑表单验证规则
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 添加表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      userEditDialogVisible: false,
      // 编辑表单数据
      editUserForm: {},
      // 设置权限数据
      settingUserForm: {},
      // 设置权限弹窗
      userSettingDialogVisible: false,
      // 角色列表
      rolesList: [],
      // 选中的权限ID
      selectRoleId: ''
    }
  },
  created () {
    // 初始化获取用户列表
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$axios.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 切换页面显示数量
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 切换当前页码
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // switch状态
    async switchStateChange (scope) {
      const { data: res } = await this.$axios.put(`users/${scope.id}/state/${scope.mg_state}`)
      if (res.meta.status !== 200) {
        scope.mg_state = !scope.mg_state
        return this.$message.error(res.meta.msg)
      }
    },
    addUser () {
      this.userAddDialogVisible = true
    },
    userAddDialogClose () {
      this.$refs.addUserRef.resetFields()
    },
    saveAddUser () {
      this.$refs.addUserRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.userAddDialogVisible = false
          // 重新获取用户列表
          this.getUserList()
        }
      })
    },
    // 编辑用户
    async editUser (id) {
      this.userEditDialogVisible = true
      const { data: res } = await this.$axios.get(`users/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.editUserForm = res.data
    },
    // 关闭编辑表单
    userEditDialogClose () {
      this.$refs.editUserRef.resetFields()
    },
    // 保存编辑
    async saveEditUser () {
      this.$refs.editUserRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.put(`users/${this.editUserForm.id}`, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.userEditDialogVisible = false
          // 重新获取用户列表
          this.getUserList()
        }
      })
    },
    // 删除用户
    removeUser (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`users/${id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 重新获取用户列表
          this.getUserList()
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    async settingUser (info) {
      this.settingUserForm = info
      this.userSettingDialogVisible = true
      // 获取角色列表
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rolesList = res.data
    },
    userSettingDialogClose () {
      this.selectRoleId = ''
      this.settingUserForm = {}
    },
    async saveSettingUser () {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$axios.put(`users/${this.settingUserForm.id}/role`, {
        rid: this.selectRoleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.userSettingDialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.user-table {
  margin: 20px 0;
}
.el-form .el-form-item:last-child {
  margin: 0
}
.el-select {
  width: 100%;
}
</style>
