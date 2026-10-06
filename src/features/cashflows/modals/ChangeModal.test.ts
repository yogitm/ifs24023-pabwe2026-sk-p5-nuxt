import { describe, it, expect, vi } from "vitest";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";

describe("ChangeModal", () => {
  const mockCashFlow = {
    id: 1,
    user_id: 1,
    type: "outflow",
    source: "savings",
    label: "makan",
    nominal: 50000,
    description: "Makan siang",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  } as any;

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false },
    });
    expect(wrapper.find('[data-testid="change-cashflow-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with cashFlowData and handle modifications", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowData: mockCashFlow },
    });

    const labelInput = wrapper.find('[data-testid="label-input-edit"]');
    expect((labelInput.element as HTMLInputElement).value).toBe("makan");

    const nominalInput = wrapper.find('[data-testid="nominal-input-edit"]');
    expect((nominalInput.element as HTMLInputElement).value).toBe("50000");

    const descInput = wrapper.find('[data-testid="description-input-edit"]');
    expect((descInput.element as HTMLTextAreaElement).value).toBe("Makan siang");
  });

  it("should trigger asyncSetCashFlowById when cashFlowId is provided without cashFlowData", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowId: 1 },
    });

    const setSpy = vi.spyOn(cashFlowsStore, "asyncSetCashFlowById").mockResolvedValue();

    await wrapper.setProps({ cashFlowId: 2 });
    expect(setSpy).toHaveBeenCalledWith(2);

    // Simulate store update
    cashFlowsStore.$state.cashFlow = mockCashFlow;
    await new Promise((r) => setTimeout(r, 10));
  });

  it("should validate empty label, nominal, and description", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(ChangeModal, {
      props: {
        show: true,
        cashFlowData: {
          ...mockCashFlow,
          label: "",
          nominal: 0,
          description: "",
        },
      },
    });

    const putSpy = vi.spyOn(cashFlowsStore, "asyncPutCashFlow").mockResolvedValue();

    const form = wrapper.find("form");
    await form.trigger("submit.prevent");

    expect(wrapper.text()).toContain("Label atau kategori wajib diisi");
    expect(wrapper.text()).toContain("Nominal harus berupa angka lebih dari 0");
    expect(wrapper.text()).toContain("Keterangan transaksi wajib diisi");
    expect(putSpy).not.toHaveBeenCalled();
  });

  it("should dispatch asyncPutCashFlow and close on success", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowData: mockCashFlow },
    });

    const putSpy = vi.spyOn(cashFlowsStore, "asyncPutCashFlow").mockResolvedValue();

    await wrapper.find('[data-testid="type-inflow-edit-btn"]').trigger("click");
    await wrapper.find('[data-testid="source-select-edit"]').setValue("cash");
    await wrapper.find('[data-testid="label-input-edit"]').setValue("gaji");
    await wrapper.find('[data-testid="nominal-input-edit"]').setValue("1000000");
    await wrapper.find('[data-testid="description-input-edit"]').setValue("Bonus akhir tahun");

    const form = wrapper.find("form");
    await form.trigger("submit.prevent");

    expect(putSpy).toHaveBeenCalledWith(1, "inflow", "cash", "gaji", 1000000, "Bonus akhir tahun");

    cashFlowsStore.setIsCashFlowChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should close modal when close button or cancel button clicked", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowData: mockCashFlow },
    });

    const closeBtn = wrapper.find('[data-testid="close-change-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-change-btn"]');
    await cancelBtn.trigger("click");
  });

  it("should toggle type to outflow and inflow", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowData: mockCashFlow },
    });

    const outflowBtn = wrapper.find('[data-testid="type-outflow-edit-btn"]');
    await outflowBtn.trigger("click");
    expect(outflowBtn.classes()).toContain("bg-rose-50");

    const inflowBtn = wrapper.find('[data-testid="type-inflow-edit-btn"]');
    await inflowBtn.trigger("click");
    expect(inflowBtn.classes()).toContain("bg-emerald-50");
  });

  it("should show loading state when isCashFlowChange is true", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowData: mockCashFlow },
      preloadedState: { isCashFlowChange: true },
    });

    expect(wrapper.text()).toContain("Menyimpan...");
    const submitBtn = wrapper.find('[data-testid="submit-change-btn"]');
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("should not call asyncPutCashFlow if targetId is missing", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(ChangeModal, {
      props: { show: true, cashFlowId: undefined, cashFlowData: undefined },
    });

    const putSpy = vi.spyOn(cashFlowsStore, "asyncPutCashFlow").mockResolvedValue();

    await wrapper.find('[data-testid="label-input-edit"]').setValue("makan");
    await wrapper.find('[data-testid="nominal-input-edit"]').setValue("25000");
    await wrapper.find('[data-testid="description-input-edit"]').setValue("siang");

    const form = wrapper.find("form");
    await form.trigger("submit.prevent");

    expect(putSpy).not.toHaveBeenCalled();
  });

  it("should handle populateForm with null and empty partial data", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true },
    });

    (wrapper.vm as any).populateForm(null);
    (wrapper.vm as any).populateForm({});
    expect((wrapper.vm as any).type).toBe("inflow");
    expect((wrapper.vm as any).source).toBe("cash");
    expect((wrapper.vm as any).nominal).toBe("");
  });
});


