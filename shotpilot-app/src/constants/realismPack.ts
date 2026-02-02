export const REALISM_PACK = {
    LOCK_BLOCK: `
- cinematic still frame, raw photographed realism, captured through a physical lens
- natural depth of field, realistic highlight rolloff, subtle filmic grain
- physically plausible lighting and shadows, realistic skin texture (no plastic)
- imperfect real-world entropy: mild wear, micro-scratches, natural variation
- avoid AI sheen, avoid HDR/glow, avoid sterile symmetry
    `.trim(),

    UNIVERSAL_NEGATIVES: `
no CGI, no render, no plastic skin, no waxy texture, no hyper-detailed, no oversharpened, no HDR, no perfect symmetry, no airbrushed skin, no unnatural bokeh, no glossy surfaces, no fake volumetrics, uncanny valley, deformed anatomy, extra fingers, bad hands, bad teeth, text artifacts, watermark, logo, jpeg artifacts, AI noise
    `.trim(),

    LENS_DEFAULTS: {
        portrait: "35mm or 50mm lens, f/4 to f/5.6, natural facial proportions",
        environment: "24mm to 35mm lens, f/8 to f/11, deeper focus and spatial clarity",
        detail: "85mm lens, f/2.8 to f/4, controlled background separation"
    },

    LIGHTING_DEFAULTS: {
        template: "- motivated key light source: [SOURCE]\n- key direction: [DIRECTION]\n- contrast + falloff: [CONTRAST]\n- atmosphere interaction: [ATMOSPHERE]"
    }
};

export const NANO_BANANA_CONSTANTS = {
    // Specifically for Nano Banana Pro acting as Nano Banana Pro
    NEGATIVE_ADDITIONS: "glitch, distorted, mutated, gibberish text, low resolution"
};
