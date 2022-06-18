<template>
  <div id="main" style="width: 800px; height:400px;"></div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  data () {
    return {
      reportForms: {},
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted () {
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error(res.meta.msg)
    }
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))
    const result = _.merge(res.data, this.options)
    myChart.setOption(result)
  }
}
</script>

<style lang="scss">

</style>
