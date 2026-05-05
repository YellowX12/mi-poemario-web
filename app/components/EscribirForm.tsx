'use client';

import { useState, type ClipboardEvent } from 'react';

type EscribirFormProps = {
  error: boolean;
  guardarPoema: (formData: FormData) => Promise<void>;
};

export default function EscribirForm({ error, guardarPoema }: EscribirFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
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
            aria-describedby="titulo-help"
          />
        </label>
        <span id="titulo-help" className="nota-accesible">
          Puedes escribir o pegar el título directamente.
        </span>

        <label className="form-label" htmlFor="contenido">
          Contenido del poema
          <textarea
            id="contenido"
            name="contenido"
            placeholder="Escribe aquí... (Puedes usar enter libremente)"
            required
            rows={15}
            aria-describedby="contenido-help"
          />
        </label>
        <span id="contenido-help" className="nota-accesible">
          Puedes escribir o pegar el contenido directamente en el área de texto.
        </span>

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
