/* eslint-disable @typescript-eslint/no-explicit-any */
import "@react-three/fiber";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as THREE from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      ambientLight: any;
      directionalLight: any;
      cylinderGeometry: any;
      meshPhysicalMaterial: any;
    }
  }
}
