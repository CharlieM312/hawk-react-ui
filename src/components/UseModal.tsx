import { useState } from 'react';

export default function UseModal() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  }

  return {
    isOpen,
    toggle
  };
}
