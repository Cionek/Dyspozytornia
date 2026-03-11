import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const incidentTypes = [
  "NZK",
  "Ból w klatce piersiowej",
  "Duszność",
  "Utrata przytomności",
  "Drgawki",
  "Udar",
  "Uraz",
  "Wypadek komunikacyjny",
  "Krwotok",
  "Zatrucie",
  "Poród",
  "Inne",
];

const priorities = [
  { value: "KOD 1", label: "KOD 1 – natychmiastowy" },
  { value: "KOD 2", label: "KOD 2 – pilny" },
];

const channels = ["112", "999", "Policja", "Straż Pożarna", "Inne służby"];
const places = ["Mieszkanie", "Droga", "Zakład pracy", "Teren otwarty", "Szkoła", "Inne"];
const units = ["ZRM P", "ZRM S", "LPR", "PSP/OSP", "Policja"];
const instructionOptions = [
  "RKO przez telefon",
  "Pozycja bezpieczna",
  "Tamowanie krwotoku",
  "Pomoc przy porodzie",
  "Ewakuacja",
  "Brak instrukcji",
];

const getNow = () => new Date();
const pad = (n) => String(n).padStart(2, "0");
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const formatTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const buildIncidentNumber = (counter) => {
  const d = getNow();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${String(counter).padStart(4, "0")}`;
};

const emptyForm = (counter = 1) => {
  const now = getNow();
  return {
    incidentNumber: buildIncidentNumber(counter),
    reportDate: formatDate(now),
    reportTime: formatTime(now),
    dispatcher: "",
    channel: "112",
    callerName: "",
    callerPhone: "",
    callerOnScene: "tak",
    city: "",
    street: "",
    building: "",
    landmark: "",
    gps: "",
    placeType: "Mieszkanie",
    incidentType: "NZK",
    casualties: "1",
    patientSex: "",
    patientAge: "",
    conscious: "",
    breathing: "",
    hemorrhage: "nie",
    trapped: "nie",
    dangerActive: "nie",
    priority: "KOD 1",
    dispatchedUnits: [],
    dispatcherInstructions: [],
    notes: "",
    status: "Przyjęte",
  };
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: 16,
    fontFamily: "Arial, sans-serif",
    color: "#0f172a",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #dbe2ea",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: 14,
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  button: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  buttonPrimary: {
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.45fr 0.85fr",
    gap: 20,
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 22,
    fontWeight: 700,
  },
  sectionText: {
    margin: "0 0 16px",
    color: "#475569",
    fontSize: 14,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  grid5: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: 14,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 120,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: 14,
    resize: "vertical",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    fontSize: 14,
  },
  badgeRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    fontSize: 12,
    fontWeight: 700,
  },
  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 14,
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 10,
    marginBottom: 16,
  },
  toggleButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 600,
  },
  toggleButtonActiveDark: {
    border: "1px solid #0f172a",
    borderRadius: 12,
    padding: 12,
    background: "#0f172a",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 600,
  },
  toggleButtonActiveBlue: {
    border: "1px solid #1d4ed8",
    borderRadius: 12,
    padding: 12,
    background: "#1d4ed8",
    color: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 600,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 560,
    overflow: "auto",
  },
  incidentCard: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    background: "#ffffff",
    padding: 14,
    textAlign: "left",
    cursor: "pointer",
  },
};

const getPriorityBadgeStyle = (priority) => ({
  ...styles.badge,
  background: priority === "KOD 1" ? "#fee2e2" : "#fef3c7",
  color: priority === "KOD 1" ? "#991b1b" : "#92400e",
  borderColor: priority === "KOD 1" ? "#fecaca" : "#fde68a",
});

const getStatusBadgeStyle = (status) => {
  const map = {
    Przyjęte: { bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
    Zadysponowane: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    "W trakcie": { bg: "#ffedd5", color: "#c2410c", border: "#fdba74" },
    Zakończone: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
    Anulowane: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  };
  const current = map[status] || { bg: "#e2e8f0", color: "#334155", border: "#cbd5e1" };
  return { ...styles.badge, background: current.bg, color: current.color, borderColor: current.border };
};

function StatCard({ label, value }) {
  return (
    <div style={styles.panel}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export default function DispatcherApp() {
  const [counter, setCounter] = useState(1);
  const [form, setForm] = useState(emptyForm(1));
  const [incidents, setIncidents] = useState([]);

  const summary = useMemo(
    () => ({
      total: incidents.length,
      active: incidents.filter((i) => ["Przyjęte", "Zadysponowane", "W trakcie"].includes(i.status)).length,
      critical: incidents.filter((i) => i.priority === "KOD 1").length,
      finished: incidents.filter((i) => i.status === "Zakończone").length,
    }),
    [incidents],
  );

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayValue = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const saveIncident = () => {
    const incident = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    setIncidents((prev) => [incident, ...prev]);
    const nextCounter = counter + 1;
    setCounter(nextCounter);
    setForm(emptyForm(nextCounter));
  };

  const loadIncident = (incident) => {
    const { id, createdAt, ...rest } = incident;
    setForm(rest);
  };

  const newCard = () => {
    const nextCounter = counter + 1;
    setCounter(nextCounter);
    setForm(emptyForm(nextCounter));
  };

  const exportCurrentToPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    const writeLine = (label, value = "—") => {
      const safeValue = Array.isArray(value) ? (value.length ? value.join(", ") : "Brak") : value || "—";
      const text = `${label}: ${safeValue}`;
      const lines = doc.splitTextToSize(text, pageWidth - 24);
      doc.text(lines, 12, y);
      y += lines.length * 7;

      if (y > 275) {
        doc.addPage();
        y = 18;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Karta obsługi zgłoszenia", 12, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    writeLine("Numer zdarzenia", form.incidentNumber);
    writeLine("Data", form.reportDate);
    writeLine("Godzina", form.reportTime);
    writeLine("Dyspozytor", form.dispatcher);
    writeLine("Kanał zgłoszenia", form.channel);
    writeLine("Kod pilności", form.priority);
    writeLine("Status", form.status);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Dane zgłaszającego", 12, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    writeLine("Imię i nazwisko", form.callerName);
    writeLine("Telefon", form.callerPhone);
    writeLine("Na miejscu", form.callerOnScene);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Lokalizacja", 12, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    writeLine("Miejscowość", form.city);
    writeLine("Ulica", form.street);
    writeLine("Nr budynku / lokalu", form.building);
    writeLine("Punkt charakterystyczny", form.landmark);
    writeLine("GPS", form.gps);
    writeLine("Typ miejsca", form.placeType);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Pacjent i zdarzenie", 12, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    writeLine("Rodzaj zdarzenia", form.incidentType);
    writeLine("Liczba poszkodowanych", form.casualties);
    writeLine("Płeć", form.patientSex);
    writeLine("Wiek", form.patientAge);
    writeLine("Przytomny", form.conscious);
    writeLine("Oddycha", form.breathing);
    writeLine("Krwotok", form.hemorrhage);
    writeLine("Uwięziony", form.trapped);
    writeLine("Zagrożenie trwa", form.dangerActive);
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("Dysponowanie", 12, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    writeLine("Zadysponowane siły i środki", form.dispatchedUnits);
    writeLine("Instrukcje telefoniczne", form.dispatcherInstructions);
    writeLine("Notatka dyspozytora", form.notes);

    doc.save(`karta-zgloszenia-${form.incidentNumber || "bez-numeru"}.pdf`);
  };

  const responsiveMainGrid = {
    ...styles.mainGrid,
    gridTemplateColumns: window.innerWidth < 1100 ? "1fr" : "1.45fr 0.85fr",
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ ...styles.panel, marginBottom: 20 }}>
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>Dyspozytornia Medyczna</h1>
              <p style={styles.subtitle}>Nowa aplikacja do obsługi zgłoszeń i tworzenia kart dyspozytorskich.</p>
            </div>
            <div style={styles.buttonRow}>
              <button style={styles.button} onClick={newCard}>Nowe zgłoszenie</button>
              <button style={styles.buttonPrimary} onClick={saveIncident}>Zapisz zdarzenie</button>
              <button style={styles.button} onClick={exportCurrentToPdf}>Pobierz PDF</button>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard label="Wszystkie zgłoszenia" value={summary.total} />
          <StatCard label="Aktywne" value={summary.active} />
          <StatCard label="KOD 1" value={summary.critical} />
          <StatCard label="Zakończone" value={summary.finished} />
        </div>

        <div style={responsiveMainGrid}>
          <div style={styles.panel}>
            <div style={{ ...styles.headerRow, marginBottom: 16 }}>
              <div>
                <h2 style={styles.sectionTitle}>Karta Dyspozytora</h2>
                <p style={styles.sectionText}>Formularz zgłoszenia wzorowany na realnej pracy dyspozytorni.</p>
              </div>
              <div style={styles.badgeRow}>
                <span style={getPriorityBadgeStyle(form.priority)}>{form.priority}</span>
                <span style={getStatusBadgeStyle(form.status)}>{form.status}</span>
              </div>
            </div>

            <div style={styles.grid4}>
              <Field label="Numer zdarzenia"><input style={styles.input} value={form.incidentNumber} onChange={(e) => setField("incidentNumber", e.target.value)} /></Field>
              <Field label="Data"><input style={styles.input} value={form.reportDate} onChange={(e) => setField("reportDate", e.target.value)} /></Field>
              <Field label="Godzina"><input style={styles.input} value={form.reportTime} onChange={(e) => setField("reportTime", e.target.value)} /></Field>
              <Field label="Dyspozytor"><input style={styles.input} value={form.dispatcher} onChange={(e) => setField("dispatcher", e.target.value)} placeholder="np. DM K. Głosnek" /></Field>
            </div>

            <div style={styles.grid4}>
              <Field label="Kanał zgłoszenia">
                <select style={styles.select} value={form.channel} onChange={(e) => setField("channel", e.target.value)}>
                  {channels.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Imię i nazwisko zgłaszającego"><input style={styles.input} value={form.callerName} onChange={(e) => setField("callerName", e.target.value)} /></Field>
              <Field label="Telefon"><input style={styles.input} value={form.callerPhone} onChange={(e) => setField("callerPhone", e.target.value)} /></Field>
              <Field label="Zgłaszający na miejscu">
                <select style={styles.select} value={form.callerOnScene} onChange={(e) => setField("callerOnScene", e.target.value)}>
                  <option value="tak">Tak</option>
                  <option value="nie">Nie</option>
                </select>
              </Field>
            </div>

            <div style={styles.grid2}>
              <Field label="Kod pilności">
                <select style={styles.select} value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
                  {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
              <Field label="Rodzaj zdarzenia">
                <select style={styles.select} value={form.incidentType} onChange={(e) => setField("incidentType", e.target.value)}>
                  {incidentTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
            </div>

            <div style={styles.grid4}>
              <Field label="Miejscowość"><input style={styles.input} value={form.city} onChange={(e) => setField("city", e.target.value)} /></Field>
              <Field label="Ulica"><input style={styles.input} value={form.street} onChange={(e) => setField("street", e.target.value)} /></Field>
              <Field label="Nr budynku / lokalu"><input style={styles.input} value={form.building} onChange={(e) => setField("building", e.target.value)} /></Field>
              <Field label="Typ miejsca">
                <select style={styles.select} value={form.placeType} onChange={(e) => setField("placeType", e.target.value)}>
                  {places.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
            </div>

            <div style={styles.grid2}>
              <Field label="Punkt charakterystyczny"><input style={styles.input} value={form.landmark} onChange={(e) => setField("landmark", e.target.value)} placeholder="np. brama nr 2, stacja paliw" /></Field>
              <Field label="GPS"><input style={styles.input} value={form.gps} onChange={(e) => setField("gps", e.target.value)} placeholder="50.294, 19.123" /></Field>
            </div>

            <div style={styles.grid4}>
              <Field label="Liczba poszkodowanych"><input style={styles.input} value={form.casualties} onChange={(e) => setField("casualties", e.target.value)} /></Field>
              <Field label="Płeć"><input style={styles.input} value={form.patientSex} onChange={(e) => setField("patientSex", e.target.value)} placeholder="K / M / NN" /></Field>
              <Field label="Wiek"><input style={styles.input} value={form.patientAge} onChange={(e) => setField("patientAge", e.target.value)} placeholder="np. 54" /></Field>
              <Field label="Status zdarzenia">
                <select style={styles.select} value={form.status} onChange={(e) => setField("status", e.target.value)}>
                  <option value="Przyjęte">Przyjęte</option>
                  <option value="Zadysponowane">Zadysponowane</option>
                  <option value="W trakcie">W trakcie</option>
                  <option value="Zakończone">Zakończone</option>
                  <option value="Anulowane">Anulowane</option>
                </select>
              </Field>
            </div>

            <div style={styles.grid5}>
              {[
                ["conscious", "Przytomny"],
                ["breathing", "Oddycha"],
                ["hemorrhage", "Krwotok"],
                ["trapped", "Uwięziony"],
                ["dangerActive", "Zagrożenie trwa"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <select style={styles.select} value={form[key]} onChange={(e) => setField(key, e.target.value)}>
                    <option value="">Wybierz</option>
                    <option value="tak">Tak</option>
                    <option value="nie">Nie</option>
                    <option value="nieznane">Nieznane</option>
                  </select>
                </Field>
              ))}
            </div>

            <div>
              <div style={{ ...styles.label, marginBottom: 10 }}>Zadysponowane siły i środki</div>
              <div style={styles.actionGrid}>
                {units.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => toggleArrayValue("dispatchedUnits", unit)}
                    style={form.dispatchedUnits.includes(unit) ? styles.toggleButtonActiveDark : styles.toggleButton}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ ...styles.label, marginBottom: 10 }}>Instrukcje telefoniczne</div>
              <div style={styles.actionGrid}>
                {instructionOptions.map((instruction) => (
                  <button
                    key={instruction}
                    type="button"
                    onClick={() => toggleArrayValue("dispatcherInstructions", instruction)}
                    style={form.dispatcherInstructions.includes(instruction) ? styles.toggleButtonActiveBlue : styles.toggleButton}
                  >
                    {instruction}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Notatka dyspozytora">
              <textarea
                style={styles.textarea}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Opis zdarzenia, priorytety, dodatkowe informacje..."
              />
            </Field>
          </div>

          <div style={styles.sideColumn}>
            <div style={styles.panel}>
              <h2 style={styles.sectionTitle}>Podgląd bieżącego zgłoszenia</h2>
              <div style={styles.previewRow}><span>Numer</span><strong>{form.incidentNumber}</strong></div>
              <div style={styles.previewRow}><span>Data / godzina</span><strong>{form.reportDate} {form.reportTime}</strong></div>
              <div style={styles.previewRow}><span>Zgłaszający</span><strong>{form.callerName || "—"} / {form.callerPhone || "—"}</strong></div>
              <div style={styles.previewRow}><span>Miejsce</span><strong>{[form.city, form.street, form.building].filter(Boolean).join(", ") || "—"}</strong></div>
              <div style={styles.previewRow}><span>Pacjent</span><strong>{form.patientSex || "NN"}, {form.patientAge || "?"} lat, {form.casualties || 0} poszk.</strong></div>
              <div style={styles.previewRow}><span>Rodzaj</span><strong>{form.incidentType}</strong></div>
              <div style={styles.previewRow}><span>Jednostki</span><strong>{form.dispatchedUnits.length ? form.dispatchedUnits.join(", ") : "Brak"}</strong></div>
              <div style={{ ...styles.previewRow, borderBottom: "none" }}><span>Instrukcje</span><strong>{form.dispatcherInstructions.length ? form.dispatcherInstructions.join(", ") : "Brak"}</strong></div>
            </div>

            <div style={styles.panel}>
              <div style={styles.headerRow}>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Lista zgłoszeń</h2>
                <span style={{ ...styles.badge, background: "#e2e8f0" }}>{incidents.length}</span>
              </div>
              <div style={styles.list}>
                {incidents.length === 0 && (
                  <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: 16, color: "#64748b" }}>
                    Brak zapisanych zgłoszeń. Zacznij od pierwszej karty.
                  </div>
                )}

                {incidents.map((incident) => (
                  <button
                    type="button"
                    key={incident.id}
                    onClick={() => loadIncident(incident)}
                    style={styles.incidentCard}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{incident.incidentNumber}</div>
                        <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>{incident.incidentType}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{incident.city || "Brak miasta"} • {incident.reportDate} {incident.reportTime}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span style={getPriorityBadgeStyle(incident.priority)}>{incident.priority}</span>
                        <span style={getStatusBadgeStyle(incident.status)}>{incident.status}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
