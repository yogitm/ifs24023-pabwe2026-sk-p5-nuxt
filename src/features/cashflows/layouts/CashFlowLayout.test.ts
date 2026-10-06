import { describe, it, expect, vi, beforeEach } from "vitest";
import CashFlowLayout from "./CashFlowLayout.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => ({ path: "/" }),
  };
});

describe("CashFlowLayout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should redirect to login if access token is missing", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    renderWithProviders(CashFlowLayout);
    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });

  it("should load profile if access token is present and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("test-token");

    const { pinia, usersStore } = createMockPinia({ profile: null });
    const profileSpy = vi.spyOn(usersStore, "asyncSetProfile").mockResolvedValue();

    renderWithProviders(CashFlowLayout, { pinia });
    await new Promise((r) => setTimeout(r, 15));

    expect(profileSpy).toHaveBeenCalled();
  });

  it("should render layout and handle sidebar toggle when profile is present", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("test-token");

    const { wrapper } = renderWithProviders(CashFlowLayout, {
      preloadedState: {
        profile: { id: 1, name: "Yogi", email: "yogi@delcom.org" },
      },
    });

    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.text()).toContain("Dashboard Arus Kas");

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    expect(wrapper.vm.sidebarOpen).toBe(true);

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");
    expect(wrapper.vm.sidebarOpen).toBe(false);
  });
});
