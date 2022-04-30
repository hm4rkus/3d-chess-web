import React from "react";

// Components
import { Piece } from "./Piece";

// Hooks
import { useTexture } from "@react-three/drei";

// Constants
const blackTextureRoot = "/textures/wood/white/";
const whiteTextureRoot = "/textures/wood/black/";

const boardColor = "rgb(90,90,90)";
const whiteColor = "white";
const blackColor = "rgb(90,90,90)";

const edgeOffset = 4.25;
const edgeDefaultLength = 8;
const edgeDefaultHeight = 0.2;
const edgeDefaultWidth = 0.5;

const commonMaterialProps = {
  metalness: 0,
  roughness: 0.2,
  opacity: 1,
  transparent: true
};

export const ChessBoard = ({
  board,
  possibleMoves,
  setSelectedObject,
  moveTo,
  matchOver,
  whiteTurn
}) => {
  const [wColorT, wDisplT, wNormalT, wRoughT] = useTexture([
    whiteTextureRoot + "color.jpg",
    whiteTextureRoot + "displacement.jpg",
    whiteTextureRoot + "normal.jpg",
    whiteTextureRoot + "roughness.jpg"
  ]);

  const [bColorT, bDisplT, bNormalT, bRoughT] = useTexture([
    blackTextureRoot + "color.jpg",
    blackTextureRoot + "displacement.jpg",
    blackTextureRoot + "normal.jpg",
    blackTextureRoot + "roughness.jpg"
  ]);

  const moveToWrapper = ([j, i]) => {
    moveTo([j, i]);
  };

  return (
    <>
      {/* 4 Board Edges */}
      {[0, 1, 2, 3].map((index) => {
        // Box Position
        let position = [];

        // Box Rotation
        let rotation = [0, 0, 0];

        // Box Size
        let args = [edgeDefaultLength, edgeDefaultHeight, edgeDefaultWidth];

        switch (index) {
          // The first 2 edges are 1 unit longer.
          case 0:
            position = [0, 0, -edgeOffset];
            args[0] += 1;
            break;
          case 1:
            position = [0, 0, edgeOffset];
            args[0] += 1;
            break;
          case 2:
            position = [-edgeOffset, 0, 0];
            rotation = [0, Math.PI / 2, 0];
            break;
          case 3:
            position = [edgeOffset, 0, 0];
            rotation = [0, Math.PI / 2, 0];
            break;

          default:
        }

        return (
          <mesh key={index} position={position} rotation={rotation}>
            <boxBufferGeometry args={args} />
            <meshStandardMaterial
              {...commonMaterialProps}
              color={boardColor}
              oughnessMap={wRoughT}
              normalMap={wNormalT}
              map={wColorT}
              bumpMap={wDisplT}
              transparent={false}
              opacity={1}
            />
          </mesh>
        );
      })}

      {new Array(64).fill(0).map((a, index) => {
        let possible = false;
        const i = Math.floor(index / 8);
        const j = index % 8;
        const piece = board[j][i];

        for (let possibleMove of possibleMoves) {
          if (possibleMove[0] === j && possibleMove[1] === i) {
            possible = true;
            break;
          }
        }

        if (piece)
          return (
            <Piece
              key={piece.id}
              id={piece.id}
              type={piece.type}
              color={piece.color}
              position={[j - 3.5, 0.1, i - 3.5]}
              onSelect={({ ref }) => {
                if (
                  possible &&
                  ((piece.color === "b" && whiteTurn) ||
                    (piece.color === "w" && !whiteTurn))
                ) {
                  moveToWrapper([j, i]);
                } else if (
                  !matchOver &&
                  ((piece.color === "w" && whiteTurn) ||
                    (piece.color === "b" && !whiteTurn))
                )
                  setSelectedObject([{ ref: ref, position: [j, i] }]);
              }}
            />
          );
      })}

      <group>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
          [0, 1, 2, 3, 4, 5, 6, 7].map((j) => {
            let possible = false;
            const hasPiece = board[j][i];
            for (let possibleMove of possibleMoves) {
              if (possibleMove[0] === j && possibleMove[1] === i) {
                possible = true;
                break;
              }
            }

            return (
              <group key={i * 8 + j}>
                {possible &&
                  (hasPiece ? (
                    [0, 1, 2, 3].map((index) => {
                      let position = [i - 3.5, 0.11, j - 3.5];
                      switch (index) {
                        case 0:
                          position[0] += 0.45;
                          position[2] += 0.45;
                          break;
                        case 1:
                          position[0] -= 0.45;
                          position[2] -= 0.45;
                          break;
                        case 2:
                          position[0] += 0.45;
                          position[2] -= 0.45;
                          break;
                        case 3:
                          position[0] -= 0.45;
                          position[2] += 0.45;
                          break;

                        default:
                      }

                      return (
                        <mesh
                          key={index}
                          position={position}
                          rotation={[-Math.PI / 2, 0, 0]}
                          scale={[1, 1, 1]}
                        >
                          <planeBufferGeometry args={[0.1, 0.1]} />
                          <meshStandardMaterial color="#28a745" roughness={1} />
                        </mesh>
                      );
                    })
                  ) : (
                    <mesh
                      position={[i - 3.5, 0.1, j - 3.5]}
                      scale={[1, 0.1, 1]}
                    >
                      <sphereBufferGeometry args={[0.15, 32, 32]} />
                      <meshStandardMaterial color="#28a745" roughness={1} />
                    </mesh>
                  ))}
                <mesh
                  position={[i - 3.5, 0, j - 3.5]}
                  scale={[1, 0.2, 1]}
                  receiveShadow
                  onClick={() => possible && moveToWrapper([j, i])}
                >
                  <boxBufferGeometry />

                  {(i + j) % 2 === 0 ? (
                    <meshStandardMaterial
                      color={whiteColor}
                      roughnessMap={wRoughT}
                      normalMap={wNormalT}
                      map={wColorT}
                      bumpMap={wDisplT}
                      {...commonMaterialProps}
                    />
                  ) : (
                    <meshStandardMaterial
                      color={blackColor}
                      roughnessMap={bRoughT}
                      normalMap={bNormalT}
                      map={bColorT}
                      bumpMap={bDisplT}
                      {...commonMaterialProps}
                    />
                  )}
                </mesh>
              </group>
            );
          })
        )}
      </group>
    </>
  );
};
