import React from "react";
import { Canvas } from "react-three-fiber";
import { DefaultScene } from "./scene/DefaultScene";
import "./styles.css";

export default function App() {
  return (
    <Canvas shadowMap>
      <DefaultScene />
    </Canvas>
  );
}
