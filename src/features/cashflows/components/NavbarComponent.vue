<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
    <div class="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Left side: Toggle button & Logo/Title -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          data-testid="toggle-sidebar-btn"
          @click="$emit('toggleSidebar')"
          class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu aria-hidden="true" :size="20" />
        </button>

        <RouterLink to="/" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Wallet aria-hidden="true" :size="20" />
          </div>
          <span class="text-base sm:text-lg font-bold text-slate-900">
            Delcom Cash Flow
          </span>
        </RouterLink>
      </div>

      <!-- Right side: User profile & Logout -->
      <div class="flex items-center gap-2">
        <RouterLink
          to="/profile"
          data-testid="navbar-profile-link"
          aria-label="Lihat profil saya"
          class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <img
            v-if="profile?.photo"
            :src="profile.photo"
            :alt="profile?.name ? `Foto profil ${profile.name}` : 'Foto profil'"
            class="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <div
            v-else
            role="img"
            aria-label="Inisial profil pengguna"
            class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center"
          >
            {{ profileInitial }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-semibold text-slate-800 leading-tight">
              {{ profile?.name }}
            </p>
            <p class="text-[11px] text-slate-400 leading-tight">
              {{ profile?.email }}
            </p>
          </div>
        </RouterLink>

        <button
          type="button"
          data-testid="logout-btn"
          aria-label="Keluar dari akun"
          @click="handleLogout"
          class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
          title="Keluar"
        >
          <LogOut aria-hidden="true" :size="18" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Menu, Wallet, LogOut } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits<{
  (e: "toggleSidebar"): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const profile = computed(() => usersStore.profile);

const profileInitial = computed(() => {
  return profile.value?.name ? profile.value.name.charAt(0).toUpperCase() : "U";
});

async function handleLogout() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin keluar dari akun ini?");
  if (result.isConfirmed) {
    await authStore.asyncSetIsAuthLogout();
    router.push("/auth/login");
  }
}
</script>
