import type OpenAi from 'openai'
import { AiAction, AiActionEnum } from '../models/AiModels'

export function parseAiActions(
  response: OpenAi.Responses.Response
): AiAction[]{
  const actions: AiAction[] = [];

  for (const item of response.output) {
    if (item.type !== 'function_call') continue;

    const args = JSON.parse(item.arguments);

    switch (item.name) {
      case "penStroke":
        actions.push({
          action: AiActionEnum.penStroke,
          layerId: args.layerId,
          size: args.size,
          color: args.color,
          points: args.points,
        });
        break;

      case "changeCanvasSize":
        actions.push({
          action: AiActionEnum.changeCanvasSize,
          width: args.width,
          height: args.height
        });
        break;

      default:
        throw new Error(`Unknown AI tool: ${item.name}`);
    }
  }

  return actions;
}

export function buildSystemPrompt(width: number, height: number, planText: string) {
  return `
You are an EXECUTOR. You receive a PLAN and must produce tool calls to execute it exactly.

HARD RULES
- Output ONLY tool calls. No normal text.
- Execute EVERY step in the PLAN, in order (1..N).
- Do NOT skip steps. Do NOT stop early.
- Do NOT merge steps unless the PLAN explicitly says to merge them.
- If the PLAN specifies "single pixel", output a penStroke with exactly ONE point (x,y).
- If the PLAN specifies a line, output a penStroke with exactly TWO points (start,end).
- Use layerId="layer1" unless the PLAN specifies otherwise.

CANVAS
- Canvas is ${width}x${height}.
- Valid x: 0..${width - 1}
- Valid y: 0..${height - 1}
- Never output coordinates outside bounds.

TOOLS
changeCanvasSize
- Only call if the PLAN says resize.
- If the PLAN says "Canvas: keep", DO NOT call changeCanvasSize.

penStroke
- points is a polyline (vertices).
- For a single pixel: points = [{x, y}].
- For a straight line: points = [{x1,y1}, {x2,y2}].
- For a polyline: only corner vertices.

COLOR (RGB)
- color is an object { r, g, b } with integers 0..255.
- Use ONLY the colors listed in the PLAN palette.

PLAN (AUTHORITATIVE)
${planText.trim()}

Now output the tool calls for all steps.
`.trim();
}

export function buildFortifierPrompt(width: number, height: number) {
  return `
You are an INTERPRETER that converts a user's drawing request into a clear, ordered drawing plan for a pixel-art engine.

OUTPUT FORMAT (TEXT ONLY)
Return ONLY a plan in this exact format:

PLAN
Canvas: <keep|resize to WxH>
Style: <icon|simple|detailed>
Main subject: <short noun phrase>
Composition: <one sentence describing placement and scale>
Palette:
- <name>: rgb(R,G,B)
- ...
Steps (ordered):
1) <layer: background|midground|foreground> <what to draw> <color name> <stroke size> <notes>
2) ...
Constraints:
- <bullet list of constraints you inferred from the user prompt>

RULES
- Do NOT mention tools or JSON.
- Be specific and concrete. The executor must be able to draw from your plan.
- Infer reasonable defaults when missing:
  - If no style is requested, prefer "icon".
  - Center the subject unless the user says otherwise.
  - Keep the current canvas size unless the user implies resizing.
- Respect user constraints and exclusions:
  - If the user says "not yellow" or "avoid yellow", do not use yellow or yellow-like colors.
  - If the user excludes an object/feature, do not include it.
- If the user requests a color by name (e.g. "sky blue"), include it in Palette with an RGB value.
- If the user does not specify colors, choose sensible object-appropriate colors (e.g. grass/stem often green), but keep the palette small (2–5 colors) unless necessary.

CANVAS CONTEXT
- Current canvas size: ${width}x${height}
- Coordinates are integer pixels within bounds: x in [0..${width - 1}], y in [0..${height - 1}]
- Default layer is "layer1"
- Stroke size default: 1

COLOR RULES (RGB ONLY, FULL OPACITY)
- Use rgb(R,G,B) with integers 0..255.
- No opacity. The program will render full opacity.

INTERPRETATION GUIDANCE
- Prefer simple recognizable pixel-art forms.
- Use symmetry for objects like flowers.
- For "flower" specifically, a good default is:
  - stem + 1–2 leaves
  - circular center
  - 5–8 petals arranged around the center
  - choose colors unless forbidden by the user.
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

