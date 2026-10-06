<template>
  <div>
    <!-- Backdrop for mobile -->
    <div
      v-if="open"
      data-testid="sidebar-backdrop"
      @click="$emit('close')"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
    />

    <!-- Sidebar Aside Container -->
    <aside
      class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 transition-transform duration-200 md:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div>
        <!-- Header Mobile -->
        <div class="pb-3 mb-3 flex items-center justify-between border-b border-slate-200 md:hidden">
          <span class="font-bold text-slate-900 text-sm">Menu Navigasi</span>
          <button
            type="button"
            data-testid="close-sidebar-btn"
            @click="$emit('close')"
            class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Tutup Menu"
          >
            <X :size="18" />
          </button>
        </div>

        <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Menu Utama
        </p>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <RouterLink
            to="/"
            data-testid="sidebar-nav-home"
            @click="$emit('close')"
            class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
            :class="route.path === '/' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <LayoutDashboard :size="18" :class="route.path === '/' ? 'text-emerald-600' : 'text-slate-400'" />
            <span>Dashboard Arus Kas</span>
          </RouterLink>

          <RouterLink
            to="/users"
            data-testid="sidebar-nav-users"
            @click="$emit('close')"
            class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
            :class="route.path.startsWith('/users') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <Users :size="18" :class="route.path.startsWith('/users') ? 'text-emerald-600' : 'text-slate-400'" />
            <span>Daftar Pengguna</span>
          </RouterLink>

          <RouterLink
            to="/profile"
            data-testid="sidebar-nav-profile"
            @click="$emit('close')"
            class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
            :class="route.path.startsWith('/profile') ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <User :size="18" :class="route.path.startsWith('/profile') ? 'text-emerald-600' : 'text-slate-400'" />
            <span>Profil & Pengaturan</span>
          </RouterLink>
        </nav>
      </div>

      <!-- Bottom System Information -->
      <div class="pt-3 border-t border-slate-100 px-3 text-xs text-slate-400 flex items-center justify-between">
        <span>Delcom Cash Flow</span>
        <span>PABWE P5</span>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { LayoutDashboard, Users, User, X } from "lucide-vue-next";

defineProps<{
  open: boolean;
}>();

defineEmits<{
  (e: "close"): void;
}>();

const route = useRoute();
</script>
