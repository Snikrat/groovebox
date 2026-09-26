import { useState } from 'react';
import { LogModal } from './LogModal';

/** Registro rápido: nota, texto e data de audição num só passo, sem sair da tela atual. */
export function LogButton({ musicbrainzId }: { musicbrainzId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="log-button" onClick={() => setIsOpen(true)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Registrar
      </button>
      {isOpen && <LogModal musicbrainzId={musicbrainzId} onClose={() => setIsOpen(false)} />}
    </>
  );
}
