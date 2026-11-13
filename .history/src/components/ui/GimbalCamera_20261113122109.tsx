'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Procedural 3-axis gimbal holding a camera.
 *
 * The handle sways like it is being carried (layered sine noise). The three
 * motors (yaw → roll → pitch) counter that sway while the camera tracks the
 * pointer, so the lens stays steady while the grip moves. Each motor has a
 * slightly different response speed, which leaves a small, realistic residual
 * wobble. When the pointer is idle the camera sweeps on its own.
 *
 * Needs: npm i three @types/three
 */

type Props = {
    className?: string;
    /** Camera follows the pointer. Default true. */
    interactive?: boolean;
    /** Multiplier for handheld sway. 0 = locked-off tripod. Default 1. */
    shake?: number;
};

const damp = (a: number, b: number, k: number, dt: number) =>
    a + (b - a) * (1 - Math.exp(-k * dt));

// Smooth pseudo-noise in roughly -1..1 from three incommensurate sines
const wobble = (t: number, seed: number) =>
    Math.sin(t + seed) * 0.5 +
    Math.sin(t * 2.31 + seed * 2.1) * 0.3 +
    Math.sin(t * 4.73 + seed * 3.7) * 0.2;

export default function GimbalCamera({
    className = '',
    interactive = true,
    shake = 1,
}: Props) {
    const host = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = host.current;
        if (!el) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const sway = reduced ? 0 : shake;

        /* ---------- Renderer / scene ---------- */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();

        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        scene.environmentIntensity = 0.55;

        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(3, 5, 4);
        scene.add(key);

        const rim = new THREE.DirectionalLight(0x8fb4ff, 2.2);
        rim.position.set(-4, 3, -3);
        scene.add(rim);

        const view = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        view.position.set(3.2, 2.4, 7.6);
        view.lookAt(0, 1.45, 0);

        /* ---------- Materials ---------- */
        const graphite = new THREE.MeshStandardMaterial({
            color: 0x1b1c20,
            roughness: 0.55,
            metalness: 0.25,
        });
        const rubber = new THREE.MeshStandardMaterial({
            color: 0x101114,
            roughness: 0.9,
            metalness: 0,
        });
        const silver = new THREE.MeshStandardMaterial({
            color: 0xc3c6cc,
            roughness: 0.32,
            metalness: 1,
        });
        const darkMetal = new THREE.MeshStandardMaterial({
            color: 0x2c2f36,
            roughness: 0.4,
            metalness: 0.9,
        });
        const glass = new THREE.MeshPhysicalMaterial({
            color: 0x070a16,
            roughness: 0.04,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
            iridescence: 1,
            iridescenceIOR: 1.6,
        });
        const led = new THREE.MeshStandardMaterial({
            color: 0x330000,
            emissive: 0xff2a1a,
            emissiveIntensity: 2,
        });

        /* ---------- Helpers ---------- */
        const add = (
            geo: THREE.BufferGeometry,
            mat: THREE.Material,
            parent: THREE.Object3D,
            pos: [number, number, number] = [0, 0, 0],
            rot: [number, number, number] = [0, 0, 0],
        ) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(...pos);
            m.rotation.set(...rot);
            parent.add(m);
            return m;
        };
        const HALF = Math.PI / 2;
        const cylZ: [number, number, number] = [HALF, 0, 0]; // cylinder along Z
        const cylX: [number, number, number] = [0, 0, HALF]; // cylinder along X

        /* ---------- Hierarchy: root → yaw → roll → pitch ---------- */
        const root = new THREE.Group(); // gets the handheld sway
        root.rotation.order = 'YXZ';
        scene.add(root);

        // Handle
        add(new THREE.CylinderGeometry(0.1, 0.09, 0.9, 32), rubber, root, [0, 0.45, 0]);
        add(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 32), silver, root, [0, 0.92, 0]);
        add(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32), silver, root, [0, 0.03, 0]);
        add(new THREE.SphereGeometry(0.045, 20, 20), graphite, root, [0.1, 0.72, 0.08]); // thumb stick
        add(new RoundedBoxGeometry(0.06, 0.12, 0.05, 3, 0.02), darkMetal, root, [0.0, 0.62, 0.11]); // trigger

        // Yaw stage
        const yaw = new THREE.Group();
        yaw.position.set(0, 1.0, 0);
        root.add(yaw);
        add(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 40), darkMetal, yaw);
        add(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 40), silver, yaw, [0, 0.1, 0]);
        add(new RoundedBoxGeometry(0.1, 0.1, 0.62, 3, 0.03), silver, yaw, [0, 0, -0.3]);
        add(new RoundedBoxGeometry(0.1, 1.06, 0.1, 3, 0.03), silver, yaw, [0, 0.5, -0.6]);
        // Roll motor (fixed part)
        add(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 40), darkMetal, yaw, [0, 1.0, -0.66], cylZ);

        // Roll stage
        const roll = new THREE.Group();
        roll.position.set(0, 1.0, 0);
        yaw.add(roll);
        add(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 32), silver, roll, [0, 0, -0.54], cylZ);
        add(new RoundedBoxGeometry(1.34, 0.1, 0.1, 3, 0.03), silver, roll, [0, 0, -0.5]);
        for (const s of [-1, 1]) {
            add(new RoundedBoxGeometry(0.1, 0.1, 0.58, 3, 0.03), silver, roll, [s * 0.62, 0, -0.22]);
            add(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 40), darkMetal, roll, [s * 0.66, 0, 0], cylX);
        }

        // Pitch stage (camera)
        const pitch = new THREE.Group();
        roll.add(pitch);
        for (const s of [-1, 1]) {
            add(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 20), silver, pitch, [s * 0.46, 0, 0], cylX);
        }
        add(new RoundedBoxGeometry(0.7, 0.5, 0.5, 5, 0.06), graphite, pitch); // body
        add(new RoundedBoxGeometry(0.2, 0.1, 0.24, 3, 0.03), graphite, pitch, [0, 0.3, -0.05]); // viewfinder
        add(new RoundedBoxGeometry(0.16, 0.34, 0.2, 3, 0.04), rubber, pitch, [0.3, -0.02, 0.28]); // grip bump
        add(new THREE.CylinderGeometry(0.24, 0.26, 0.1, 48), darkMetal, pitch, [0, 0, 0.3], cylZ); // mount
        add(new THREE.CylinderGeometry(0.2, 0.21, 0.4, 48), graphite, pitch, [0, 0, 0.52], cylZ); // barrel
        for (const z of [0.46, 0.58]) {
            add(new THREE.CylinderGeometry(0.215, 0.215, 0.05, 48), silver, pitch, [0, 0, z], cylZ); // rings
        }
        add(
            new THREE.CylinderGeometry(0.25, 0.22, 0.16, 48, 1, true),
            rubber,
            pitch,
            [0, 0, 0.78],
            cylZ,
        ).material.side = THREE.DoubleSide; // hood
        add(new THREE.CircleGeometry(0.17, 48), glass, pitch, [0, 0, 0.725]); // front element
        const ledMesh = add(new THREE.SphereGeometry(0.025, 16, 16), led, pitch, [-0.26, 0.16, 0.252]);
        void ledMesh;

        /* ---------- Sizing ---------- */
        const resize = () => {
            const w = el.clientWidth || 1;
            const h = el.clientHeight || 1;
            renderer.setSize(w, h, false);
            view.aspect = w / h;
            view.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        /* ---------- Pointer ---------- */
        const ptr = { x: 0, y: 0 };
        let lastMove = -Infinity;
        const onMove = (e: PointerEvent) => {
            ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
            ptr.y = -((e.clientY / window.innerHeight) * 2 - 1);
            lastMove = performance.now();
        };
        if (interactive) window.addEventListener('pointermove', onMove, { passive: true });

        /* ---------- Loop ---------- */
        const clock = new THREE.Clock();
        let t = 0;
        let aimYaw = 0;
        let aimPitch = 0;

        renderer.setAnimationLoop(() => {
            const dt = Math.min(clock.getDelta(), 0.05);
            t += dt;

            // 1) Handheld sway on the grip
            root.rotation.y = wobble(t * 0.6, 3) * 0.12 * sway;
            root.rotation.x = wobble(t * 0.9, 1) * 0.07 * sway;
            root.rotation.z = wobble(t * 0.8, 2) * 0.09 * sway;
            root.position.x = wobble(t * 0.7, 4) * 0.08 * sway;
            root.position.y = (wobble(t * 1.1, 5) * 0.05 + Math.sin(t * 3.2) * 0.015) * sway;

            // 2) Where the camera wants to look (world space)
            const active = interactive && performance.now() - lastMove < 2500;
            let tYaw: number;
            let tPitch: number;
            if (active) {
                tYaw = ptr.x * 0.95;
                tPitch = -ptr.y * 0.5; // +x rotation tilts the lens down
            } else if (reduced) {
                tYaw = 0.25;
                tPitch = 0;
            } else {
                tYaw = Math.sin(t * 0.4) * 0.85 + Math.sin(t * 0.9) * 0.1;
                tPitch = Math.sin(t * 0.55 + 1) * 0.22 + 0.05;
            }
            aimYaw = damp(aimYaw, tYaw, active ? 4 : 1.6, dt);
            aimPitch = damp(aimPitch, tPitch, active ? 4 : 1.6, dt);

            // 3) Motors counter the sway so the lens keeps its heading.
            //    Different speeds per axis leave a little believable residual wobble.
            yaw.rotation.y = damp(yaw.rotation.y, aimYaw - root.rotation.y, 9, dt);
            roll.rotation.z = damp(roll.rotation.z, -root.rotation.z, 14, dt);
            pitch.rotation.x = damp(pitch.rotation.x, aimPitch - root.rotation.x, 12, dt);

            // 4) Record light
            led.emissiveIntensity = Math.sin(t * 3) > 0 ? 2.5 : 0.15;

            renderer.render(scene, view);
        });

        /* ---------- Cleanup ---------- */
        return () => {
            renderer.setAnimationLoop(null);
            ro.disconnect();
            window.removeEventListener('pointermove', onMove);
            scene.traverse((o) => {
                if (o instanceof THREE.Mesh) o.geometry.dispose();
            });
            [graphite, rubber, silver, darkMetal, glass, led].forEach((m) => m.dispose());
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [interactive, shake]);

    return (
        <div
            ref={host}
            role="img"
            aria-label="A camera on a three-axis gimbal that follows the cursor"
            className={`relative h-full min-h-[320px] w-full ${className}`}
        />
    );
}