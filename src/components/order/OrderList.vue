<template>
  <div class="order-wraper">
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <!-- 搜索与添加 -->
          <el-input placeholder="请输入订单信息" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe class="order-table">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column width="120" label="订单价格（元）" prop="order_price"></el-table-column>
        <el-table-column width="100" label="是否发货">
          <template slot-scope="scope">
            <i class="el-icon-circle-close no" v-if="scope.row.is_send === '否'"></i>
            <i class="el-icon-circle-check yes" v-else></i>
          </template>
        </el-table-column>
        <el-table-column width="100" label="支付状态">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未支付</el-tag>
            <el-tag v-else>已支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="240">
          <template slot-scope="scope">
            {{scope.row.create_time | formatTime}}
          </template>
        </el-table-column>
        <el-table-column label="地址" prop="consignee_addr"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="primary" size="small" icon="el-icon-edit" @click="editOrder(scope.row)">编辑</el-button>
            <el-button type="success" size="small" icon="el-icon-truck" @click="logisticsOrder(scope.row)">物流</el-button>
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
        :total="total"
        background>
      </el-pagination>
    </el-card>
    <el-dialog
      title="编辑订单"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editHandleClose">
      <el-form ref="editOrderRef" :model="editOrderForm" :rules="editOrderRules" label-width="100px">
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="editOrderForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="下单日期" class="time" prop="create_time">
          <el-date-picker v-model="editOrderForm.create_time" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="订单价格" prop="order_price">
          <el-input type="number" v-model="editOrderForm.order_price"></el-input>
        </el-form-item>
        <el-form-item label="支付状态" prop="pay_status">
          <el-select v-model="editOrderForm.pay_status" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="是否发货" prop="is_send">
          <el-select v-model="editOrderForm.is_send" placeholder="请选择">
            <el-option v-for="item in sendOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="省市区/县" prop="address">
           <el-cascader
            v-model="editOrderForm.address"
            :options="city"
            :props="cascaderProp"
            class="order">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="fullAddress">
           <el-input v-model="editOrderForm.fullAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditOrder">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流查看 -->
    <el-dialog
      title="物流信息"
      :visible.sync="seeDialogVisible"
      width="30%"
      @close="seehandleClose">
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="seeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="seeDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import city from '@/tools/city.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      editDialogVisible: false,
      seeDialogVisible: false,
      editOrderForm: {},
      statusOptions: [
        { value: '0', label: '未付款' },
        { value: '1', label: '已付款' }
      ],
      sendOptions: [
        { value: '否', label: '未发货' },
        { value: '是', label: '已发货' }
      ],
      cascaderProp: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      city: city,
      editOrderRules: {
        order_number: [
          { required: true, message: '请输入订单编号', trigger: 'blur' }
        ],
        create_time: [
          { required: true, message: '请输入下单日期', trigger: 'blur' }
        ],
        order_price: [
          { required: true, message: '请输入订单价格', trigger: 'blur' }
        ],
        pay_status: [
          { required: true, message: '请选择支付状态', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入地址信息', trigger: 'blur' }
        ],
        fullAddress: [
          { required: true, message: '请输入地址信息', trigger: 'blur' }
        ],
        is_send: [
          { required: true, message: '请选择是否发货', trigger: 'blur' }
        ]
      },
      activities: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    editHandleClose () {
      this.$refs.editOrderRef.resetFields()
      this.editOrderForm.address = []
      this.editOrderForm.fullAddress = ''
      this.editDialogVisible = false
    },
    async editOrder (parm) {
      const { data: res } = await this.$axios.get(`orders/${parm.order_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editOrderForm = res.data
      // 获取市区县区
      const reg = /.+?(省|市|自治区|自治州|县|区)/g
      const full = /(县|区)(.+)/g
      if (this.editOrderForm.consignee_addr) {
        // 通过set来添加响应式数据
        this.$set(this.editOrderForm, 'address', res.data.consignee_addr.match(reg))
        this.$set(this.editOrderForm, 'fullAddress', res.data.consignee_addr.match(full).join('').slice(1))
      } else {
        this.editOrderForm.address = []
        this.editOrderForm.fullAddress = ''
      }
      this.editDialogVisible = true
    },
    saveEditOrder () {
      this.$refs.editOrderRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$axios.put(`orders/${this.editOrderForm.order_id}`, {
          order_number: this.editOrderForm.order_number,
          order_price: this.editOrderForm.order_price,
          pay_status: this.editOrderForm.pay_status,
          is_send: this.editOrderForm.is_send,
          create_time: this.editOrderForm.create_time,
          consignee_addr: this.editOrderForm.address.join('') + this.editOrderForm.fullAddress
        })
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          this.editDialogVisible = false
          this.getOrderList()
        }
      })
    },
    async logisticsOrder () {
      // mock模拟
      const { data: res } = await this.$axios.get('https://mock.presstime.cn/mock/62ac59783143f20030de1add/example/kuaidi')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.activities = res.data
      this.seeDialogVisible = true
    },
    seehandleClose () {
      this.seeDialogVisible = false
    }
  },
  filters: {
    formatTime (time) {
      return dayjs(time).locale('zh-cn').format('YYYY年MM月DD日 HH:mm:ss')
    }
  }
}
</script>

<style lang="scss">
.order-table {
  margin: 20px 0
}
.yes {
  font-size: 20px;
  color: #67c23a;
}
.no {
  font-size: 20px;
  color: #f56c6c;
}
.el-select {
  width: 100%;
}
.order.el-cascader {
  width: 100%;
}
.time .el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: 100%;
}
.el-form .el-form-item:last-child {
  margin: 0
}
</style>
