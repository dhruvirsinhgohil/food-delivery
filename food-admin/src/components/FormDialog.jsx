import { useState } from "react";
import { FiX } from "react-icons/fi";

function FormDialog({ title, description, fields, initialValues = {}, busy, error, onClose, onSubmit }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [
      field.name,
      initialValues[field.name] ?? field.defaultValue ?? (field.type === "checkbox" ? false : ""),
    ])));

  const change = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog-header"><div><div className="eyebrow">WORKSPACE EDITOR</div><h2 id="dialog-title">{title}</h2><p>{description}</p></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><FiX /></button></header>
        <form onSubmit={submit}>
          <div className="dialog-fields">
            {fields.map((field) => <label className={`form-field ${field.type === "checkbox" ? "checkbox-field" : ""}`} key={field.name}>
              {field.type === "checkbox" ? <><input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => change(field.name, event.target.checked)} /><span>{field.label}</span></> : <>{field.label}{field.type === "textarea" ? <textarea value={values[field.name] ?? ""} placeholder={field.placeholder || ""} required={field.required} rows={3} onChange={(event) => change(field.name, event.target.value)} /> : field.type === "select" ? <select value={values[field.name] ?? ""} required={field.required} onChange={(event) => change(field.name, event.target.value)}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "file" ? <input type="file" accept={field.accept} required={field.required} onChange={(event) => change(field.name, event.target.files?.[0] || null)} /> : <input type={field.type || "text"} value={values[field.name] ?? ""} required={field.required} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || ""} onChange={(event) => change(field.name, event.target.value)} />}</>}
            </label>)}
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="dialog-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
        </form>
      </section>
    </div>
  );
}

export default FormDialog;
