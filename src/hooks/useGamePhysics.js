// src/hooks/useGamePhysics.js
import { useEffect, useRef, useCallback } from 'react';
import {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Body,
  Events,
  Sleeping,
  // Mouse, // no longer using MouseConstraint for dragging
} from 'matter-js';

const useGamePhysics = (canvasRef, callbacks = {}) => {
  const { onScore, onCanDown, onLevelCleared } = callbacks;
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const slipperRef = useRef(null);
  const cansRef = useRef([]); // array of can bodies
  const knockedSetRef = useRef(new Set());

  // Slingshot config/state
  const anchorRef = useRef({ x: 120, y: 520 });
  const isAimingRef = useRef(false);
  const hasLaunchedRef = useRef(false);
  const dragPosRef = useRef({ x: 120, y: 520 });
  const maxPullRef = useRef(130); // max drag distance in px
  const activePointerIdRef = useRef(null);

  const setupPhysics = useCallback(() => {
    if (!canvasRef.current) return;

    const engine = Engine.create();
    engineRef.current = engine;
    // Ensure gravity is enabled
    engine.world.gravity.y = 1;
    engine.timing.timeScale = 1;
    const world = engine.world;

    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: 'transparent',
      },
    });
    renderRef.current = render;

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Ground and walls
    const ground = Bodies.rectangle(400, 590, 810, 20, {
      isStatic: true,
      label: 'ground',
      render: { fillStyle: '#6a493c' },
    });
    const leftWall = Bodies.rectangle(10, 300, 20, 600, {
      isStatic: true,
      label: 'wall',
      render: { fillStyle: '#6a493c' },
    });
    const rightWall = Bodies.rectangle(790, 300, 20, 600, {
      isStatic: true,
      label: 'wall',
      render: { fillStyle: '#6a493c' },
    });
    const ceiling = Bodies.rectangle(400, 10, 810, 20, {
      isStatic: true,
      label: 'wall',
      render: { fillStyle: '#6a493c' },
    });

    // Slipper
    const slipper = Bodies.circle(anchorRef.current.x, anchorRef.current.y, 20, {
      inertia: Infinity,
      frictionAir: 0.03,
      restitution: 0.8,
      density: 0.005,
      label: 'slipper',
      isStatic: true, // stay put on anchor until launched
      render: {
        sprite: {
          texture: require('../assets/images/slipper.png'),
          xScale: 0.1,
          yScale: 0.1,
        },
      },
    });
    slipperRef.current = slipper;

    World.add(world, [ground, leftWall, rightWall, ceiling, slipper]);

    // Custom slingshot mouse handling
    const canvas = render.canvas;
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const startAim = (e) => {
      if (hasLaunchedRef.current) return; // wait until reset before next shot
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      // Only start if click/touch is inside canvas bounds
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }
      const p = getMousePos(e);
      isAimingRef.current = true;
      console.log('[Sling] startAim', p);
      Body.setStatic(slipper, true);
      // start from anchor for consistent sling behavior
      const a = anchorRef.current;
      dragPosRef.current = { x: a.x, y: a.y };
      Body.setPosition(slipper, a);
      Body.setVelocity(slipper, { x: 0, y: 0 });
      Body.setAngularVelocity(slipper, 0);
      e.preventDefault();
    };

    const moveAim = (e) => {
      if (!isAimingRef.current) return;
      const p = getMousePos(e);
      const a = anchorRef.current;
      // Vector from anchor to current pointer
      let dx = p.x - a.x;
      let dy = p.y - a.y;
      // Clamp pull distance
      const maxPull = maxPullRef.current;
      const len = Math.hypot(dx, dy) || 1;
      if (len > maxPull) {
        dx = (dx / len) * maxPull;
        dy = (dy / len) * maxPull;
      }
      const newPos = { x: a.x + dx, y: a.y + dy };
      dragPosRef.current = newPos;
      // Move slipper body with the drag
      Body.setPosition(slipper, newPos);
      Body.setVelocity(slipper, { x: 0, y: 0 });
      Body.setAngularVelocity(slipper, 0);
      // debug
      // console.log('[Sling] moveAim', newPos);
      e.preventDefault();
    };

    const endAim = (e) => {
      if (!isAimingRef.current) return;
      const a = anchorRef.current;
      const p = dragPosRef.current;
      // Classic slingshot: launch opposite the pull (fly ahead)
      const lx = a.x - p.x;
      const ly = a.y - p.y;
      const pull = Math.hypot(lx, ly);
      if (pull < 5) {
        // too small, cancel
        isAimingRef.current = false;
        e.preventDefault();
        return;
      }
      // Apply velocity proportional to drag distance for reliable launch
      const velScale = 0.08; // stronger (pull 100px => speed ~8)
      Body.setStatic(slipper, false);
      // compute velocity and enforce a minimum speed
      let vx = lx * velScale;
      let vy = ly * velScale;
      const minSpeed = 10; // pixels per step
      const speed = Math.hypot(vx, vy);
      if (speed < minSpeed && speed > 0) {
        const k = minSpeed / speed;
        vx *= k;
        vy *= k;
      }
      Body.setVelocity(slipper, { x: vx, y: vy });
      // Add a matching impulse to guarantee movement
      const forceScale = 0.0015; // tuned small force applied once
      Body.applyForce(slipper, slipper.position, {
        x: vx * forceScale * slipper.mass,
        y: vy * forceScale * slipper.mass,
      });
      Sleeping.set(slipper, false);
      console.log('[Sling] endAim launch', { lx, ly, velX: vx, velY: vy, isStatic: slipper.isStatic });
      isAimingRef.current = false;
      hasLaunchedRef.current = true;
      e.preventDefault();
    };

    // Pointer events with capture to guarantee delivery during drag
    const onPointerDown = (e) => {
      activePointerIdRef.current = e.pointerId ?? activePointerIdRef.current;
      if (e.target && e.pointerId && e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
      startAim(e);
    };
    const onPointerMove = (e) => {
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
      moveAim(e);
    };
    const onPointerUp = (e) => {
      if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
      endAim(e);
      if (e.target && e.pointerId && e.target.releasePointerCapture) {
        e.target.releasePointerCapture(e.pointerId);
      }
      activePointerIdRef.current = null;
    };
    const onPointerCancel = (e) => {
      console.warn('[Sling] pointercancel');
      if (isAimingRef.current) endAim(e);
      activePointerIdRef.current = null;
    };
    const onLostPointerCapture = (e) => {
      console.warn('[Sling] lostpointercapture');
      if (isAimingRef.current) endAim(e);
      activePointerIdRef.current = null;
    };
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerCancel, { passive: false });
    canvas.addEventListener('lostpointercapture', onLostPointerCapture, { passive: false });

    // Draw slingshot bands after render
    const drawBands = () => {
      if (!isAimingRef.current) return; // draw only while aiming
      const ctx = render.context;
      const a = anchorRef.current;
      const sPos = dragPosRef.current;
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'; // golden bands
      ctx.beginPath();
      ctx.moveTo(a.x - 12, a.y);
      ctx.lineTo(sPos.x, sPos.y);
      ctx.lineTo(a.x + 12, a.y);
      ctx.stroke();
      // Anchor base
      ctx.fillStyle = 'rgba(80, 42, 20, 0.9)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const afterRender = () => {
      drawBands();
    };
    Events.on(render, 'afterRender', afterRender);

    // Check for cans knocked down after each update
    Events.on(engine, 'afterUpdate', () => {
      const cans = cansRef.current;
      if (!cans) return;
      let downCount = 0;
      for (const c of cans) {
        const id = c.id;
        const isDown = Math.abs(c.angle) > 0.6 || c.position.y > 540;
        if (isDown) {
          downCount++;
          if (!knockedSetRef.current.has(id)) {
            knockedSetRef.current.add(id);
            // add hit/knock effect
            Body.setAngularVelocity(c, (Math.random() - 0.5) * 0.5);
            onCanDown && onCanDown();
          }
        }
      }
      // Level cleared when all cans are down
      if (cans.length > 0 && downCount === cans.length) {
        onLevelCleared && onLevelCleared();
      }
    });

    // Collision detection (slipper hits any can)
    Events.on(engine, 'collisionStart', (event) => {
      for (let pair of event.pairs) {
        const a = pair.bodyA;
        const b = pair.bodyB;
        const hit =
          (a.label === 'slipper' && b.label && b.label.startsWith('can')) ||
          (a.label && a.label.startsWith('can') && b.label === 'slipper');
        if (hit) {
          const slipperBody = slipperRef.current;
          // Determine which body is the can
          const can = a.label === 'slipper' ? b : a;
          if (can && slipperBody) {
            // Make the can dynamic (allow movement) and transfer impulse based on slipper velocity
            Body.setStatic(can, false);
            const v = slipperBody.velocity;
            const impulseScale = 0.02; // tune for feel
            Body.applyForce(can, can.position, {
              x: v.x * impulseScale * can.mass,
              y: v.y * impulseScale * can.mass,
            });
            Body.setAngularVelocity(can, (Math.random() - 0.5) * 1.2);
          }
          onScore && onScore(10);
        }
      }
    });

    // Cleanup
    return () => {
      // Remove event listeners and hooks
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('lostpointercapture', onLostPointerCapture);
      Events.off(render, 'afterRender', afterRender);

      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [canvasRef]);

  useEffect(() => {
    setupPhysics();
  }, [setupPhysics]);

  // Reset slipper
  const resetSlipper = useCallback(() => {
    if (slipperRef.current && engineRef.current) {
      // Reset slipper back to anchor and make static for next shot
      const a = anchorRef.current;
      Body.setPosition(slipperRef.current, { x: a.x, y: a.y });
      Body.setAngle(slipperRef.current, 0);
      Body.setVelocity(slipperRef.current, { x: 0, y: 0 });
      Body.setAngularVelocity(slipperRef.current, 0);
      Body.setStatic(slipperRef.current, true);
      // Reset slingshot state flags
      isAimingRef.current = false;
      hasLaunchedRef.current = false;
    }
  }, []);

  // Build a pyramid of cans
  const setupLevel = useCallback((totalCans = 5) => {
    if (!engineRef.current) return;
    const world = engineRef.current.world;
    // Remove existing cans
    if (cansRef.current.length) {
      for (const c of cansRef.current) {
        World.remove(world, c);
      }
    }
    cansRef.current = [];
    knockedSetRef.current = new Set();
    // Can dimensions (smaller cans to fit larger pyramids)
    const cw = 24;
    const ch = 28;
    // Base position
    const baseX = 600;
    const baseY = 565; // ground is at y=590
    // compute rows for pyramid close to totalCans
    let rows = 1;
    while ((rows * (rows + 1)) / 2 <= totalCans) rows++;
    rows = Math.max(1, rows - 1);
    let created = 0;
    for (let r = 0; r < rows; r++) {
      const cols = rows - r;
      for (let c = 0; c < cols && created < totalCans; c++) {
        const x = baseX + (c - (cols - 1) / 2) * (cw + 4);
        const y = baseY - r * (ch + 4);
        const can = Bodies.rectangle(x, y, cw, ch, {
          isStatic: false,
          label: `can_${created}`,
          render: {
            sprite: {
              texture: require('../assets/images/tin_can.png'),
              xScale: 0.12,
              yScale: 0.12,
            },
          },
        });
        cansRef.current.push(can);
        created++;
      }
    }
    World.add(world, cansRef.current);
  }, []);

  return { resetSlipper, setupLevel };
};

export default useGamePhysics;
