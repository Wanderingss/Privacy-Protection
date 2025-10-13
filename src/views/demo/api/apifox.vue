<!-- 接口文档 -->
<template>
  <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>   </span>
              <el-radio-group v-model="visitTrendDateRange" size="small">
                <el-radio-button :value=0>隐私保护</el-radio-button>
                <el-radio-button :value=1>状态估计</el-radio-button>
                <el-radio-button :value=2>对比</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <ECharts :options="visitTrendChartOptions" height="900px" />
        </el-card>
</template>


<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

  import { dayjs } from "element-plus";
  import LogAPI, { VisitTrendVO } from "@/api/system/log.api";

  // 访问趋势日期范围（单位：天）
  const visitTrendDateRange = ref(0);
  // 访问趋势图表配置
  const visitTrendChartOptions = ref();

  /**
 * 更新访问趋势图表的配置项
 *
 * @param data - 访问趋势数据
 */
const updateVisitTrendChartOptions = (data: VisitTrendVO) => {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["隐私保护行驶数据", "估计行驶数据"],
      bottom: 0,
    },
    grid: {
      left: "1%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.dates,
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "隐私保护行驶数据",
        type: "line",
        data: data.pvList,
        areaStyle: {
          color: "rgba(64, 158, 255, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#4080FF",
        },
        lineStyle: {
          color: "#4080FF",
        },
      },
      {
        name: "估计行驶数据",
        type: "line",
        data: data.ipList,
        areaStyle: {
          color: "rgba(103, 194, 58, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#67C23A",
        },
        lineStyle: {
          color: "#67C23A",
        },
      },
    ],
  };
};

/**
 * 获取访问趋势数据，并更新图表配置
 */
const fetchVisitTrendData = () => {
  const startDate = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  const endDate = new Date();
  switch(visitTrendDateRange.value){
    case 0: {
      LogAPI.getVisitCount({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      }).then((data) => {
      updateVisitTrendChartOptions(data);
      });
      break;
    }
    case 1: {
      LogAPI.getVisitCount1({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      }).then((data) => {
        updateVisitTrendChartOptions(data);
      });
      break;
    }
    case 2: {
      LogAPI.getVisitCount2({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      }).then((data) => {
        updateVisitTrendChartOptions(data);
      });
      break;
    }
  }
  
};

// 监听访问趋势日期范围的变化，重新获取趋势数据
watch(
  () => visitTrendDateRange.value,
  () => {
    fetchVisitTrendData();
  },
  { immediate: true }
);
</script>
<style lang="scss" scoped>

</style>
