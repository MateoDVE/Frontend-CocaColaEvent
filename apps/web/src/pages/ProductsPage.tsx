import { uiText } from "../shared/i18n";
import { useState } from "react";
import { Plus, Package, Search } from "lucide-react";
import { useProducts } from "../features/catalog";
import { useDemoMutation } from "../features/event-management";
import { apiRepository } from "../shared/api";
import { Button, Modal, Loading, ErrorState, Empty } from "../shared/ui";
import { es } from "../shared/i18n";
export default function ProductsPage() {
  const query = useProducts();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const mutation = useDemoMutation(apiRepository.addProduct);
  const toggle = useDemoMutation(apiRepository.toggleProduct);
  const rows =
    query.data?.filter((p) =>
      `${p.name} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{es.productPage.title}</h1>
          <p>{es.productPage.subtitle}</p>
        </div>
        <Button
          onClick={() => {
            mutation.reset();
            setOpen(true);
          }}
        >
          <Plus size={17} />
          {es.form.addProduct}
        </Button>
      </div>
      <div className="filter-row">
        <div className="search-input">
          <Search size={17} />
          <input
            aria-label={uiText.productsPage1}
            placeholder={uiText.productsPage2}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} retry={query.refetch} />
      ) : rows.length ? (
        <section className="panel">
          {rows.map((p, i) => (
            <div className="management-row" key={p.id}>
              <span className={`product-symbol product-${i % 3}`}>
                <Package size={25} />
              </span>
              <div>
                <strong>{p.name}</strong>
                <p>
                  {p.sku} · {p.brandLine}
                </p>
              </div>
              <span
                className={`status-badge ${p.isActive ? "status-active" : "status-draft"}`}
              >
                {p.isActive ? "Activo" : "Inactivo"}
              </span>
              <Button
                variant="ghost"
                disabled={toggle.isPending}
                onClick={() => toggle.mutate(p.id)}
              >
                {p.isActive ? es.detail.deactivate : es.detail.activate}
              </Button>
            </div>
          ))}
        </section>
      ) : (
        <Empty />
      )}
      {toggle.error && (
        <p role="alert" className="form-error">
          {toggle.error.message}
        </p>
      )}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={es.form.addProduct}
        description={uiText.productsPage3}
      >
        <form
          className="form-grid"
          onSubmit={(ev) => {
            ev.preventDefault();
            const f = new FormData(ev.currentTarget);
            mutation.mutate(
              {
                name: String(f.get("name")).trim(),
                sku: String(f.get("sku")).trim(),
                brandLine: String(f.get("brand")).trim(),
              },
              { onSuccess: () => setOpen(false) },
            );
          }}
        >
          <label className="col-span-full">
            {es.form.productName}
            <input name="name" required minLength={3} />
          </label>
          <label>
            {es.form.sku}
            <input name="sku" required pattern="[A-Z0-9-]+" />
          </label>
          <label>
            {es.form.brandLine}
            <input name="brand" required />
          </label>
          {mutation.error && (
            <p role="alert" className="form-error col-span-full">
              {mutation.error.message}
            </p>
          )}
          <Button className="col-span-full" disabled={mutation.isPending}>
            {es.save}
          </Button>
        </form>
      </Modal>
    </>
  );
}
