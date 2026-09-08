import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

// ── Groq API helper ──────────────────────────────────────────────────────────
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

async function callGroq(systemPrompt, userMessage) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── Section list ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "personal", label: "Personal Details"},
  { id: "education", label: "Education"},
  { id: "experience", label: "Experience"},
  { id: "projects", label: "Projects"},
  { id: "skills", label: "Skills"},
  { id: "certifications", label: "Certifications"},
  { id: "achievements", label: "Achievements"},
];

// ── Empty state factories ─────────────────────────────────────────────────────
const emptyPersonal = () => ({ name: "", phone: "", email: "", linkedin: "", github: "", location: "" });
const emptyEdu = () => ({ degree: "", institution: "", grade: "", startDate: "", endDate: "" });
const emptyExp = () => ({ role: "", company: "", startDate: "", endDate: "", bullets: ["", "", ""] });
const emptyProj = () => ({ name: "", technologies: "", startDate: "", endDate: "", bullets: ["", "", ""] });
const emptySkills = () => ({ languages: "", webDev: "", databases: "", fundamentals: "", tools: "" });

// ── Reusable input components ─────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || label}
      style={styles.input}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 2 }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={styles.label}>{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || label}
      rows={rows}
      style={{ ...styles.input, resize: "vertical", lineHeight: 1.5 }}
    />
  </div>
);

// ── Card wrapper for repeatable sections ─────────────────────────────────────
const EntryCard = ({ index, onRemove, children }) => (
  <div style={styles.entryCard}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={styles.entryIndex}>#{index + 1}</span>
      <button onClick={onRemove} style={styles.removeBtn} title="Remove">✕</button>
    </div>
    {children}
  </div>
);

// ── Section Forms ─────────────────────────────────────────────────────────────
function PersonalForm({ data, setData }) {
  const u = (k) => (v) => setData((p) => ({ ...p, [k]: v }));
  return (
    <div>
      <Field label="Full Name *" value={data.name} onChange={u("name")} placeholder="e.g. John Doe" />
      <Field label="Phone" value={data.phone} onChange={u("phone")} placeholder="(123) 456-7890" />
      <Field label="Email" value={data.email} onChange={u("email")} placeholder="john@example.com" type="email" />
      <Field label="LinkedIn URL" value={data.linkedin} onChange={u("linkedin")} placeholder="linkedin.com/in/johndoe" />
      <Field label="GitHub URL" value={data.github} onChange={u("github")} placeholder="github.com/johndoe" />
      <Field label="Location" value={data.location} onChange={u("location")} placeholder="New York, NY" />
    </div>
  );
}

function EducationForm({ items, setItems }) {
  const update = (i, k) => (v) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => items.length < 3 && setItems((p) => [...p, emptyEdu()]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  return (
    <div>
      {items.map((edu, i) => (
        <EntryCard key={i} index={i} onRemove={() => remove(i)}>
          <Field label="Degree / Qualification" value={edu.degree} onChange={update(i, "degree")} placeholder="B.Sc. Computer Science" />
          <Field label="Institution" value={edu.institution} onChange={update(i, "institution")} placeholder="University Name" />
          <Field label="Grade / GPA" value={edu.grade} onChange={update(i, "grade")} placeholder="3.8 / 4.0" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date" value={edu.startDate} onChange={update(i, "startDate")} placeholder="Jan 2018" />
            <Field label="End Date" value={edu.endDate} onChange={update(i, "endDate")} placeholder="May 2022" />
          </div>
        </EntryCard>
      ))}
      {items.length < 3 && <button onClick={add} style={styles.addBtn}>+ Add Education</button>}
    </div>
  );
}

function ExperienceForm({ items, setItems }) {
  const update = (i, k) => (v) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updateBullet = (i, bi) => (v) =>
    setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, bullets: x.bullets.map((b, j) => j === bi ? v : b) } : x));
  const add = () => items.length < 3 && setItems((p) => [...p, emptyExp()]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  return (
    <div>
      {items.map((exp, i) => (
        <EntryCard key={i} index={i} onRemove={() => remove(i)}>
          <Field label="Job Title" value={exp.role} onChange={update(i, "role")} placeholder="Software Engineer" />
          <Field label="Company" value={exp.company} onChange={update(i, "company")} placeholder="ABC Corporation" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date" value={exp.startDate} onChange={update(i, "startDate")} placeholder="Jun 2022" />
            <Field label="End Date" value={exp.endDate} onChange={update(i, "endDate")} placeholder="Present" />
          </div>
          <label style={styles.label}>Responsibilities / Bullet Points</label>
          {exp.bullets.map((b, bi) => (
            <input key={bi} value={b} onChange={(e) => updateBullet(i, bi)(e.target.value)}
              placeholder={`Bullet ${bi + 1}`} style={{ ...styles.input, marginBottom: 6 }} />
          ))}
        </EntryCard>
      ))}
      {items.length < 3 && <button onClick={add} style={styles.addBtn}>+ Add Experience</button>}
    </div>
  );
}

function ProjectsForm({ items, setItems }) {
  const update = (i, k) => (v) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const updateBullet = (i, bi) => (v) =>
    setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, bullets: x.bullets.map((b, j) => j === bi ? v : b) } : x));
  const add = () => items.length < 3 && setItems((p) => [...p, emptyProj()]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  return (
    <div>
      {items.map((proj, i) => (
        <EntryCard key={i} index={i} onRemove={() => remove(i)}>
          <Field label="Project Name" value={proj.name} onChange={update(i, "name")} placeholder="Personal Website" />
          <Field label="Tech Stack" value={proj.technologies} onChange={update(i, "technologies")} placeholder="React, Node.js, MongoDB" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Start Date" value={proj.startDate} onChange={update(i, "startDate")} placeholder="Jan 2023" />
            <Field label="End Date" value={proj.endDate} onChange={update(i, "endDate")} placeholder="Mar 2023" />
          </div>
          <label style={styles.label}>Key Points (up to 3)</label>
          {proj.bullets.map((b, bi) => (
            <input key={bi} value={b} onChange={(e) => updateBullet(i, bi)(e.target.value)}
              placeholder={`Point ${bi + 1} — e.g. Built REST API with JWT authentication`}
              style={{ ...styles.input, marginBottom: 6 }} />
          ))}
        </EntryCard>
      ))}
      {items.length < 3 && <button onClick={add} style={styles.addBtn}>+ Add Project</button>}
    </div>
  );
}

function SkillsForm({ data, setData }) {
  const u = (k) => (v) => setData((p) => ({ ...p, [k]: v }));
  return (
    <div>
      <TextArea label="Languages" value={data.languages} onChange={u("languages")}
        placeholder="e.g. JavaScript, Python, Java, C++, TypeScript" rows={2} />
      <TextArea label="Web Development" value={data.webDev} onChange={u("webDev")}
        placeholder="e.g. React, Node.js, Express, HTML, CSS, Next.js, Tailwind" rows={2} />
      <TextArea label="Databases" value={data.databases} onChange={u("databases")}
        placeholder="e.g. MySQL, PostgreSQL, MongoDB, Redis, Firebase" rows={2} />
      <TextArea label="Fundamentals" value={data.fundamentals} onChange={u("fundamentals")}
        placeholder="e.g. Data Structures, Algorithms, OOP, OS, DBMS, Computer Networks" rows={2} />
      <TextArea label="Tools" value={data.tools} onChange={u("tools")}
        placeholder="e.g. Git, Docker, VS Code, Postman, AWS, Linux, Figma" rows={2} />
    </div>
  );
}

function CertificationsForm({ items, setItems }) {
  const add = () => setItems((p) => [...p, ""]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const update = (i) => (v) => setItems((p) => p.map((x, idx) => (idx === i ? v : x)));
  return (
    <div>
      {items.map((cert, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={cert} onChange={(e) => update(i)(e.target.value)}
            placeholder={`Certification ${i + 1}`} style={{ ...styles.input, flex: 1, marginBottom: 0 }} />
          <button onClick={() => remove(i)} style={styles.removeBtn}>✕</button>
        </div>
      ))}
      <button onClick={add} style={styles.addBtn}>+ Add Certification</button>
    </div>
  );
}

function AchievementsForm({ items, setItems }) {
  const add = () => setItems((p) => [...p, ""]);
  const remove = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const update = (i) => (v) => setItems((p) => p.map((x, idx) => (idx === i ? v : x)));
  return (
    <div>
      {items.map((ach, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={ach} onChange={(e) => update(i)(e.target.value)}
            placeholder={`Achievement ${i + 1}`} style={{ ...styles.input, flex: 1, marginBottom: 0 }} />
          <button onClick={() => remove(i)} style={styles.removeBtn}>✕</button>
        </div>
      ))}
      <button onClick={add} style={styles.addBtn}>+ Add Achievement</button>
    </div>
  );
}

// ── Resume Preview ────────────────────────────────────────────────────────────
function ResumeSection({ title, children }) {
  return (
    <div style={styles.resumeSection}>
      <h2 style={styles.resumeSectionTitle}>{title}</h2>
      <hr style={styles.resumeHr} />
      {children}
    </div>
  );
}

function ResumePreview({ data }) {
  const { personal, education, experience, projects, skills, certifications, achievements } = data;

  const hasPersonal = personal.name;
  const hasEducation = education.some((e) => e.degree || e.institution);
  const hasExperience = experience.some((e) => e.role || e.company);
  const hasProjects = projects.some((p) => p.name);
  const hasSkills = skills.languages || skills.webDev || skills.databases || skills.fundamentals || skills.tools;
  const hasCerts = certifications.some((c) => c.trim());
  const hasAchievements = achievements.some((a) => a.trim());

  const skillRows = [
    skills.languages    && { label: "Languages",       value: skills.languages },
    skills.webDev       && { label: "Web Development",  value: skills.webDev },
    skills.databases    && { label: "Databases",        value: skills.databases },
    skills.fundamentals && { label: "Fundamentals",     value: skills.fundamentals },
    skills.tools        && { label: "Tools",            value: skills.tools },
  ].filter(Boolean);

  if (!hasPersonal && !hasEducation && !hasExperience && !hasProjects && !hasSkills && !hasCerts && !hasAchievements) {
    return (
      <div style={styles.emptyPreview}>
        <div style={styles.emptyIcon}>📄</div>
        <p style={styles.emptyText}>Your resume preview will appear here</p>
        <p style={styles.emptySubtext}>Fill in the sections on the left to get started</p>
      </div>
    );
  }

  return (
    <div id="resume-printable" style={styles.resumeDoc}>
      {hasPersonal && (
        <div style={styles.resumeHeader}>
          <h1 style={styles.resumeName}>{personal.name}</h1>
          <p style={styles.resumeContact}>
            {[personal.phone, personal.email, personal.linkedin, personal.github, personal.location]
              .filter(Boolean).join(" | ")}
          </p>
        </div>
      )}

      {hasEducation && (
        <ResumeSection title="Education">
          {education.filter((e) => e.degree || e.institution).map((edu, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={styles.resumeEntryRow}>
                <span style={styles.resumeEntryTitle}>
                  {edu.degree}{edu.institution ? ` - ${edu.institution}` : ""}
                </span>
                <span style={styles.resumeEntryDate}>
                  {[edu.startDate, edu.endDate].filter(Boolean).join(" - ")}
                </span>
              </div>
              {edu.grade && <p style={styles.resumeSubline}>Grade: {edu.grade}</p>}
            </div>
          ))}
        </ResumeSection>
      )}

      {hasExperience && (
        <ResumeSection title="Experience">
          {experience.filter((e) => e.role || e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={styles.resumeEntryRow}>
                <span style={styles.resumeEntryTitle}>
                  {exp.role}{exp.company ? ` at ${exp.company}` : ""}
                </span>
                <span style={styles.resumeEntryDate}>
                  {[exp.startDate, exp.endDate].filter(Boolean).join(" - ")}
                </span>
              </div>
              <ul style={styles.resumeList}>
                {exp.bullets.filter((b) => b.trim()).map((b, bi) => (
                  <li key={bi} style={styles.resumeListItem}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </ResumeSection>
      )}

      {hasProjects && (
        <ResumeSection title="Projects">
          {projects.filter((p) => p.name).map((proj, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={styles.resumeEntryRow}>
                <span style={styles.resumeEntryTitle}>
                  {proj.name}
                  {proj.technologies && <span style={{ fontWeight: 400 }}> | {proj.technologies}</span>}
                </span>
                <span style={styles.resumeEntryDate}>
                  {[proj.startDate, proj.endDate].filter(Boolean).join(" - ")}
                </span>
              </div>
              <ul style={styles.resumeList}>
                {(proj.bullets || []).filter((b) => b.trim()).map((b, bi) => (
                  <li key={bi} style={styles.resumeListItem}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </ResumeSection>
      )}

      {hasSkills && (
        <ResumeSection title="Technical Skills">
          {skillRows.map((row, i) => (
            <p key={i} style={{ ...styles.resumeSubline, marginBottom: 4 }}>
              <span style={{ fontWeight: 700 }}>{row.label}: </span>{row.value}
            </p>
          ))}
        </ResumeSection>
      )}

      {hasCerts && (
        <ResumeSection title="Certifications">
          <ul style={styles.resumeList}>
            {certifications.filter((c) => c.trim()).map((c, i) => (
              <li key={i} style={styles.resumeListItem}>{c}</li>
            ))}
          </ul>
        </ResumeSection>
      )}

      {hasAchievements && (
        <ResumeSection title="Achievements">
          <ul style={styles.resumeList}>
            {achievements.filter((a) => a.trim()).map((a, i) => (
              <li key={i} style={styles.resumeListItem}>{a}</li>
            ))}
          </ul>
        </ResumeSection>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState("personal");
  const [generating, setGenerating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [error, setError] = useState("");

  const [personal, setPersonal]           = useState(emptyPersonal());
  const [education, setEducation]         = useState([emptyEdu()]);
  const [experience, setExperience]       = useState([emptyExp()]);
  const [projects, setProjects]           = useState([emptyProj()]);
  const [skills, setSkills]               = useState(emptySkills());
  const [certifications, setCertifications] = useState([""]);
  const [achievements, setAchievements]   = useState([""]);

  const resumeData = { personal, education, experience, projects, skills, certifications, achievements };

  // ── AI Enhance ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!GROQ_API_KEY) {
      setError("Groq API key not found. Add VITE_GROQ_API_KEY to your .env file.");
      return;
    }
    setError("");
    setGenerating(true);
    setAiStatus("Analyzing your resume data...");
    try {
      const rawData = JSON.stringify(resumeData, null, 2);
      const systemPrompt = `You are a professional resume writer. The user will give you raw resume data in JSON.
Your job is to enhance it and return ONLY valid JSON in the exact same schema — do not add or remove keys.
Rules:
- Improve bullet points to be action-oriented and quantified where possible.
- Polish project descriptions to be concise and impactful.
- Fix grammar and improve phrasing throughout.
- Keep all arrays within their original length limits (max 3 for education, experience, projects).
- Do NOT invent new information. Only improve existing text.
- Return ONLY the JSON object. No markdown, no explanation.`;

      setAiStatus("Enhancing your resume with AI...");
      const result = await callGroq(systemPrompt, `Enhance this resume data:\n${rawData}`);
      const cleaned = result.replace(/```json|```/g, "").trim();
      const enhanced = JSON.parse(cleaned);

      if (enhanced.personal)       setPersonal(enhanced.personal);
      if (enhanced.education)      setEducation(enhanced.education);
      if (enhanced.experience)     setExperience(enhanced.experience);
      if (enhanced.projects)       setProjects(enhanced.projects);
      if (enhanced.skills)         setSkills(enhanced.skills);
      if (enhanced.certifications) setCertifications(enhanced.certifications);
      if (enhanced.achievements)   setAchievements(enhanced.achievements);

      setAiStatus("✅ Resume enhanced successfully!");
      setTimeout(() => setAiStatus(""), 3000);
    } catch (err) {
      setError(`AI Error: ${err.message}`);
      setAiStatus("");
    } finally {
      setGenerating(false);
    }
  };

  // ── PDF Generation ────────────────────────────────────────────────────────
  const handleGeneratePDF = async () => {
    const el = document.getElementById("resume-printable");
    if (!el) {
      alert("Please fill in your resume details first.");
      return;
    }
    setPdfGenerating(true);
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${personal.name || "resume"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    try {
      await html2pdf().set(opt).from(el).save();
    } catch (e) {
      alert("PDF generation failed: " + e.message);
    }
    setPdfGenerating(false);
  };

  // ── Section forms map ────────────────────────────────────────────────────
  const sectionForms = {
    personal:       <PersonalForm data={personal} setData={setPersonal} />,
    education:      <EducationForm items={education} setItems={setEducation} />,
    experience:     <ExperienceForm items={experience} setItems={setExperience} />,
    projects:       <ProjectsForm items={projects} setItems={setProjects} />,
    skills:         <SkillsForm data={skills} setData={setSkills} />,
    certifications: <CertificationsForm items={certifications} setItems={setCertifications} />,
    achievements: (
      <div>
        <AchievementsForm items={achievements} setItems={setAchievements} />
        <div style={styles.generateBox}>
          <h3 style={styles.generateTitle}>🤖 AI Resume Enhancer</h3>
          <p style={styles.generateDesc}>
            Click Generate to let AI polish your resume — improving bullet points, descriptions, and phrasing
            automatically. Requires <code>VITE_GROQ_API_KEY</code> in your <code>.env</code> file.
          </p>
          {error   && <p style={styles.errorText}>{error}</p>}
          {aiStatus && <p style={styles.statusText}>{aiStatus}</p>}
          <button onClick={handleGenerate} disabled={generating}
            style={{ ...styles.generateBtn, opacity: generating ? 0.7 : 1 }}>
            {generating ? "⏳ Generating..." : "✨ Enhance Resume with AI"}
          </button>
        </div>
      </div>
    ),
  };

  const idx = SECTIONS.findIndex((s) => s.id === activeSection);

  return (
    <div style={styles.root}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.logo}></span>
          <span style={styles.logoText}>AI Resume Builder</span>
        </div>
        <button onClick={handleGeneratePDF} disabled={pdfGenerating}
          style={{ ...styles.printBtn, opacity: pdfGenerating ? 0.7 : 1 }}>
          {pdfGenerating ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <p style={styles.sidebarHeading}>BUILD SECTIONS</p>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ ...styles.sidebarItem, ...(activeSection === s.id ? styles.sidebarItemActive : {}) }}>
              <span style={styles.sidebarIcon}>{s.icon}</span>
              <span style={styles.sidebarLabel}>{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Form Panel */}
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>
              {SECTIONS[idx]?.icon} {SECTIONS[idx]?.label}
            </h2>
            <p style={styles.formSubtitle}>
              {activeSection === "personal"       && "Your contact information"}
              {activeSection === "education"      && "Add up to 3 education entries"}
              {activeSection === "experience"     && "Add up to 3 work experiences"}
              {activeSection === "projects"       && "Add up to 3 projects"}
              {activeSection === "skills"         && "Technical skills by category"}
              {activeSection === "certifications" && "Professional certifications"}
              {activeSection === "achievements"   && "List your accomplishments"}
            </p>
          </div>
          <div style={styles.formBody}>{sectionForms[activeSection]}</div>
          <div style={styles.navRow}>
            {idx > 0 && (
              <button onClick={() => setActiveSection(SECTIONS[idx - 1].id)} style={styles.navBtn}>
                ← Previous
              </button>
            )}
            {idx < SECTIONS.length - 1 && (
              <button onClick={() => setActiveSection(SECTIONS[idx + 1].id)}
                style={{ ...styles.navBtn, ...styles.navBtnNext, marginLeft: "auto" }}>
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div style={styles.previewPanel}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>Live Preview</span>
          </div>
          <div style={styles.previewScroll}>
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input:focus, textarea:focus { outline: none; border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        button:hover { filter: brightness(0.95); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0f2f8", minHeight: "100vh", display: "flex", flexDirection: "column" },
  topBar: { background: "#1e1b4b", color: "#fff", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", position: "sticky", top: 64, zIndex: 40 },
  topBarLeft: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 22 },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: 0.3 },
  printBtn: { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  layout: { display: "grid", gridTemplateColumns: "220px 380px 1fr", flex: 1, height: "calc(100vh - 56px)", overflow: "hidden" },
  sidebar: { background: "#1e1b4b", padding: "20px 0", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.08)" },
  sidebarHeading: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "0 20px 12px", margin: 0 },
  sidebarItem: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 20px", background: "transparent", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: 13.5, fontWeight: 500, textAlign: "left", borderLeft: "3px solid transparent" },
  sidebarItemActive: { background: "rgba(255,255,255,0.1)", color: "#fff", borderLeft: "3px solid #818cf8" },
  sidebarIcon: { fontSize: 16, minWidth: 20 },
  sidebarLabel: { flex: 1 },
  formPanel: { background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" },
  formHeader: { padding: "20px 24px 14px", borderBottom: "1px solid #f3f4f6", background: "#fafbff" },
  formTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: "#1e1b4b" },
  formSubtitle: { margin: "4px 0 0", fontSize: 12, color: "#9ca3af" },
  formBody: { flex: 1, overflowY: "auto", padding: "20px 24px" },
  navRow: { display: "flex", padding: "12px 24px", borderTop: "1px solid #f3f4f6", background: "#fafbff", gap: 8 },
  navBtn: { padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" },
  navBtnNext: { background: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { display: "block", width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13.5, color: "#111827", background: "#fff", transition: "border-color 0.2s" },
  entryCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16 },
  entryIndex: { fontSize: 12, fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: 20 },
  removeBtn: { background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  addBtn: { width: "100%", padding: "10px", border: "2px dashed #d1d5db", borderRadius: 10, background: "transparent", color: "#6b7280", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  generateBox: { marginTop: 24, background: "linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)", border: "1px solid #c7d2fe", borderRadius: 14, padding: 20 },
  generateTitle: { margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#1e1b4b" },
  generateDesc: { margin: "0 0 16px", fontSize: 12.5, color: "#6b7280", lineHeight: 1.6 },
  generateBtn: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 12px rgba(79,70,229,0.35)" },
  errorText: { color: "#dc2626", fontSize: 12.5, marginBottom: 10, fontWeight: 500 },
  statusText: { color: "#059669", fontSize: 12.5, marginBottom: 10, fontWeight: 500 },
  previewPanel: { display: "flex", flexDirection: "column", overflow: "hidden", background: "#e5e7eb" },
  previewHeader: { padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center" },
  previewTitle: { fontSize: 13, fontWeight: 700, color: "#374151", letterSpacing: 0.5 },
  previewScroll: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", justifyContent: "center" },
  resumeDoc: { background: "#fff", width: "100%", maxWidth: 760, minHeight: 900, padding: "40px 48px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", fontFamily: "'Times New Roman', Times, serif", fontSize: 12.5, color: "#111", lineHeight: 1.5 },
  resumeHeader: { textAlign: "center", marginBottom: 20 },
  resumeName: { fontSize: 26, fontWeight: 700, margin: "0 0 6px", fontFamily: "inherit" },
  resumeContact: { fontSize: 11.5, color: "#444", margin: 0 },
  resumeSection: { marginBottom: 14 },
  resumeSectionTitle: { fontSize: 13, fontWeight: 700, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'Segoe UI', sans-serif" },
  resumeHr: { border: "none", borderTop: "1.5px solid #222", margin: "2px 0 8px" },
  resumeEntryRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  resumeEntryTitle: { fontWeight: 600, fontSize: 12.5, flex: 1 },
  resumeEntryDate: { fontSize: 12, color: "#444", whiteSpace: "nowrap", marginLeft: 8 },
  resumeSubline: { margin: "2px 0 0", fontSize: 12, color: "#333" },
  resumeList: { margin: "4px 0 0 0", paddingLeft: 20 },
  resumeListItem: { marginBottom: 3, fontSize: 12.5 },
  emptyPreview: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, color: "#9ca3af" },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: 600, margin: "0 0 6px" },
  emptySubtext: { fontSize: 13, margin: 0 },
};