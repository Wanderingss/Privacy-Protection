<template>
  <el-card>
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="logo">数据传输潜力评估系统</div>
      <div class="header-actions">
        <el-button icon="Refresh" size="small" class="reset-btn" @click="handleReset">
          <span class="btn-text">重置</span>
        </el-button>
        <el-button
          type="success"
          icon="Monitor"
          size="small"
          class="run-btn"
          @click="handleRunAnalysis"
        >
          <span class="btn-text">运行分析</span>
        </el-button>
      </div>
    </el-header>

    <div class="main-content">
      <!-- 左侧导航 -->
      <el-aside class="sidebar">
        <el-menu
          default-active="1"
          class="sidebar-menu"
          text-color="#0f1733"
          active-text-color="#ff1733"
          :unique-opened="true"
        >
          <el-menu-item index="1" icon="Grid">
            <span>矩阵配置</span>
          </el-menu-item>
          <el-menu-item index="2" icon="PieChart">
            <span>评估结果</span>
          </el-menu-item>
          <el-menu-item index="3" icon="LineChart">
            <span>历史数据</span>
          </el-menu-item>
          <el-menu-item index="4" icon="Setting" :disabled="isAnalyzing">
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main">
        <div class="main-grid">
          <!-- 左侧配置面板 -->
          <div class="left-panel">
            <!-- 邻接矩阵配置 -->
            <el-card class="config-card matrix-config">
              <template #header>
                <div class="card-header">
                  <h3>邻接矩阵配置</h3>
                </div>
              </template>

              <div class="matrix-source">
                <h4>矩阵来源</h4>
                <div class="matrix-buttons">
                  <el-button type="default" icon="Upload" class="upload-btn">导入矩阵</el-button>
                  <el-button
                    type="primary"
                    icon="RefreshLeft"
                    class="generate-btn"
                    :disabled="isAnalyzing"
                    @click="generateMatrix"
                  >
                    自动生成
                  </el-button>
                </div>
              </div>

              <div class="node-count">
                <h4>节点数量</h4>
                <el-input
                  v-model="nodeCount"
                  type="number"
                  min="1"
                  :disabled="isAnalyzing"
                ></el-input>
              </div>

              <div class="matrix-preview">
                <h4>预览</h4>
                <div class="matrix-content">
                  <pre v-for="(row, index) in matrixData" :key="index">{{ row.join(" ") }}</pre>
                </div>
                <!-- 新增：矩阵操作按钮 -->
                <div class="matrix-actions">
                  <el-button
                    type="text"
                    class="export-btn"
                    :disabled="isAnalyzing || matrixData.length === 0"
                  >
                    <el-icon size="14">
                      <Download />
                    </el-icon>
                    导出
                  </el-button>
                  <el-button
                    type="text"
                    class="visualize-btn"
                    :disabled="isAnalyzing || matrixData.length === 0"
                  >
                    <el-icon size="14">
                      <Monitor />
                    </el-icon>
                    可视化
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- 评估权重配置 -->
            <el-card class="config-card weight-config">
              <template #header>
                <div class="card-header">
                  <h3>评估权重配置</h3>
                </div>
              </template>

              <div class="weight-item">
                <div class="weight-label">
                  <span>网络中心性权重</span>
                  <span class="weight-value">{{ networkCentralityWeight }}%</span>
                </div>
                <el-slider
                  v-model="networkCentralityWeight"
                  min="0"
                  max="100"
                  step="1"
                  :disabled="isAnalyzing"
                ></el-slider>
              </div>

              <div class="weight-item">
                <div class="weight-label">
                  <span>传输资源指数权重</span>
                  <span class="weight-value">{{ transmissionResourceWeight }}%</span>
                </div>
                <el-slider
                  v-model="transmissionResourceWeight"
                  min="0"
                  max="100"
                  step="1"
                  :disabled="isAnalyzing"
                ></el-slider>
              </div>

              <el-button
                type="success"
                class="save-weight-btn"
                :disabled="isAnalyzing"
                @click="saveWeightConfig"
              >
                保存权重配置
              </el-button>
            </el-card>

            <!-- 资源参数来源 -->
            <el-card class="config-card resource-config">
              <template #header>
                <div class="card-header">
                  <h3>资源参数来源</h3>
                </div>
              </template>

              <el-radio-group v-model="resourceSource" :disabled="isAnalyzing">
                <el-radio label="realtime" class="resource-option">
                  <span class="option-label">实时节点数据</span>
                  <span class="option-desc">从在线节点采集实时数据</span>
                </el-radio>
                <el-radio label="simulated" class="resource-option">
                  <span class="option-label">模拟数据</span>
                  <span class="option-desc">使用系统生成的模拟数据</span>
                </el-radio>
              </el-radio-group>

              <el-button
                type="default"
                icon="Refresh"
                class="refresh-resource-btn"
                :disabled="isAnalyzing"
                @click="refreshResourceData"
              >
                刷新资源数据
              </el-button>
            </el-card>
          </div>

          <!-- 右侧结果展示面板 -->
          <div class="right-panel">
            <el-card class="result-card">
              <template #header>
                <div class="card-header">
                  <h3>数据传输潜力评估</h3>
                  <p class="card-subtitle">综合评估节点传输能力与网络位置价值</p>
                </div>
              </template>

              <!-- 初始状态/网络拓扑图 -->
              <div v-if="!isAnalyzing && !analysisComplete" class="initial-view">
                <div class="network-placeholder">
                  <div class="network-icon">
                    <el-icon :size="48">
                      <Monitor />
                    </el-icon>
                  </div>
                  <p class="network-text">配置网络参数并运行分析，评估各边缘节点的数据传输潜力</p>

                  <div class="network-diagram">
                    <div class="cloud-node">云</div>
                    <div class="central-node">中心节点</div>
                    <div class="router-node">路由器</div>
                    <div class="edge-nodes">
                      <div v-for="i in 6" :key="i" class="edge-node">边缘节点 {{ i }}</div>
                    </div>
                    <!-- 新增：网络连接线 -->
                    <div class="network-lines">
                      <div class="line cloud-to-central"></div>
                      <div class="line central-to-router"></div>
                      <div
                        v-for="i in 6"
                        :key="i"
                        class="line router-to-edge"
                        :style="{ '--index': i }"
                      ></div>
                    </div>
                  </div>

                  <el-button type="primary" class="start-analysis-btn" @click="handleRunAnalysis">
                    <el-icon class="mr-1"><Select /></el-icon>
                    开始分析向导
                  </el-button>
                </div>
              </div>

              <!-- 分析进行中 -->
              <div v-if="isAnalyzing" class="analysis-progress">
                <div class="progress-icon">
                  <el-progress
                    type="circle"
                    :percentage="progress"
                    :stroke-width="8"
                    class="circle-progress"
                  ></el-progress>
                </div>
                <h3>分析进行中</h3>
                <p class="progress-text">{{ progressText }}</p>
                <el-progress :percentage="progress" class="linear-progress"></el-progress>
                <div class="progress-estimate">预计剩余: {{ remainingTime }}秒</div>
              </div>

              <!-- 分析结果 -->
              <div v-if="!isAnalyzing && analysisComplete" class="analysis-result">
                <!-- 节点传输潜力排名 -->
                <div class="ranking-section">
                  <h3>节点传输潜力排名</h3>
                  <div class="rank-list">
                    <div
                      v-for="(node, index) in nodeRanking"
                      :key="node.id"
                      class="rank-item"
                      :class="{ 'top-rank': index < 3 }"
                    >
                      <div class="rank-number">{{ index + 1 }}</div>
                      <div class="rank-info">
                        <div class="node-name">{{ node.name }}</div>
                        <div class="rank-bar">
                          <div class="bar-fill" :style="{ width: `${node.score}%` }"></div>
                        </div>
                      </div>
                      <div class="rank-score">{{ node.score.toFixed(1) }}</div>
                    </div>
                  </div>
                </div>

                <!-- 节点详情分析 -->
                <div class="detail-section">
                  <h3>节点详情分析</h3>
                  <div class="detail-header">
                    <el-select v-model="selectedNodeId" class="node-selector">
                      <el-option
                        v-for="node in nodeRanking"
                        :key="node.id"
                        :label="
                          node.name +
                          ' (' +
                          (node === nodeRanking[0] ? '最高潜力' : '潜力节点') +
                          ')'
                        "
                        :value="node.id"
                      ></el-option>
                    </el-select>
                  </div>

                  <div class="metrics-grid">
                    <div class="metric-card">
                      <h4>网络中心性</h4>
                      <div class="metric-value">
                        {{ selectedNode.networkCentrality.toFixed(2) }}
                      </div>
                      <div class="metric-change positive">
                        <el-icon size="14">
                          <ArrowUp />
                        </el-icon>
                        {{ selectedNode.centralityChange }}%
                      </div>
                      <div class="metric-desc">较上次分析提升</div>
                    </div>

                    <div class="metric-card">
                      <h4>传输资源指数</h4>
                      <div class="metric-value">{{ selectedNode.resourceIndex.toFixed(2) }}</div>
                      <div class="metric-change positive">
                        <el-icon size="14">
                          <ArrowUp />
                        </el-icon>
                        {{ selectedNode.resourceChange }}%
                      </div>
                      <div class="metric-desc">基于当前节点资源状态</div>
                    </div>
                  </div>

                  <!-- 资源详情 -->
                  <div class="resource-details">
                    <div class="resource-item">
                      <div class="resource-label">可用带宽</div>
                      <div class="resource-bar">
                        <div
                          class="resource-fill"
                          :style="{
                            width: selectedNode.bandwidth + '%',
                            backgroundColor: getResourceColor(selectedNode.bandwidth),
                          }"
                        ></div>
                      </div>
                      <div class="resource-value">{{ selectedNode.bandwidth }}%</div>
                    </div>

                    <div class="resource-item">
                      <div class="resource-label">CPU空闲率</div>
                      <div class="resource-bar">
                        <div
                          class="resource-fill"
                          :style="{
                            width: selectedNode.cpu + '%',
                            backgroundColor: getResourceColor(selectedNode.cpu),
                          }"
                        ></div>
                      </div>
                      <div class="resource-value">{{ selectedNode.cpu }}%</div>
                    </div>

                    <div class="resource-item">
                      <div class="resource-label">内存空闲率</div>
                      <div class="resource-bar">
                        <div
                          class="resource-fill"
                          :style="{
                            width: selectedNode.memory + '%',
                            backgroundColor: getResourceColor(selectedNode.memory),
                          }"
                        ></div>
                      </div>
                      <div class="resource-value">{{ selectedNode.memory }}%</div>
                    </div>

                    <div class="resource-item">
                      <div class="resource-label">连接节点数</div>
                      <div class="connection-bar">
                        <div
                          class="connection-fill"
                          :style="{
                            width: (selectedNode.connections / maxConnections) * 100 + '%',
                          }"
                        ></div>
                      </div>
                      <div class="resource-value">{{ selectedNode.connections }}个</div>
                    </div>
                  </div>

                  <el-button type="default" class="optimization-btn" @click="showOptimizationTips">
                    查看传输优化建议
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>
    </div>
    <!-- 优化建议弹窗 -->
    <ElDialog
      v-model="optimizationDialogVisible"
      title="传输优化建议"
      width="500px"
      :before-close="handleDialogClose"
    >
      <div class="optimization-content">
        <div class="optimization-item">
          <div class="item-icon success">
            <el-icon size="20">
              <Monitor />
            </el-icon>
          </div>
          <div class="item-content">
            <h4>优先选择高潜力节点</h4>
            <p>建议将核心数据传输任务分配给节点#EDGE-05、#EDGE-02等高分节点，提升传输效率</p>
          </div>
        </div>
        <div class="optimization-item">
          <div class="item-icon warning">
            <el-icon size="20">
              <WarningFilled />
            </el-icon>
          </div>
          <div class="item-content">
            <h4>资源扩容建议</h4>
            <p>节点#EDGE-08内存空闲率仅50%，建议扩容以避免影响传输稳定性</p>
          </div>
        </div>
        <div class="optimization-item">
          <div class="item-icon info">
            <el-icon size="20">
              <InfoFilled />
            </el-icon>
          </div>
          <div class="item-content">
            <h4>网络拓扑优化</h4>
            <p>建议增加节点#EDGE-05与#EDGE-07的直连通道，减少中转延迟</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="optimizationDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportOptimizationReport">导出报告</el-button>
      </template>
    </ElDialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { ElMessage, ElDialog } from "element-plus";

// 状态变量
const nodeCount = ref(8);
const matrixData = ref([]);
const networkCentralityWeight = ref(60);
const transmissionResourceWeight = ref(40);
const resourceSource = ref("realtime");
const isAnalyzing = ref(false);
const progress = ref(0);
const progressText = ref("正在计算节点中心性...");
const remainingTime = ref(12);
const analysisComplete = ref(false);
const selectedNodeId = ref("");
const maxConnections = ref(8);
const optimizationDialogVisible = ref(false);

// 节点排名数据
const nodeRanking = ref([
  {
    id: "edge-05",
    name: "节点#EDGE-05",
    score: 87.4,
    networkCentrality: 0.78,
    centralityChange: 1.2,
    resourceIndex: 0.92,
    resourceChange: 5,
    bandwidth: 87,
    cpu: 65,
    memory: 72,
    connections: 5,
  },
  {
    id: "edge-02",
    name: "节点#EDGE-02",
    score: 82.1,
    networkCentrality: 0.75,
    centralityChange: 0.8,
    resourceIndex: 0.89,
    resourceChange: 3,
    bandwidth: 82,
    cpu: 70,
    memory: 68,
    connections: 4,
  },
  {
    id: "edge-07",
    name: "节点#EDGE-07",
    score: 76.8,
    networkCentrality: 0.72,
    centralityChange: -0.3,
    resourceIndex: 0.85,
    resourceChange: 2,
    bandwidth: 76,
    cpu: 62,
    memory: 75,
    connections: 6,
  },
  {
    id: "edge-01",
    name: "节点#EDGE-01",
    score: 68.5,
    networkCentrality: 0.65,
    centralityChange: 1.5,
    resourceIndex: 0.78,
    resourceChange: 1,
    bandwidth: 68,
    cpu: 58,
    memory: 64,
    connections: 3,
  },
  {
    id: "edge-06",
    name: "节点#EDGE-06",
    score: 63.2,
    networkCentrality: 0.62,
    centralityChange: 0.5,
    resourceIndex: 0.72,
    resourceChange: -1,
    bandwidth: 63,
    cpu: 55,
    memory: 60,
    connections: 4,
  },
  {
    id: "edge-03",
    name: "节点#EDGE-03",
    score: 59.7,
    networkCentrality: 0.58,
    centralityChange: -0.8,
    resourceIndex: 0.68,
    resourceChange: 0,
    bandwidth: 59,
    cpu: 60,
    memory: 55,
    connections: 2,
  },
  {
    id: "edge-04",
    name: "节点#EDGE-04",
    score: 55.3,
    networkCentrality: 0.55,
    centralityChange: 0.2,
    resourceIndex: 0.65,
    resourceChange: -2,
    bandwidth: 55,
    cpu: 45,
    memory: 62,
    connections: 3,
  },
  {
    id: "edge-08",
    name: "节点#EDGE-08",
    score: 51.9,
    networkCentrality: 0.52,
    centralityChange: -1.1,
    resourceIndex: 0.61,
    resourceChange: 1,
    bandwidth: 51,
    cpu: 50,
    memory: 50,
    connections: 2,
  },
]);

// 计算属性：当前选中的节点
const selectedNode = computed(() => {
  return nodeRanking.value.find((node) => node.id === selectedNodeId.value) || nodeRanking.value[0];
});

// 生成邻接矩阵
function generateMatrix() {
  matrixData.value = [];
  for (let i = 0; i < nodeCount.value; i++) {
    const row = [];
    for (let j = 0; j < nodeCount.value; j++) {
      // 对角线为1，其他位置随机0或1
      row.push(i === j ? 1 : Math.random() > 0.5 ? 1 : 0);
    }
    matrixData.value.push(row);
  }

  // 显示成功消息
  ElMessage.success("邻接矩阵已自动生成");
}

// 保存权重配置
function saveWeightConfig() {
  // 确保权重总和为100%
  if (networkCentralityWeight.value + transmissionResourceWeight.value !== 100) {
    ElMessage.warning("权重总和必须为100%");
    return;
  }

  ElMessage.success("权重配置已保存");
}

// 刷新资源数据
function refreshResourceData() {
  // 模拟刷新数据
  ElMessage.loading({
    message: "正在刷新资源数据...",
    duration: 1000,
    onClose: () => {
      ElMessage.success("资源数据已更新");
    },
  });
}

// 处理运行分析
function handleRunAnalysis() {
  if (matrixData.value.length === 0) {
    ElMessage.warning("请先生成或导入邻接矩阵");
    return;
  }

  isAnalyzing.value = true;
  analysisComplete.value = false;
  progress.value = 0;

  // 模拟分析进度
  const interval = setInterval(() => {
    progress.value += Math.floor(Math.random() * 5) + 1;

    // 更新进度文本
    if (progress.value > 70) {
      progressText.value = "正在计算传输资源指数...";
    } else if (progress.value > 30) {
      progressText.value = "正在综合评估节点潜力...";
    }

    // 更新剩余时间
    remainingTime.value = Math.max(0, Math.floor((100 - progress.value) / 8));

    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(interval);

      // 完成分析，延迟显示结果
      setTimeout(() => {
        isAnalyzing.value = false;
        analysisComplete.value = true;
        selectedNodeId.value = nodeRanking.value[0].id;
        ElMessage.success("分析完成，已生成评估结果");

        // 初始化排名图表
        nextTick(() => {
          initRankingChart();
        });
      }, 1000);
    }
  }, 500);
}

// 处理重置
function handleReset() {
  if (isAnalyzing.value) {
    ElMessage.warning("分析正在进行中，无法重置");
    return;
  }

  // 重置状态
  matrixData.value = [];
  networkCentralityWeight.value = 60;
  transmissionResourceWeight.value = 40;
  resourceSource.value = "realtime";
  analysisComplete.value = false;
  progress.value = 0;

  ElMessage.info("已重置所有配置");
}

// 根据资源使用率获取颜色
function getResourceColor(value) {
  if (value > 70) return "#22c55e"; // 绿色
  if (value > 30) return "#3b82f6"; // 蓝色
  return "#f59e0b"; // 黄色
}

// 显示优化建议弹窗
function showOptimizationTips() {
  optimizationDialogVisible.value = true;
}

// 关闭弹窗处理
function handleDialogClose() {
  optimizationDialogVisible.value = false;
}

// 导出优化报告
function exportOptimizationReport() {
  ElMessage.success("优化报告已导出");
  optimizationDialogVisible.value = false;
}

// 监听权重变化，确保总和为100%
watch(networkCentralityWeight, (newVal) => {
  if (newVal + transmissionResourceWeight.value !== 100) {
    transmissionResourceWeight.value = 100 - newVal;
  }
});

watch(transmissionResourceWeight, (newVal) => {
  if (newVal + networkCentralityWeight.value !== 100) {
    networkCentralityWeight.value = 100 - newVal;
  }
});

// 初始化
onMounted(() => {
  // 初始生成矩阵
  generateMatrix();
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #334155;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #0a0000;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.reset-btn,
.run-btn {
  display: flex;
  gap: 5px;
  align-items: center;
  background-color: #c8d8bb;
}

.run-btn {
  background-color: #10b981;
}

.btn-text {
  display: none;

  @media (min-width: 768px) {
    display: inline;
  }
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 60px;
  background-color: #0f1733;
  border-right: 1px solid #334155;

  @media (min-width: 768px) {
    width: 200px;
  }
}

.sidebar-menu {
  height: 100%;
  padding-top: 20px;
  border-right: none;
}

.main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1.5fr;
  }
}

.config-card {
  margin-bottom: 20px;
  color: #000307;
  border: none;
}

.card-header {
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  border-bottom: 1px solid #334155;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.card-subtitle {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.matrix-source,
.node-count,
.matrix-preview {
  padding: 15px 20px;
  border-bottom: 1px solid #334155;
}

.matrix-source:last-child,
.node-count:last-child,
.matrix-preview:last-child {
  border-bottom: none;
}

.matrix-source h4,
.node-count h4,
.matrix-preview h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #94a3b8;
}

.matrix-buttons {
  display: flex;
  gap: 10px;
}

.upload-btn {
  flex: 1;
  background-color: #91a1b8;
}

.generate-btn {
  flex: 1;
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.node-count .el-input {
  width: 100%;
}

.matrix-content {
  max-height: 200px;
  padding: 10px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  border-radius: 4px;
}

.matrix-content pre {
  margin: 0;
  line-height: 1.5;
}

/* 新增：矩阵操作按钮 */
.matrix-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.export-btn,
.visualize-btn {
  height: auto;
  padding: 0;
  font-size: 12px;
  color: #94a3b8;
}

.export-btn:hover,
.visualize-btn:hover {
  color: #3b82f6;
}

.weight-config {
  padding: 15px 20px;
}

.weight-item {
  margin-bottom: 20px;
}

.weight-item:last-child {
  margin-bottom: 25px;
}

.weight-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.weight-value {
  color: #94a3b8;
}

.save-weight-btn {
  width: 100%;
  background-color: #10b981;
  border-color: #10b981;
}

.resource-config {
  padding: 15px 20px;
}

.resource-option {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.option-label {
  margin-bottom: 5px;
  font-size: 14px;
}

.option-desc {
  font-size: 12px;
  color: #94a3b8;
}

.refresh-resource-btn {
  width: 100%;
  margin-top: 10px;
  background-color: #334155;
  border-color: #334155;
}

.result-card {
  height: 100%;
  min-height: 800px;
  color: #00050a;
  border: none;
}

.initial-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  padding: 40px 20px;
}

.network-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.network-icon {
  margin-bottom: 20px;
  color: #3b82f6;
}

.network-text {
  margin-bottom: 30px;
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
}

.network-diagram {
  position: relative;
  width: 100%;
  height: 250px;
  margin-bottom: 30px;
}

.cloud-node {
  position: absolute;
  top: 0;
  left: 50%;
  padding: 8px 16px;
  font-size: 12px;
  background-color: #334155;
  border-radius: 4px;
  transform: translateX(-50%);
}

.central-node {
  position: absolute;
  top: 60px;
  left: 50%;
  padding: 8px 16px;
  font-size: 12px;
  background-color: #3b82f6;
  border-radius: 4px;
  transform: translateX(-50%);
}

.router-node {
  position: absolute;
  top: 120px;
  left: 50%;
  padding: 8px 16px;
  font-size: 12px;
  background-color: #6366f1;
  border-radius: 4px;
  transform: translateX(-50%);
}

.edge-nodes {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.edge-node {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #10b981;
  border-radius: 4px;
}

/* 新增：网络连接线 */
.network-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.line {
  position: absolute;
  background-color: rgba(59, 130, 246, 0.3);
  transform-origin: top left;
}

.cloud-to-central {
  top: 30px;
  left: 50%;
  width: 1px;
  height: 60px;
  transform: translateX(-50%);
}

.central-to-router {
  top: 90px;
  left: 50%;
  width: 1px;
  height: 60px;
  transform: translateX(-50%);
}

.router-to-edge {
  top: 150px;
  left: 50%;
  width: 1px;
  height: 100px;
  transform: translateX(-50%) rotate(calc((var(--index) - 3.5) * 15deg));
}

.start-analysis-btn {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.analysis-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
  padding: 40px 20px;
}

.progress-icon {
  margin-bottom: 20px;
}

.circle-progress {
  width: 120px !important;
  height: 120px !important;
  --el-progress-circle-color: #3b82f6;
}

.progress-text {
  margin: 10px 0 20px 0;
  color: #94a3b8;
}

.linear-progress {
  width: 100%;
  max-width: 500px;
  margin-bottom: 10px;
  --el-progress-fill-color: #3b82f6;
  --el-progress-background-color: #334155;
}

.progress-estimate {
  font-size: 12px;
  color: #94a3b8;
}

.analysis-result {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
  padding: 10px 0;
}

.ranking-section {
  margin-bottom: 30px;
}

.ranking-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

/* 新增：排名图表预览 */
.ranking-chart-preview {
  height: 180px;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.mini-chart {
  width: 100%;
  height: 100%;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  padding-right: 10px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
}

.top-rank {
  border-left: 3px solid #3b82f6;
}

.rank-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: bold;
  background-color: #334155;
  border-radius: 50%;
}

.rank-info {
  flex: 1;
}

.node-name {
  margin-bottom: 5px;
  font-size: 14px;
}

.rank-bar {
  height: 6px;
  overflow: hidden;
  background-color: #334155;
  border-radius: 3px;
}

.bar-fill {
  height: 100%;
  background-color: #10b981;
}

.rank-score {
  min-width: 40px;
  font-size: 14px;
  font-weight: bold;
  color: #10b981;
  text-align: right;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.node-selector {
  width: 250px;
  background-color: #0f1733;
  border-color: #334155;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 25px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.metric-card {
  padding: 15px;
  background-color: #afbae2;
  border-radius: 4px;
}

.metric-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #94a3b8;
}

.metric-value {
  margin-bottom: 5px;
  font-size: 24px;
  font-weight: bold;
}

.metric-change {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.metric-desc {
  font-size: 12px;
  color: #94a3b8;
}

.resource-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.resource-item {
  display: flex;
  gap: 15px;
  align-items: center;
}

.resource-label {
  min-width: 100px;
  font-size: 14px;
}

.resource-bar,
.connection-bar {
  flex: 1;
  height: 8px;
  overflow: hidden;
  background-color: #334155;
  border-radius: 4px;
}

.resource-fill,
.connection-fill {
  height: 100%;
}

.connection-fill {
  background-color: #6366f1;
}

.resource-value {
  min-width: 40px;
  font-size: 14px;
  text-align: right;
}

.optimization-btn {
  background-color: #37b652;
  border-color: #22a056;
}

.optimization-btn:hover {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 优化建议弹窗样式 */
.optimization-content {
  padding: 10px 0;
}

.optimization-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.optimization-item:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.item-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.item-icon.success {
  color: #10b981;
}

.item-icon.warning {
  color: #f59e0b;
}

.item-icon.info {
  color: #3b82f6;
}

.item-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.item-content p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}

.el-dialog {
  --el-dialog-background-color: #1e293b;
  --el-dialog-border-color: #334155;
  --el-dialog-title-color: #fff;
}

.el-dialog__body {
  color: #e2e8f0;
}
</style>
