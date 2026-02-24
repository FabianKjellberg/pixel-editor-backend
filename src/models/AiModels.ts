import OpenAI from "openai";

export type Point = {
  x: number,
  y: number,
}

export type Color = {
  r: number,
  g: number,
  b: number
}

export enum AiActionEnum {
  penStroke = "penStroke",
  lineTool = "lineTool",
  rectangleTool = "rectangleTool",
  ellipseTool = "ellipseTool",
  fillBucket = "fillBucket",
  changeCanvasSize = "changeCanvasSize",
  gradientTool = "gradientTool",
  freeformTool = "freeformTool",
}

export type AiPenStroke = {
  action: AiActionEnum.penStroke; 
  layerId: string;
  color: Color; 
  size: number;
  points: Point[]
}

export type AiLineTool = {
  action: AiActionEnum.lineTool;
  layerId: string;
  color: Color;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
}

export type AiRectangleTool = {
  action: AiActionEnum.rectangleTool;
  layerId: string;
  color: Color;
  fill: boolean;
  fillColor: Color;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
}

export type AiEllipseTool = {
  action: AiActionEnum.ellipseTool;
  layerId: string;
  color: Color;
  fill: boolean;
  fillColor: Color;
  strokeWidth: number;
  opacity: number;
  from: Point;
  to: Point;
}

export type AiFillBucket = {
  action: AiActionEnum.fillBucket;
  layerId: string;
  color: Color;
  opacity: number;
  x: number;
  y: number;
}

export type AiChangeCanvasSize = {
  action: AiActionEnum.changeCanvasSize; 
  width: number,
  height: number,
}

export type AiGradientTool = {
  action: AiActionEnum.gradientTool;
  layerId: string;
  color: Color;
  toColor: Color;
  opacity: number;
  singleColor: boolean;
  gradientType: string;
  from: Point;
  to: Point;
}

export type AiFreeformTool = {
  action: AiActionEnum.freeformTool;
  layerId: string;
  color: Color;
  fillColor: Color;
  fill: boolean;
  strokeWidth: number;
  opacity: number;
  points: Point[];
}

export type AiAction = AiPenStroke | AiLineTool | AiRectangleTool | AiEllipseTool | AiFillBucket | AiChangeCanvasSize | AiGradientTool | AiFreeformTool;

export type AiResponse = {
    actions: AiAction[];
}

export const aiTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "penStroke",
    description: "Draw a polyline. Use for small details needing precision. For complex shapes use lineTool.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        size: { type: "number" },
        opacity: { type: "number" },
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
        },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "size", "opacity", "points"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "lineTool",
    description: "Draw a straight line from one point to another.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        strokeWidth: { type: "number" },
        opacity: { type: "number" },
        fromX: { type: "number" },
        fromY: { type: "number" },
        toX: { type: "number" },
        toY: { type: "number" },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "strokeWidth", "opacity", "fromX", "fromY", "toX", "toY"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "rectangleTool",
    description: "Draw a rectangle from 'from' to 'to'.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        fill: { type: "boolean" },
        fillColorR: { type: "number" },
        fillColorG: { type: "number" },
        fillColorB: { type: "number" },
        strokeWidth: { type: "number" },
        opacity: { type: "number" },
        fromX: { type: "number" },
        fromY: { type: "number" },
        toX: { type: "number" },
        toY: { type: "number" },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "fill", "fillColorR", "fillColorG", "fillColorB", "strokeWidth", "opacity", "fromX", "fromY", "toX", "toY"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "ellipseTool",
    description: "Draw an ellipse within the bounding box from 'from' to 'to'.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        fill: { type: "boolean" },
        fillColorR: { type: "number" },
        fillColorG: { type: "number" },
        fillColorB: { type: "number" },
        strokeWidth: { type: "number" },
        opacity: { type: "number" },
        fromX: { type: "number" },
        fromY: { type: "number" },
        toX: { type: "number" },
        toY: { type: "number" },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "fill", "fillColorR", "fillColorG", "fillColorB", "strokeWidth", "opacity", "fromX", "fromY", "toX", "toY"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "fillBucket",
    description: "Flood fill from (x,y) with the given color.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        opacity: { type: "number" },
        x: { type: "number" },
        y: { type: "number" },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "opacity", "x", "y"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "changeCanvasSize",
    description: "Resize the drawing canvas.",
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
  },
  {
    type: "function",
    name: "gradientTool",
    description: "Draw a gradient from 'from' toward 'to'. Blends color into toColor. singleColor=true fades to transparent instead.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        toColorR: { type: "number" },
        toColorG: { type: "number" },
        toColorB: { type: "number" },
        opacity: { type: "number" },
        singleColor: { type: "boolean" },
        gradientType: {
          type: "string",
          enum: ["Dithering", "Random", "Linear"]
        },
        fromX: { type: "number" },
        fromY: { type: "number" },
        toX: { type: "number" },
        toY: { type: "number" },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "toColorR", "toColorG", "toColorB", "opacity", "singleColor", "gradientType", "fromX", "fromY", "toX", "toY"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "freeformTool",
    description: "Draw a closed polygon. Auto-closed: last point connects back to first. Good for irregular shapes, triangles, stars.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        layerId: { type: "string" },
        colorR: { type: "number" },
        colorG: { type: "number" },
        colorB: { type: "number" },
        fillColorR: { type: "number" },
        fillColorG: { type: "number" },
        fillColorB: { type: "number" },
        fill: { type: "boolean" },
        strokeWidth: { type: "number" },
        opacity: { type: "number" },
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
        },
      },
      required: ["layerId", "colorR", "colorG", "colorB", "fillColorR", "fillColorG", "fillColorB", "fill", "strokeWidth", "opacity", "points"],
      additionalProperties: false
    }
  }
];

