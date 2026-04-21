"use client";

import { useEffect, useState, useRef } from "react";
import getCaretCoordinates from "textarea-caret";

export default function NinjaCursor({ targetRef, isActive = false }) {
  const rafRef = useRef(null);
  const wrapperRef = useRef(null);
  const cursorRef = useRef(null);
  
  const lastPos = useRef(null);
  const styleCount = useRef(0);
  const isProcessing = useRef(false);

  useEffect(() => {
    const loop = () => {
      const el = targetRef?.current;
      const wrapper = wrapperRef?.current;
      const cursor = cursorRef?.current;
      
      if (!isActive || !el || !wrapper || !cursor) {
        if (wrapper) wrapper.style.setProperty("--cursor-visibility", "hidden");
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isProcessing.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      isProcessing.current = true;

      const caret = getCaretCoordinates(el, el.selectionStart);
      
      // Compute un-scrollable relative mapping
      const rect = {
        x: caret.left - el.scrollLeft,
        y: caret.top - el.scrollTop,
        height: caret.height || parseInt(window.getComputedStyle(el).fontSize, 10) * 1.2 || 26
      };

      if (lastPos.current == null) {
        lastPos.current = rect;
        isProcessing.current = false;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (lastPos.current.x === rect.x && lastPos.current.y === rect.y) {
        wrapper.style.setProperty("--cursor-visibility", "visible");
        isProcessing.current = false;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      styleCount.current = (styleCount.current + 1) % 2;
      const dx = rect.x - lastPos.current.x;
      const dy = lastPos.current.y - rect.y;
      
      const cursorDragAngle = Math.atan2(dx, dy) + Math.PI / 2;
      const cursorDragDistance = Math.sqrt(dx * dx + Math.pow(rect.y - lastPos.current.y, 2));

      const cursorDragHeight =
        Math.abs(Math.sin(cursorDragAngle)) * 8 +
        Math.abs(Math.cos(cursorDragAngle)) * rect.height;
      const cursorDragWidth = cursorDragDistance;

      wrapper.style.setProperty("--cursor-drag-height", `${cursorDragHeight}px`);
      wrapper.style.setProperty("--cursor-drag-width", `${cursorDragWidth}px`);
      wrapper.style.setProperty("--cursor-drag-angle", `${cursorDragAngle}rad`);
      wrapper.style.setProperty("--cursor-height", `${rect.height}px`);
      wrapper.style.setProperty("--cursor-x1", `${lastPos.current.x}px`);
      wrapper.style.setProperty("--cursor-y1", `${lastPos.current.y}px`);
      wrapper.style.setProperty("--cursor-x2", `${rect.x}px`);
      wrapper.style.setProperty("--cursor-y2", `${rect.y}px`);
      wrapper.style.setProperty("--cursor-visibility", "visible");

      cursor.className = `ninja-cursor-head ninja-cursor-anim${styleCount.current}`;
      
      lastPos.current = rect;
      isProcessing.current = false;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetRef, isActive]);

  return (
    <div ref={wrapperRef} className="ninja-cursor-wrapper">
      <div ref={cursorRef} className="ninja-cursor-head" />
    </div>
  );
}
