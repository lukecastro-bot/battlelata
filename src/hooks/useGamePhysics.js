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
  Mouse,
  MouseConstraint,
} from 'matter-js';

const useGamePhysics = (canvasRef, onCanHit) => {
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const slipperRef = useRef(null);
  const canRef = useRef(null);

  // Track drag start manually
  let dragStart = null;

  const setupPhysics = useCallback(() => {
    if (!canvasRef.current) return;

    const engine = Engine.create();
    engineRef.current = engine;
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
    const slipper = Bodies.circle(100, 500, 20, {
      inertia: Infinity,
      frictionAir: 0.03,
      restitution: 0.8,
      density: 0.005,
      label: 'slipper',
      render: {
        sprite: {
          texture: require('../assets/images/slipper.png'),
          xScale: 0.1,
          yScale: 0.1,
        },
      },
    });
    slipperRef.current = slipper;

    // Tin can
    const can = Bodies.rectangle(400, 500, 40, 60, {
      isStatic: true,
      label: 'can',
      render: {
        sprite: {
          texture: require('../assets/images/tin_can.png'),
          xScale: 0.2,
          yScale: 0.2,
        },
      },
    });
    canRef.current = can;

    World.add(world, [ground, leftWall, rightWall, ceiling, slipper, can]);

    // Mouse constraint
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(world, mouseConstraint);

    // Remember drag start
    Events.on(mouseConstraint, 'startdrag', (event) => {
      if (event.body === slipper) {
        dragStart = { ...event.mouse.position };
      }
    });

    // Release slipper (throw)
    Events.on(mouseConstraint, 'enddrag', (event) => {
      if (event.body === slipper && dragStart) {
        const dx = event.mouse.position.x - dragStart.x;
        const dy = event.mouse.position.y - dragStart.y;
        const angle = Math.atan2(dy, dx);
        const forceMagnitude = 0.05 * slipper.mass;

        Body.applyForce(slipper, slipper.position, {
          x: Math.cos(angle) * forceMagnitude,
          y: Math.sin(angle) * forceMagnitude,
        });

        dragStart = null;
      }
    });

    // Collision detection
    Events.on(engine, 'collisionStart', (event) => {
      for (let pair of event.pairs) {
        if (
          (pair.bodyA.label === 'slipper' && pair.bodyB.label === 'can') ||
          (pair.bodyA.label === 'can' && pair.bodyB.label === 'slipper')
        ) {
          console.log('Slipper hit the can!');
          if (canRef.current) {
            World.remove(world, canRef.current);
            const newCan = Bodies.rectangle(
              canRef.current.position.x,
              canRef.current.position.y,
              40,
              60,
              {
                isStatic: false,
                label: 'can',
                render: {
                  sprite: {
                    texture: require('../assets/images/tin_can.png'),
                    xScale: 0.2,
                    yScale: 0.2,
                  },
                },
              }
            );
            World.add(world, newCan);
            canRef.current = newCan;
          }
          onCanHit();
        }
      }
    });

    // Cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [canvasRef, onCanHit]);

  useEffect(() => {
    setupPhysics();
  }, [setupPhysics]);

  // Reset slipper
  const resetSlipper = useCallback(() => {
    if (slipperRef.current && engineRef.current) {
      World.remove(engineRef.current.world, slipperRef.current);
      const newSlipper = Bodies.circle(100, 500, 20, {
        inertia: Infinity,
        frictionAir: 0.03,
        restitution: 0.8,
        density: 0.005,
        label: 'slipper',
        render: {
          sprite: {
            texture: require('../assets/images/slipper.png'),
            xScale: 0.1,
            yScale: 0.1,
          },
        },
      });
      World.add(engineRef.current.world, newSlipper);
      slipperRef.current = newSlipper;
    }
  }, []);

  // Reset can
  const resetCan = useCallback(() => {
    if (canRef.current && engineRef.current) {
      World.remove(engineRef.current.world, canRef.current);
      const newCan = Bodies.rectangle(400, 500, 40, 60, {
        isStatic: true,
        label: 'can',
        render: {
          sprite: {
            texture: require('../assets/images/tin_can.png'),
            xScale: 0.2,
            yScale: 0.2,
          },
        },
      });
      World.add(engineRef.current.world, newCan);
      canRef.current = newCan;
    }
  }, []);

  return { resetSlipper, resetCan };
};

export default useGamePhysics;
