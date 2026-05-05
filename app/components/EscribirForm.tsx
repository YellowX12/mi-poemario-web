'use client';

import { useState, type ClipboardEvent } from 'react';

type EscribirFormProps = {
  error: boolean;
  guardarPoema: (formData: FormData) => Promise<void>;
};

export default function EscribirForm({ error, guardarPoema }: EscribirFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteMessage, setPasteMessage] = useState('');

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  const handlePreventPaste = (event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault();
    setPasteMessage('Pegar texto está deshabilitado para que escribas tu poema directamente.');
    window.setTimeout(() => setPasteMessage(''), 4000);
  };

  return (
    <>
      {isSubmitting && (
        <div className="loading-overlay" role="status" aria-live="polite" aria-label="Subiendo poema">
          <div className="loading-card">
            <div className="loading-spinner" aria-hidden="true" />
            <p>Subiendo tu poema... espera un momento.</p>
          </div>
        </div>
      )}
      <form action={guardarPoema} className="formulario-auth" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="titulo">
          Título del poema
          <input
            id="titulo"
            type="text"
            name="titulo"
            placeholder="Título del poema"
            required
            onPaste={handlePreventPaste}
            aria-describedby="titulo-help"
          />
        </label>
        <span id="titulo-help" className="nota-accesible">
          Escribe el título directamente. Pegar contenido está deshabilitado.
        </span>

        <label className="form-label" htmlFor="contenido">
          Contenido del poema
          <textarea
            id="contenido"
            name="contenido"
            placeholder="Escribe aquí... (Puedes usar enter libremente)"
            required
            rows={15}
            onPaste={handlePreventPaste}
            aria-describedby="contenido-help"
          />
        </label>
        <span id="contenido-help" className="nota-accesible">
          Para fomentar la creación original, el pegado está deshabilitado en este campo.
        </span>

        {pasteMessage && (
          <div className="mensaje-pegar" role="status" aria-live="polite">
            {pasteMessage}
          </div>
        )}

        {error && (
          <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
            El título y el contenido son obligatorios para publicar.
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publicando...' : 'Publicar Poema'}
        </button>
      </form>
    </>
  );
}
