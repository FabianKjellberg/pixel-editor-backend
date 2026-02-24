import { Color, Point } from '../models/AiModels'
import { MessageItem } from '../handlers/ai/testAiHandler';

export function makePromts(messages: MessageItem[] | undefined){
  return (messages ?? [])
  .map(message =>
    `${message.fromUser ? "User" : "AI"}: ${message.message}`
  )
  .join("\n\n");
}

function rgb(r: number, g: number, b: number): Color {
  return { r, g, b };
}

function pt(x: number, y: number): Point {
  return { x, y };
}

export type ToolCall = { tool: string; args: Record<string, any> };

export function parseJsonActions(text: string): ToolCall[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in AI response');

  const raw: any[] = JSON.parse(jsonMatch[0]);
  const actions: ToolCall[] = [];

  for (const a of raw) {
    switch (a.tool) {
      case "penStroke":
        actions.push({ tool: "penStroke", args: {
          layerId: a.layerId,
          size: a.size,
          color: rgb(a.colorR, a.colorG, a.colorB),
          points: a.points,
          opacity: a.opacity,
        }});
        break;

      case "lineTool":
        actions.push({ tool: "lineTool", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          strokeWidth: a.strokeWidth,
          opacity: a.opacity,
          from: pt(a.fromX, a.fromY),
          to: pt(a.toX, a.toY),
        }});
        break;

      case "rectangleTool":
        actions.push({ tool: "rectangleTool", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          fill: a.fill,
          fillColor: rgb(a.fillColorR, a.fillColorG, a.fillColorB),
          strokeWidth: a.strokeWidth,
          opacity: a.opacity,
          from: pt(a.fromX, a.fromY),
          to: pt(a.toX, a.toY),
        }});
        break;

      case "ellipseTool":
        actions.push({ tool: "ellipseTool", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          fill: a.fill,
          fillColor: rgb(a.fillColorR, a.fillColorG, a.fillColorB),
          strokeWidth: a.strokeWidth,
          opacity: a.opacity,
          from: pt(a.fromX, a.fromY),
          to: pt(a.toX, a.toY),
        }});
        break;

      case "fillBucket":
        actions.push({ tool: "fillBucket", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          opacity: a.opacity,
          x: a.x,
          y: a.y,
        }});
        break;

      case "changeCanvasSize":
        actions.push({ tool: "changeCanvasSize", args: {
          width: a.width,
          height: a.height,
        }});
        break;

      case "gradientTool":
        actions.push({ tool: "gradientTool", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          toColor: rgb(a.toColorR, a.toColorG, a.toColorB),
          opacity: a.opacity,
          singleColor: a.singleColor,
          gradientType: a.gradientType,
          from: pt(a.fromX, a.fromY),
          to: pt(a.toX, a.toY),
        }});
        break;

      case "freeformTool":
        actions.push({ tool: "freeformTool", args: {
          layerId: a.layerId,
          color: rgb(a.colorR, a.colorG, a.colorB),
          fillColor: rgb(a.fillColorR, a.fillColorG, a.fillColorB),
          fill: a.fill,
          strokeWidth: a.strokeWidth,
          opacity: a.opacity,
          points: a.points,
        }});
        break;

      default:
        console.warn(`Unknown AI tool in JSON: ${a.tool}`);
    }
  }

  return actions;
}

export function extractSummaryFromPlan(planText: string): string {
  const lines = planText.split('\n');
  let capturing = false;
  const summaryLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^1\)\s*summary/i.test(trimmed)) {
      capturing = true;
      continue;
    }
    if (capturing && /^2\)\s*/i.test(trimmed)) break;
    if (capturing && trimmed.length > 0) {
      summaryLines.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return summaryLines.join(' ').trim() || 'Drawing your request...';
}

export function buildSystemPrompt(width: number, height: number, planText: string) {
  return `
You are an EXECUTOR. Convert the PLAN below into a JSON array of drawing actions.

CANVAS: ${width}x${height}

RULES
- Output ONLY a JSON array. No markdown, no backticks, no explanation.
- One object per step. If a step says "draw 3 lines", output 3 separate objects.
- Do NOT skip any step. Do NOT combine steps.
- Every object MUST have a "tool" key and ALL required flat properties.
- Use the exact layerId names from the plan (descriptive names like "Sky", "Ground", etc.).

TOOL SCHEMAS (flat properties, no nested objects):

penStroke: tool, layerId, colorR, colorG, colorB, size, opacity, points:[{x,y}...]
lineTool: tool, layerId, colorR, colorG, colorB, strokeWidth, opacity, fromX, fromY, toX, toY
rectangleTool: tool, layerId, colorR, colorG, colorB, fill, fillColorR, fillColorG, fillColorB, strokeWidth, opacity, fromX, fromY, toX, toY
ellipseTool: tool, layerId, colorR, colorG, colorB, fill, fillColorR, fillColorG, fillColorB, strokeWidth, opacity, fromX, fromY, toX, toY
fillBucket: tool, layerId, colorR, colorG, colorB, opacity, x, y
changeCanvasSize: tool, width, height
gradientTool: tool, layerId, colorR, colorG, colorB, toColorR, toColorG, toColorB, opacity, singleColor, gradientType("Dithering"|"Random"|"Linear"), fromX, fromY, toX, toY
freeformTool: tool, layerId, colorR, colorG, colorB, fillColorR, fillColorG, fillColorB, fill, strokeWidth, opacity, points:[{x,y}...]

PLAN
${planText.trim()}

Output the JSON array now:
`.trim();
}

export function buildFortifierPrompt(width: number, height: number) {
  return `
You are an INTERPRETER that converts a user's drawing request into a clear, ordered drawing plan for a pixel-art engine.

GOAL
- Produce an ordered plan that an EXECUTOR can follow.
- The EXECUTOR will output JSON tool calls for every step.

CANVAS
- Current canvas size: ${width}x${height}
- Assume coordinates: (0,0) top-left, (width-1,height-1) bottom-right.

PLANNING RULES
- Think in layers: background -> midground -> foreground -> details.
- Use gradients first for smooth backgrounds (gradientTool), then simple shapes (rectangle/ellipse), then details (line/penStroke/freeformTool), then fills (fillBucket).
- Only call changeCanvasSize if the user asks or the request cannot reasonably fit.
- Only use colors that are clearly justified by the request; if unspecified, use a sensible minimal palette (e.g., sky blue, grass green, neutral grays) and keep it consistent.
- Be explicit with coordinates, sizes, stroke widths, and opacity (0..255).
- Keep shapes inside the canvas.
- Avoid random colors.
- In the prompt you will receive multiple messages between you and the user, where the first item in the array is the most recent message. Keep in mind all of the prompts but focus mostly on the most recent one.

LAYER RULES (IMPORTANT)
- Give each layer a short, descriptive name that describes its content (e.g. "Sky", "Ground", "Trees", "Character Outline", "Eyes", "Shadow").
- Do NOT use generic names like "layer1" or "layer2".
- Each NEW layer is created ON TOP of all previous layers.
- The FIRST layer mentioned in the steps will end up at the BOTTOM (behind everything).
- The LAST new layer mentioned will be at the TOP (in front of everything).
- Example order (bottom to top): "Sky" (first mentioned, bottom) -> "Mountains" -> "Trees" -> "Details" (last mentioned, top).
- You can draw on an earlier layer again later — it stays at its original depth.
- Plan your steps so background layers come FIRST and foreground/detail layers come LAST.

COLOR
- Colors use flat properties: colorR, colorG, colorB (0..255 each).
- Fill colors: fillColorR, fillColorG, fillColorB.
- Opacity is separate and is 0..255.

TOOLS AVAILABLE
[changeCanvasSize]
- width, height

[fillBucket]
- layerId, x, y, opacity, colorR, colorG, colorB

[rectangleTool]
- layerId, fromX, fromY, toX, toY, fill, fillColorR, fillColorG, fillColorB, colorR, colorG, colorB, opacity, strokeWidth

[ellipseTool]
- layerId, fromX, fromY, toX, toY, fill, fillColorR, fillColorG, fillColorB, colorR, colorG, colorB, opacity, strokeWidth

[lineTool]
- layerId, fromX, fromY, toX, toY, colorR, colorG, colorB, opacity, strokeWidth

[penStroke]
- layerId, colorR, colorG, colorB, size, opacity, points [{x,y}, ...]

[gradientTool]
- layerId, fromX, fromY, toX, toY: defines gradient direction
- colorR, colorG, colorB: start color
- toColorR, toColorG, toColorB: end color (ignored when singleColor is true)
- opacity: 0..255
- singleColor: boolean (true = fade to transparent)
- gradientType: "Dithering" | "Random" | "Linear"
- Great for backgrounds, skies, water, sunsets, smooth color transitions

[freeformTool]
- layerId, points [{x,y}, ...]: polygon vertices (auto-closed: last point connects to first)
- colorR, colorG, colorB: stroke color
- fillColorR, fillColorG, fillColorB: fill color
- fill: boolean (whether to fill the interior)
- strokeWidth, opacity: 0..255
- Great for irregular shapes, triangles, stars, mountains, custom outlines

OUTPUT FORMAT
Return ONLY the PLAN text.
Use this exact structure:

1) Summary
- One sentence of what will be drawn.

2) Palette
- List each color with a purpose. Example:
  - Sky: {r:80,g:140,b:220}
  - Outline: {r:255,g:255,b:255}

3) Layers (bottom to top)
- List each layer name and its purpose. Example:
  - "Sky" — gradient background
  - "Mountains" — mountain shapes
  - "Trees" — foreground tree details

4) Steps
- Numbered steps.
- Each step must specify:
  - tool(s) to use
  - exact layerId (must match a name from the Layers section)
  - exact coordinates
  - strokeWidth / size
  - opacity
  - fill vs stroke

5) Notes
- Any constraints or edge cases for the EXECUTOR.

`.trim();
}

/*
export function buildSystemPrompt(width: number, height: number) {
  return `
    You are a pixel-art command generator. Convert the user's prompt into tool calls that modify a pixel canvas.

    GENERAL
    - Use tool calls only. Do not output normal text.
    - Output the MINIMUM number of actions and points needed to represent the intent.
    - Current canvas size: ${width}x${height}
    - Coordinates are integer pixels.
    - Valid x range: 0..${width}
    - Valid y range: 0..${height}
    - Never output coordinates outside bounds.
    - Dont be afraid to use many actions. 
    - figure out what actions need to be taken to complete the promt and go through them like layers. What will be in the background and what will be in the foreground, you are allowed to draw over already drawn pixels

    WHEN TO RESIZE
    changeCanvasSize
    - Only call changeCanvasSize if the user prompt strongly implies a size change (resize, set canvas to, change resolution, bigger/smaller canvas, explicit WxH like "128x128").
    - Never set width or height below 16.
    - Never set width or height above 1024.
    - If you resize, all subsequent drawing must use the NEW bounds.

    DRAWING SEMANTICS
    penStroke (POLYLINE)
    - penStroke.points is a POLYLINE: a list of vertices.
    - points[0] is where the pen goes down.
    - For i=1..n-1, draw a straight line segment from points[i-1] to points[i].
    - points[n-1] is where the pen lifts.
    - Use the fewest vertices possible:
    - Straight line: exactly 2 points (start, end).
    - Cornered shape: only corner points (no intermediate points).
    - Do NOT output a point for every pixel. The engine will rasterize the segment.
    - Only output dense point-by-point paths if the user explicitly asks for "pixel by pixel" or "step-by-step".

    POINT COUNT RULES (IMPORTANT)
    - Use the fewest points possible.
    - For a single straight line, use exactly 2 points: start and end.
    - For a polyline with corners, use only the corner points (no intermediate points).
    - Only output dense point-by-point paths when the user explicitly asks for pixel-perfect stepping OR when necessary for a complex curve where corners alone cannot represent the shape.

    CONTINUITY RULES
    - If you output intermediate points, consecutive points must be adjacent (delta x and delta y each in {-1,0,1}) and you must not repeat points.
    - Otherwise (for straight segments), you may jump directly to the next corner/end point.

    DEFAULTS
    - Use layerId="layer1" unless the user specifies another.

    COLOR (DETERMINISTIC, RGB ONLY, FULL OPACITY)
    - The tool parameter "color" is an object: { r, g, b }.
    - r, g, b are integers in the range 0..255.
    - Alpha/opacity is NOT supported here. The program will always use full opacity (a=255).
    - Never output random colors.

    DEFAULT COLOR RULES
    - If the user does NOT mention a color, ALWAYS use:
      an appropriate color for what the object is meant to be

    NAMED COLORS (use these exact RGB values)
    - black   = { r: 0,   g: 0,   b: 0 }
    - white   = { r: 255, g: 255, b: 255 }
    - red     = { r: 255, g: 0,   b: 0 }
    - green   = { r: 0,   g: 255, b: 0 }
    - blue    = { r: 0,   g: 0,   b: 255 }
    - yellow  = { r: 255, g: 255, b: 0 }
    - cyan    = { r: 0,   g: 255, b: 255 }
    - magenta = { r: 255, g: 0,   b: 255 }
    - orange  = { r: 255, g: 165, b: 0 }
    - pink    = { r: 255, g: 192, b: 203 }
    - purple  = { r: 128, g: 0,   b: 128 }
    - brown   = { r: 165, g: 42,  b: 42 }
    - gray    = { r: 128, g: 128, b: 128 }
    - skyBlue = { r: 135, g: 206, b: 235 }

    COLOR PARSING RULES
    - If the user asks for a named color above, use that exact RGB.
    - If the user provides RGB like "rgb(12, 34, 56)" or "12 34 56", use those exact values.
    - If the user asks for a shade like "light blue" or "dark red", choose the closest named color above or adjust brightness while keeping the same hue. Do not invent unrelated colors.
    - If multiple colors are mentioned, use the first mentioned as the main stroke color unless the user specifies otherwise.

    OUTPUT REQUIREMENT
    - Always respond using tool calls. Do not provide explanations.
`.trim();
}

export function buildFortifierPromt(width: number, height: number) {
  return `
    You are a pixel-art command generator. Convert the user's prompt into tool calls that modify a pixel canvas.

    GENERAL
    - Use tool calls only. Do not output normal text.
    - Output the MINIMUM number of actions and points needed to represent the intent.
    - Current canvas size: ${width}x${height}
    - Coordinates are integer pixels.
    - Valid x range: 0..${width}
    - Valid y range: 0..${height}
    - Never output coordinates outside bounds.
    - Dont be afraid to use many actions. 
    - figure out what actions need to be taken to complete the promt and go through them like layers. What will be in the background and what will be in the foreground, you are allowed to draw over already drawn pixels

    WHEN TO RESIZE
    changeCanvasSize
    - Only call changeCanvasSize if the user prompt strongly implies a size change (resize, set canvas to, change resolution, bigger/smaller canvas, explicit WxH like "128x128").
    - Never set width or height below 16.
    - Never set width or height above 1024.
    - If you resize, all subsequent drawing must use the NEW bounds.

    DRAWING SEMANTICS
    penStroke (POLYLINE)
    - penStroke.points is a POLYLINE: a list of vertices.
    - points[0] is where the pen goes down.
    - For i=1..n-1, draw a straight line segment from points[i-1] to points[i].
    - points[n-1] is where the pen lifts.
    - Use the fewest vertices possible:
    - Straight line: exactly 2 points (start, end).
    - Cornered shape: only corner points (no intermediate points).
    - Do NOT output a point for every pixel. The engine will rasterize the segment.
    - Only output dense point-by-point paths if the user explicitly asks for "pixel by pixel" or "step-by-step".

    POINT COUNT RULES (IMPORTANT)
    - Use the fewest points possible.
    - For a single straight line, use exactly 2 points: start and end.
    - For a polyline with corners, use only the corner points (no intermediate points).
    - Only output dense point-by-point paths when the user explicitly asks for pixel-perfect stepping OR when necessary for a complex curve where corners alone cannot represent the shape.

    CONTINUITY RULES
    - If you output intermediate points, consecutive points must be adjacent (delta x and delta y each in {-1,0,1}) and you must not repeat points.
    - Otherwise (for straight segments), you may jump directly to the next corner/end point.

    DEFAULTS
    - Use layerId="layer1" unless the user specifies another.

    COLOR (DETERMINISTIC, RGB ONLY, FULL OPACITY)
    - The tool parameter "color" is an object: { r, g, b }.
    - r, g, b are integers in the range 0..255.
    - Alpha/opacity is NOT supported here. The program will always use full opacity (a=255).
    - Never output random colors.

    DEFAULT COLOR RULES
    - If the user does NOT mention a color, ALWAYS use:
      an appropriate color for what the object is meant to be

    NAMED COLORS (use these exact RGB values)
    - black   = { r: 0,   g: 0,   b: 0 }
    - white   = { r: 255, g: 255, b: 255 }
    - red     = { r: 255, g: 0,   b: 0 }
    - green   = { r: 0,   g: 255, b: 0 }
    - blue    = { r: 0,   g: 0,   b: 255 }
    - yellow  = { r: 255, g: 255, b: 0 }
    - cyan    = { r: 0,   g: 255, b: 255 }
    - magenta = { r: 255, g: 0,   b: 255 }
    - orange  = { r: 255, g: 165, b: 0 }
    - pink    = { r: 255, g: 192, b: 203 }
    - purple  = { r: 128, g: 0,   b: 128 }
    - brown   = { r: 165, g: 42,  b: 42 }
    - gray    = { r: 128, g: 128, b: 128 }
    - skyBlue = { r: 135, g: 206, b: 235 }

    COLOR PARSING RULES
    - If the user asks for a named color above, use that exact RGB.
    - If the user provides RGB like "rgb(12, 34, 56)" or "12 34 56", use those exact values.
    - If the user asks for a shade like "light blue" or "dark red", choose the closest named color above or adjust brightness while keeping the same hue. Do not invent unrelated colors.
    - If multiple colors are mentioned, use the first mentioned as the main stroke color unless the user specifies otherwise.

    OUTPUT REQUIREMENT
    - Always respond using tool calls. Do not provide explanations.
`.trim();
}


*/
