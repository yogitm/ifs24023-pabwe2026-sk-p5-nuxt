<template>
  <div class="space-y-6">
    <!-- Header Page: Title & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">
          Ringkasan Arus Kas
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pantau seluruh perputaran uang masuk dan keluar secara terperinci
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          data-testid="reset-all-cashflows-btn"
          aria-label="Reset Semua Catatan Arus Kas"
          @click="handleDeleteAll"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200/60"
        >
          <RotateCcw aria-hidden="true" :size="16" />
          <span>Reset Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-cashflow-btn"
          aria-label="Catat Transaksi Baru"
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/25 transition-all"
        >
          <Plus aria-hidden="true" :size="18" />
          <span>Catat Transaksi</span>
        </button>
      </div>
    </div>

    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Total Saldo Bersih -->
      <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/10">
        <div class="flex items-center justify-between opacity-85">
          <span class="text-xs font-bold uppercase tracking-wider">Saldo Bersih</span>
          <Wallet aria-hidden="true" :size="20" />
        </div>
        <p class="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
          {{ formatRupiah(statsNet) }}
        </p>
        <p class="text-xs mt-1 text-emerald-100">
          Akumulasi total pemasukan dikurangi pengeluaran
        </p>
      </div>

      <!-- Total Pemasukan -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between text-emerald-700">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Pemasukan</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <ArrowDownLeft aria-hidden="true" :size="18" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-800 mt-2 tracking-tight">
          {{ formatRupiah(statsInflow) }}
        </p>
        <p class="text-xs mt-1 text-slate-600">Total seluruh arus dana masuk</p>
      </div>

      <!-- Total Pengeluaran -->
      <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between text-rose-700">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Total Pengeluaran</span>
          <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <ArrowUpRight aria-hidden="true" :size="18" />
          </div>
        </div>
        <p class="text-2xl font-black text-slate-800 mt-2 tracking-tight">
          {{ formatRupiah(statsOutflow) }}
        </p>
        <p class="text-xs mt-1 text-slate-600">Total seluruh beban pengeluaran</p>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Live Search Input -->
        <div class="relative flex-1">
          <label for="search-cashflow-input" class="sr-only">Cari Transaksi</label>
          <Search aria-hidden="true" :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            id="search-cashflow-input"
            data-testid="search-cashflow-input"
            aria-label="Cari transaksi berdasarkan label atau keterangan"
            v-model="searchQuery"
            placeholder="Cari transaksi berdasarkan label atau keterangan..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-wrap items-center gap-2">
          <label for="filter-type-select" class="sr-only">Filter Jenis Transaksi</label>
          <select
            id="filter-type-select"
            data-testid="filter-type-select"
            aria-label="Filter Berdasarkan Jenis Transaksi"
            v-model="typeFilter"
            class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua Jenis</option>
            <option value="inflow">Pemasukan</option>
            <option value="outflow">Pengeluaran</option>
          </select>

          <label for="filter-source-select" class="sr-only">Filter Sumber Dana</label>
          <select
            id="filter-source-select"
            data-testid="filter-source-select"
            aria-label="Filter Berdasarkan Sumber Dana"
            v-model="sourceFilter"
            class="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Semua Sumber</option>
            <option value="cash">Tunai</option>
            <option value="savings">Tabungan</option>
            <option value="loans">Pinjaman</option>
          </select>

          <button
            v-if="typeFilter || sourceFilter || searchQuery"
            type="button"
            data-testid="reset-filter-btn"
            aria-label="Reset Filter Transaksi"
            @click="resetFilters"
            class="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-slate-400">
      <Loader2 aria-hidden="true" :size="32" class="animate-spin text-emerald-600 mx-auto mb-2" />
      <p class="text-sm font-semibold">Memuat catatan arus kas...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredCashFlows.length === 0"
      data-testid="empty-state"
      class="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200"
    >
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
        <Receipt aria-hidden="true" :size="28" />
      </div>
      <h2 class="text-base font-bold text-slate-800">Belum Ada Catatan Transaksi</h2>
      <p class="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
        Belum ada catatan keuangan yang sesuai filter atau transaksi masih kosong.
      </p>
    </div>

    <!-- Cash Flows Table -->
    <div v-else class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-slate-800 text-sm">
          Daftar Transaksi ({{ filteredCashFlows.length }})
        </h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
            <tr>
              <th scope="col" class="px-5 py-3.5">Tanggal</th>
              <th scope="col" class="px-5 py-3.5">Kategori / Keterangan</th>
              <th scope="col" class="px-5 py-3.5">Sumber</th>
              <th scope="col" class="px-5 py-3.5 text-right">Nominal</th>
              <th scope="col" class="px-5 py-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in filteredCashFlows"
              :key="item.id"
              :data-testid="`cashflow-row-${item.id}`"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <td class="px-5 py-4 text-xs text-slate-600 whitespace-nowrap">
                {{ formatDate(item.created_at) }}
              </td>

              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1',
                      item.type === 'inflow'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300',
                    ]"
                  >
                    <component :is="item.type === 'inflow' ? ArrowDownLeft : ArrowUpRight" aria-hidden="true" :size="12" />
                    {{ item.label }}
                  </span>
                </div>
                <p class="text-xs text-slate-600 mt-1 line-clamp-1">
                  {{ item.description }}
                </p>
              </td>

              <td class="px-5 py-4 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  {{ formatSource(item.source) }}
                </span>
              </td>

              <td class="px-5 py-4 text-right whitespace-nowrap font-bold" :class="item.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'">
                {{ item.type === 'inflow' ? '+' : '-' }} {{ formatRupiah(item.nominal) }}
              </td>

              <td class="px-5 py-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    :data-testid="`view-cashflow-${item.id}`"
                    aria-label="Lihat detail transaksi"
                    @click="router.push(`/cash-flows/${item.id}`)"
                    class="p-2 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye aria-hidden="true" :size="16" />
                  </button>
                  <button
                    type="button"
                    :data-testid="`edit-cashflow-${item.id}`"
                    aria-label="Ubah catatan transaksi"
                    @click="openEditModal(item)"
                    class="p-2 text-slate-600 hover:text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Ubah"
                  >
                    <Edit3 aria-hidden="true" :size="16" />
                  </button>
                  <button
                    type="button"
                    :data-testid="`delete-cashflow-${item.id}`"
                    aria-label="Hapus catatan transaksi"
                    @click="handleDelete(item.id)"
                    class="p-2 text-slate-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 aria-hidden="true" :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <AddModal
      :show="showAddModal"
      @close="showAddModal = false"
      @success="loadCashFlows"
    />

    <ChangeModal
      :show="showChangeModal"
      :cash-flow-data="selectedCashFlow"
      @close="showChangeModal = false"
      @success="loadCashFlows"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RotateCcw,
  Search,
  Loader2,
  Receipt,
  Eye,
  Edit3,
  Trash2,
} from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlow } from "../api/cashFlowApi";
import { formatDate, formatRupiah, showConfirmDialog } from "../../../helpers/toolsHelper";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";

const router = useRouter();
const cashFlowsStore = useCashFlowsStore();

const cashFlows = computed(() => cashFlowsStore.cashFlows);
const stats = computed(() => cashFlowsStore.stats);

const loading = ref(false);
const searchQuery = ref("");
const typeFilter = ref("");
const sourceFilter = ref("");

const showAddModal = ref(false);
const showChangeModal = ref(false);
const selectedCashFlow = ref<CashFlow | null>(null);

const statsNet = computed(() => {
  if (stats.value && stats.value.cashflow !== undefined) return stats.value.cashflow;
  return 0;
});

const statsInflow = computed(() => {
  if (stats.value && stats.value.total_inflow !== undefined) return stats.value.total_inflow;
  return 0;
});

const statsOutflow = computed(() => {
  if (stats.value && stats.value.total_outflow !== undefined) return stats.value.total_outflow;
  return 0;
});

function formatSource(src: string): string {
  if (src === "cash") return "Tunai";
  if (src === "savings") return "Tabungan";
  if (src === "loans") return "Pinjaman";
  return src;
}

function loadCashFlows() {
  loading.value = true;
  Promise.resolve(
    cashFlowsStore.asyncSetCashFlows(
      typeFilter.value || null,
      sourceFilter.value || null
    )
  ).finally(() => {
    loading.value = false;
  });
}

onMounted(() => {
  loadCashFlows();
});

watch([typeFilter, sourceFilter], () => {
  loadCashFlows();
});

function resetFilters() {
  typeFilter.value = "";
  sourceFilter.value = "";
  searchQuery.value = "";
}

const filteredCashFlows = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return cashFlows.value;

  return cashFlows.value.filter((cf) => {
    const labelMatch = cf.label.toLowerCase().includes(query);
    const descMatch = cf.description.toLowerCase().includes(query);
    return labelMatch || descMatch;
  });
});

function openEditModal(item: CashFlow) {
  selectedCashFlow.value = item;
  showChangeModal.value = true;
}

async function handleDelete(id: number) {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus catatan transaksi ini?");
  if (result.isConfirmed) {
    await cashFlowsStore.asyncDeleteCashFlow(id);
    loadCashFlows();
  }
}

async function handleDeleteAll() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus SEMUA catatan arus kas?");
  if (result.isConfirmed) {
    await cashFlowsStore.asyncDeleteAllCashFlows();
    loadCashFlows();
  }
}
</script>
