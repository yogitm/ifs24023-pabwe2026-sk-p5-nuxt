<template>
  <div
    v-if="show"
    data-testid="change-cashflow-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto"
  >
    <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Edit3 :size="20" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">Ubah Catatan Arus Kas</h3>
            <p class="text-xs text-slate-400">Perbarui rincian transaksi arus kas</p>
          </div>
        </div>
        <button
          type="button"
          data-testid="close-change-modal-btn"
          @click="handleClose"
          class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Modal Body / Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Type Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Jenis Transaksi <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="type-inflow-edit-btn"
              @click="type = 'inflow'"
              :class="[
                'p-3 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2',
                type === 'inflow'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              ]"
            >
              <ArrowDownLeft :size="16" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              data-testid="type-outflow-edit-btn"
              @click="type = 'outflow'"
              :class="[
                'p-3 rounded-xl border text-center font-bold text-sm transition-all flex items-center justify-center gap-2',
                type === 'outflow'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              ]"
            >
              <ArrowUpRight :size="16" />
              <span>Pengeluaran</span>
            </button>
          </div>
        </div>

        <!-- Source Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Sumber Dana <span class="text-rose-500">*</span>
          </label>
          <select
            data-testid="source-select-edit"
            v-model="source"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Rekening Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label / Category -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Label / Kategori <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            data-testid="label-input-edit"
            v-model="label"
            placeholder="Contoh: gaji, makanan, transportasi"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <p v-if="errors.label" class="mt-1 text-xs text-rose-500 font-medium">
            {{ errors.label }}
          </p>
        </div>

        <!-- Nominal -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nominal (Rupiah) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              Rp
            </span>
            <input
              type="number"
              data-testid="nominal-input-edit"
              v-model="nominal"
              placeholder="0"
              min="1"
              class="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
            />
          </div>
          <p v-if="errors.nominal" class="mt-1 text-xs text-rose-500 font-medium">
            {{ errors.nominal }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Keterangan / Deskripsi <span class="text-rose-500">*</span>
          </label>
          <textarea
            data-testid="description-input-edit"
            v-model="description"
            rows="3"
            placeholder="Tuliskan catatan transaksi ini secara lengkap..."
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
          />
          <p v-if="errors.description" class="mt-1 text-xs text-rose-500 font-medium">
            {{ errors.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-change-btn"
            @click="handleClose"
            class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-change-btn"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-md shadow-amber-500/25"
          >
            <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Perbarui Transaksi' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import { Edit3, X, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlow } from "../api/cashFlowApi";

const props = defineProps<{
  show: boolean;
  cashFlowId?: number | string | null;
  cashFlowData?: CashFlow | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const cashFlowsStore = useCashFlowsStore();

const type = ref<"inflow" | "outflow">("inflow");
const source = ref<"cash" | "savings" | "loans">("cash");
const label = ref("");
const nominal = ref<number | string>("");
const description = ref("");

const errors = reactive({
  label: "",
  nominal: "",
  description: "",
});

const isSubmitting = computed(() => cashFlowsStore.isCashFlowChange);
const isChanged = computed(() => cashFlowsStore.isCashFlowChanged);

function populateForm(data: CashFlow | null | undefined) {
  if (!data) return;
  type.value = data.type || "inflow";
  source.value = data.source || "cash";
  label.value = data.label || "";
  nominal.value = data.nominal ?? "";
  description.value = data.description || "";
}

function handleClose() {
  emit("close");
}

watch(
  () => [props.show, props.cashFlowData],
  ([show, data]) => {
    if (show && data) {
      populateForm(data as CashFlow);
    }
  },
  { immediate: true }
);

watch(
  () => [props.show, props.cashFlowId],
  ([show, id]) => {
    if (show && id && !props.cashFlowData) {
      cashFlowsStore.asyncSetCashFlowById(id as string | number);
    }
  }
);

watch(
  () => cashFlowsStore.cashFlow,
  (newDetail) => {
    if (props.show && newDetail && !props.cashFlowData) {
      populateForm(newDetail);
    }
  }
);

watch(isChanged, (changed) => {
  if (changed) {
    cashFlowsStore.setIsCashFlowChanged(false);
    emit("success");
    handleClose();
  }
});

function validate(): boolean {
  errors.label = "";
  errors.nominal = "";
  errors.description = "";

  let isValid = true;
  if (!label.value.trim()) {
    errors.label = "Label atau kategori wajib diisi";
    isValid = false;
  }
  if (!nominal.value || Number(nominal.value) <= 0) {
    errors.nominal = "Nominal harus berupa angka lebih dari 0";
    isValid = false;
  }
  if (!description.value.trim()) {
    errors.description = "Keterangan transaksi wajib diisi";
    isValid = false;
  }
  return isValid;
}

function handleSubmit() {
  if (!validate()) return;
  const targetId = props.cashFlowId || props.cashFlowData?.id;
  if (!targetId) return;

  cashFlowsStore.asyncPutCashFlow(
    targetId,
    type.value,
    source.value,
    label.value.trim(),
    Number(nominal.value),
    description.value.trim()
  );
}
</script>
