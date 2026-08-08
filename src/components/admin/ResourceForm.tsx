"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { saveResource, type AdminFormState } from "@/lib/admin/actions";
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  RESOURCE_TYPE_LABELS,
} from "@/constants";
import { DIFFICULTIES, LANGUAGES, RESOURCE_TYPES, type Topic } from "@/types";

export interface ResourceFormValues {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  url?: string;
  source?: string;
  author?: string;
  resourceType?: string;
  difficulty?: string;
  language?: string;
  isVerified?: boolean;
  isActive?: boolean;
  topics?: string[];
  tags?: string[];
}

interface ResourceFormProps {
  values: ResourceFormValues;
  topics: Topic[];
  /** Quando presente, aprovar o recurso encerra a submissão de origem. */
  submissionId?: string;
}

const FIELD =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-navy-900 outline-none transition-quick placeholder:text-ink-400 focus:border-brand-400";

export function ResourceForm({
  values,
  topics,
  submissionId,
}: ResourceFormProps) {
  const [state, formAction] = useActionState<AdminFormState, FormData>(
    saveResource,
    {},
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {submissionId ? (
        <input type="hidden" name="submission_id" value={submissionId} />
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-line bg-surface-muted px-3 py-2.5 text-sm text-navy-900"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
          {state.error}
        </p>
      ) : null}

      <Field label="Título" name="title" defaultValue={values.title} required />

      <Field
        label="URL da fonte original"
        name="url"
        type="url"
        defaultValue={values.url}
        required
      />

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-navy-900">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          placeholder="Uma ou duas frases sobre o que o conteúdo entrega."
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Tipo"
          name="resource_type"
          defaultValue={values.resourceType ?? "documentation"}
          options={RESOURCE_TYPES.map((type) => ({
            value: type,
            label: RESOURCE_TYPE_LABELS[type],
          }))}
        />
        <Select
          label="Nível"
          name="difficulty"
          defaultValue={values.difficulty ?? ""}
          options={[
            { value: "", label: "Não classificado" },
            ...DIFFICULTIES.map((level) => ({
              value: level,
              label: DIFFICULTY_LABELS[level],
            })),
          ]}
        />
        <Select
          label="Idioma"
          name="language"
          defaultValue={values.language ?? "en"}
          options={LANGUAGES.map((lang) => ({
            value: lang,
            label: LANGUAGE_LABELS[lang],
          }))}
        />
        <Field
          label="Fonte"
          name="source"
          defaultValue={values.source}
          hint="Em branco, usamos o domínio."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Autoria" name="author" defaultValue={values.author} />
        <Field
          label="Slug"
          name="slug"
          defaultValue={values.slug}
          hint="Endereço público. Em branco, geramos pelo título."
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-navy-900">
          Tecnologias
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-700"
            >
              <input
                type="checkbox"
                name="topics"
                value={topic.slug}
                defaultChecked={values.topics?.includes(topic.slug)}
                className="size-3.5 cursor-pointer accent-brand-500"
              />
              {topic.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Tags"
        name="tags"
        defaultValue={values.tags?.join(", ")}
        hint="Separadas por vírgula. Tags novas são criadas automaticamente."
      />

      <div className="space-y-2 border-t border-line pt-5">
        <Checkbox
          name="is_verified"
          label="Revisado pela curadoria"
          hint="Exibe o selo e dá peso extra no ranking."
          defaultChecked={values.isVerified ?? true}
        />
        <Checkbox
          name="is_active"
          label="Publicado"
          hint="Desmarcado, some da busca sem ser apagado."
          defaultChecked={values.isActive ?? true}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <SubmitButton isEditing={Boolean(values.id)} />
        <ButtonLink href="/admin/resources" variant="secondary">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando…" : isEditing ? "Salvar alterações" : "Publicar no catálogo"}
    </Button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  hint?: string;
}

function Field({ label, name, hint, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className={FIELD}
        {...props}
      />
      {hint ? (
        <p id={`${name}-hint`} className="mt-1 text-xs text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={FIELD}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-3.5 cursor-pointer accent-brand-500"
      />
      <span>
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        <span className="block text-xs text-ink-400">{hint}</span>
      </span>
    </label>
  );
}
