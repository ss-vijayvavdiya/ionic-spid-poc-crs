/**
 * Trigger confetti celebration. Uses canvas-confetti.
 */
import confetti from 'canvas-confetti';

export function triggerReceiptCelebration(): void {
  const duration = 1500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#2dd36f', '#3880ff', '#ffc409'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#2dd36f', '#3880ff', '#ffc409'],
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
