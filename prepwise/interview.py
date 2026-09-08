import streamlit as st
import time
import requests
from fpdf import FPDF
from gtts import gTTS
import os
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase
import av

# ---------------- CONFIG ----------------
GROQ_API_KEY = "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"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"
MAX_QUESTIONS = 8

# ---------------- GROQ CALL ----------------
def groq_chat(system_prompt, user_prompt, temperature=0.6):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "temperature": temperature,
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()},
        ]
    }

    res = requests.post(GROQ_URL, headers=headers, json=payload)
    data = res.json()

    if "choices" not in data:
        return f"❌ Groq Error: {data}"

    return data["choices"][0]["message"]["content"]

# ---------------- NEXT QUESTION ----------------
def next_question(interview_type, role, transcript, q_no, user_answer=None):
    system_prompt = f"""
You are PrepWise AI Interviewer.

Interview Type: {interview_type}
Role: {role}

Rules:
- Ask only one question at a time.
- Ask questions ONLY in English.
- Ask follow-up questions based on user's last answer.
- Normal difficulty.
- Total questions max: {MAX_QUESTIONS}.
"""

    formatted = "\n".join(transcript) if transcript else "None"

    user_prompt = f"""
Question Number: {q_no}/{MAX_QUESTIONS}

Transcript:
{formatted}

User last answer:
{user_answer if user_answer else "None (first question)"}

Return ONLY the next interview question (no extra text).
"""
    return groq_chat(system_prompt, user_prompt, temperature=0.6)

# ---------------- FINAL EVALUATION ----------------
def evaluate(interview_type, role, transcript):
    system_prompt = f"""
You are PrepWise Interview Evaluator.
Evaluate based on BOTH:
1) Technical correctness
2) Communication clarity
Return English only.
Score out of 10.
"""

    formatted = "\n".join(transcript)

    user_prompt = f"""
Interview Type: {interview_type}
Role: {role}

Transcript:
{formatted}

Return evaluation in this exact format:
Score: X/10
Strengths:
- ...
Improvements:
- ...
Focus Areas:
- ...
Final Feedback:
...
"""
    return groq_chat(system_prompt, user_prompt, temperature=0.4)

# ---------------- PDF ----------------
def generate_pdf(filename, interview_type, role, duration, evaluation_text):
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, "PrepWise - Interview Report", ln=True, align="C")

    pdf.ln(10)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 8, f"Interview Type: {interview_type}", ln=True)
    pdf.cell(200, 8, f"Role: {role}", ln=True)
    pdf.cell(200, 8, f"Duration: {duration} minutes", ln=True)

    pdf.ln(10)
    pdf.set_font("Arial", size=11)
    for line in evaluation_text.split("\n"):
        pdf.multi_cell(0, 7, line)

    pdf.output(filename)

# ---------------- AI VOICE (TTS) ----------------
def speak_ai(text, filename="ai_voice.mp3"):
    tts = gTTS(text=text, lang="en")
    tts.save(filename)
    return filename

# ---------------- FACE CAM PROCESSOR ----------------
class VideoProcessor(VideoProcessorBase):
    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        img = frame.to_ndarray(format="bgr24")
        return av.VideoFrame.from_ndarray(img, format="bgr24")

# ---------------- SESSION STATE ----------------
if "started" not in st.session_state:
    st.session_state.started = False
    st.session_state.transcript = []
    st.session_state.question = ""
    st.session_state.q_no = 0
    st.session_state.end_time = 0
    st.session_state.user_answer = ""
    st.session_state.last_ai_audio = None

# ---------------- UI ----------------
st.set_page_config(page_title="PrepWise Voice Interview", layout="wide")
st.title("🎤 PrepWise - Voice Interview (Groq + FaceCam)")

# SETTINGS SCREEN
if not st.session_state.started:
    with st.form("settings"):
        col1, col2, col3 = st.columns(3)

        with col1:
            interview_type = st.selectbox("Interview Type", ["Technical", "Behavioural/HR"])

        with col2:
            role = st.selectbox("Role", [
                "Frontend Developer",
                "Backend Developer",
                "Full Stack Developer",
                "Software Engineer",
                "Data Analyst"
            ])

        with col3:
            duration = st.selectbox("Duration (mins)", [10, 15, 20, 25, 30, 40, 45])

        start_btn = st.form_submit_button("✅ Start Interview")

    if start_btn:
        st.session_state.started = True
        st.session_state.role = role
        st.session_state.interview_type = interview_type
        st.session_state.duration = duration
        st.session_state.end_time = time.time() + duration * 60

        st.session_state.q_no = 1
        q = next_question(interview_type, role, [], 1)
        st.session_state.question = q
        st.session_state.transcript = [f"AI: {q}"]

        # ✅ Generate AI voice audio
        audio_file = speak_ai(q)
        st.session_state.last_ai_audio = audio_file

        st.rerun()

# INTERVIEW SESSION SCREEN
else:
    time_left = int(st.session_state.end_time - time.time())

    # ✅ Time finished -> generate PDF report
    if time_left <= 0:
        st.warning("⏰ Time Completed! Generating report...")
        report = evaluate(
            st.session_state.interview_type,
            st.session_state.role,
            st.session_state.transcript
        )
        generate_pdf(
            "PrepWise_Report.pdf",
            st.session_state.interview_type,
            st.session_state.role,
            st.session_state.duration,
            report
        )
        st.success("✅ Report Generated!")
        st.download_button("⬇️ Download PDF", data=open("PrepWise_Report.pdf", "rb"), file_name="PrepWise_Report.pdf")
        st.session_state.started = False
        st.stop()

    # HEADER
    colA, colB = st.columns([4, 1])
    with colA:
        st.subheader(f"{st.session_state.role} Interview")
        st.caption(f"{st.session_state.interview_type} • Question {st.session_state.q_no}/{MAX_QUESTIONS}")
    with colB:
        st.metric("Time Left", f"{time_left//60:02}:{time_left%60:02}")

    st.divider()

    # TWO PANELS UI (LIKE YOUR REACT IMAGE)
    left, right = st.columns(2)

    # AI PANEL
    with left:
        st.markdown("### 🤖 AI Interviewer")
        st.info(st.session_state.question)

        # ✅ Play AI Voice
        if st.session_state.last_ai_audio and os.path.exists(st.session_state.last_ai_audio):
            st.audio(st.session_state.last_ai_audio)

        if st.button("🔁 Repeat Question"):
            audio_file = speak_ai(st.session_state.question)
            st.session_state.last_ai_audio = audio_file
            st.rerun()

    # USER PANEL
    with right:
        st.markdown("### 🙂 You (FaceCam)")
        webrtc_streamer(
            key="facecam",
            video_processor_factory=VideoProcessor,
            media_stream_constraints={"video": True, "audio": False},
            async_processing=True,
        )

        st.markdown("#### 🎙️ Your Answer")
        st.session_state.user_answer = st.text_area("Type Answer (Voice STT coming below)", st.session_state.user_answer, height=130)

    st.divider()

    # ✅ Mic Waveform Animation (simple UI)
    st.markdown("### 🎧 Mic Waveform (Listening)")
    wave_cols = st.columns(12)
    for i in range(12):
        wave_cols[i].progress((i * 8 + int(time.time() * 20) % 100) % 100)

    st.divider()

    # CONTROLS
    c1, c2, c3 = st.columns(3)

    with c1:
        st.info("✅ STT (Voice Input) requires browser audio recorder integration. (Next step)")
    with c2:
        if st.button("✅ Submit Answer"):
            ans = st.session_state.user_answer.strip()

            if ans == "":
                st.error("❌ Please answer before submitting.")
            else:
                st.session_state.transcript.append(f"USER: {ans}")

                # ✅ if completed 8 questions -> report
                if st.session_state.q_no >= MAX_QUESTIONS:
                    st.warning("✅ Interview completed! Generating report...")

                    report = evaluate(
                        st.session_state.interview_type,
                        st.session_state.role,
                        st.session_state.transcript
                    )
                    generate_pdf(
                        "PrepWise_Report.pdf",
                        st.session_state.interview_type,
                        st.session_state.role,
                        st.session_state.duration,
                        report
                    )

                    st.success("✅ Report Generated!")
                    st.download_button("⬇️ Download PDF", data=open("PrepWise_Report.pdf", "rb"), file_name="PrepWise_Report.pdf")
                    st.session_state.started = False
                    st.stop()

                # ✅ next question
                st.session_state.q_no += 1
                nq = next_question(
                    st.session_state.interview_type,
                    st.session_state.role,
                    st.session_state.transcript,
                    st.session_state.q_no,
                    ans
                )

                st.session_state.question = nq
                st.session_state.transcript.append(f"AI: {nq}")
                st.session_state.user_answer = ""

                audio_file = speak_ai(nq)
                st.session_state.last_ai_audio = audio_file

                st.rerun()

    with c3:
        if st.button("❌ Leave Interview"):
            st.session_state.started = False
            st.warning("Interview ended.")
            st.rerun()
