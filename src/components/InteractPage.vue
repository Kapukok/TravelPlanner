<script lang="ts">
import {defineComponent, onMounted, ref, computed} from 'vue';
import {marked} from 'marked';

export default defineComponent({
  name: 'InteractPage',
  setup() {
    const travelData = ref<any>(null);
    const travelPlan = ref<string>('');
    const isLoading = ref(false);

    onMounted(() => {
      const savedData = localStorage.getItem('travelFormData');
      const savedPlan = localStorage.getItem('travelPlan');
      if (savedData) {
        travelData.value = JSON.parse(savedData);
      }
      if (savedPlan) {
        travelPlan.value = savedPlan;
      }
    });

    const submitted = ref(false);

    const renderedPlan = computed(() => {
      if (!travelPlan.value) return '';
      return marked(travelPlan.value) as string;
    });

    const handleSubmit = async () => {
      submitted.value = true;

      if (!travelData.value?.requirements.trim()) {
        return;
      }

      console.log('=== 表单提交 ===');
      console.log('表单数据:', travelData.value);

      isLoading.value = true;

      try {
        const response = await fetch('http://localhost:8080/api/generate_plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(travelData.value)
        });

        if (!response.ok) {
          throw new Error('网络响应失败');
        }

        const data = await response.json();
        console.log('后端返回:', data);

        travelPlan.value = data.plan;
        localStorage.setItem('travelPlan', data.plan);
      } catch (error) {
        console.error('请求失败:', error);
        alert('生成计划失败，请稍后重试');
      } finally {
        isLoading.value = false;
      }

      submitted.value = false;
    };

    return {
      travelData,
      travelPlan,
      renderedPlan,
      isLoading,
      submitted,
      handleSubmit
    };
  }
});
</script>

<template>
  <div class="page-container">
    <form class="main-form" v-if="travelData">
      <div class="form-container top-fixed">
        <div class="info-row">
          <div class="form-group">
            <label for="destination">目的地</label>
            <input
                type="text"
                id="destination"
                :value="travelData.destination"
                readonly
                tabindex="-1"
                class="readonly-input"
            />
          </div>

          <div class="form-group">
            <label for="startDate">开始日期</label>
            <input
                type="date"
                id="startDate"
                :value="travelData.startDate"
                readonly
                tabindex="-1"
                class="readonly-input"
            />
          </div>

          <div class="form-group">
            <label for="endDate">结束日期</label>
            <input
                type="date"
                id="endDate"
                :value="travelData.endDate"
                readonly
                tabindex="-1"
                class="readonly-input"
            />
          </div>
        </div>
      </div>
      <div class="form-container bottom-fixed">
        <div class="req-row">
          <div class="form-group">
            <label for="requirements">其他需求</label>
            <textarea
                id="requirements"
                v-model="travelData.requirements"
                rows="2"
                placeholder="请输入您的其他需求"
            ></textarea>
            <button
                type="submit"
                class="submit-btn"
                @click.prevent="handleSubmit"
                :disabled="isLoading"
            >
              <svg v-if="!isLoading" width="24" height="24" viewBox="0 0 24 24"
                   fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white"
                      stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </form>

    <div class="plan-content" v-html="renderedPlan"></div>
  </div>
</template>
