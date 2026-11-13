'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Detailed procedural cine camera on a 3-axis handheld gimbal.
 *
 * - Handheld sway on the grip, countered by three motors (yaw → roll → pitch)
 *   so the lens keeps its heading. Camera tracks the pointer, or sweeps on
 *   its own when idle.
 * - Everything is generated in code: canvas textures for knurling, brushed
 *   metal, lens scale and screens; no model files.
 * - Live details: the handle display shows the real pan/tilt/roll angles,
 *   the focus ring pulls, the iris breathes, the record light blinks.
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

type V3 = [number, number, number];

const HALF = Math.PI / 2;
const TAU = Math.PI * 2;
const RAD2DEG = 180 / Math.PI;

const damp = (a: number, b: number, k: number, dt: number) =>
    a + (b - a) * (1 - Math.exp(-k * dt));

const wobble = (t: number, seed: number) =>
    Math.sin(t + seed) * 0.5 +
    Math.sin(t * 2.31 + seed * 2.1) * 0.3 +
    Math.sin(t * 4.73 + seed * 3.7) * 0.2;

const mulberry = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const signed = (n: number, digits = 1) => (n >= 0 ? '+' : '') + n.toFixed(digits);

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
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        scene.environmentIntensity = 0.6;

        const key = new THREE.DirectionalLight(0xffffff, 2.6);
        key.position.set(3, 5, 4);
        key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.left = -3;
        key.shadow.camera.right = 3;
        key.shadow.camera.top = 4;
        key.shadow.camera.bottom = -1;
        key.shadow.camera.near = 0.5;
        key.shadow.camera.far = 20;
        key.shadow.bias = -0.0004;
        key.shadow.normalBias = 0.02;
        const rim = new THREE.DirectionalLight(0x8fb4ff, 2.2);
        rim.position.set(-4, 3, -3);
        const fill = new THREE.DirectionalLight(0xffe2c8, 0.5);
        fill.position.set(-3, 1, 5);
        scene.add(key, rim, fill);

        const view = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        view.position.set(3.2, 2.4, 7.8);
        view.lookAt(0, 1.5, 0);

        /* ---------- Tracking for disposal ---------- */
        const disposables: { dispose(): void }[] = [];
        const track = <T extends { dispose(): void }>(d: T): T => {
            disposables.push(d);
            return d;
        };

        /* ---------- Procedural textures ---------- */
        const makeTex = (
            w: number,
            h: number,
            draw: (c: CanvasRenderingContext2D, w: number, h: number) => void,
            repeat: [number, number] = [1, 1],
            srgb = false,
        ) => {
            const cv = document.createElement('canvas');
            cv.width = w;
            cv.height = h;
            const c = cv.getContext('2d')!;
            draw(c, w, h);
            const tx = track(new THREE.CanvasTexture(cv));
            tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
            tx.repeat.set(repeat[0], repeat[1]);
            tx.anisotropy = renderer.capabilities.getMaxAnisotropy();
            if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
            return tx;
        };

        const rnd = mulberry(7);

        const brushed = makeTex(512, 512, (c, w, h) => {
            c.fillStyle = '#8a8a8a';
            c.fillRect(0, 0, w, h);
            for (let i = 0; i < 2400; i++) {
                const g = (100 + rnd() * 110) | 0;
                c.strokeStyle = `rgba(${g},${g},${g},0.55)`;
                c.lineWidth = 0.4 + rnd() * 1.2;
                const y = rnd() * h;
                c.beginPath();
                c.moveTo(0, y);
                c.lineTo(w, y + (rnd() - 0.5) * 3);
                c.stroke();
            }
        });

        const leather = makeTex(
            128,
            128,
            (c, w, h) => {
                c.fillStyle = '#777';
                c.fillRect(0, 0, w, h);
                for (let i = 0; i < 2600; i++) {
                    const g = (60 + rnd() * 150) | 0;
                    c.fillStyle = `rgb(${g},${g},${g})`;
                    c.beginPath();
                    c.arc(rnd() * w, rnd() * h, 0.7 + rnd() * 1.4, 0, TAU);
                    c.fill();
                }
            },
            [3, 3],
        );

        const foam = makeTex(
            128,
            128,
            (c, w, h) => {
                c.fillStyle = '#666';
                c.fillRect(0, 0, w, h);
                for (let i = 0; i < 4200; i++) {
                    const g = (40 + rnd() * 190) | 0;
                    c.strokeStyle = `rgb(${g},${g},${g})`;
                    c.lineWidth = 0.8;
                    const x = rnd() * w;
                    const y = rnd() * h;
                    c.beginPath();
                    c.moveTo(x, y);
                    c.lineTo(x + (rnd() - 0.5) * 6, y + (rnd() - 0.5) * 6);
                    c.stroke();
                }
            },
            [2, 4],
        );

        const knurlTex = (rx: number, ry: number) =>
            makeTex(
                64,
                64,
                (c, w, h) => {
                    c.fillStyle = '#000';
                    c.fillRect(0, 0, w, h);
                    c.strokeStyle = '#fff';
                    c.lineWidth = 5;
                    for (let k = -h; k <= w + h; k += 32) {
                        c.beginPath();
                        c.moveTo(k, 0);
                        c.lineTo(k + h, h);
                        c.stroke();
                        c.beginPath();
                        c.moveTo(k + h, 0);
                        c.lineTo(k, h);
                        c.stroke();
                    }
                },
                [rx, ry],
            );

        const ribTex = (n: number) =>
            makeTex(
                16,
                16,
                (c, w, h) => {
                    c.fillStyle = '#000';
                    c.fillRect(0, 0, w, h);
                    c.fillStyle = '#fff';
                    c.fillRect(0, 0, w * 0.55, h);
                },
                [n, 1],
            );

        // Distance scale printed around the lens barrel
        const lensScale = makeTex(
            1024,
            72,
            (c, w) => {
                c.fillStyle = '#14161a';
                c.fillRect(0, 0, w, 72);
                c.fillStyle = '#e6e7ea';
                c.strokeStyle = '#e6e7ea';
                c.lineWidth = 2;
                c.textAlign = 'center';
                c.font = '600 26px ui-monospace, Menlo, monospace';
                const marks = ['0.5', '0.7', '1', '1.5', '2', '3', '5', '∞'];
                const per = w / 2;
                for (let r = 0; r < 2; r++) {
                    marks.forEach((m, i) => {
                        const x = r * per + ((i + 0.5) * per) / marks.length;
                        c.fillText(m, x, 30);
                        c.beginPath();
                        c.moveTo(x, 40);
                        c.lineTo(x, 62);
                        c.stroke();
                    });
                    for (let k = 0; k < 40; k++) {
                        const x = r * per + (k / 40) * per;
                        c.beginPath();
                        c.moveTo(x, 52);
                        c.lineTo(x, 62);
                        c.stroke();
                    }
                }
            },
            [1, 1],
            true,
        );

        // Front brand plate
        const plateTex = makeTex(
            256,
            64,
            (c, w, h) => {
                c.fillStyle = '#17181b';
                c.fillRect(0, 0, w, h);
                c.fillStyle = '#d9dbe0';
                c.textBaseline = 'middle';
                c.font = '700 34px ui-sans-serif, system-ui, sans-serif';
                c.fillText('KOR8', 14, h / 2 + 1);
                c.fillStyle = '#7d828c';
                c.font = '500 15px ui-monospace, Menlo, monospace';
                c.textAlign = 'right';
                c.fillText('kor8.in', w - 14, h / 2 + 1);
            },
            [1, 1],
            true,
        );

        /* ---------- Live screens ---------- */
        const makeScreen = (w: number, h: number) => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d')!;
            const tex = track(new THREE.CanvasTexture(canvas));
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            const m = track(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
            return { ctx, tex, mat: m };
        };
        const oled = makeScreen(192, 112);
        const topLcd = makeScreen(256, 112);

        const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

        const drawOled = (pan: number, tilt: number, rollD: number, recOn: boolean) => {
            const c = oled.ctx;
            c.fillStyle = '#04070a';
            c.fillRect(0, 0, 192, 112);
            c.textBaseline = 'top';
            c.textAlign = 'left';
            c.font = `600 14px ${MONO}`;
            c.fillStyle = '#7b8494';
            c.fillText('FOLLOW', 10, 8);
            if (recOn) {
                c.fillStyle = '#ff4a2b';
                c.beginPath();
                c.arc(172, 15, 6, 0, TAU);
                c.fill();
            }
            const rows: [string, number][] = [
                ['PAN', pan],
                ['TLT', tilt],
                ['ROL', rollD],
            ];
            rows.forEach(([label, v], i) => {
                const y = 36 + i * 24;
                c.fillStyle = '#7b8494';
                c.font = `600 14px ${MONO}`;
                c.textAlign = 'left';
                c.fillText(label, 10, y);
                c.fillStyle = '#e8f1ff';
                c.font = `600 19px ${MONO}`;
                c.textAlign = 'right';
                c.fillText(`${signed(v)}°`, 182, y - 2);
            });
            oled.tex.needsUpdate = true;
        };

        const drawTop = (tcSeconds: number, recOn: boolean) => {
            const c = topLcd.ctx;
            c.fillStyle = '#0a0d0b';
            c.fillRect(0, 0, 256, 112);
            c.textBaseline = 'top';
            c.textAlign = 'left';
            c.fillStyle = '#9fd8a8';
            c.font = `600 20px ${MONO}`;
            c.fillText('24p  1/48  T1.8', 12, 10);
            c.fillText('ISO 800  5600K', 12, 38);
            const f = Math.floor((tcSeconds % 1) * 24);
            const s = Math.floor(tcSeconds) % 60;
            const m = Math.floor(tcSeconds / 60) % 60;
            const p = (n: number) => String(n).padStart(2, '0');
            c.fillStyle = recOn ? '#ff6a4d' : '#9fd8a8';
            c.font = `700 26px ${MONO}`;
            c.fillText(`${p(0)}:${p(m)}:${p(s)}:${p(f)}`, 12, 70);
            topLcd.tex.needsUpdate = true;
        };

        /* ---------- Materials ---------- */
        const mat = <T extends THREE.Material>(m: T) => track(m);

        const silver = mat(
            new THREE.MeshStandardMaterial({
                color: 0xc9ccd2,
                metalness: 1,
                roughness: 0.75,
                roughnessMap: brushed,
                bumpMap: brushed,
                bumpScale: 0.25,
            }),
        );
        const darkMetal = mat(
            new THREE.MeshStandardMaterial({
                color: 0x23252b,
                metalness: 0.85,
                roughness: 0.8,
                roughnessMap: brushed,
            }),
        );
        const graphite = mat(
            new THREE.MeshStandardMaterial({
                color: 0x1a1b1f,
                metalness: 0.2,
                roughness: 0.65,
                bumpMap: leather,
                bumpScale: 0.6,
            }),
        );
        const graphiteOpen = mat(
            new THREE.MeshStandardMaterial({
                color: 0x1a1b1f,
                metalness: 0.2,
                roughness: 0.6,
                side: THREE.DoubleSide,
            }),
        );
        const black = mat(
            new THREE.MeshStandardMaterial({ color: 0x07080a, metalness: 0.3, roughness: 0.5 }),
        );
        const gripRubber = mat(
            new THREE.MeshStandardMaterial({
                color: 0x111215,
                roughness: 0.95,
                bumpMap: knurlTex(16, 7),
                bumpScale: 2,
            }),
        );
        const barRubber = mat(
            new THREE.MeshStandardMaterial({
                color: 0x111215,
                roughness: 0.95,
                bumpMap: knurlTex(10, 6),
                bumpScale: 2,
            }),
        );
        const focusRibs = mat(
            new THREE.MeshStandardMaterial({
                color: 0x17181b,
                roughness: 0.8,
                bumpMap: ribTex(96),
                bumpScale: 3,
            }),
        );
        const zoomRibs = mat(
            new THREE.MeshStandardMaterial({
                color: 0x17181b,
                roughness: 0.8,
                bumpMap: ribTex(70),
                bumpScale: 3,
            }),
        );
        const knobRibs = mat(
            new THREE.MeshStandardMaterial({
                color: 0x2b2d33,
                metalness: 0.8,
                roughness: 0.6,
                bumpMap: ribTex(28),
                bumpScale: 2,
            }),
        );
        const micFoam = mat(
            new THREE.MeshStandardMaterial({
                color: 0x2a2b2e,
                roughness: 1,
                bumpMap: foam,
                bumpScale: 4,
            }),
        );
        const lensBand = mat(
            new THREE.MeshStandardMaterial({ map: lensScale, roughness: 0.55, metalness: 0.15 }),
        );
        const hoodMat = mat(
            new THREE.MeshStandardMaterial({
                color: 0x0d0e10,
                roughness: 0.92,
                side: THREE.DoubleSide,
            }),
        );
        const accent = mat(
            new THREE.MeshStandardMaterial({ color: 0xff3b1f, roughness: 0.5, metalness: 0.2 }),
        );
        const white = mat(
            new THREE.MeshStandardMaterial({ color: 0xe6e7ea, roughness: 0.6, metalness: 0 }),
        );
        const plateMat = mat(
            new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.4, metalness: 0.4 }),
        );
        const glassFront = mat(
            new THREE.MeshPhysicalMaterial({
                color: 0x03040a,
                roughness: 0.02,
                metalness: 0,
                transparent: true,
                opacity: 0.4,
                clearcoat: 1,
                clearcoatRoughness: 0.02,
                envMapIntensity: 2.5,
            }),
        );
        const glassRear = mat(
            new THREE.MeshPhysicalMaterial({
                color: 0x120826,
                roughness: 0.08,
                metalness: 0.6,
                iridescence: 1,
                iridescenceIOR: 1.7,
                emissive: 0x2a0f55,
                emissiveIntensity: 0.7,
            }),
        );
        const ledRed = mat(
            new THREE.MeshStandardMaterial({
                color: 0x330000,
                emissive: 0xff2a1a,
                emissiveIntensity: 2,
            }),
        );
        const ledGreen = mat(
            new THREE.MeshStandardMaterial({
                color: 0x003311,
                emissive: 0x33ff88,
                emissiveIntensity: 1.6,
            }),
        );
        const bezel = mat(
            new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 0.35, metalness: 0.4 }),
        );

        /* ---------- Builders ---------- */
        const add = (
            geo: THREE.BufferGeometry,
            m: THREE.Material,
            parent: THREE.Object3D,
            pos: V3 = [0, 0, 0],
            rot: V3 = [0, 0, 0],
        ) => {
            const mesh = new THREE.Mesh(geo, m);
            mesh.position.set(...pos);
            mesh.rotation.set(...rot);
            parent.add(mesh);
            return mesh;
        };
        const rbox = (w: number, h: number, d: number, r = 0.02, seg = 3) =>
            new RoundedBoxGeometry(w, h, d, seg, r);
        const cyl = (rt: number, rb: number, h: number, seg = 48, open = false) =>
            new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
        const cylZ: V3 = [HALF, 0, 0];
        const cylX: V3 = [0, 0, HALF];

        /** Rotates a group so its local +Y points along +axis (or -axis with dir = -1). */
        const orient = <T extends THREE.Object3D>(g: T, axis: 'x' | 'y' | 'z', dir = 1): T => {
            if (axis === 'x') g.rotation.z = -HALF * dir;
            if (axis === 'z') g.rotation.x = HALF * dir;
            if (axis === 'y' && dir < 0) g.rotation.x = Math.PI;
            return g;
        };

        /** Instances placed around a circle in the group's XZ plane, long edge radial. */
        const ring = (
            parent: THREE.Object3D,
            geo: THREE.BufferGeometry,
            m: THREE.Material,
            n: number,
            r: number,
            y: number,
            scale?: (i: number) => V3,
        ) => {
            const im = new THREE.InstancedMesh(geo, m, n);
            const d = new THREE.Object3D();
            for (let i = 0; i < n; i++) {
                const a = (i / n) * TAU;
                d.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
                d.rotation.set(0, -a, 0);
                const s = scale ? scale(i) : ([1, 1, 1] as V3);
                d.scale.set(...s);
                d.updateMatrix();
                im.setMatrixAt(i, d.matrix);
            }
            im.instanceMatrix.needsUpdate = true;
            parent.add(im);
            return im;
        };

        const boltGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.012, 6);
        const tickGeo = new THREE.BoxGeometry(0.03, 0.003, 0.006);

        /** Machined motor can with caps, seam grooves, tick marks, bolts, status LED. */
        const motor = (
            parent: THREE.Object3D,
            pos: V3,
            axis: 'x' | 'y' | 'z',
            r: number,
            len: number,
            dir = 1,
        ) => {
            const g = orient(new THREE.Group(), axis, dir);
            g.position.set(...pos);
            parent.add(g);
            add(cyl(r, r, len, 64), darkMetal, g);
            for (const s of [1, -1]) {
                add(cyl(r * 1.06, r * 1.06, len * 0.14, 64), silver, g, [0, s * len * 0.43, 0]);
                add(new THREE.TorusGeometry(r * 1.0, 0.006, 8, 64), black, g, [0, s * len * 0.18, 0], [
                    HALF,
                    0,
                    0,
                ]);
            }
            ring(g, tickGeo, white, 48, r * 0.88, len / 2 + 0.001, (i) =>
                i % 6 === 0 ? [1.7, 1, 1.3] : [1, 1, 1],
            );
            ring(g, boltGeo, darkMetal, 6, r * 0.55, len / 2 + 0.004);
            add(new THREE.SphereGeometry(0.011, 12, 12), ledGreen, g, [r * 1.0, 0, 0]);
            return g;
        };

        /** Knurled adjuster knob with a coloured cap. */
        const knob = (
            parent: THREE.Object3D,
            pos: V3,
            axis: 'x' | 'y' | 'z',
            r: number,
            len: number,
            dir = 1,
        ) => {
            const g = orient(new THREE.Group(), axis, dir);
            g.position.set(...pos);
            parent.add(g);
            add(cyl(r * 0.45, r * 0.45, len * 0.6, 24), silver, g, [0, -len * 0.3, 0]);
            add(cyl(r, r, len, 40), knobRibs, g, [0, len * 0.1, 0]);
            add(cyl(r * 0.7, r * 0.7, len * 0.12, 32), accent, g, [0, len * 0.62, 0]);
            return g;
        };

        /** Lens-style dome cap (convex toward +Z once added). */
        const dome = (discRadius: number, curvature: number) => {
            const g = new THREE.SphereGeometry(
                curvature,
                48,
                10,
                0,
                TAU,
                0,
                Math.asin(discRadius / curvature),
            );
            g.rotateX(HALF);
            return g;
        };

        /* =====================================================
           HIERARCHY: root (sway) → yaw → roll → pitch → rig
           ===================================================== */
        const root = new THREE.Group();
        root.rotation.order = 'YXZ';
        scene.add(root);

        /* ---------- Handle ---------- */
        const profile = (
            [
                [0.001, 0],
                [0.095, 0],
                [0.105, 0.03],
                [0.092, 0.14],
                [0.086, 0.4],
                [0.092, 0.66],
                [0.11, 0.82],
                [0.115, 0.9],
                [0.001, 0.9],
            ] as [number, number][]
        ).map(([x, y]) => new THREE.Vector2(x, y));
        add(new THREE.LatheGeometry(profile, 64), gripRubber, root);

        add(cyl(0.12, 0.12, 0.04, 64), silver, root, [0, 0.02, 0]); // base flange
        add(cyl(0.125, 0.125, 0.05, 64), silver, root, [0, 0.925, 0]); // top collar
        for (const y of [0.91, 0.94]) {
            add(new THREE.TorusGeometry(0.126, 0.004, 8, 64), black, root, [0, y, 0], [HALF, 0, 0]);
        }
        const YAW_Y = 1.08;
        add(cyl(0.09, 0.1, YAW_Y - 0.95, 48), darkMetal, root, [0, 0.95 + (YAW_Y - 0.95) / 2 - 0.04, 0]);

        /** Frame on the handle surface at a given height/angle; local +Z points outward. */
        const onGrip = (y: number, angleDeg: number, radius: number) => {
            const g = new THREE.Group();
            const a = (angleDeg * Math.PI) / 180;
            g.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
            g.rotation.y = a;
            root.add(g);
            return g;
        };

        // Handle display
        const gDisp = onGrip(0.8, 0, 0.108);
        add(rbox(0.1, 0.066, 0.02, 0.008), bezel, gDisp, [0, 0, 0.002]);
        add(new THREE.PlaneGeometry(0.088, 0.051), oled.mat, gDisp, [0, 0, 0.0125]);
        // Thumb stick
        const gStick = onGrip(0.64, 38, 0.088);
        add(cyl(0.034, 0.034, 0.014, 32), darkMetal, gStick, [0, 0, 0.004], cylZ);
        add(cyl(0.011, 0.011, 0.028, 16), silver, gStick, [0, 0, 0.02], cylZ);
        const cap = add(new THREE.SphereGeometry(0.022, 20, 14), gripRubber, gStick, [0, 0, 0.036]);
        cap.scale.z = 0.55;
        // Record button
        const gRec = onGrip(0.7, -34, 0.09);
        add(cyl(0.03, 0.03, 0.012, 32), silver, gRec, [0, 0, 0.004], cylZ);
        add(cyl(0.02, 0.02, 0.016, 32), accent, gRec, [0, 0, 0.008], cylZ);
        // Mode button
        const gMode = onGrip(0.56, 0, 0.09);
        add(rbox(0.04, 0.022, 0.012, 0.005), darkMetal, gMode, [0, 0, 0.004]);
        // Side wheel
        const gWheel = onGrip(0.48, 90, 0.087);
        add(cyl(0.04, 0.04, 0.026, 40), knobRibs, gWheel, [0, 0, 0.012], cylX);

        /* ---------- Yaw stage ---------- */
        const yaw = new THREE.Group();
        yaw.position.set(0, YAW_Y, 0);
        root.add(yaw);

        const ARM_Z = -0.98;
        motor(yaw, [0, 0.0, 0], 'y', 0.2, 0.12);
        add(rbox(0.12, 0.1, 0.92, 0.03), silver, yaw, [0, 0, -0.48]); // bridge
        add(rbox(0.18, 0.14, 0.18, 0.03), darkMetal, yaw, [0, 0, ARM_Z]); // clamp block
        for (const sx of [-0.05, 0.05]) {
            add(boltGeo, silver, yaw, [sx, 0.075, ARM_Z]);
        }
        add(rbox(0.1, 1.06, 0.12, 0.03), silver, yaw, [0, 0.5, ARM_Z]); // vertical arm
        add(rbox(0.05, 0.84, 0.02, 0.008), black, yaw, [0, 0.52, ARM_Z + 0.065]); // inset channel
        // Balance scale on the arm's side
        const scaleGeo = new THREE.BoxGeometry(0.004, 0.003, 0.034);
        const scaleTicks = new THREE.InstancedMesh(scaleGeo, darkMetal, 26);
        {
            const d = new THREE.Object3D();
            for (let i = 0; i < 26; i++) {
                d.position.set(0.052, 0.1 + i * 0.033, ARM_Z);
                d.scale.set(1, 1, i % 5 === 0 ? 1.6 : 1);
                d.updateMatrix();
                scaleTicks.setMatrixAt(i, d.matrix);
            }
            scaleTicks.instanceMatrix.needsUpdate = true;
            yaw.add(scaleTicks);
        }
        knob(yaw, [0.1, 0.32, ARM_Z], 'x', 0.05, 0.06);
        // Roll motor (stator side)
        motor(yaw, [0, 1.0, -0.85], 'z', 0.15, 0.16);

        /* ---------- Roll stage ---------- */
        const roll = new THREE.Group();
        roll.position.set(0, 1.0, 0);
        yaw.add(roll);

        motor(roll, [0, 0, -0.71], 'z', 0.11, 0.12);
        add(rbox(1.34, 0.1, 0.1, 0.03), silver, roll, [0, 0, -0.63]); // back bar
        for (const s of [-1, 1]) {
            add(rbox(0.1, 0.07, 0.62, 0.02), silver, roll, [s * 0.62, 0.1, -0.31]); // top rail
            add(rbox(0.1, 0.07, 0.62, 0.02), silver, roll, [s * 0.62, -0.1, -0.31]); // bottom rail
            add(rbox(0.1, 0.27, 0.09, 0.02), silver, roll, [s * 0.62, 0, -0.6]); // rear post
            add(rbox(0.1, 0.27, 0.1, 0.02), silver, roll, [s * 0.62, 0, -0.05]); // front post
        }
        motor(roll, [0.66, 0, 0], 'x', 0.15, 0.14, 1);
        motor(roll, [-0.66, 0, 0], 'x', 0.15, 0.14, -1);
        knob(roll, [-0.78, 0, 0], 'x', 0.05, 0.06, -1);

        /* ---------- Pitch stage + camera rig ---------- */
        const pitch = new THREE.Group();
        roll.add(pitch);
        for (const s of [-1, 1]) {
            add(cyl(0.05, 0.05, 0.24, 24), silver, pitch, [s * 0.47, 0, 0], cylX);
        }

        const rig = new THREE.Group(); // body sits behind the pitch axis to balance the lens
        rig.position.z = -0.2;
        pitch.add(rig);

        // Body
        add(rbox(0.72, 0.52, 0.56, 0.05, 5), graphite, rig);
        add(rbox(0.7, 0.5, 0.02, 0.01), darkMetal, rig, [0, 0, 0.285]); // front plate
        add(rbox(0.72, 0.03, 0.56, 0.012), darkMetal, rig, [0, 0.265, 0]); // top plate
        // Side vents (+X) and a seam line
        for (let i = 0; i < 5; i++) {
            add(rbox(0.006, 0.01, 0.22, 0.003, 2), black, rig, [0.361, -0.06 + i * 0.03, -0.02]);
        }
        add(rbox(0.004, 0.4, 0.004, 0.001, 1), black, rig, [0.361, 0, 0.12]);
        // Hot shoe
        add(rbox(0.08, 0.012, 0.07, 0.004, 2), silver, rig, [0, 0.287, -0.2]);
        for (const sx of [-0.032, 0.032]) {
            add(rbox(0.01, 0.01, 0.07, 0.003, 2), silver, rig, [sx, 0.297, -0.2]);
        }
        // Top handle
        for (const z of [-0.2, 0.14]) {
            add(rbox(0.05, 0.14, 0.07, 0.015), darkMetal, rig, [0, 0.345, z]);
        }
        add(new THREE.CapsuleGeometry(0.03, 0.3, 8, 24), barRubber, rig, [0, 0.43, -0.03], cylZ);
        // Shotgun mic on the handle
        add(rbox(0.03, 0.025, 0.05, 0.008, 2), darkMetal, rig, [0, 0.465, -0.08]);
        add(rbox(0.03, 0.025, 0.05, 0.008, 2), darkMetal, rig, [0, 0.465, 0.06]);
        add(new THREE.CapsuleGeometry(0.026, 0.22, 8, 20), micFoam, rig, [0, 0.505, -0.01], cylZ);
        // Top status display
        add(new THREE.PlaneGeometry(0.2, 0.088), topLcd.mat, rig, [-0.17, 0.2815, 0.12], [-HALF, 0, 0]);
        // Front brand plate, tally light
        add(new THREE.PlaneGeometry(0.2, 0.05), plateMat, rig, [-0.17, -0.17, 0.2955]);
        add(new THREE.SphereGeometry(0.02, 16, 16), ledRed, rig, [-0.3, 0.205, 0.292]);

        // Lens mount
        const mountG = orient(new THREE.Group(), 'z');
        mountG.position.set(0, 0, 0.3);
        rig.add(mountG);
        add(cyl(0.285, 0.285, 0.03, 64), darkMetal, mountG);
        ring(mountG, boltGeo, silver, 8, 0.262, 0.017);
        add(cyl(0.255, 0.255, 0.03, 64), silver, rig, [0, 0, 0.33], cylZ);

        /* ---------- Lens ---------- */
        add(cyl(0.235, 0.235, 0.12, 64), graphite, rig, [0, 0, 0.405], cylZ); // rear barrel

        const focus = new THREE.Group(); // rotates for focus pulls
        focus.position.set(0, 0, 0.54);
        rig.add(focus);
        add(cyl(0.248, 0.248, 0.15, 64), focusRibs, focus, [0, 0, 0], cylZ);
        const teeth = orient(new THREE.Group(), 'z');
        focus.add(teeth);
        ring(teeth, new THREE.BoxGeometry(0.014, 0.05, 0.007), darkMetal, 96, 0.252, -0.045);

        add(cyl(0.238, 0.238, 0.1, 64), lensBand, rig, [0, 0, 0.665], cylZ); // distance scale
        add(new THREE.BoxGeometry(0.012, 0.012, 0.1), accent, rig, [0, 0.2395, 0.665]); // index mark
        add(cyl(0.25, 0.25, 0.12, 64), zoomRibs, rig, [0, 0, 0.775], cylZ); // zoom ring
        add(cyl(0.215, 0.238, 0.1, 64, true), graphiteOpen, rig, [0, 0, 0.88], cylZ); // front barrel
        add(cyl(0.212, 0.212, 0.03, 64), silver, rig, [0, 0, 0.945], cylZ); // filter ring
        add(new THREE.TorusGeometry(0.212, 0.005, 8, 64), black, rig, [0, 0, 0.93]);
        add(new THREE.RingGeometry(0.15, 0.21, 64), black, rig, [0, 0, 0.9615]); // front rim

        // Glass stack: coated rear element → iris → front element
        add(dome(0.1, 0.18), glassRear, rig, [0, 0, 0.84 - 0.18 + 0.02]);
        add(new THREE.CircleGeometry(0.16, 48), black, rig, [0, 0, 0.8]);
        const iris = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.16, 8), darkMetal);
        iris.position.set(0, 0, 0.9);
        rig.add(iris);
        add(dome(0.15, 0.35), glassFront, rig, [0, 0, 0.965 - 0.35]);

        // Tulip hood
        const hoodGeo = new THREE.CylinderGeometry(0.3, 0.235, 0.22, 96, 1, true);
        {
            const p = hoodGeo.attributes.position;
            for (let i = 0; i < p.count; i++) {
                const y = p.getY(i);
                if (y > 0) {
                    const a = Math.atan2(p.getZ(i), p.getX(i));
                    p.setY(i, y - 0.09 * (0.5 - 0.5 * Math.cos(a * 4)));
                }
            }
            hoodGeo.computeVertexNormals();
        }
        add(hoodGeo, hoodMat, rig, [0, 0, 1.06], cylZ);
        add(cyl(0.24, 0.24, 0.02, 64), silver, rig, [0, 0, 0.965], cylZ);

        /* ---------- Shadows ---------- */
        const noShadow = new Set<THREE.Material>([glassFront, oled.mat, topLcd.mat]);
        scene.traverse((o) => {
            if (o instanceof THREE.Mesh) {
                o.castShadow = !noShadow.has(o.material as THREE.Material);
                o.receiveShadow = true;
            }
        });

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
        let nextUi = 0;

        drawOled(0, 0, 0, true);
        drawTop(0, true);

        renderer.setAnimationLoop(() => {
            const dt = Math.min(clock.getDelta(), 0.05);
            t += dt;

            // 1) Handheld sway on the grip
            root.rotation.y = wobble(t * 0.6, 3) * 0.12 * sway;
            root.rotation.x = wobble(t * 0.9, 1) * 0.07 * sway;
            root.rotation.z = wobble(t * 0.8, 2) * 0.09 * sway;
            root.position.x = wobble(t * 0.7, 4) * 0.08 * sway;
            root.position.y = (wobble(t * 1.1, 5) * 0.05 + Math.sin(t * 3.2) * 0.015) * sway;

            // 2) Where the camera wants to look
            const active = interactive && performance.now() - lastMove < 2500;
            let tYaw: number;
            let tPitch: number;
            if (active) {
                tYaw = ptr.x * 0.95;
                tPitch = -ptr.y * 0.5; // +X rotation tilts the lens down
            } else if (reduced) {
                tYaw = 0.25;
                tPitch = 0;
            } else {
                tYaw = Math.sin(t * 0.4) * 0.85 + Math.sin(t * 0.9) * 0.1;
                tPitch = Math.sin(t * 0.55 + 1) * 0.22 + 0.05;
            }
            aimYaw = damp(aimYaw, tYaw, active ? 4 : 1.6, dt);
            aimPitch = damp(aimPitch, tPitch, active ? 4 : 1.6, dt);

            // 3) Motors counter the sway; different speeds leave a believable residual
            yaw.rotation.y = damp(yaw.rotation.y, aimYaw - root.rotation.y, 9, dt);
            roll.rotation.z = damp(roll.rotation.z, -root.rotation.z, 14, dt);
            pitch.rotation.x = damp(pitch.rotation.x, aimPitch - root.rotation.x, 12, dt);

            // 4) Lens life: focus pull + breathing iris
            if (!reduced) {
                focus.rotation.z = Math.sin(t * 0.35) * 1.6 + Math.sin(t * 0.9) * 0.15;
                iris.scale.setScalar(0.85 + Math.sin(t * 0.6) * 0.3);
            }

            // 5) Record light + live displays (10 Hz)
            const recOn = Math.sin(t * 3) > 0;
            ledRed.emissiveIntensity = recOn ? 2.5 : 0.15;
            if (t > nextUi) {
                nextUi = t + 0.1;
                drawOled(
                    aimYaw * RAD2DEG,
                    -aimPitch * RAD2DEG,
                    (roll.rotation.z + root.rotation.z) * RAD2DEG,
                    recOn,
                );
                drawTop(t, recOn);
            }

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
            boltGeo.dispose();
            tickGeo.dispose();
            scaleGeo.dispose();
            disposables.forEach((d) => d.dispose());
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
            aria-label="A cinema camera on a three-axis gimbal that follows the cursor"
            className={`relative h-full min-h-[320px] w-full ${className}`}
        />
    );
}