"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";

/* ─── Types ─── */

type ShotPill = { name: string; count: number; level: "good" | "bad" | "neutral"; eff?: number };
type ZoneData = { eff: number; level: "high" | "mid" | "low" };

interface Court3DCanvasProps {
  playerZones: Record<string, ZoneData>;
  zoneKeys: string[];
  selectedZone: string | null;
  landing: { avgEff: number; zones: Record<string, ShotPill[]> } | null;
  onZoneClick: (zone: string) => void;
  onShotClick?: (shotName: string, count: number, eff: number) => void;
}

/* ─── Court dimensions (scaled: 1 unit = 1 meter) ─── */

const COURT_L = 13.4;   // full length
const COURT_W = 6.1;    // doubles width
const HALF = COURT_L / 2; // 6.7 — half court
const SINGLES_W = 5.18;
const SHORT_SERVICE = 1.98; // from net
const LONG_SERVICE = 0.76; // from baseline

/* Zone grid: 3 rows × 2 cols on each half */
const ZONE_ROWS = 3;
const ZONE_COLS = 2;
const ZONE_W = SINGLES_W / 2;
const ZONE_H = (HALF - 0.3) / 3; // ~2.13 each, with small margin

/* Zone center positions on PLAYER half (positive Z = player side) */
function playerZonePos(row: number, col: number): [number, number, number] {
  const x = col === 0 ? -ZONE_W / 2 : ZONE_W / 2;
  const z = 0.4 + ZONE_H / 2 + row * ZONE_H; // start just past net
  return [x, 0.02, z];
}

/* Zone center positions on OPPONENT half (negative Z) — MIRRORED left/right */
/* Opponent's "left" = player's "right" on screen, so col=0 flips to +x */
function opponentZonePos(row: number, col: number): [number, number, number] {
  const x = col === 0 ? ZONE_W / 2 : -ZONE_W / 2;  // FLIPPED from player side
  const z = -(0.4 + ZONE_H / 2 + row * ZONE_H);
  return [x, 0.02, z];
}

/* ─── Camera positions ─── */

/* Player view: zoomed out to show full court */
const CAM_PLAYER: [number, number, number] = [0, 11, 10];
const CAM_PLAYER_LOOK: [number, number, number] = [0, 0, 0.5];

/* Opponent view: close top-down, focused on opponent half */
const CAM_OPPONENT: [number, number, number] = [0, 10, 0.5];
const CAM_OPPONENT_LOOK: [number, number, number] = [0, 0, -3.5];

/* ─── Fixed camera controller — no zoom, no scroll ─── */
/* Smoothly animates between player and opponent view on zone tap only */

function CameraController({ target }: { target: "player" | "opponent" }) {
  const { camera } = useThree();
  const currentLook = useRef(new THREE.Vector3(...CAM_PLAYER_LOOK));
  const t = useRef(0);
  const targetT = target === "opponent" ? 1 : 0;

  useFrame((_, dt) => {
    // Smooth lerp toward target
    t.current += (targetT - t.current) * (1 - Math.exp(-4 * dt));

    const posPlayer = new THREE.Vector3(...CAM_PLAYER);
    const posOpponent = new THREE.Vector3(...CAM_OPPONENT);
    const lookPlayer = new THREE.Vector3(...CAM_PLAYER_LOOK);
    const lookOpponent = new THREE.Vector3(...CAM_OPPONENT_LOOK);

    camera.position.lerpVectors(posPlayer, posOpponent, t.current);
    const targetLook = new THREE.Vector3().lerpVectors(lookPlayer, lookOpponent, t.current);
    currentLook.current.lerp(targetLook, 1 - Math.exp(-8 * dt));
    camera.lookAt(currentLook.current);
  });

  return null;
}

/* ─── Court floor + lines ─── */

function CourtSurface() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const halfW = COURT_W / 2;
    const halfL = COURT_L / 2;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // y in plane = z in world (rotated)
      // Normalize to 0-1
      const nx = (x + halfW) / COURT_W;
      const ny = (y + halfL) / COURT_L;

      // Gradient: darker green center, lighter edges
      // Center band (along length) is richer green
      const centerDist = Math.abs(nx - 0.5) * 2; // 0 at center, 1 at edges
      const lengthFade = ny; // 0 at one end, 1 at other

      // Base: rich green #3a8f35 → lighter #7ec87a at edges
      const r = 0.23 + centerDist * 0.12 + lengthFade * 0.04;
      const g = 0.56 + centerDist * 0.08 - lengthFade * 0.02;
      const b = 0.21 + centerDist * 0.10 + lengthFade * 0.03;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, []);

  return null; // just sets vertex colors on the geometry
}

function CourtFloor() {
  const courtRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!courtRef.current) return;
    const geo = courtRef.current.geometry;
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const halfW = COURT_W / 2;
    const halfL = COURT_L / 2;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const nx = (x + halfW) / COURT_W;
      const ny = (y + halfL) / COURT_L;
      const centerDist = Math.abs(nx - 0.5) * 2;

      // Rich gradient: #2d7a28 (center) → #5aad55 (edges), with length variation
      const r = 0.18 + centerDist * 0.15 + ny * 0.05;
      const g = 0.48 + centerDist * 0.12 + ny * 0.06;
      const b = 0.16 + centerDist * 0.10 + ny * 0.03;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, []);

  return (
    <group>
      {/* Surround floor — brown/tan like a real court surround */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[COURT_W + 1.5, COURT_L + 1.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Court surface with vertex color gradient */}
      <mesh ref={courtRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[COURT_W, COURT_L, 32, 32]} />
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Court lines */}
      <CourtLines />

      {/* Net */}
      <Net />
    </group>
  );
}

function CourtLines() {
  const hw = COURT_W / 2;
  const hl = COURT_L / 2;
  const sw = SINGLES_W / 2;
  const y = 0.005;

  // Helper to make line points
  const lp = (points: [number, number, number][]) => points;

  return (
    <group>
      {/* Outer boundary */}
      <Line
        points={lp([[-hw, y, -hl], [hw, y, -hl], [hw, y, hl], [-hw, y, hl], [-hw, y, -hl]])}
        color="white" lineWidth={2.5} opacity={0.85} transparent
      />
      {/* Singles sidelines */}
      <Line points={lp([[-sw, y, -hl], [-sw, y, hl]])} color="white" lineWidth={1.8} opacity={0.7} transparent />
      <Line points={lp([[sw, y, -hl], [sw, y, hl]])} color="white" lineWidth={1.8} opacity={0.7} transparent />
      {/* Center line */}
      <Line points={lp([[0, y, -hl], [0, y, 0]])} color="white" lineWidth={1.5} opacity={0.6} transparent />
      <Line points={lp([[0, y, 0], [0, y, hl]])} color="white" lineWidth={1.5} opacity={0.6} transparent />
      {/* Short service lines */}
      <Line points={lp([[-sw, y, SHORT_SERVICE], [sw, y, SHORT_SERVICE]])} color="white" lineWidth={1.5} opacity={0.6} transparent />
      <Line points={lp([[-sw, y, -SHORT_SERVICE], [sw, y, -SHORT_SERVICE]])} color="white" lineWidth={1.5} opacity={0.6} transparent />
      {/* Long service lines */}
      <Line points={lp([[-hw, y, hl - LONG_SERVICE], [hw, y, hl - LONG_SERVICE]])} color="white" lineWidth={1.2} opacity={0.5} transparent />
      <Line points={lp([[-hw, y, -(hl - LONG_SERVICE)], [hw, y, -(hl - LONG_SERVICE)]])} color="white" lineWidth={1.2} opacity={0.5} transparent />
    </group>
  );
}

function Net() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Net posts */}
      <mesh position={[-COURT_W / 2 - 0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh position={[COURT_W / 2 + 0.1, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Net mesh */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[COURT_W + 0.2, 0.7, 0.02]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Net top line */}
      <Line
        points={[[-(COURT_W / 2 + 0.1), 0.4, 0], [COURT_W / 2 + 0.1, 0.4, 0]]}
        color="white" lineWidth={2} opacity={0.8} transparent
      />
    </group>
  );
}

/* ─── Player zone panel ─── */

function PlayerZonePanel({
  zoneKey, data, row, col, selected, onClick,
}: {
  zoneKey: string; data: ZoneData; row: number; col: number; selected: boolean; onClick: () => void;
}) {
  const pos = playerZonePos(row, col);
  const meshRef = useRef<THREE.Mesh>(null);

  const colors = {
    high: { fill: "#37d825", border: "#1b9f2a", opacity: 0.35 },
    mid:  { fill: "#cccccc", border: "#7a7a7a", opacity: 0.3 },
    low:  { fill: "#de4949", border: "#f71b1b", opacity: 0.4 },
  }[data.level];

  const textColor = data.level === "mid" ? "#252424" : "white";

  // Subtle hover animation
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = selected ? 0.08 : 0.02;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * (1 - Math.exp(-6 * delta));
  });

  // Dashed border outline
  const hw = ZONE_W / 2 - 0.08;
  const hh = ZONE_H / 2 - 0.08;
  const borderPoints: [number, number, number][] = [
    [-hw, 0.04, -hh], [hw, 0.04, -hh], [hw, 0.04, hh], [-hw, 0.04, hh], [-hw, 0.04, -hh],
  ];

  return (
    <group position={pos}>
      {/* Clickable panel */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <boxGeometry args={[ZONE_W - 0.12, 0.03, ZONE_H - 0.12]} />
        <meshStandardMaterial
          color={colors.fill}
          transparent
          opacity={selected ? colors.opacity + 0.15 : colors.opacity}
        />
      </mesh>

      {/* Dashed border */}
      <Line
        points={borderPoints}
        color={colors.border}
        lineWidth={selected ? 2.5 : 1.5}
        dashed
        dashSize={0.15}
        gapSize={0.1}
        opacity={0.8}
        transparent
      />

      {/* Text labels via HTML overlay */}
      <Html
        position={[0, 0.1, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div className="flex flex-col items-center gap-0.5" style={{ color: textColor, textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 300, opacity: 0.9 }}>{zoneKey}</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-1px" }}>{data.eff}%</span>
          <span style={{ fontSize: 10, fontWeight: 300, opacity: 0.85 }}>Effectiveness</span>
        </div>
      </Html>
    </group>
  );
}

/* ─── Opponent zone panel (same style as player zones) + shot markers ─── */

const OPP_ZONE_COLORS = {
  good:    { fill: "#37d825", border: "#1b9f2a", opacity: 0.3 },
  bad:     { fill: "#de4949", border: "#f71b1b", opacity: 0.35 },
  neutral: { fill: "#cccccc", border: "#7a7a7a", opacity: 0.25 },
  empty:   { fill: "#ffffff", border: "#aaaaaa", opacity: 0.1 },
};

function getZoneShotLevel(pills: ShotPill[]): "good" | "bad" | "neutral" | "empty" {
  if (pills.length === 0) return "empty";
  const goodCount = pills.filter(p => p.level === "good").reduce((s, p) => s + p.count, 0);
  const badCount = pills.filter(p => p.level === "bad").reduce((s, p) => s + p.count, 0);
  const total = pills.reduce((s, p) => s + p.count, 0);
  if (goodCount > total * 0.5) return "good";
  if (badCount > total * 0.5) return "bad";
  return "neutral";
}

function OpponentZonePanel({
  zoneKey, pills, row, col, visible, onShotClick,
}: {
  zoneKey: string; pills: ShotPill[]; row: number; col: number; visible: boolean; onShotClick?: (shotName: string, count: number, eff: number) => void;
}) {
  const pos = opponentZonePos(row, col);
  const level = getZoneShotLevel(pills);
  const colors = OPP_ZONE_COLORS[level];
  const totalShots = pills.reduce((s, p) => s + p.count, 0);

  const hw = ZONE_W / 2 - 0.08;
  const hh = ZONE_H / 2 - 0.08;
  const borderPoints: [number, number, number][] = [
    [-hw, 0.04, -hh], [hw, 0.04, -hh], [hw, 0.04, hh], [-hw, 0.04, hh], [-hw, 0.04, -hh],
  ];

  return (
    <group position={pos}>
      {/* Zone panel */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[ZONE_W - 0.12, 0.03, ZONE_H - 0.12]} />
        <meshStandardMaterial
          color={colors.fill}
          transparent
          opacity={visible ? colors.opacity : 0.05}
        />
      </mesh>

      {/* Dashed border */}
      {visible && (
        <Line
          points={borderPoints}
          color={colors.border}
          lineWidth={1.5}
          dashed
          dashSize={0.15}
          gapSize={0.1}
          opacity={0.7}
          transparent
        />
      )}

      {/* Shot details inside zone — glass cards */}
      {visible && pills.length > 0 && (
        <Html
          position={[0, 0.1, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: onShotClick ? "auto" : "none", userSelect: "none", width: "auto" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {pills.map((pill, pi) => {
              const effColor = pill.level === "good" ? "#22c55e" : pill.level === "bad" ? "#ef4444" : "#f59e0b";
              return (
                <div
                  key={pi}
                  onClick={(e) => {
                    if (onShotClick && pill.eff != null) {
                      e.stopPropagation();
                      onShotClick(pill.name, pill.count, pill.eff);
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(12px) saturate(180%)",
                    WebkitBackdropFilter: "blur(12px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 10,
                    padding: "5px 10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    cursor: onShotClick ? "pointer" : "default",
                    minWidth: 120,
                    width: "fit-content",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{pill.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{pill.count}x</span>
                    {pill.eff != null && (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "white",
                        background: effColor,
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}>{pill.eff}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Scene ─── */

function Scene({
  playerZones, zoneKeys, selectedZone, landing, onZoneClick, onShotClick,
}: Court3DCanvasProps) {
  const cameraTarget = selectedZone ? "opponent" : "player";

  return (
    <>
      <CameraController target={cameraTarget} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 10, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 6, -4]} intensity={0.3} />

      {/* Clouds — far back, high up, behind everything */}
      <Clouds material={THREE.MeshBasicMaterial} renderOrder={-1}>
        <Cloud position={[12, 18, -25]} speed={0.1} opacity={0.6} segments={12} scale={[6, 2, 2]} />
        <Cloud position={[-14, 20, -30]} speed={0.15} opacity={0.5} segments={10} scale={[5, 1.8, 1.5]} />
        <Cloud position={[8, 16, -35]} speed={0.08} opacity={0.4} segments={8} scale={[4, 1.5, 1.5]} />
        <Cloud position={[-10, 22, -28]} speed={0.12} opacity={0.55} segments={10} scale={[7, 2.5, 2]} />
        <Cloud position={[16, 17, -32]} speed={0.1} opacity={0.45} segments={9} scale={[5.5, 2, 1.5]} />
      </Clouds>

      {/* Court */}
      <CourtFloor />

      {/* Player zones */}
      {zoneKeys.map((key, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        return (
          <PlayerZonePanel
            key={key}
            zoneKey={key}
            data={playerZones[key]}
            row={row}
            col={col}
            selected={selectedZone === key}
            onClick={() => onZoneClick(key)}
          />
        );
      })}

      {/* Opponent zone panels + shot markers */}
      {zoneKeys.map((key, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const pills = landing?.zones[key] || [];
        return (
          <OpponentZonePanel
            key={`opp-${key}`}
            zoneKey={key}
            pills={pills}
            row={row}
            col={col}
            visible={true}
            onShotClick={onShotClick}
          />
        );
      })}
    </>
  );
}

/* ─── Exported canvas wrapper ─── */

export function Court3DCanvas(props: Court3DCanvasProps) {
  return (
    <Canvas
      shadows
      gl={{ alpha: true }}
      camera={{ position: CAM_PLAYER, fov: 55, near: 0.1, far: 100 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 0);
        camera.lookAt(...CAM_PLAYER_LOOK);
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
