import { describe, it, expect, vi } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import { reactive } from "vue";

const mockRoute = reactive({
  path: "/",
});

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRoute: () => mockRoute,
  };
});

describe("SidebarComponent", () => {
  it("should render navigation links and handle open state", async () => {
    mockRoute.path = "/";
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { open: true },
    });

    expect(wrapper.text()).toContain("Dashboard Arus Kas");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil & Pengaturan");

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const closeBtn = wrapper.find('[data-testid="close-sidebar-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);

    const homeLink = wrapper.find('[data-testid="sidebar-nav-home"]');
    await homeLink.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);

    const usersLink = wrapper.find('[data-testid="sidebar-nav-users"]');
    await usersLink.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(4);

    const profileLink = wrapper.find('[data-testid="sidebar-nav-profile"]');
    await profileLink.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(5);
  });

  it("should handle active styles for users and profile routes", async () => {
    mockRoute.path = "/users";
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { open: true },
    });
    const usersLink = wrapper.find('[data-testid="sidebar-nav-users"]');
    expect(usersLink.classes()).toContain("bg-emerald-50");

    mockRoute.path = "/profile";
    const { wrapper: profWrapper } = renderWithProviders(SidebarComponent, {
      props: { open: true },
    });
    const profLink = profWrapper.find('[data-testid="sidebar-nav-profile"]');
    expect(profLink.classes()).toContain("bg-emerald-50");

    mockRoute.path = "/other";
    const { wrapper: otherWrapper } = renderWithProviders(SidebarComponent, {
      props: { open: true },
    });
    const homeLink = otherWrapper.find('[data-testid="sidebar-nav-home"]');
    expect(homeLink.classes()).toContain("text-slate-600");
  });

  it("should not render backdrop when open is false", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: { open: false },
    });

    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);
  });
});

