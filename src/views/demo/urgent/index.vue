<template>
  <div class="main-urgent">
    <el-card class="config-card" :body-style="{ padding: '20px' }">
      <div class="card-header">
        <h2 class="card-title">基准模型参数配置</h2>
        <p class="card-desc">选择或上传历史全局模型参数作为分析基准</p>

        <div class="header-actions">
          <el-button type="default" size="small" class="history-btn">
            <el-icon class="mr-1">
              <Clock />
            </el-icon>
            选择历史基准
          </el-button>
          <el-button type="primary" size="small" class="upload-btn">
            <el-icon class="mr-1">
              <Upload />
            </el-icon>
            上传新基准
          </el-button>
        </div>
      </div>

      <!-- 当前基准模型 -->
      <div class="current-model">
        <div class="model-icon">
          <el-icon class="file-icon">
            <Document />
          </el-icon>
        </div>
        <div class="model-info">
          <div class="model-name">model_V1.0_20250815.pth</div>
          <div class="model-meta">上传于2025-08-15 · 大小:128.5 MB</div>
        </div>
        <div class="model-actions">
          <el-button type="text" class="detail-btn">查看详情</el-button>
          <el-button type="default" size="small" class="replace-btn">更换基准</el-button>
        </div>
      </div>
    </el-card>

    <!-- 分析参数配置区域 -->
    <el-card class="config-card" :body-style="{ padding: '20px' }">
      <div class="card-header">
        <h2 class="card-title">分析参数配置</h2>
      </div>

      <el-row :gutter="30">
        <!-- 资源权重系数 -->
        <el-col :span="12">
          <h3 class="section-title">资源权重系数</h3>

          <el-form-item label="CPU使用率权重" class="form-item">
            <el-row :gutter="2" class="slider-row">
              <el-col :span="18">
                <el-slider
                  v-model="cpuWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :show-stops="true"
                  class="resource-slider"
                  @input="updateSum"
                />
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="cpuWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  type="number"
                  class="weight-input"
                  @change="updateSum"
                />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="内存使用率权重" class="form-item">
            <el-row :gutter="2" class="slider-row">
              <el-col :span="18">
                <el-slider
                  v-model="memoryWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :show-stops="true"
                  class="resource-slider"
                  @input="updateSum"
                />
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="memoryWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  type="number"
                  class="weight-input"
                  @change="updateSum"
                />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="网络带宽权重" class="form-item">
            <el-row :gutter="2" class="slider-row">
              <el-col :span="18">
                <el-slider
                  v-model="networkWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :show-stops="true"
                  class="resource-slider"
                  @input="updateSum"
                />
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="networkWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  type="number"
                  class="weight-input"
                  @change="updateSum"
                />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="电池状态权重" class="form-item">
            <el-row :gutter="2" class="slider-row">
              <el-col :span="18">
                <el-slider
                  v-model="batteryWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :show-stops="true"
                  class="resource-slider"
                  @input="updateSum"
                />
              </el-col>
              <el-col :span="4">
                <el-input
                  v-model="batteryWeight"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  type="number"
                  class="weight-input"
                  @change="updateSum"
                />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item class="sum-item">
            <div class="weight-sum">
              权重总和:
              <span :class="sumValid ? 'valid' : 'invalid'">{{ totalWeight.toFixed(2) }}</span>
              <span v-if="!sumValid" class="invalid-hint">权重总和必须为1.0</span>
            </div>
          </el-form-item>
        </el-col>

        <!-- 分析范围与阈值 -->
        <el-col :span="12">
          <h3 class="section-title">分析范围与阈值</h3>

          <el-form-item label="分析节点范围" class="form-item">
            <el-select v-model="analysisScope" class="scope-select">
              <el-option label="全部边缘节点" value="all" />
              <el-option label="在线边缘节点" value="online" />
              <el-option label="自定义节点组" value="custom" />
            </el-select>
          </el-form-item>

          <el-form-item label="参数差异阈值" class="form-item">
            <el-input
              v-model="paramDiffThreshold"
              :min="0"
              :max="1"
              :step="0.01"
              type="number"
              class="threshold-input"
            />
            <div class="threshold-desc">模型参数与基准的最大允许差异值</div>
          </el-form-item>

          <el-form-item label="资源紧张度阈值" class="form-item">
            <el-input
              v-model="resourceThreshold"
              :min="0"
              :max="1"
              :step="0.01"
              type="number"
              class="threshold-input"
            />
            <div class="threshold-desc">触发资源调整的紧张度临界值</div>
          </el-form-item>

          <div class="save-actions">
            <el-button type="success" class="save-btn">
              <el-icon class="mr-1">
                <Pointer />
              </el-icon>
              保存分析配置
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 参数更新紧急度分析 -->
    <el-card class="config-card" :body-style="{ padding: '20px' }">
      <div class="card-header">
        <h2 class="card-title">参数更新紧急度分析</h2>
        <p class="card-desc">基于当前配置启动或查看分析任务</p>

        <div class="task-status">
          <el-badge type="warning" class="status-badge">未运行</el-badge>
        </div>
      </div>

      <el-row :gutter="20" class="analysis-stats">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">上次分析时间</div>
            <div class="stat-value">2025-09-08 14:32</div>
            <el-button type="text" class="view-btn">
              <el-icon class="mr-1">
                <Monitor />
              </el-icon>
              查看上次结果
            </el-button>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">分析节点数量</div>
            <div class="stat-value">12个节点</div>
            <el-button type="text" class="adjust-btn">
              <el-icon class="mr-1">
                <Edit />
              </el-icon>
              调整节点
            </el-button>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">预计完成时间</div>
            <div class="stat-value">2分30秒</div>
            <el-button type="text" class="detail-btn">时间明细</el-button>
          </div>
        </el-col>
      </el-row>

      <div class="analysis-options">
        <el-checkbox v-model="includeOffline" class="option-checkbox">包含离线节点</el-checkbox>
        <el-checkbox v-model="priorityExecution" class="option-checkbox">优先执行分析</el-checkbox>
      </div>

      <div class="analysis-actions">
        <el-button type="primary" class="start-btn">
          <el-icon class="mr-1">
            <Monitor />
          </el-icon>
          启动紧急度分析
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// 权重参数
const cpuWeight = ref(0.3);
const memoryWeight = ref(0.25);
const networkWeight = ref(0.35);
const batteryWeight = ref(0.1);
const totalWeight = ref(1.0);

// 分析范围与阈值
const analysisScope = ref("all");
const paramDiffThreshold = ref(0.15);
const resourceThreshold = ref(0.7);

// 分析选项
const includeOffline = ref(false);
const priorityExecution = ref(false);

// 计算权重总和
const updateSum = () => {
  totalWeight.value =
    Number(cpuWeight.value) +
    Number(memoryWeight.value) +
    Number(networkWeight.value) +
    Number(batteryWeight.value);
  totalWeight.value = Math.round(totalWeight.value * 100) / 100; // 保留两位小数
};

// 检查权重总和是否有效
const sumValid = computed(() => {
  return Math.abs(totalWeight.value - 1.0) < 0.01;
});

// 初始化计算
updateSum();

// 监听权重变化自动更新总和
watch([cpuWeight, memoryWeight, networkWeight, batteryWeight], updateSum);
</script>

<style scoped>
.main-urgent {
  padding: 20px;
}
.config-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0e0101;
}

.card-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #86909c;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.history-btn {
  color: #01060e;
  border-color: #4e5969;
}

.upload-btn {
  background-color: #165dff;
  border-color: #165dff;
}

/* 当前基准模型样式 */
.current-model {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #4e5969;
  border-radius: 6px;
}

.model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 16px;
  border-radius: 4px;
}

.file-icon {
  font-size: 20px;
  color: #165dff;
}

.model-info {
  flex: 1;
}

.model-name {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #0c0101;
}

.model-meta {
  font-size: 12px;
  color: #86909c;
}

.model-actions {
  display: flex;
  gap: 10px;
}

.detail-btn {
  height: auto;
  padding: 0;
  color: #165dff;
}

.replace-btn {
  color: #ff7d00;
  border-color: #ff7d00;
}

/* 分析参数配置样式 */
.section-title {
  padding-bottom: 8px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #080000;
  border-bottom: 1px solid #4e5969;
}

.form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  padding-right: 10px;
  font-size: 14px;
  color: #86909c;
}

.slider-row {
  align-items: center;
}

.resource-slider {
  --el-slider-runway-background: #4e5969;
  --el-slider-process-background: #165dff;
  --el-slider-button-background: #0a0101;
  --el-slider-button-border-color: #165dff;
}

.weight-input {
  color: #01060f;
  text-align: center;
  background-color: #1d2129;
  border-color: #4e5969;
}

.sum-item {
  margin-top: 10px;
  margin-bottom: 0;
}

.weight-sum {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  color: #86909c;
}

.weight-sum .valid {
  font-weight: 500;
  color: #00b42a;
}

.weight-sum .invalid {
  font-weight: 500;
  color: #f53f3f;
}

.invalid-hint {
  font-size: 12px;
  color: #f53f3f;
}

.scope-select {
  width: 100%;
  color: #02060e;
  border-color: #4e5969;
}

.threshold-input {
  width: 100%;
  color: #01040a;
  background-color: #1d2129;
  border-color: #4e5969;
}

.threshold-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #86909c;
}

.save-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-btn {
  background-color: #00b42a;
  border-color: #00b42a;
}

/* 参数更新紧急度分析样式 */
.task-status {
  display: flex;
  align-items: center;
}

.status-badge {
  font-size: 12px;
}

.analysis-stats {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  padding: 16px;
  border: 1px solid #4e5969;
  border-radius: 6px;
}

.stat-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: #86909c;
}

.stat-value {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #080000;
}

.view-btn,
.adjust-btn,
.detail-btn {
  height: auto;
  padding: 0;
  font-size: 13px;
  color: #165dff;
}

.analysis-options {
  display: flex;
  gap: 20px;
  padding: 10px 0;
  margin-bottom: 20px;
}

.option-checkbox {
  font-size: 14px;
  color: #0c111a;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #165dff;
  border-color: #165dff;
}

.analysis-actions {
  display: flex;
  justify-content: flex-end;
}

.start-btn {
  padding: 8px 24px;
  background-color: #722ed1;
  border-color: #722ed1;
}
</style>
