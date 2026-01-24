"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface RoscoeInstance {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

const ROSCOE_COUNT = 50;
const DURATION = 3000;
const SIZE_MIN = 20;
const SIZE_MAX = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function BouncingRoscoe({ onComplete }: { onComplete: () => void }) {
  const [roscoes, setRoscoes] = useState<RoscoeInstance[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const initial: RoscoeInstance[] = Array.from(
      { length: ROSCOE_COUNT },
      (_, i) => ({
        id: i,
        x: randomBetween(0, window.innerWidth - SIZE_MAX),
        y: randomBetween(0, window.innerHeight - SIZE_MAX),
        vx: randomBetween(-6, 6) || 3,
        vy: randomBetween(-6, 6) || 3,
        rotation: randomBetween(0, 360),
        rotationSpeed: randomBetween(-8, 8),
        size: randomBetween(SIZE_MIN, SIZE_MAX),
      }),
    );

    setRoscoes(initial);
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      if (time - startTimeRef.current > DURATION) {
        onComplete();
        return;
      }

      setRoscoes((prev) =>
        prev.map((r) => {
          let newX = r.x + r.vx;
          let newY = r.y + r.vy;
          let newVx = r.vx;
          let newVy = r.vy;

          if (newX <= 0 || newX >= window.innerWidth - r.size) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(newX, window.innerWidth - r.size));
          }
          if (newY <= 0 || newY >= window.innerHeight - r.size) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(newY, window.innerHeight - r.size));
          }

          return {
            ...r,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: r.rotation + r.rotationSpeed,
          };
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {roscoes.map((r) => (
        <div
          key={r.id}
          className="absolute"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            transform: `rotate(${r.rotation}deg)`,
          }}
        >
          <Image
            src="/icons/cartoon_roscoe.png"
            alt="Roscoe"
            width={r.size}
            height={r.size}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}
