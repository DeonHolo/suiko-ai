import React, { useLayoutEffect, useId, useRef } from 'react';

export default function Dialog({ title, children, onClose, busy = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (opener?.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => {
    event.preventDefault();
    if (!busy) onClose();
  }}>
    <h2 id={titleId}>{title}</h2>
    {children}
  </dialog>;
}
