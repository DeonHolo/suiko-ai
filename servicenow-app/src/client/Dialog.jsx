import React, { useEffect, useId, useRef } from 'react';

export default function Dialog({ title, children, onClose, busy = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => {
    event.preventDefault();
    if (!busy) onClose();
  }}>
    <h2 id={titleId}>{title}</h2>
    {children}
  </dialog>;
}
