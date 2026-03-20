<script lang="ts">
import {ref, defineComponent} from 'vue';
import {useRouter} from 'vue-router';

export default defineComponent({
  name: 'FirstPage',
  setup() {
    const router = useRouter();
    const travelData = ref({
      destination: '',
      startDate: '',
      endDate: '',
      requirements: ''
    });

    const submitted = ref(false);
    const isLoading = ref(false);
    const dateErrors = ref({
      startDateInvalid: false,
      endDateInvalid: false
    });

    const getTodayString = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const validateDates = () => {
      const today = getTodayString();
      const startDate = travelData.value.startDate;
      const endDate = travelData.value.endDate;

      dateErrors.value.startDateInvalid = false;
      dateErrors.value.endDateInvalid = false;

      if (!startDate) {
        return true;
      }

      if (startDate < today) {
        dateErrors.value.startDateInvalid = true;
        return false;
      }

      if (!endDate) {
        return true;
      }

      if (endDate < startDate || endDate < today) {
        dateErrors.value.endDateInvalid = true;
        return false;
      }

      return true;
    };

    const getMinEndDate = () => {
      return travelData.value.startDate || getTodayString();
    };

    const handleSubmit = async () => {
      submitted.value = true;

      if (!travelData.value.destination.trim() || !travelData.value.startDate || !travelData.value.endDate) {
        return;
      }

      if (!validateDates()) {
        return;
      }

      console.log('表单数据:', travelData.value);

      isLoading.value = true;

      try {
        const response = await fetch('http://localhost:8000/api/generate_plan', {
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

        localStorage.setItem('travelFormData', JSON.stringify(travelData.value));
        localStorage.setItem('travelPlan', data.plan);

        router.push('/interact');
      } catch (error) {
        console.error('请求失败:', error);
        alert('生成计划失败，请稍后重试');
      } finally {
        isLoading.value = false;
      }

      submitted.value = false;
    };

    return {
      formData: travelData,
      submitted,
      isLoading,
      dateErrors,
      handleSubmit,
      getTodayString,
      getMinEndDate
    };
  }
});
</script>

<template>
  <div class="page-container">
    <div class="form-container">
      <h1 class="title">Travel Planner</h1>

      <form class="main-form">
        <div class="info-row">
          <div class="form-group">
            <label for="destination">目的地</label>
            <input
                type="text"
                id="destination"
                v-model="formData.destination"
                placeholder="请输入目的地"
                :class="{ 'input-error': !formData.destination.trim() && submitted }"
            />
          </div>

          <div class="form-group">
            <label for="startDate">开始日期</label>
            <input
                type="date"
                id="startDate"
                v-model="formData.startDate"
                :min="getTodayString()"
                :class="{ 'input-error': (!formData.startDate && submitted) || dateErrors.startDateInvalid }"
            />
          </div>

          <div class="form-group">
            <label for="endDate">结束日期</label>
            <input
                type="date"
                id="endDate"
                v-model="formData.endDate"
                :min="getMinEndDate()"
                :class="{ 'input-error': (!formData.endDate && submitted) || dateErrors.endDateInvalid }"
            />
          </div>
        </div>

        <div class="req-row">
          <div class="form-group">
            <label for="requirements">其他需求</label>
            <textarea
                id="requirements"
                v-model="formData.requirements"
                rows="5"
                placeholder="请输入您的其他需求"
            ></textarea>
            <button
                type="submit"
                class="submit-btn"
                @click.prevent="handleSubmit"
                :disabled="isLoading"
            >
              <svg v-if="!isLoading" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white"
                      stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
