import { describe, it, expect, vi } from "vitest";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";

describe("AddModal", () => {
  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: false },
    });
    expect(wrapper.find('[data-testid="add-cashflow-modal"]').exists()).toBe(false);
  });

  it("should validate empty label, nominal, and description", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const postSpy = vi.spyOn(cashFlowsStore, "asyncPostCashFlow").mockResolvedValue();

    const form = wrapper.find("form");
    await form.trigger("submit.prevent");

    expect(wrapper.text()).toContain("Label atau kategori wajib diisi");
    expect(wrapper.text()).toContain("Nominal harus berupa angka lebih dari 0");
    expect(wrapper.text()).toContain("Keterangan transaksi wajib diisi");
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("should toggle type and select source", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const inflowBtn = wrapper.find('[data-testid="type-inflow-btn"]');
    const outflowBtn = wrapper.find('[data-testid="type-outflow-btn"]');
    await outflowBtn.trigger("click");
    await inflowBtn.trigger("click");

    const sourceSelect = wrapper.find('[data-testid="source-select"]');
    await sourceSelect.setValue("savings");
  });

  it("should submit form when valid and emit success on store update", async () => {
    const { wrapper, cashFlowsStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const postSpy = vi.spyOn(cashFlowsStore, "asyncPostCashFlow").mockResolvedValue();

    await wrapper.find('[data-testid="type-outflow-btn"]').trigger("click");
    await wrapper.find('[data-testid="source-select"]').setValue("cash");
    await wrapper.find('[data-testid="label-input"]').setValue("makan");
    await wrapper.find('[data-testid="nominal-input"]').setValue("30000");
    await wrapper.find('[data-testid="description-input"]').setValue("Makan siang bakso");

    const form = wrapper.find("form");
    await form.trigger("submit.prevent");

    expect(postSpy).toHaveBeenCalledWith("outflow", "cash", "makan", 30000, "Makan siang bakso");

    // Trigger isCashFlowAdded watcher
    cashFlowsStore.setIsCashFlowAdded(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should emit close on close button and cancel button and reset on show prop change", async () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.find('[data-testid="cancel-add-btn"]');
    await cancelBtn.trigger("click");

    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
  });

  it("should show loading state and disable submit button when isCashFlowAdd is true", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
      preloadedState: { isCashFlowAdd: true },
    });

    expect(wrapper.text()).toContain("Menyimpan...");
    const submitBtn = wrapper.find('[data-testid="submit-add-btn"]');
    expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true);
  });
});

