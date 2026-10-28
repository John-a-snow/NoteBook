
export function initKeyboardOnlyMode(): void {
  if (typeof window === 'undefined') return;

  const blockMouseOrPointer = (e: Event): void => {
    if (window.PointerEvent && e instanceof PointerEvent) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen' || e.pointerType === 'touch') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
    }


    if (e instanceof MouseEvent) {
  
      if (e.type === 'click' && e.detail === 0 && e.clientX === 0 && e.clientY === 0) {
        return; 
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  const mouseEvents = [
    'pointerdown',
    'pointerup',
    'pointermove',
    'pointerover',
    'pointerout',
    'pointerenter',
    'pointerleave',
    'mousedown',
    'mouseup',
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseenter',
    'mouseleave',
    'click',
    'dblclick',
    'contextmenu',
    'touchstart',
    'touchend',
    'touchmove',
  ];

  mouseEvents.forEach((evt) => {
    window.addEventListener(evt, blockMouseOrPointer, { capture: true, passive: false });
  });
}

