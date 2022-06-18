<template>
  <div class="good-wrapper">
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入商品名称" v-model="goodInfo.query" clearable @clear="getGoodList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" icon="el-icon-plus" @click="addGood">新增商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodList" border stripe class="good-table">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" width="800" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" width="140" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" width="140" label="商品重量（kg）"></el-table-column>
        <el-table-column prop="add_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time | formatTime}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" icon="el-icon-edit" @click="editGood(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteGood(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="goodInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="goodInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    </el-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
export default {
  data () {
    return {
      goodList: [],
      goodInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    async getGoodList () {
      const { data: res } = await this.$axios.get('goods', {
        params: this.goodInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.goodInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange (newPage) {
      this.goodInfo.pagenum = newPage
      this.getGoodList()
    },
    deleteGood (scope) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(`goods/${scope.goods_id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 重新获取商品列表
          this.getGoodList()
        }
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },
    addGood () {
      this.$router.push('goods/add')
    },
    editGood (params) {
      this.$router.push({
        path: `/goods/edit/${params.goods_id}`
      })
    }
  },
  filters: {
    formatTime (time) {
      return dayjs(time).locale('zh-cn').format('YYYY/MM/DD HH:mm:ss')
    }
  }
}
</script>

<style lang="scss">
.good-table {
  margin: 20px 0;
}
</style>
