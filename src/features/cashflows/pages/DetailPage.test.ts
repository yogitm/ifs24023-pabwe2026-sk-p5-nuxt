import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.vue";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import cashFlowApi from "../api/cashFlowApi";
import { reactive } from "vue";

const mockRouter = {
  push: vi.fn(),
};

const mockRoute = reactive({
  params: { cashFlowId: "1" },
});

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockRoute,
  };
});

describe("DetailPage", () => {
  const mockCashFlow = {
    id: 1,
    user_id: 1,
    type: "inflow",
    source: "cash",
    label: "gaji",
    nominal: 2500000,
    description: "Gaji bulanan",
    created_at: "2024-10-05T11:26:45.000000Z",
    updated_at: "2024-10-05T11:26:48.000000Z",
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRoute.params.cashFlowId = "1";
    vi.spyOn(cashFlowApi, "getCashFlowById").mockResolvedValue(mockCashFlow);
  });

  it("should show loading state when cash flow is null", () => {
    vi.spyOn(cashFlowApi, "getCashFlowById").mockReturnValue(new Promise(() => {}));

    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: null },
    });

    expect(wrapper.text()).toContain("Memuat rincian transaksi...");
  });

  it("should render transaction detail and handle back button", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: mockCashFlow },
    });

    expect(wrapper.text()).toContain("gaji");
    expect(wrapper.text()).toContain("Pemasukan");
    expect(wrapper.text()).toContain("Gaji bulanan");
    expect(wrapper.text()).toContain("Tunai (Cash)");

    const backBtn = wrapper.find('[data-testid="back-to-home-btn"]');
    await backBtn.trigger("click");
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should render outflow and various sources correctly", () => {
    const { wrapper: savingsWrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        cashFlow: {
          ...mockCashFlow,
          type: "outflow",
          source: "savings",
          description: "",
        },
      },
    });
    expect(savingsWrapper.text()).toContain("Pengeluaran");
    expect(savingsWrapper.text()).toContain("Rekening Tabungan (Savings)");
    expect(savingsWrapper.text()).toContain("Tidak ada deskripsi tambahan.");

    const { wrapper: loansWrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        cashFlow: {
          ...mockCashFlow,
          source: "loans",
        },
      },
    });
    expect(loansWrapper.text()).toContain("Pinjaman (Loans)");

    const { wrapper: otherWrapper } = renderWithProviders(DetailPage, {
      preloadedState: {
        cashFlow: {
          ...mockCashFlow,
          source: "other",
        },
      },
    });
    expect(otherWrapper.text()).toContain("other");
  });

  it("should open and close edit modal", async () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: mockCashFlow },
    });

    const editBtn = wrapper.find('[data-testid="edit-detail-btn"]');
    await editBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cashflow-modal"]').exists()).toBe(true);

    const closeBtn = wrapper.find('[data-testid="close-change-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.find('[data-testid="change-cashflow-modal"]').exists()).toBe(false);
  });

  it("should handle delete transaction with confirm dialog and redirect when deleted", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: mockCashFlow },
    });

    const deleteSpy = vi.spyOn(cashFlowsStore, "asyncDeleteCashFlow").mockResolvedValue();

    // Cancel deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: false } as any);
    const deleteBtn = wrapper.find('[data-testid="delete-detail-btn"]');
    await deleteBtn.trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirm deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue({ isConfirmed: true } as any);
    await deleteBtn.trigger("click");
    expect(deleteSpy).toHaveBeenCalledWith(1);

    // Watcher on isCashFlowDeleted
    cashFlowsStore.setIsCashFlowDeleted(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should reload detail when route id changes", async () => {
    const { cashFlowsStore } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: mockCashFlow },
    });

    const setSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlowById").mockResolvedValue();

    mockRoute.params.cashFlowId = "2";
    await new Promise((r) => setTimeout(r, 10));
    expect(setSpy).toHaveBeenCalledWith("2");

    mockRoute.params.cashFlowId = "";
    await new Promise((r) => setTimeout(r, 10));
  });

  it("should handle empty cashFlowId on mount and handleDelete when cashFlow is null", async () => {
    mockRoute.params.cashFlowId = "";
    const { wrapper } = renderWithProviders(DetailPage, {
      preloadedState: { cashFlow: null },
    });

    const dialogSpy = vi.spyOn(toolsHelper, "showConfirmDialog");
    await (wrapper.vm as any).handleDelete();
    expect(dialogSpy).not.toHaveBeenCalled();
  });
});

