<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Navigation / Back Button -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        data-testid="back-to-home-btn"
        aria-label="Kembali ke Beranda"
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
      >
        <ArrowLeft aria-hidden="true" :size="18" />
        <span>Kembali ke Beranda</span>
      </button>

      <!-- Manage Actions -->
      <div v-if="cashFlow" class="flex items-center gap-2">
        <button
          type="button"
          data-testid="edit-detail-btn"
          aria-label="Ubah Catatan Transaksi"
          @click="showEditModal = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
        >
          <Edit3 aria-hidden="true" :size="16" />
          <span>Ubah</span>
        </button>
        <button
          type="button"
          data-testid="delete-detail-btn"
          aria-label="Hapus Catatan Transaksi"
          @click="handleDelete"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
        >
          <Trash2 aria-hidden="true" :size="16" />
          <span>Hapus</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!cashFlow" class="p-16 text-center text-slate-600 bg-white rounded-3xl border border-slate-200/80">
      <h1 class="sr-only">Memuat Rincian Transaksi</h1>
      <Loader2 aria-hidden="true" :size="32" class="animate-spin text-emerald-600 mx-auto mb-2" />
      <p class="text-sm font-semibold text-slate-700">Memuat rincian transaksi...</p>
    </div>

    <!-- Detail Content Card -->
    <div v-else class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Card Header -->
      <div class="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md',
              cashFlow.type === 'inflow'
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-rose-600 text-white shadow-rose-600/20',
            ]"
          >
            <component :is="cashFlow.type === 'inflow' ? ArrowDownLeft : ArrowUpRight" aria-hidden="true" :size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-slate-600">#{{ cashFlow.id }}</span>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-bold',
                  cashFlow.type === 'inflow'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800',
                ]"
              >
                {{ cashFlow.type === 'inflow' ? 'Pemasukan' : 'Pengeluaran' }}
              </span>
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {{ cashFlow.label }}
            </h1>
          </div>
        </div>

        <!-- Big Amount Display -->
        <div class="text-left sm:text-right">
          <span class="text-xs font-bold text-slate-600 uppercase tracking-wider block">
            Nominal Transaksi
          </span>
          <span
            :class="[
              'text-2xl sm:text-3xl font-black tracking-tight',
              cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700',
            ]"
          >
            {{ cashFlow.type === 'inflow' ? '+' : '-' }} {{ formatRupiah(cashFlow.nominal) }}
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-6 sm:p-8 space-y-6">
        <!-- Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Sumber Dana</p>
            <p class="text-sm font-extrabold text-slate-800 mt-1">
              {{ formatSource(cashFlow.source) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Waktu Dicatat</p>
            <p class="text-sm font-semibold text-slate-700 mt-1">
              {{ formatDate(cashFlow.created_at) }}
            </p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider">Pembaruan Terakhir</p>
            <p class="text-sm font-semibold text-slate-700 mt-1">
              {{ formatDate(cashFlow.updated_at) }}
            </p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h2 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Catatan / Deskripsi Transaksi
          </h2>
          <div class="p-5 rounded-2xl bg-white border border-slate-200/80 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {{ cashFlow.description || 'Tidak ada deskripsi tambahan.' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Change Modal -->
    <ChangeModal
      :show="showEditModal"
      :cash-flow-data="cashFlow"
      @close="showEditModal = false"
      @success="loadDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";
import ChangeModal from "../modals/ChangeModal.vue";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const cashFlow = computed(() => cashFlowsStore.cashFlow);
const isDeleted = computed(() => cashFlowsStore.isCashFlowDeleted);

const showEditModal = ref(false);

const cashFlowId = computed(() => route.params.cashFlowId);

function formatSource(src: string): string {
  if (src === "cash") return "Tunai (Cash)";
  if (src === "savings") return "Rekening Tabungan (Savings)";
  if (src === "loans") return "Pinjaman (Loans)";
  return src;
}

function loadDetail() {
  if (cashFlowId.value) {
    cashFlowsStore.asyncSetCashFlowById(cashFlowId.value as string);
  }
}

onMounted(() => {
  loadDetail();
});

watch(cashFlowId, (newId) => {
  if (newId) {
    cashFlowsStore.asyncSetCashFlowById(newId as string);
  }
});

watch(isDeleted, (del) => {
  if (del) {
    cashFlowsStore.setIsCashFlowDeleted(false);
    router.push("/");
  }
});

async function handleDelete() {
  if (!cashFlow.value) return;
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus catatan transaksi ini?");
  if (result.isConfirmed) {
    await cashFlowsStore.asyncDeleteCashFlow(cashFlow.value.id);
  }
}
</script>
