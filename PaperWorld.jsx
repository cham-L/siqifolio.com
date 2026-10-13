/* eslint-disable react/no-unknown-property */
// PaperWorld —— 全站固定的 3D 纸张世界背景
// 纯白纸片（无图像）：鼠标滚轮滚动页面时，相机以弹簧物理沿纵深漫游；鼠标移动带轻微视差。
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PAPER_SHADES = ['#fdfcfa', '#faf8f4', '#f6f3ed', '#f3f0e9', '#f0ede5'];

// 确定性伪随机（避免每次渲染位置跳动）
const rand = seed => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function Papers() {
  const group = useRef();

  const sheets = useMemo(() => {
    const list = [];
    // 纯白纸张（氛围填充，无任何图像）
    for (let i = 0; i < 40; i++) {
      const side = rand(i + 101) > 0.5 ? -1 : 1;
      list.push({
        key: `paper-${i}`,
        shade: PAPER_SHADES[i % PAPER_SHADES.length],
        w: 1.1 + rand(i + 111) * 1.7,
        h: 1.5 + rand(i + 121) * 2.2,
        x: side * (1.6 + rand(i + 131) * 4.8),
        y: (rand(i + 141) - 0.5) * 4.6,
        z: -3 - rand(i + 151) * 62,
        rx: (rand(i + 161) - 0.5) * 0.8,
        ry: (rand(i + 171) - 0.5) * 1.1,
        rz: (rand(i + 181) - 0.5) * 0.6,
        float: 0.5 + rand(i + 191) * 0.9,
        phase: rand(i + 201) * Math.PI * 2
      });
    }
    return list;
  }, []);

  useFrame(state => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    for (const child of group.current.children) {
      const d = child.userData;
      child.position.y = d.y + Math.sin(t * d.float + d.phase) * 0.18;
      child.rotation.z = d.rz + Math.sin(t * d.float * 0.6 + d.phase) * 0.03;
    }
  });

  return (
    <group ref={group}>
      {sheets.map(s => (
        <mesh
          key={s.key}
          position={[s.x, s.y, s.z]}
          rotation={[s.rx, s.ry, s.rz]}
          userData={s}
        >
          <planeGeometry args={[s.w, s.h]} />
          <meshBasicMaterial color={s.shade} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// 相机弹簧物理漫游
function CameraRig() {
  const stateRef = useRef({
    z: 9,
    vz: 0,
    x: 0,
    vx: 0,
    y: 0,
    vy: 0,
    mx: 0,
    my: 0
  });

  useFrame((state, delta) => {
    const s = stateRef.current;
    const dt = Math.min(delta, 0.05);

    // 目标纵深：滚动进度映射
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    const targetZ = 9 - progress * 64;

    // 鼠标视差目标
    const targetX = state.pointer.x * 0.9;
    const targetY = state.pointer.y * 0.55 + Math.sin(state.clock.elapsedTime * 0.4) * 0.12;

    // 弹簧积分（欠阻尼 → 弹性过冲）
    const spring = (pos, vel, target, k, c) => {
      const acc = k * (target - pos) - c * vel;
      return [pos + vel * dt, vel + acc * dt];
    };
    [s.z, s.vz] = spring(s.z, s.vz, targetZ, 26, 7.5);
    [s.x, s.vx] = spring(s.x, s.vx, targetX, 18, 7);
    [s.y, s.vy] = spring(s.y, s.vy, targetY, 18, 7);

    state.camera.position.set(s.x, s.y, s.z);
    state.camera.lookAt(s.x * 0.4, s.y * 0.4, s.z - 10);
  });

  return null;
}

export default function PaperWorld() {
  return (
    <div className="paper-world" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 52, near: 0.1, far: 90 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color('#ffffff'), 1);
          scene.fog = new THREE.Fog('#ffffff', 7, 46);
        }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 6, 8]} intensity={1.1} />
        <directionalLight position={[-5, -3, 4]} intensity={0.35} />
        <Papers />
        <CameraRig />
      </Canvas>
    </div>
  );
}
