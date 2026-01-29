# Video Analysis for AI Filmmaking - Research Notes

## GPT-4o Video Analysis Capabilities

**Source:** https://openai.com/index/hello-gpt-4o/

### Key Capabilities:
- **Multimodal Input:** Accepts "any combination of text, audio, image, and video"
- **Real-time Processing:** Can reason across audio, vision, and text in real time
- **Response Time:** 232-320ms average (similar to human response time)
- **Launched:** May 2024

### Technical Details:
- End-to-end trained model across text, vision, and audio
- Single neural network processes all inputs and outputs
- Can directly observe tone, multiple speakers, background noises
- Can output laughter, singing, and express emotion

### Potential Use Cases for AI Filmmaking:
- Analyzing generated AI videos for quality control
- Understanding what worked/didn't work in generated clips
- Extracting insights from reference videos
- Identifying artifacts and issues in generated content

---

## Gemini Video Understanding Capabilities

**Source:** https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/video-understanding

### Supported Models:
- Gemini 3 Pro (preview)
- Gemini 3 Flash (preview)
- Gemini 2.5 Pro
- Gemini 2.5 Flash
- Gemini 2.5 Flash-Lite
- Gemini 2.0 Flash-Lite

### Technical Specifications:

**File Limits:**
- Maximum video length (with audio): ~45 minutes
- Maximum video length (without audio): ~1 hour
- Maximum number of videos per prompt: 10

**Supported Formats:**
- video/x-flv
- video/quicktime
- video/mpeg
- video/mpegs
- video/mpg
- video/mp4
- video/webm
- video/wmv
- video/3gpp

**Resolution:**
- Default resolution tokens per frame: 70 (Gemini 3)
- Standard resolution: 768 x 768 (Gemini 2.5 Flash with Live API)

### Capabilities:
- Summarization of video content
- Chapter extraction with timestamps
- Scene analysis
- Audio understanding (when included)
- Customizable clipping intervals
- Frame rate sampling control

### Potential Use Cases for AI Filmmaking:
- Analyzing generated videos for narrative coherence
- Extracting timestamps for multi-shot sequences
- Comparing reference videos to generated outputs
- Quality control automation
- Shot-by-shot analysis of generated content

---

## Claude 3.5 Sonnet (Indirect Video Analysis)

**Source:** Search results

### Capabilities:
- Can work with video files when preprocessed
- Requires transcripts + frame extraction
- Not native video understanding like GPT-4o or Gemini

### Workflow:
1. Extract frames from video
2. Generate transcript
3. Feed both to Claude for analysis

---

## Specialized Video Analysis Tools

### TwelveLabs
**Source:** https://www.twelvelabs.io/

- Dedicated video understanding platform
- "AI that can see, hear, and reason"
- Search and understand videos with AI
- Find anything, discover deep insights, analyze, remix, automate workflows

---

## AI Filmmaking Workflow Applications

### 1. Quality Control Automation
- Analyze generated videos for common artifacts (flickering, morphing, jitter)
- Identify inconsistencies in character appearance
- Check lip-sync accuracy in dialogue scenes
- Verify camera motion smoothness

### 2. Feedback Loop Workflows
- Generate video → Analyze with GPT-4o/Gemini → Extract insights → Refine prompt → Regenerate
- Iterative improvement based on automated analysis
- Track what prompting techniques work best

### 3. Reference Video Analysis
- Analyze reference videos to extract prompting insights
- Understand cinematography techniques
- Extract camera movement patterns
- Identify lighting and composition principles

### 4. Shot Planning & Storyboarding
- Analyze existing films to understand shot structure
- Extract timing and pacing information
- Identify transition techniques
- Study character blocking and movement

### 5. Comparative Analysis
- Compare generated video to reference
- Identify gaps between vision and output
- Track improvement over iterations
- Benchmark different models against each other

---

## API Integration Considerations

### GPT-4o
- Available via OpenAI API
- Multimodal input support
- Real-time processing capabilities

### Gemini
- Available via Google Vertex AI API
- Batch processing support
- Customizable frame sampling
- Chapter extraction with timestamps

---

## Recommended Workflows

### Workflow 1: Automated Quality Control
1. Generate video with chosen model
2. Upload to GPT-4o or Gemini
3. Prompt: "Analyze this video for common AI artifacts: flickering, morphing, jitter, inconsistent style, poor lip-sync. Provide a detailed report."
4. Review analysis
5. Fix issues or regenerate

### Workflow 2: Reference-Based Improvement
1. Upload reference video to GPT-4o/Gemini
2. Prompt: "Analyze the cinematography, camera movements, lighting, and composition in this video. Provide specific details I can use in prompts for AI video generation."
3. Extract insights
4. Apply to prompts
5. Generate and compare

### Workflow 3: Iterative Refinement
1. Generate initial video
2. Analyze with GPT-4o/Gemini
3. Ask: "What could be improved in this video? What prompting changes would help?"
4. Refine prompt based on feedback
5. Regenerate and repeat

---

## Next Steps for Guide Creation

1. Create comprehensive guide covering:
   - Introduction to video analysis for AI filmmaking
   - Model comparison (GPT-4o vs Gemini)
   - Practical workflows (QC, feedback loops, reference analysis)
   - API integration examples
   - Best practices and prompting techniques
   - Case studies and examples
