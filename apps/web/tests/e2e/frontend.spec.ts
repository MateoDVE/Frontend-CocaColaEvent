import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function enter(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explorar demo de operaciones" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cada encuentro cuenta." }),
  ).toBeVisible();
}
test("Dashboard, responsive layout, navigation and accessibility", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.screenshot({
    path: "../../docs/screenshots/dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page
    .getByRole("combobox", { name: "Métrica del gráfico" })
    .selectOption("claims");
  await page.getByRole("link", { name: "Mis eventos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tus próximas grandes experiencias." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Buscar evento", exact: true })
    .fill("inexistente");
  await expect(
    page.getByRole("heading", { name: "No hay resultados" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Buscar evento", exact: true })
    .fill("");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page
    .getByRole("link", { name: "Panel del evento", exact: true })
    .click();
  await page.screenshot({
    path: "../../docs/screenshots/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("US-01/03/04: create draft, reject publication, add activity, publish", async ({
  page,
}) => {
  await enter(page);
  await page.getByRole("link", { name: "Mis eventos", exact: true }).click();
  await page.getByRole("button", { name: "Crear evento", exact: true }).click();
  await page
    .getByLabel("Nombre del evento", { exact: true })
    .fill("Experiencia de prueba");
  await page.getByLabel("Código público").fill("TEST26");
  await page.getByLabel("Recinto").fill("Parque Central");
  await page.getByLabel("Ciudad", { exact: true }).fill("Santiago");
  await page.getByLabel("Inicio", { exact: true }).fill("2026-11-02T15:00");
  await page.getByLabel("Fin", { exact: true }).fill("2026-11-02T20:00");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Crear evento", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Experiencia de prueba", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Publicar evento", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "actividad activa",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar", exact: true })
    .click();
  await page.getByRole("tab", { name: "Actividades" }).click();
  await page.getByRole("button", { name: "Agregar actividad" }).click();
  await page.getByLabel("Nombre de actividad").fill("Stand de prueba");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Guardar cambios" })
    .click();
  await expect(
    page.getByText("Stand de prueba", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Resumen" }).click();
  await page
    .getByRole("button", { name: "Publicar evento", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Iniciar evento", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Mis eventos", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("link", { name: "Experiencia de prueba", exact: true }),
  ).toBeVisible();
});
test("Feedback filtering, product creation and CSV export", async ({
  page,
}) => {
  await enter(page);
  await page
    .getByRole("link", { name: "Voz del consumidor", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Sentimiento", exact: true })
    .selectOption("negative");
  await expect(page.getByText("Camila", { exact: true })).toBeVisible();
  await expect(page.getByText("Valentina", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Leer opinión" }).click();
  await expect(page.getByRole("dialog")).toContainText("demasiado larga");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cerrar", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("feedback-demo.csv");
  await page.getByRole("link", { name: "Productos", exact: true }).click();
  await page.getByRole("button", { name: "Agregar producto" }).click();
  await page.getByLabel("Nombre del producto").fill("Producto de prueba");
  await page.getByLabel("SKU", { exact: true }).fill("TEST-350");
  await page.getByLabel("Línea de marca").fill("Coca-Cola");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Guardar cambios" })
    .click();
  await expect(
    page.getByText("Producto de prueba", { exact: true }),
  ).toBeVisible();
});
test("Mobile staff: duplicate ingress, sampling limit, offline block and logout", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/staff/login");
  await page.getByLabel("Código de evento").fill("LOLLA26");
  await page.getByLabel("PIN de acceso").fill("123456");
  await page.getByRole("button", { name: "Iniciar turno demo" }).click();
  await page.getByRole("link", { name: /Control de ingreso/ }).click();
  await page
    .getByLabel("Código de prueba o contenido del QR")
    .fill("DEMO-VALENTINA");
  await page.getByRole("button", { name: "Validar pase demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Ingreso aprobado" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Escanear siguiente" }).click();
  await page
    .getByLabel("Código de prueba o contenido del QR")
    .fill("DEMO-VALENTINA");
  await page.getByRole("button", { name: "Validar pase demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Asistencia ya registrada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Escanear siguiente" }).click();
  await page.getByRole("link", { name: "Cambiar modo" }).click();
  await page.getByRole("link", { name: /Stand Zero/ }).click();
  await page
    .getByLabel("Código de prueba o contenido del QR")
    .fill("DEMO-VALENTINA");
  await page.getByRole("button", { name: "Validar pase demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Entrega aprobada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Escanear siguiente" }).click();
  await page
    .getByLabel("Código de prueba o contenido del QR")
    .fill("DEMO-VALENTINA");
  await page.getByRole("button", { name: "Validar pase demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Beneficio ya canjeado" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Escanear siguiente" }).click();
  await context.setOffline(true);
  await expect(page.getByRole("alert")).toContainText(
    "Sin conexión: no entregar",
  );
  await expect(
    page.getByRole("button", { name: "Validar pase demo" }),
  ).toBeDisabled();
  await context.setOffline(false);
  await page.screenshot({
    path: "../../docs/screenshots/staff-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("button", { name: "Cerrar turno" }).click();
  await expect(
    page.getByRole("button", { name: "Iniciar turno demo" }),
  ).toBeVisible();
});
