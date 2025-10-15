<template>
  <el-card>
    <!-- 主内容区 -->
    <el-main class="main-content">
      <!-- 状态信息栏 -->
      <div class="status-bar">
        <div class="status-info">
          <span>{{ currentTime }}</span>
          <span class="separator">|</span>
          <span>节点在线: 12/15</span>
          <span class="separator">|</span>
          <span>数据传输: 4.2 GB</span>
        </div>

        <div class="status-actions">
          <el-button type="default" size="small" @click="handleRefresh">
            <Refresh class="mr-1" />
            刷新
          </el-button>
          <el-button type="default" size="small" @click="handleExport">
            <Download class="mr-1" />
            导出
          </el-button>
        </div>
      </div>

      <!-- 节点选择区域 -->
      <el-card class="content-card" :body-style="{ padding: '20px' }">
        <div class="card-header">
          <el-icon class="header-icon">
            <MapLocation />
          </el-icon>
          <h2 class="card-title">节点选择</h2>
        </div>
        <p class="card-desc">选择需要配置数据采集的边缘节点</p>

        <div class="node-groups">
          <el-card
            v-for="group in nodeGroups"
            :key="group.id"
            :class="['node-card', { 'node-card-selected': group.selected }]"
            @click="toggleNodeGroup(group.id)"
          >
            <div class="node-card-header">
              <div class="node-group-info">
                <div class="node-color-indicator" :style="{ backgroundColor: group.color }"></div>
                <span class="node-group-name">{{ group.name }}</span>
              </div>
              <el-checkbox v-model="group.selected" class="node-select-checkbox" />
            </div>
            <div class="node-group-stats text-xs text-gray-400">
              {{ group.nodeCount }}个节点 · {{ group.status }}
            </div>
          </el-card>
        </div>

        <div class="node-group-actions">
          <el-button type="default" size="small" @click="selectAllNodes">全选</el-button>
          <el-button type="default" size="small" @click="deselectAllNodes">取消全选</el-button>
        </div>
      </el-card>

      <!-- 数据采集配置区域 -->
      <el-card class="content-card" :body-style="{ padding: '20px' }">
        <div class="card-header">
          <el-icon class="header-icon">
            <Monitor />
          </el-icon>
          <h2 class="card-title">采集配置</h2>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据采集频率" class="form-item">
              <el-select v-model="collectionConfig.frequency" class="form-control">
                <el-option label="10秒 (平衡模式)" value="10s" />
                <el-option label="5秒 (高性能模式)" value="5s" />
                <el-option label="30秒 (节能模式)" value="30s" />
                <el-option label="1分钟 (低耗模式)" value="60s" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="传输协议" class="form-item">
              <el-radio-group v-model="collectionConfig.protocol" class="radio-group">
                <el-radio label="mqtt" border>MQTT</el-radio>
                <el-radio label="http" border>HTTP</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="数据加密方式" class="form-item">
              <el-select v-model="collectionConfig.encryption" class="form-control">
                <el-option label="TLS 1.2" value="tls1.2" />
                <el-option label="TLS 1.3" value="tls1.3" />
                <el-option label="SSL 3.0" value="ssl3.0" />
                <el-option label="不加密 (不安全)" value="none" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="采集数据类型" class="form-item">
              <el-checkbox-group v-model="collectionConfig.dataTypes" class="checkbox-group">
                <el-checkbox label="modelParams" border>模型参数更新</el-checkbox>
                <el-checkbox label="nodeStatus" border>节点运行状态</el-checkbox>
                <el-checkbox label="resourceUsage" border>CPU/内存使用率</el-checkbox>
                <el-checkbox label="network" border>网络拓扑数据</el-checkbox>
                <el-checkbox label="energy" border>能耗监测数据</el-checkbox>
                <el-checkbox label="logs" border>异常日志信息</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高级选项 -->
        <el-collapse class="advanced-options">
          <el-collapse-item title="高级选项" name="advanced">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数据压缩频率" class="form-item">
                  <el-select v-model="advancedConfig.compression" class="form-control">
                    <el-option label="中 (平衡)" value="medium" />
                    <el-option label="高 (节省带宽)" value="high" />
                    <el-option label="低 (快速传输)" value="low" />
                    <el-option label="不压缩" value="none" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="数据缓存策略" class="form-item">
                  <el-select v-model="advancedConfig.caching" class="form-control">
                    <el-option label="磁盘缓存" value="disk" />
                    <el-option label="内存缓存" value="memory" />
                    <el-option label="混合缓存" value="hybrid" />
                    <el-option label="不缓存" value="none" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="离线缓存时长" class="form-item">
                  <el-select v-model="advancedConfig.offlineCache" class="form-control">
                    <el-option label="24小时" value="24h" />
                    <el-option label="12小时" value="12h" />
                    <el-option label="72小时" value="72h" />
                    <el-option label="永久缓存" value="forever" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <!-- 数据处理配置区域 -->
      <el-card class="content-card" :body-style="{ padding: '20px' }">
        <div class="card-header">
          <el-icon class="header-icon">
            <Monitor />
          </el-icon>
          <h2 class="card-title">数据处理配置</h2>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据清洗规则" class="form-item">
              <el-select v-model="processingConfig.cleaningRules" class="form-control">
                <el-option label="标准清洗 (默认)" value="standard" />
                <el-option label="严格清洗 (高准确性)" value="strict" />
                <el-option label="快速清洗 (高性能)" value="fast" />
                <el-option label="自定义规则" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="异常检测阈值" class="form-item">
              <el-slider
                v-model="processingConfig.anomalyThreshold"
                :min="1"
                :max="100"
                :show-input="true"
                class="threshold-slider"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="数据聚合方式" class="form-item">
              <el-select v-model="processingConfig.aggregation" class="form-control">
                <el-option label="平均值聚合" value="average" />
                <el-option label="总和聚合" value="sum" />
                <el-option label="最大值聚合" value="max" />
                <el-option label="最小值聚合" value="min" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="特征提取算法" class="form-item">
              <el-select v-model="processingConfig.featureExtraction" class="form-control">
                <el-option label="PCA (主成分分析)" value="pca" />
                <el-option label="小波变换" value="wavelet" />
                <el-option label="傅里叶变换" value="fourier" />
                <el-option label="不提取特征" value="none" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 处理节点分配 -->
        <el-card class="processing-node-card">
          <div class="card-subheader">
            <el-icon class="subheader-icon">
              <Monitor />
            </el-icon>
            <h3 class="subheader-title">处理节点分配</h3>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="处理模式" class="form-item">
                <el-radio-group v-model="processingConfig.mode" class="radio-group">
                  <el-radio label="distributed" border>分布式处理</el-radio>
                  <el-radio label="centralized" border>集中式处理</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="负载均衡策略" class="form-item">
                <el-select v-model="processingConfig.loadBalancing" class="form-control">
                  <el-option label="动态负载均衡" value="dynamic" />
                  <el-option label="轮询分配" value="roundRobin" />
                  <el-option label="性能优先" value="performance" />
                  <el-option label="就近原则" value="proximity" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-card>

      <!-- 采集任务控制 -->
      <el-card class="content-card" :body-style="{ padding: '20px' }">
        <div class="card-header">
          <el-icon class="header-icon">
            <Monitor />
          </el-icon>
          <h2 class="card-title">采集任务控制</h2>
        </div>
        <p class="card-desc">管理数据采集任务的启动、暂停与调度</p>

        <el-row :gutter="20" class="task-controls">
          <el-col :span="8">
            <el-form-item label="任务调度" class="form-item">
              <el-switch
                v-model="taskConfig.scheduleEnabled"
                active-text="启用"
                inactive-text="禁用"
                @change="handleScheduleChange"
              />
              <div class="form-hint text-xs text-gray-400">启用后可按设定时间自动执行任务</div>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="采集任务状态" class="form-item">
              <el-tag :type="taskStatus.type" class="status-tag">
                {{ taskStatus.label }}
              </el-tag>
              <div class="form-hint text-xs text-gray-400">上次运行: 2025/09/10 12:30:45</div>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="节点采集状态" class="form-item">
              <el-tag type="info" class="status-tag">等待启动</el-tag>
              <div class="form-hint text-xs text-gray-400">0/31 节点正在采集</div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 调度设置 -->
        <el-card v-if="taskConfig.scheduleEnabled" class="schedule-settings">
          <h3 class="schedule-title">调度设置</h3>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="执行频率" class="form-item">
                <el-select v-model="taskConfig.frequency" class="form-control">
                  <el-option label="每小时" value="hourly" />
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="开始时间" class="form-item">
                <el-date-picker
                  v-model="taskConfig.startTime"
                  type="datetime"
                  class="form-control"
                />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="最大执行时长" class="form-item">
                <el-select v-model="taskConfig.maxDuration" class="form-control">
                  <el-option label="1小时" value="1h" />
                  <el-option label="2小时" value="2h" />
                  <el-option label="4小时" value="4h" />
                  <el-option label="无限制" value="unlimited" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <div class="task-actions">
          <el-button type="default" size="small" @click="saveConfig">保存配置</el-button>
          <el-button type="primary" size="small" @click="startCollection">
            <Monitor class="mr-1" />
            启动采集
          </el-button>
        </div>
      </el-card>

      <!-- 数据分析结果预览 -->
      <el-card class="content-card" :body-style="{ padding: '20px' }">
        <div class="card-header">
          <el-icon class="header-icon">
            <Monitor />
          </el-icon>
          <h2 class="card-title">数据分析结果预览</h2>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="chart-card">
              <h3 class="chart-title">节点性能指标</h3>
              <div class="chart-container">
                <canvas ref="performanceChart"></canvas>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="chart-card">
              <h3 class="chart-title">数据传输统计</h3>
              <div class="chart-container">
                <canvas ref="dataTransferChart"></canvas>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </el-main>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Monitor, Refresh, Download, MapLocation } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 状态数据
const currentTime = ref("");
// 节点组数据
const nodeGroups = ref([
  {
    id: 1,
    name: "华东区域节点组",
    color: "#165DFF",
    nodeCount: 12,
    status: "全部在线",
    selected: true,
  },
  {
    id: 2,
    name: "华北区域节点组",
    color: "#0FC6C2",
    nodeCount: 8,
    status: "7个在线",
    selected: true,
  },
  {
    id: 3,
    name: "华南区域节点组",
    color: "#722ED1",
    nodeCount: 15,
    status: "14个在线",
    selected: false,
  },
  {
    id: 4,
    name: "西部区域节点组",
    color: "#FF7D00",
    nodeCount: 5,
    status: "5个在线",
    selected: true,
  },
  {
    id: 5,
    name: "东北区域节点组",
    color: "#00B42A",
    nodeCount: 6,
    status: "6个在线",
    selected: true,
  },
  {
    id: 6,
    name: "自定义节点选择",
    color: "#86909C",
    nodeCount: 0,
    status: "选择特定独立节点",
    selected: false,
  },
]);

// 采集配置数据
const collectionConfig = ref({
  frequency: "10s",
  protocol: "mqtt",
  encryption: "tls1.2",
  dataTypes: ["modelParams", "nodeStatus", "resourceUsage"],
});

// 高级配置
const advancedConfig = ref({
  compression: "medium",
  caching: "disk",
  offlineCache: "24h",
});

// 数据处理配置
const processingConfig = ref({
  cleaningRules: "standard",
  anomalyThreshold: 75,
  aggregation: "average",
  featureExtraction: "pca",
  mode: "distributed",
  loadBalancing: "dynamic",
});

// 任务配置
const taskConfig = ref({
  scheduleEnabled: false,
  frequency: "hourly",
  startTime: new Date(),
  maxDuration: "1h",
});

// 任务状态
const taskStatus = ref({
  label: "未运行",
  type: "warning",
});

// 节点组选择处理
const toggleNodeGroup = (id) => {
  const group = nodeGroups.value.find((g) => g.id === id);
  if (group) {
    group.selected = !group.selected;
  }
};

const selectAllNodes = () => {
  nodeGroups.value.forEach((group) => {
    group.selected = true;
  });
};

const deselectAllNodes = () => {
  nodeGroups.value.forEach((group) => {
    group.selected = false;
  });
};

// 任务调度切换
const handleScheduleChange = (checked) => {
  taskConfig.value.scheduleEnabled = checked;
};

// 按钮事件处理
const handleRefresh = () => {
  ElMessage.info("刷新数据中...");
  // 实际应用中这里会有刷新数据的逻辑
};

const handleExport = () => {
  ElMessage.info("正在导出数据...");
  // 实际应用中这里会有导出数据的逻辑
};

const saveConfig = () => {
  ElMessage.success("配置已保存");
  // 实际应用中这里会有保存配置的逻辑
};

const startCollection = () => {
  ElMessage.success("开始数据采集");
  taskStatus.value = { label: "运行中", type: "success" };
  // 实际应用中这里会有启动采集任务的逻辑
};

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date();
  currentTime.value = now
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(",", "");
};

// 组件挂载时初始化
onMounted(() => {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #272e3b;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-icon {
  font-size: 20px;
  color: #165dff;
}

.header-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.header-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  font-size: 12px;
}

.search-input {
  width: 200px;
  border-color: #4e5969;
}

.user-info {
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
  color: #fff;
}

.user-name {
  font-size: 14px;
}

.notification-icon {
  font-size: 18px;
  cursor: pointer;
}

.sidebar {
  width: 64px;
  border-right: 1px solid #272e3b;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 12px;
  color: #86909c;
}

.status-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.separator {
  color: #4e5969;
}

.status-actions {
  display: flex;
  gap: 10px;
}

.content-card {
  margin-bottom: 20px;
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0e0202;
}

.card-desc {
  margin-bottom: 20px;
  font-size: 12px;
  color: #86909c;
}

.node-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.node-card {
  width: 280px;
  cursor: pointer;
  border: 1px solid #4e5969;
  transition: all 0.3s;
}

.node-card:hover {
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.node-card-selected {
  border-color: #165dff;
  box-shadow: 0 0 0 1px rgba(22, 93, 255, 0.3);
}

.node-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.node-group-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.node-color-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-group-name {
  font-weight: 500;
  color: #160303;
}

.node-select-checkbox {
  --el-checkbox-bg-color: #1d2129;
  --el-checkbox-border-color: #4e5969;
  --el-checkbox-checked-bg-color: #165dff;
}

.node-group-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.form-item {
  margin-bottom: 16px;
}

.el-form-item__label {
  font-size: 14px;
  color: #020913;
}

.form-control {
  width: 100%;
  color: #010711;
  border-color: #4e5969;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.el-radio__label {
  color: #c9cdd4;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.el-checkbox__label {
  color: #c9cdd4;
}

.advanced-options {
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #4e5969;
}

.el-collapse {
  --el-collapse-border-color: transparent;
}

.el-collapse-item__header {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.processing-node-card {
  margin-top: 20px;
  border: 1px solid #4e5969;
}

.card-subheader {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.subheader-icon {
  margin-right: 8px;
  color: #165dff;
}

.subheader-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #160101;
}

.task-controls {
  margin-bottom: 20px;
}

.status-tag {
  margin-right: 8px;
}

.form-hint {
  margin-top: 4px;
}

.schedule-settings {
  padding: 16px;
  margin-top: 16px;
  border: 1px solid #4e5969;
}

.schedule-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #110202;
}

.task-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.chart-card {
  height: 100%;
  border: 1px solid #4e5969;
}

.chart-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #0f0101;
}

.chart-container {
  height: 256px;
}

.threshold-slider {
  --el-slider-runway-background: #4e5969;
  --el-slider-process-background: #165dff;
}
</style>
