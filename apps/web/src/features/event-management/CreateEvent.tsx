import { uiText } from "../../shared/i18n";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { EventInputSchema, eventTypes } from "@cocacola-ei/contracts";
import { useDemoMutation } from "./index";
import { demoRepository } from "../../shared/demo";
import { es } from "../../shared/i18n";
import { Button, Modal } from "../../shared/ui";
type Form = {
  name: string;
  publicCode: string;
  type: (typeof eventTypes)[number];
  location: string;
  city: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  attendanceGoal: number;
};
export function CreateEvent({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const form = useForm<Form>({
    defaultValues: { type: "FESTIVAL", capacity: 1000, attendanceGoal: 800 },
  });
  const navigate = useNavigate();
  const mutation = useDemoMutation(demoRepository.createEvent);
  async function submit(values: Form) {
    const parsed = EventInputSchema.safeParse({
      ...values,
      timezone: "America/Santiago",
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    });
    if (!parsed.success) {
      form.setError("root", { message: es.form.invalid });
      return;
    }
    try {
      const e = await mutation.mutateAsync(parsed.data);
      onOpenChange(false);
      navigate(`/admin/events/${e.id}`);
    } catch (e) {
      form.setError("root", { message: (e as Error).message });
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={es.createEvent}
      description={uiText.createEvent1}
    >
      <form onSubmit={form.handleSubmit(submit)} className="form-grid">
        <label className="col-span-full">
          {es.form.name}
          <input required maxLength={200} {...form.register("name")} />
        </label>
        <label>
          {es.form.code}
          <input
            required
            pattern="[A-Z0-9]{4,12}"
            placeholder={uiText.createEvent2}
            {...form.register("publicCode")}
          />
        </label>
        <label>
          {es.form.type}
          <select {...form.register("type")}>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {es.types[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {es.form.location}
          <input required {...form.register("location")} />
        </label>
        <label>
          {es.form.city}
          <input required {...form.register("city")} />
        </label>
        <label>
          {es.form.start}
          <input
            type="datetime-local"
            required
            {...form.register("startsAt")}
          />
        </label>
        <label>
          {es.form.end}
          <input type="datetime-local" required {...form.register("endsAt")} />
        </label>
        <p className="form-help col-span-full">{uiText.createEvent3}</p>
        <label>
          {es.form.capacity}
          <input
            type="number"
            min={1}
            required
            {...form.register("capacity", { valueAsNumber: true })}
          />
        </label>
        <label>
          {es.form.goal}
          <input
            type="number"
            min={0}
            required
            {...form.register("attendanceGoal", { valueAsNumber: true })}
          />
        </label>
        {form.formState.errors.root && (
          <p role="alert" className="form-error col-span-full">
            {form.formState.errors.root.message}
          </p>
        )}
        <div className="form-actions col-span-full">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {es.cancel}
          </Button>
          <Button disabled={form.formState.isSubmitting}>
            {es.createEvent}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
