<template>
  <div class="role-wrapper">
    <el-card>
      <el-row :gutter="20">
        <el-col :span="2">
          <el-button type="primary" icon="el-icon-plus" @click="addRole">新增角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" border stripe class="role-table">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div v-if="scope.row.children.length !== 0">
              <el-row :class="['bottom', index === 0 ? 'top' : '']" type="flex" align="middle" justify="center" v-for="(item, index) in scope.row.children" :key="item.id">
                <!-- 一级权限 -->
                <el-col :span="5">
                  <el-tag type="success" closable @close="removeRole(scope.row, item.id)">{{ item.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级与三级权限 -->
                <el-col :span="19">
                  <el-row type="flex" align="middle" justify="center" :class="[index2 === 0 ? '' : 'top']" v-for="(list, index2) in item.children" :key="list.id">
                    <!-- 二级权限 -->
                    <el-col :span="6">
                      <el-tag type="warning" closable @close="removeRole(scope.row, list.id)">{{ list.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级权限 -->
                    <el-col :span="18">
                      <el-tag closable @close="removeRole(scope.row, list2.id)" type="danger" v-for="list2 in list.children" :key="list2.id">{{ list2.authName }}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
            <div v-else class="nopower">暂无权限</div>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button type="warning" size="small" icon="el-icon-setting" @click="settingRole(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限弹窗 -->
    <el-dialog title="分配权限" width="30%" :visible.sync="roleDialogVisible" @close="roleDialogClose">
      <el-tree
      :data="powerList"
      :props="poserProps"
      show-checkbox
      default-expand-all
      node-key="id"
      :default-checked-keys="defaultPoserList"
      ref="treeRole">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoleList">确定</el-button>
      </span>
    </el-dialog>
    <!-- 新增角色弹窗 -->
    <el-dialog title="新增角色" width="30%" :visible.sync="addRoleDialogVisible" @close="addRoleDialogClose">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleRef" label-width="100px">
         <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddRole">确定</el-button>
      </span>
    </el-dialog>
     <!-- 新增角色弹窗 -->
    <el-dialog title="编辑角色" width="30%" :visible.sync="editRoleDialogVisible" @close="editRoleDialogClose">
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleRef" label-width="100px">
         <el-form-item prop="roleName" label="角色名称">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item prop="roleDesc" label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditRole">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表
      roleList: [],
      // 权限分配弹窗显示与隐藏
      roleDialogVisible: false,
      // 所有权限列表数据
      powerList: [],
      // tree配置选项
      poserProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认展开的权限列表
      defaultPoserList: [],
      // 当前角色id
      roleId: '',
      // 新增角色弹窗
      addRoleDialogVisible: false,
      // 新增角色数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 校验规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色数据
      editRoleForm: {},
      // 编辑角色弹窗
      editRoleDialogVisible: false
    }
  },
  created () {
    // 初始加载所有角色权限
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleList = res.data
    },
    // 根据id删除对应权限
    removeRole (role, roleId) {
      this.$confirm(
        '此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${roleId}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        role.children = res.data
      }).catch(() => {
        return this.$message.info('取消删除')
      })
    },
    // 展示分配权限弹框
    async settingRole (role) {
      this.roleId = role.id
      this.roleDialogVisible = true
      this.getPoserKeys(role, this.defaultPoserList)
      // 获取所有权限列表tree
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.powerList = res.data
    },
    // 递归实现获取角色权限
    getPoserKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getPoserKeys(item, arr)
      })
    },
    // 关闭弹窗
    roleDialogClose () {
      this.defaultPoserList = []
    },
    // 确定按钮分配权限保存
    async saveRoleList () {
      this.roleDialogVisible = false
      const keys = [
        ...this.$refs.treeRole.getCheckedKeys(),
        ...this.$refs.treeRole.getHalfCheckedNodes()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      // 刷新角色权限数据
      this.getRoleList()
      // 关闭分配权限弹窗
      this.roleDialogVisible = false
    },
    // 新增角色
    addRole () {
      this.addRoleDialogVisible = true
    },
    // 新增角色弹窗关闭
    addRoleDialogClose () {
      this.$refs.addRoleRef.resetFields()
    },
    // 保存新增角色
    saveAddRole () {
      this.$refs.addRoleRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.addRoleDialogVisible = false
          // 重新获取角色列表
          this.getRoleList()
        }
      })
    },
    // 编辑角色
    async editRole (id) {
      this.editRoleDialogVisible = true
      const { data: res } = await this.$axios.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.editRoleForm = res.data
    },
    // 关闭编辑角色
    editRoleDialogClose () {
      this.$refs.editRoleRef.resetFields()
    },
    // 保存编辑
    saveEditRole () {
      this.$refs.editRoleRef.validate(async bool => {
        if (!bool) return false
        const { data: res } = await this.$axios.put(`roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.editRoleDialogVisible = false
          // 重新获取角色列表
          this.getRoleList()
        }
      })
    },
    // 删除角色
    deleteRole (id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`roles/${id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 重新获取用户列表
          this.getRoleList()
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 8px;
}
.top {
  border-top: 1px solid #ebeef5;
}
.bottom {
  border-bottom: 1px solid #ebeef5;
}
.nopower {
  text-align: center;
  line-height: 30px;
}
.role-table {
  margin-top: 20px;
}
</style>
