<template>
  <el-card>
    <el-table :data="powerList" border stripe>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="权限名称" prop="authName"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="权限等级" prop="level">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.level === '0'">一级权限</el-tag>
          <el-tag type="warning" v-else-if="scope.row.level === '1'">二级权限</el-tag>
          <el-tag type="danger" v-else>三级权限</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      powerList: []
    }
  },
  created () {
    // 请求所有权限
    this.getPowerList()
  },
  methods: {
    // 获取权限列表
    async getPowerList () {
      const { data: res } = await this.$axios.get('rights/list')
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      }
      this.powerList = res.data
    }
  }
}
</script>

<style lang="scss">

</style>
