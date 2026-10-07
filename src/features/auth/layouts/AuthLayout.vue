<template>
  <main role="main" class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="inline-flex w-12 h-12 rounded-xl bg-emerald-600 items-center justify-center text-white shadow-xs mb-3">
        <Wallet aria-hidden="true" :size="24" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
        Delcom Cash Flow
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Sistem Pencatatan Arus Kas Keuangan
      </p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-xl border border-slate-200">
        <!-- Tabs -->
        <nav aria-label="Navigasi Autentikasi" class="flex rounded-lg bg-slate-100 p-1 mb-6">
          <RouterLink
            to="/auth/login"
            :aria-current="isLoginActive ? 'page' : undefined"
            class="flex-1 py-2 text-center text-sm font-semibold rounded-md transition-colors"
            :class="isLoginActive ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            Masuk Akun
          </RouterLink>
          <RouterLink
            to="/auth/register"
            :aria-current="!isLoginActive ? 'page' : undefined"
            class="flex-1 py-2 text-center text-sm font-semibold rounded-md transition-colors"
            :class="!isLoginActive ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          >
            Daftar Baru
          </RouterLink>
        </nav>

        <RouterView />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { Wallet } from "lucide-vue-next";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const isLoginActive = computed(() => route.path === "/auth/login");

onMounted(() => {
  const authToken = apiHelper.getAccessToken();
  if (authToken) {
    usersStore.asyncSetProfile();
  }
});

watch(
  () => [usersStore.isProfile, usersStore.profile],
  ([isProfile, profile]) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (profile) {
        router.push("/");
      } else {
        apiHelper.putAccessToken("");
      }
    }
  }
);
</script>
