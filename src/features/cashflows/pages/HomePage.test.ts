import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.vue";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import cashFlowApi from "../api/cashFlowApi";

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

describe("HomePage", () => {
  const mockCashFlows = [
    {
      id: 1,
      user_id: 1,
      type: "inflow",
      source: "cash",
      label: "gaji",
      description: "Gaji bulanan",
      nominal: 2500000,
      created_at: "2024-10-05T11:26:45.000000Z",
      updated_at: "2024-10-05T11:26:48.000000Z",
    },
    {
      id: 2,
      user_id: 1,
      type: "outflow",
      source: "savings",
      label: "alat-mandi",
      description: "Sabun dan odol",
      nominal: 100000,
      created_at: "2024-10-05T11:28:02.000000Z",
      updated_at: "2024-10-05T11:28:02.000000Z",
    },
    {
      id: 3,
      user_id: 1,
      type: "outflow",
      source: "loans",
      label: "cicilan",
      description: "Bayar hutang",
      nominal: 500000,
      created_at: "2024-10-05T11:30:00.000000Z",
      updated_at: "2024-10-05T11:30:00.000000Z",
    },
    {
      id: 4,
      user_id: 1,
      type: "inflow",
      source: "other",
      label: "hadiah",
      description: "Uang kado",
      nominal: 200000,
      created_at: "2024-10-05T11:35:00.000000Z",
      updated_at: "2024-10-05T11:35:00.000000Z",
    },
  ] as any;

  const mockStats = {
    cashflow: 2100000,
    total_inflow: 2700000,
    total_outflow: 600000,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValue({
      cash_flows: mockCashFlows,
      stats: mockStats,
    });
  });

  it("should render stats and empty state when cash flows are empty", async () => {
    vi.spyOn(cashFlowApi, "getCashFlows").mockResolvedValue({
      cash_flows: [],
      stats: {},
    });

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: [],
        stats: null,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Belum Ada Catatan Transaksi");
  });

  it("should render cash flows list and filter by search query", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Daftar Transaksi (4)");
    expect(wrapper.text()).toContain("gaji");
    expect(wrapper.text()).toContain("alat-mandi");

    // Search by label
    const searchInput = wrapper.find('[data-testid="search-cashflow-input"]');
    await searchInput.setValue("gaji");
    expect(wrapper.text()).toContain("gaji");
    expect(wrapper.text()).not.toContain("alat-mandi");

    // Search by description
    await searchInput.setValue("sabun");
    expect(wrapper.text()).toContain("alat-mandi");
    expect(wrapper.text()).not.toContain("gaji");
  });

  it("should handle filter dropdowns and reset button", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const setSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlows").mockResolvedValue();

    const typeSelect = wrapper.find('[data-testid="filter-type-select"]');
    await typeSelect.setValue("inflow");
    expect(setSpy).toHaveBeenCalledWith("inflow", null);

    const sourceSelect = wrapper.find('[data-testid="filter-source-select"]');
    await sourceSelect.setValue("cash");
    expect(setSpy).toHaveBeenCalledWith("inflow", "cash");

    const resetBtn = wrapper.find('[data-testid="reset-filter-btn"]');
    await resetBtn.trigger("click");
    expect((typeSelect.element as HTMLSelectElement).value).toBe("");
  });

  it("should open and close AddModal and ChangeModal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const addBtn = wrapper.find('[data-testid="add-cashflow-btn"]');
    await addBtn.trigger("click");
    expect(wrapper.find('[data-testid="add-cashflow-modal"]').exists()).toBe(true);

    const editBtn = wrapper.find('[data-testid="edit-cashflow-1"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cashflow-modal"]').exists()).toBe(true);

    const changeModal = wrapper.findComponent(ChangeModal);
    await changeModal.vm.$emit("close");
    await changeModal.vm.$emit("success");
    await new Promise((r) => setTimeout(r, 20));

    const addModal = wrapper.findComponent(AddModal);
    await addModal.vm.$emit("close");
    await addModal.vm.$emit("success");
    await new Promise((r) => setTimeout(r, 20));
  });

  it("should navigate to detail page when view button clicked", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const viewBtn = wrapper.find('[data-testid="view-cashflow-1"]');
    await viewBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/cash-flows/1");
  });

  it("should handle single item deletion with confirm dialog", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockResolvedValue();

    // Cancel deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const deleteBtn = wrapper.find('[data-testid="delete-cashflow-1"]');
    await deleteBtn.trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirm deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await deleteBtn.trigger("click");
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should handle reset all items deletion with confirm dialog", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(HomePage, {
      preloadedState: {
        cashFlows: mockCashFlows,
        stats: mockStats,
      },
    });

    await new Promise((r) => setTimeout(r, 10));

    const deleteAllSpy = vi.spyOn(cashFlowsStore, "asyncDeleteAllCashFlows").mockResolvedValue();

    // Cancel reset
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const resetAllBtn = wrapper.find('[data-testid="reset-all-cashflows-btn"]');
    await resetAllBtn.trigger("click");
    expect(deleteAllSpy).not.toHaveBeenCalled();

    // Confirm reset
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await resetAllBtn.trigger("click");
    expect(deleteAllSpy).toHaveBeenCalled();
  });
});
