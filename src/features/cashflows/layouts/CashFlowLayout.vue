<template>
  <div v-if="!usersStore.profile" class="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <p class="text-sm font-medium">Memuat data pengguna...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-50 text-slate-800">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <SidebarComponent
      :open="sidebarOpen"
      @close="sidebarOpen = false"
    />

    <main role="main" class="pt-16 md:pl-64 transition-all">
      <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter, RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const router = useRouter();
const usersStore = useUsersStore();

const sidebarOpen = ref(false);

onMounted(async () => {
  const token = apiHelper.getAccessToken();
  if (!token) {
    router.push("/auth/login");
    return;
  }

  if (!usersStore.profile) {
    try {
      await usersStore.asyncSetProfile();
    } catch {
      // ignore
    }
  }
});

watch(
  () => [usersStore.isProfile, usersStore.profile],
  ([isProfile, profile]) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (!profile) {
        apiHelper.putAccessToken("");
        router.push("/auth/login");
      }
    }
  }
);
</script>
