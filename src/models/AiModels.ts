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
  lineTool = "lineTool",
  rectangleTool = "rectangleTool",
  ellipseTool = "ellipseTool",
  fillBucket = "fillBucket",
  changeCanvasSize = "changeCanvasSize",
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

export type AiAction = AiPenStroke | AiLineTool | AiRectangleTool | AiEllipseTool | AiFillBucket | AiChangeCanvasSize;

export type AiResponse = {
    actions: AiAction[];
}

export const aiTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "penStroke",
    description: `
      Draw a polyline draw from point a to b with a.
      -use penStroke for smaller details that need percision. -if you want to more complex shapes use a lineTool
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
        },
        opacity: { type: 'number'},
      },
      required: ["layerId", "color", "points", 'size', 'opacity'],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "lineTool",
    description: "Draw a straight line from one point to another. Use for simple straight lines and geometric shapes.",
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
        strokeWidth: { type: 'number'},
        opacity: { type: 'number'},
        from: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        },
        to: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        }
      },
      required: ["layerId", "color", "strokeWidth", "opacity", "from", "to"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "rectangleTool",
    description: "Draw a rectangle shape. The rectangle is drawn from the 'from' point to the 'to' point, creating a rectangular area.",
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
        fill: {type: 'boolean'},
        fillColor: {
          type: "object",
          properties: {
            r: { type: "number" },
            g: { type: "number" },
            b: { type: "number" }
          },
          required: ["r", "g", "b"],
          additionalProperties: false
        },
        strokeWidth: { type: 'number'},
        opacity: { type: 'number'},
        from: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        },
        to: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        }
      },
      required: ["layerId", "color", "strokeWidth", "opacity", "from", "to", "fill", "fillColor"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "ellipseTool",
    description: "Draw an ellipse (oval) shape. The ellipse is drawn within the bounding box defined by the 'from' and 'to' points.",
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
        fill: {type: 'boolean'},
        fillColor: {
          type: "object",
          properties: {
            r: { type: "number" },
            g: { type: "number" },
            b: { type: "number" }
          },
          required: ["r", "g", "b"],
          additionalProperties: false
        },
        strokeWidth: { type: 'number'},
        opacity: { type: 'number'},
        from: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        },
        to: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" }
          },
          required: ["x", "y"],
          additionalProperties: false
        }
      },
      required: ["layerId", "color", "strokeWidth", "opacity", "from", "to", "fill", "fillColor"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "fillBucket",
    description: "Fill an area with color using flood fill. Starts filling from the specified x, y coordinate and fills all connected pixels of the same color.",
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
        opacity: { type: 'number'},
        x: { type: "number" },
        y: { type: "number" }
      },
      required: ["layerId", "color", "opacity", "x", "y"],
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

