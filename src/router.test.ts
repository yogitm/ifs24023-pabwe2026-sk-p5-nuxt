import { describe, it, expect } from "vitest";
import router, { createAppRouter, routes } from "./router";
import routerOptions from "./router.options";
import { createMemoryHistory } from "vue-router";

describe("router configuration", () => {
  it("should export routes and default router instance", () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
    expect(router).toBeDefined();
  });

  it("should create app router with custom memory history", () => {
    const memoryRouter = createAppRouter(createMemoryHistory());
    expect(memoryRouter).toBeDefined();
    expect(memoryRouter.getRoutes().length).toBeGreaterThan(0);
  });

  it("should return routes from router.options", () => {
    expect(routerOptions.routes()).toEqual(routes);
  });
});
