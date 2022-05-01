import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Three
import { extend } from "react-three-fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { EffectComposer, Outline } from "@react-three/postprocessing";

// Prefabs
import { ChessBoard } from "../prefabs/ChessBoard";
import { Skybox } from "../prefabs/SkyBox";

// Chess library.
import { Chess } from "chess.js";

// Utils
import {
  getCoordenatePositions,
  getNotatedPosition,
} from "../utils/notatedPosition";

extend({ OutlinePass });

export const DefaultScene = () => {
  // Chess instance.
  const chessRef = useRef(new Chess());

  // Application state.
  const [selected, setSelected] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [isMatchOver, setIsMatchOver] = useState(false);

  // Initial board state.
  const initialStateBoard = useMemo(() => {
    const board = chessRef.current.board();

    board.forEach((column, columnIndex) => {
      column.forEach((row, rowIndex) => {
        if (row) {
          row.id = columnIndex.toString() + rowIndex.toString();
        }
      });
    });
    return board;
  }, []);

  const [board, setBoard] = useState(initialStateBoard);

  /**
   * Update board state.
   * @param {[number, number]} targetPosition Position to move to.
   * @param {string} pieceId Id of the piece to move.
   */
  const updateBoard = useCallback(
    (targetPosition, id) => {
      const chess = chessRef.current;
      setSelected([]);
      setPossibleMoves([]);

      setBoard((currentBoard) => {
        const newBoard = chess.board();

        newBoard.forEach((column, columnIndex) => {
          column.forEach((row, rowIndex) => {
            if (row) {
              if (
                targetPosition[0] === columnIndex &&
                targetPosition[1] === rowIndex
              ) {
                row.id = id;
              } else {
                row.id = currentBoard[columnIndex][rowIndex].id;
              }
            }
          });
        });

        return newBoard;
      });

      if (chess.in_check()) {
        //Play audio
      }
      if (
        chess.in_checkmate() ||
        chess.in_draw() ||
        chess.in_stalemate() ||
        chess.in_threefold_repetition() ||
        chess.insufficient_material()
      ) {
        setIsMatchOver(true);
      } else {
        setIsWhiteTurn((turn) => !turn);
      }
    },
    [setBoard]
  );

  /**
   * Move seleted piece to a specific position.
   * @param {[number, number]} position Position to move to.
   */
  const moveSelectedPieceTo = useCallback(
    (position) => {
      const chess = chessRef.current;

      const originPosition = selected[0].position;
      const targetPosition = position;

      const originNPosition = getNotatedPosition(originPosition);
      const targetNPosition = getNotatedPosition(position);

      const movedPieceId = board[originPosition[0]][originPosition[1]].id;

      chess.move({
        from: originNPosition,
        to: targetNPosition,
      });

      updateBoard(targetPosition, movedPieceId);
    },
    [updateBoard, chessRef, board, selected]
  );

  // Updates possible move positions when a piece is selected or unselected.
  useEffect(() => {
    if (selected.length !== 0) {
      const selectedPosition = getNotatedPosition(selected[0].position);
      const possibleMoves = chessRef.current.moves({
        square: selectedPosition,
        verbose: true,
      });

      setPossibleMoves(
        possibleMoves.map((pos) => getCoordenatePositions(pos.to))
      );
    }
  }, [selected]);

  return (
    <>
      {/** Outline Effect fot the selected piece */}
      <EffectComposer multisampling={8}>
        <Outline
          selection={
            selected.length !== 0 ? selected.map((object) => object.ref) : []
          }
          edgeStrength={10}
        />
      </EffectComposer>
      {/** Skybox */}
      <Skybox />
      {/** Lighting */}
      <hemisphereLight color={"white"} groundColor={"brown"} intensity={0.4} />
      <directionalLight position={[2, 10, -10]} castShadow />
      <ambientLight intensity={0.4} />
      {/** Camera and camera controls*/}
      <PerspectiveCamera makeDefault position={[0, 10, 10]} />
      <OrbitControls />
      {/**Chess Board*/}
      <Suspense fallback={null}>
        <ChessBoard
          board={board}
          possibleMoves={possibleMoves}
          selected={selected}
          setSelectedObject={setSelected}
          moveTo={moveSelectedPieceTo}
          isWhiteTurn={isWhiteTurn}
          isMatchOver={isMatchOver}
        />
      </Suspense>
    </>
  );
};
