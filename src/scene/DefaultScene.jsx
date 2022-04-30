import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ChessBoard } from "../prefabs/ChessBoard";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { extend } from "react-three-fiber";
import { Chess } from "chess.js";
import {
  getCoordenatePositions,
  getNotatedPosition
} from "../utils/notatedPosition";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { Skybox } from "../prefabs/SkyBox";

extend({ OutlinePass });

export const DefaultScene = () => {
  const chessRef = useRef(new Chess());

  const [selected, setSelected] = useState([]);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [whiteTurn, setWhiteTurn] = useState(true);
  const [matchOver, setMatchOver] = useState(false);

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
        setMatchOver(true);
      } else {
        setWhiteTurn((turn) => !turn);
      }
    },
    [setBoard]
  );

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
        to: targetNPosition
      });

      updateBoard(targetPosition, movedPieceId);
    },
    [updateBoard, chessRef, board, selected]
  );

  useEffect(() => {
    if (selected.length !== 0) {
      const selectedPosition = getNotatedPosition(selected[0].position);
      const possibleMoves = chessRef.current.moves({
        square: selectedPosition,
        verbose: true
      });

      setPossibleMoves(
        possibleMoves.map((pos) => getCoordenatePositions(pos.to))
      );
    }
  }, [selected]);

  return (
    <>
      <EffectComposer multisampling={8}>
        <Outline
          selection={
            selected.length !== 0 ? selected.map((object) => object.ref) : []
          }
          edgeStrength={10}
        />
      </EffectComposer>

      <Skybox />
      <hemisphereLight color={"white"} groundColor={"brown"} intensity={0.4} />
      <OrbitControls />
      <PerspectiveCamera makeDefault position={[0, 10, 10]} />
      <directionalLight position={[2, 10, -10]} castShadow />
      <ambientLight intensity={0.4} />
      <Suspense fallback={null}>
        <ChessBoard
          board={board}
          possibleMoves={possibleMoves}
          selected={selected}
          setSelectedObject={setSelected}
          moveTo={moveSelectedPieceTo}
          whiteTurn={whiteTurn}
          matchOver={matchOver}
        />
      </Suspense>
    </>
  );
};
