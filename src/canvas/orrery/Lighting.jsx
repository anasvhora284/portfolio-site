import { Environment, Lightformer } from "@react-three/drei";

// Procedural studio environment: no network fetches, gives brass something to reflect.
export function Lighting() {
  return (
    <>
      <color attach="background" args={["#07080c"]} />
      <ambientLight intensity={0.25} />
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffe2a0"
          position={[0, 6, 4]}
          scale={[14, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#6f8cff"
          position={[-8, 1, -3]}
          rotation-y={Math.PI / 2}
          scale={[10, 4, 1]}
        />
        <Lightformer
          form="ring"
          intensity={3}
          color="#ffffff"
          position={[6, 3, -6]}
          scale={5}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#ff9a68"
          position={[0, -5, 2]}
          scale={[12, 2, 1]}
        />
      </Environment>
    </>
  );
}
