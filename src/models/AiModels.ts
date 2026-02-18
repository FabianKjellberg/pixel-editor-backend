import OpenAI from "openai";

export type Point = {
  x: number,
  y: number,
}

export type Color = {
  r: string,
  g: string,
  b: string
}

export enum AiActionEnum {
    penStroke = "penStroke",
  changeCanvasSize = "changeCanvasSize",
}

export type AiPenStroke = {
  action: AiActionEnum.penStroke; 
  layerId: string;
  color: Color; 
  size: number;
  points: Point[]
}

export type AiChangeCanvasSize = {
  action: AiActionEnum.changeCanvasSize; 
  width: number,
  height: number,
}

export type AiAction = AiPenStroke | AiChangeCanvasSize;

export type AiResponse = {
    actions: AiAction[];
}

export const aiTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "penStroke",
    description: `
      Draw a polyline (connected straight line segments) on a layer.

      Semantics:
      - vertices is a list of corner points.
      - The engine will draw a straight line from vertices[i] to vertices[i+1].
      - The engine handles rasterization.
      - Use the minimum number of vertices needed.
      - For a straight line, use exactly 2 vertices.
      - Do NOT output one point per pixel.
      - The drawing should be intentional and structured, not random.
      - To create an enclosed shape you need to end on the same cordinate as you ended
    `,
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        color: {
          type: "object",
          properties: {
            r: { type: "number" },
            g: { type: "number" },
            b: { type: "number" }
          },
          required: ["r", "g", "b"],
          additionalProperties: false
        },
        size: { type: 'number'},
        points: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" }
            },
            required: ["x", "y"],
            additionalProperties: false
          }
        }
      },
      required: ["layerId", "color", "points", 'size'],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "changeCanvasSize",
    description: "Resize the drawing canvas",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" }
      },
      required: ["width", "height"],
      additionalProperties: false
    }
  }
];

