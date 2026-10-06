import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render correctly with profile photo and trigger sidebar toggle", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Yogi Trimulya",
          email: "yogi@delcom.org",
          photo: "https://example.com/avatar.jpg",
        },
      },
    });

    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.text()).toContain("Yogi Trimulya");
    expect(wrapper.text()).toContain("yogi@delcom.org");
    expect(wrapper.find("img").exists()).toBe(true);

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    expect(wrapper.emitted("toggleSidebar")).toBeTruthy();
  });

  it("should render initial fallback when photo is null and 'U' when profile is null", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Budi",
          email: "budi@delcom.org",
          photo: null,
        },
      },
    });

    expect(wrapper.text()).toContain("B");
    expect(wrapper.find("img").exists()).toBe(false);

    const { wrapper: emptyWrapper } = renderWithProviders(NavbarComponent, {
      preloadedState: {
        profile: null,
      },
    });
    expect(emptyWrapper.text()).toContain("U");
  });

  it("should handle logout when user confirms", async () => {
    const { wrapper, authStore } = renderWithProviders(NavbarComponent, {
      preloadedState: {
        profile: { id: 1, name: "Yogi", email: "yogi@delcom.org" },
      },
    });

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockResolvedValue();

    const logoutBtn = wrapper.find('[data-testid="logout-btn"]');
    await logoutBtn.trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });

  it("should cancel logout when user does not confirm", async () => {
    const { wrapper, authStore } = renderWithProviders(NavbarComponent, {
      preloadedState: {
        profile: { id: 1, name: "Yogi", email: "yogi@delcom.org" },
      },
    });

    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockResolvedValue();

    const logoutBtn = wrapper.find('[data-testid="logout-btn"]');
    await logoutBtn.trigger("click");

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
