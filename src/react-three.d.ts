/* eslint-disable @typescript-eslint/no-explicit-any */
import "@react-three/fiber";

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
