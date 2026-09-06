import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  LayoutGrid, Route as RouteIcon, Camera, BarChart3, ShieldAlert, TriangleAlert,
  Car, Search, Clock, MapPin, Gauge, Radio, ChevronRight, Fingerprint,
  Siren, CircleAlert, Eye, ArrowRight, CheckCircle2, XCircle, Bike, Truck, Bus,
} from "lucide-react";

/* ----------------------------- mock data layer ----------------------------- */

const CAMERAS = [
  { id: "CAM_01", name: "Airport Rd Junction", x: 700, y: 520, vpd: 18200, avgSpeed: 46, peak: "6:00–9:00 AM", congestion: "LOW" },
  { id: "CAM_02", name: "LB Nagar Circle", x: 610, y: 470, vpd: 21500, avgSpeed: 28, peak: "8:30–10:30 AM", congestion: "HIGH" },
  { id: "CAM_03", name: "Charminar Chowk", x: 460, y: 430, vpd: 25400, avgSpeed: 19, peak: "5:00–8:00 PM", congestion: "HIGH" },
  { id: "CAM_04", name: "Begumpet Signal", x: 390, y: 300, vpd: 17800, avgSpeed: 33, peak: "9:00–11:00 AM", congestion: "MEDIUM" },
  { id: "CAM_05", name: "Hitech City Junction", x: 210, y: 255, vpd: 15432, avgSpeed: 32, peak: "8:30–10:00 AM", congestion: "HIGH" },
  { id: "CAM_06", name: "Gachibowli Flyover", x: 130, y: 330, vpd: 14100, avgSpeed: 41, peak: "9:00–10:30 AM", congestion: "MEDIUM" },
  { id: "CAM_07", name: "Madhapur Cross", x: 190, y: 190, vpd: 12760, avgSpeed: 37, peak: "6:00–8:00 PM", congestion: "MEDIUM" },
  { id: "CAM_08", name: "Kondapur Road", x: 110, y: 155, vpd: 9800, avgSpeed: 44, peak: "8:00–9:30 AM", congestion: "LOW" },
  { id: "CAM_09", name: "Jubilee Hills Check Post", x: 290, y: 150, vpd: 13250, avgSpeed: 30, peak: "6:30–8:30 PM", congestion: "MEDIUM" },
  { id: "CAM_10", name: "Banjara Hills Rd No.12", x: 335, y: 225, vpd: 16900, avgSpeed: 27, peak: "5:30–7:30 PM", congestion: "HIGH" },
  { id: "CAM_11", name: "Kukatpally Housing Board", x: 155, y: 85, vpd: 19700, avgSpeed: 25, peak: "8:00–10:00 AM", congestion: "HIGH" },
  { id: "CAM_12", name: "Secunderabad Station Rd", x: 490, y: 185, vpd: 22300, avgSpeed: 22, peak: "5:00–7:00 PM", congestion: "HIGH" },
];

const EDGES = [
  ["CAM_01", "CAM_02"], ["CAM_02", "CAM_03"], ["CAM_03", "CAM_04"], ["CAM_04", "CAM_12"],
  ["CAM_04", "CAM_10"], ["CAM_10", "CAM_09"], ["CAM_09", "CAM_07"], ["CAM_07", "CAM_06"],
  ["CAM_06", "CAM_05"], ["CAM_05", "CAM_10"], ["CAM_07", "CAM_08"], ["CAM_09", "CAM_11"],
  ["CAM_08", "CAM_11"], ["CAM_05", "CAM_07"],
];

const CONGESTION_COLOR = { LOW: "#4CAF7D", MEDIUM: "#E7A93B", HIGH: "#E15251" };

const VEHICLE_ICONS = { SUV: Car, Sedan: Car, Hatchback: Car, Bike: Bike, Truck: Truck, Bus: Bus };

const VEHICLES = {
  "TS09AB1234": {
    vehicleId: "VH_001245", plate: "TS09AB1234", type: "SUV", color: "White",
    make: "Hyundai Creta", blacklisted: false,
    journey: [
      { cam: "CAM_09", entry: "18:02:12", exit: "18:02:40" },
      { cam: "CAM_10", entry: "18:11:05", exit: "18:11:30" },
      { cam: "CAM_05", entry: "18:24:50", exit: "18:25:15" },
    ],
    distanceKm: 9.8, avgSpeed: 34,
    confidence: { detection: 0.99, ocr: 0.94, tracking: 0.91 },
  },
  "AP10BZ7788": {
    vehicleId: "VH_004410", plate: "AP10BZ7788", type: "Sedan", color: "Black",
    make: "Honda City", blacklisted: true, blacklistReason: "Reported stolen — FIR 442/2026",
    journey: [
      { cam: "CAM_02", entry: "11:40:02", exit: "11:40:22" },
      { cam: "CAM_03", entry: "11:47:55", exit: "11:48:16" },
    ],
    distanceKm: 6.1, avgSpeed: 40,
    confidence: { detection: 0.97, ocr: 0.89, tracking: 0.85 },
  },
  "TS07EF4521": {
    vehicleId: "VH_002210", plate: "TS07EF4521", type: "Bike", color: "Red",
    make: "TVS Apache", blacklisted: false,
    journey: [
      { cam: "CAM_11", entry: "08:15:44", exit: "08:15:58" },
      { cam: "CAM_08", entry: "08:26:10", exit: "08:26:24" },
      { cam: "CAM_07", entry: "08:33:40", exit: "08:33:52" },
    ],
    distanceKm: 7.4, avgSpeed: 31,
    confidence: { detection: 0.98, ocr: 0.96, tracking: 0.93 },
  },
  "TS12CD9090": {
    vehicleId: "VH_007765", plate: "TS12CD9090", type: "Truck", color: "Blue",
    make: "Tata 407", blacklisted: false,
    journey: [
      { cam: "CAM_12", entry: "14:02:30", exit: "14:02:55" },
      { cam: "CAM_04", entry: "14:14:12", exit: "14:14:40" },
    ],
    distanceKm: 5.9, avgSpeed: 52,
    confidence: { detection: 0.96, ocr: 0.9, tracking: 0.88 },
    flagged: "Overspeeding — 95 km/h in a 60 km/h zone",
  },
};

const VIOLATIONS = [
  { id: "V-88213", plate: "TS12CD9090", type: "Overspeeding", cam: "CAM_04", time: "14:14:40", detail: "95 km/h in 60 km/h zone", confidence: 0.96, status: "Pending review" },
  { id: "V-88214", plate: "TS44XY0077", type: "Red light crossing", cam: "CAM_03", time: "17:52:03", detail: "Junction_4, frame 45672", confidence: 0.93, status: "Confirmed" },
  { id: "V-88215", plate: "TS21GH6650", type: "Wrong lane driving", cam: "CAM_10", time: "09:18:27", detail: "Entered bus priority lane", confidence: 0.88, status: "Pending review" },
  { id: "V-88216", plate: "TS07EF4521", type: "No helmet", cam: "CAM_08", time: "08:26:24", detail: "Rider — no helmet detected", confidence: 0.91, status: "Confirmed" },
  { id: "V-88217", plate: "TS33JK1121", type: "Illegal parking", cam: "CAM_09", time: "12:40:00", detail: "Stationary 24 min in no-parking zone", confidence: 0.85, status: "Pending review" },
];

const BLACKLIST_ALERTS = [
  { plate: "AP10BZ7788", reason: "Reported stolen — FIR 442/2026", lastSeen: "CAM_03", time: "11:48:16" },
  { plate: "TS19QW3345", reason: "Court order — vehicle seizure pending", lastSeen: "CAM_11", time: "07:02:41" },
];

const SUSPICIOUS_ALERTS = [
  { plate: "TS44XY0007", camA: "CAM_01", timeA: "10:00:00", camB: "CAM_11", timeB: "10:05:00", distanceKm: 20, note: "Impossible travel time — possible plate cloning" },
];

const RUSH_HOUR = [
  { hour: "05", vol: 4200 }, { hour: "06", vol: 9800 }, { hour: "07", vol: 18200 },
  { hour: "08", vol: 27600 }, { hour: "09", vol: 24300 }, { hour: "10", vol: 15400 },
  { hour: "11", vol: 12100 }, { hour: "12", vol: 13800 }, { hour: "13", vol: 14200 },
  { hour: "14", vol: 12900 }, { hour: "15", vol: 13500 }, { hour: "16", vol: 16700 },
  { hour: "17", vol: 22800 }, { hour: "18", vol: 28900 }, { hour: "19", vol: 25100 },
  { hour: "20", vol: 17300 }, { hour: "21", vol: 10600 }, { hour: "22", vol: 6200 },
];

const ROUTE_POPULARITY = [
  { route: "Airport → City Centre", vpd: 12000 },
  { route: "IT Corridor → Residential", vpd: 9500 },
  { route: "Secunderabad → Hitech City", vpd: 8700 },
  { route: "Charminar → Banjara Hills", vpd: 7400 },
  { route: "Kukatpally → Gachibowli", vpd: 6100 },
];

const OD_FLOWS = [
  { from: "CAM_01", to: "CAM_02", vpd: 15000, avgTravel: "12 min" },
  { from: "CAM_09", to: "CAM_10", vpd: 11200, avgTravel: "6 min" },
  { from: "CAM_04", to: "CAM_12", vpd: 9700, avgTravel: "9 min" },
  { from: "CAM_06", to: "CAM_05", vpd: 8400, avgTravel: "5 min" },
  { from: "CAM_11", to: "CAM_08", vpd: 7900, avgTravel: "7 min" },
];

const CONGESTION_FORECAST = [
  { road: "Hitech City Junction", current: "MEDIUM", predicted: "HIGH", in: "30 min" },
  { road: "Charminar Chowk", current: "HIGH", predicted: "HIGH", in: "30 min" },
  { road: "Banjara Hills Rd No.12", current: "MEDIUM", predicted: "HIGH", in: "45 min" },
  { road: "Gachibowli Flyover", current: "LOW", predicted: "MEDIUM", in: "40 min" },
];

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "trajectory", label: "Trajectory search", icon: RouteIcon },
  { id: "cameras", label: "Camera network", icon: Camera },
  { id: "analytics", label: "Traffic analytics", icon: BarChart3 },
  { id: "violations", label: "Violations", icon: TriangleAlert },
  { id: "alerts", label: "Alerts", icon: ShieldAlert },
  { id: "registry", label: "Vehicle registry", icon: Fingerprint },
];

/* --------------------------------- helpers --------------------------------- */

function camById(id) { return CAMERAS.find((c) => c.id === id); }
function Badge({ level }) {
  const color = CONGESTION_COLOR[level];
  return (
    <span className="badge" style={{ color, borderColor: color + "55", background: color + "18" }}>
      {level}
    </span>
  );
}
function ConfBar({ value, label }) {
  const pct = Math.round(value * 100);
  const color = pct >= 92 ? "#4CAF7D" : pct >= 85 ? "#E7A93B" : "#E15251";
  return (
    <div className="confbar">
      <div className="confbar-top"><span>{label}</span><span className="mono">{pct}%</span></div>
      <div className="confbar-track"><div className="confbar-fill" style={{ width: pct + "%", background: color }} /></div>
    </div>
  );
}

/* ---------------------------------- map ---------------------------------- */

function CityMap({ highlightRoute = [], highlightCam = null, onSelectCam }) {
  const routeSet = new Set(highlightRoute);
  return (
    <svg viewBox="0 0 800 600" className="citymap">
      {EDGES.map(([a, b], i) => {
        const ca = camById(a), cb = camById(b);
        const active = routeSet.has(a) && routeSet.has(b) &&
          Math.abs(highlightRoute.indexOf(a) - highlightRoute.indexOf(b)) === 1;
        return (
          <line key={i} x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
            stroke={active ? "#3FB6A8" : "#27344A"} strokeWidth={active ? 3.5 : 1.6}
            strokeDasharray={active ? "0" : "0"} />
        );
      })}
      {highlightRoute.length > 1 && highlightRoute.slice(0, -1).map((id, i) => {
        const a = camById(id), b = camById(highlightRoute[i + 1]);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        return (
          <g key={"arrow" + i}>
            <circle cx={mx} cy={my} r="3" fill="#3FB6A8" />
          </g>
        );
      })}
      {CAMERAS.map((c) => {
        const isRoute = routeSet.has(c.id);
        const isSel = highlightCam === c.id;
        return (
          <g key={c.id} onClick={() => onSelectCam && onSelectCam(c.id)} className="camnode" style={{ cursor: onSelectCam ? "pointer" : "default" }}>
            <circle cx={c.x} cy={c.y} r={isRoute ? 9 : isSel ? 10 : 7}
              fill={isRoute ? "#3FB6A8" : CONGESTION_COLOR[c.congestion]}
              stroke={isSel ? "#F4F6FA" : "#0B111C"} strokeWidth={isSel ? 2.5 : 1.5} />
            <text x={c.x} y={c.y - 13} textAnchor="middle" className="maplabel">{c.id.replace("CAM_", "C")}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------- sidebar --------------------------------- */

function Sidebar({ view, setView }) {
  return (
    <div className="sidebar">
      <div className="brand">
        <svg width="26" height="26" viewBox="0 0 26 26" className="brandmark">
          <circle cx="13" cy="13" r="11" fill="none" stroke="#3FB6A8" strokeWidth="1.4" />
          <circle cx="13" cy="13" r="4.4" fill="#3FB6A8" />
          <circle cx="13" cy="4.6" r="1.6" fill="#E7A93B" />
        </svg>
        <div>
          <div className="brand-name">TRINETRA</div>
          <div className="brand-sub">City vehicle intelligence</div>
        </div>
      </div>
      <nav className="navlist">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = view === n.id;
          return (
            <button key={n.id} className={"navitem" + (active ? " active" : "")} onClick={() => setView(n.id)}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{n.label}</span>
              {active && <ChevronRight size={14} className="navchevron" />}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="foot-row"><Radio size={13} /> <span>12/12 cameras online</span></div>
        <div className="foot-row mono">Hyderabad ANPR Grid · Sector 4</div>
      </div>
    </div>
  );
}

/* --------------------------------- topbar --------------------------------- */

function TopBar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-clock">
        <Clock size={14} /> <span className="mono">Live · updated 4s ago</span>
      </div>
    </div>
  );
}

/* --------------------------------- overview --------------------------------- */

function Overview({ setView, onSearchPlate }) {
  const kpis = [
    { label: "Vehicles tracked today", value: "2,84,650", icon: Car },
    { label: "Active cameras", value: "12 / 12", icon: Camera },
    { label: "Open alerts", value: "3", icon: ShieldAlert, warn: true },
    { label: "Avg. city speed", value: "29 km/h", icon: Gauge },
    { label: "OCR accuracy (24h)", value: "96.2%", icon: Eye },
  ];
  return (
    <div className="viewpad">
      <div className="kpi-row">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div className="kpi" key={k.label}>
              <div className="kpi-icon" style={k.warn ? { color: "#E7A93B" } : undefined}><Icon size={16} strokeWidth={1.8} /></div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <span>Live network map</span>
            <span className="panel-head-sub">congestion by node</span>
          </div>
          <CityMap />
          <div className="legend">
            <span><i className="dot" style={{ background: CONGESTION_COLOR.LOW }} /> Low</span>
            <span><i className="dot" style={{ background: CONGESTION_COLOR.MEDIUM }} /> Medium</span>
            <span><i className="dot" style={{ background: CONGESTION_COLOR.HIGH }} /> High</span>
          </div>
        </div>

        <div className="stack-col">
          <div className="panel">
            <div className="panel-head"><span>Quick plate lookup</span></div>
            <div className="quicksearch">
              <Search size={15} className="quicksearch-icon" />
              <input placeholder="e.g. TS09AB1234" className="quicksearch-input"
                onKeyDown={(e) => { if (e.key === "Enter") onSearchPlate(e.currentTarget.value); }} />
            </div>
            <div className="quicksearch-hint">Try TS09AB1234, AP10BZ7788, TS07EF4521 or TS12CD9090</div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <span>Priority alerts</span>
              <button className="linkbtn" onClick={() => setView("alerts")}>View all</button>
            </div>
            <div className="alertfeed">
              {BLACKLIST_ALERTS.map((a) => (
                <div className="alertrow" key={a.plate}>
                  <Siren size={15} className="alertrow-icon danger" />
                  <div>
                    <div className="alertrow-title mono">{a.plate}<span className="tag danger">blacklisted</span></div>
                    <div className="alertrow-sub">{a.reason} · last seen {a.lastSeen} at {a.time}</div>
                  </div>
                </div>
              ))}
              {SUSPICIOUS_ALERTS.map((a) => (
                <div className="alertrow" key={a.plate}>
                  <CircleAlert size={15} className="alertrow-icon warn" />
                  <div>
                    <div className="alertrow-title mono">{a.plate}<span className="tag warn">anomaly</span></div>
                    <div className="alertrow-sub">{a.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span>Most used routes today</span></div>
        <div className="chartwrap">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ROUTE_POPULARITY} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3D" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#8A93A6", fontSize: 11 }} axisLine={{ stroke: "#27344A" }} tickLine={false} />
              <YAxis type="category" dataKey="route" width={190} tick={{ fill: "#C6CDDB", fontSize: 11.5 }} axisLine={{ stroke: "#27344A" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131B29", border: "1px solid #27344A", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "#E7EBF2" }} />
              <Bar dataKey="vpd" name="vehicles/day" fill="#3FB6A8" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ trajectory search ------------------------------ */

function TrajectorySearch({ initialPlate, onConsumeInitial }) {
  const [query, setQuery] = useState(initialPlate || "");
  const [result, setResult] = useState(initialPlate ? VEHICLES[initialPlate.toUpperCase()] || "not-found" : null);

  React.useEffect(() => {
    if (initialPlate) {
      setQuery(initialPlate);
      setResult(VEHICLES[initialPlate.toUpperCase()] || "not-found");
      onConsumeInitial && onConsumeInitial();
    }
    // eslint-disable-next-line
  }, [initialPlate]);

  function runSearch() {
    const v = VEHICLES[query.trim().toUpperCase()];
    setResult(v || "not-found");
  }

  const route = result && result !== "not-found" ? result.journey.map((j) => j.cam) : [];

  return (
    <div className="viewpad">
      <div className="panel">
        <div className="panel-head"><span>Search by plate number</span></div>
        <div className="searchbar">
          <Search size={16} className="searchbar-icon" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Enter plate, e.g. TS09AB1234" className="searchbar-input" />
          <button className="btn-primary" onClick={runSearch}>Track vehicle</button>
        </div>
      </div>

      {result === "not-found" && (
        <div className="panel empty">
          <XCircle size={20} className="mut" />
          <div>No trajectory found for this plate in the last 24 hours.</div>
        </div>
      )}

      {result && result !== "not-found" && (
        <div className="grid-2">
          <div className="panel">
            <div className="panel-head"><span>Route across camera network</span></div>
            <CityMap highlightRoute={route} />
          </div>

          <div className="stack-col">
            <div className="panel">
              <div className="vehicle-id-row">
                <div className="vehicle-id-icon">{React.createElement(VEHICLE_ICONS[result.type] || Car, { size: 20 })}</div>
                <div>
                  <div className="mono vehicle-plate">{result.plate}</div>
                  <div className="topbar-sub">{result.color} {result.make} · {result.type}</div>
                </div>
                {result.blacklisted && <span className="tag danger" style={{ marginLeft: "auto" }}>blacklisted</span>}
              </div>
              <div className="statgrid">
                <div><div className="statgrid-label">Vehicle ID</div><div className="mono">{result.vehicleId}</div></div>
                <div><div className="statgrid-label">Distance travelled</div><div>{result.distanceKm} km</div></div>
                <div><div className="statgrid-label">Average speed</div><div>{result.avgSpeed} km/h</div></div>
                <div><div className="statgrid-label">Cameras hit</div><div>{result.journey.length}</div></div>
              </div>
              {result.blacklisted && (
                <div className="inline-alert danger"><Siren size={14} /> {result.blacklistReason}</div>
              )}
              {result.flagged && (
                <div className="inline-alert warn"><TriangleAlert size={14} /> {result.flagged}</div>
              )}
            </div>

            <div className="panel">
              <div className="panel-head"><span>Confidence</span></div>
              <ConfBar value={result.confidence.detection} label="Vehicle detection" />
              <ConfBar value={result.confidence.ocr} label="OCR read" />
              <ConfBar value={result.confidence.tracking} label="Cross-camera tracking" />
            </div>
          </div>
        </div>
      )}

      {result && result !== "not-found" && (
        <div className="panel">
          <div className="panel-head"><span>Chronological journey</span></div>
          <div className="timeline">
            {result.journey.map((j, i) => {
              const cam = camById(j.cam);
              return (
                <div className="timeline-row" key={i}>
                  <div className="timeline-dot" />
                  <div className="timeline-body">
                    <div className="timeline-title">{cam.name} <span className="mono mut">{cam.id}</span></div>
                    <div className="timeline-sub">
                      <span><MapPin size={12} /> entry {j.entry}</span>
                      <span>exit {j.exit}</span>
                    </div>
                  </div>
                  {i < result.journey.length - 1 && <ArrowRight size={14} className="timeline-arrow" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ camera network ------------------------------ */

function CameraNetwork() {
  const [selected, setSelected] = useState(CAMERAS[4].id);
  const cam = camById(selected);
  return (
    <div className="viewpad">
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span>Camera network map</span><span className="panel-head-sub">click a node to inspect</span></div>
          <CityMap highlightCam={selected} onSelectCam={setSelected} />
        </div>
        <div className="panel">
          <div className="panel-head"><span>{cam.name}</span><Badge level={cam.congestion} /></div>
          <div className="statgrid">
            <div><div className="statgrid-label">Camera ID</div><div className="mono">{cam.id}</div></div>
            <div><div className="statgrid-label">Vehicles detected / day</div><div>{cam.vpd.toLocaleString()}</div></div>
            <div><div className="statgrid-label">Average speed</div><div>{cam.avgSpeed} km/h</div></div>
            <div><div className="statgrid-label">Peak traffic</div><div>{cam.peak}</div></div>
          </div>
          <div className="panel-head" style={{ marginTop: "1.1rem" }}><span>Camera-to-camera flow</span></div>
          <div className="odlist">
            {OD_FLOWS.filter((f) => f.from === cam.id || f.to === cam.id).length === 0 && (
              <div className="mut" style={{ fontSize: 12.5 }}>No major flow pairs recorded for this node yet.</div>
            )}
            {OD_FLOWS.filter((f) => f.from === cam.id || f.to === cam.id).map((f, i) => (
              <div className="odrow" key={i}>
                <span className="mono">{f.from}</span><ArrowRight size={12} /><span className="mono">{f.to}</span>
                <span className="odrow-meta">{f.vpd.toLocaleString()} veh/day · {f.avgTravel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span>All camera nodes</span></div>
        <table className="table">
          <thead>
            <tr><th>Camera</th><th>Location</th><th>Vehicles/day</th><th>Avg speed</th><th>Peak window</th><th>Congestion</th></tr>
          </thead>
          <tbody>
            {CAMERAS.map((c) => (
              <tr key={c.id} className={c.id === selected ? "row-active" : ""} onClick={() => setSelected(c.id)}>
                <td className="mono">{c.id}</td>
                <td>{c.name}</td>
                <td>{c.vpd.toLocaleString()}</td>
                <td>{c.avgSpeed} km/h</td>
                <td>{c.peak}</td>
                <td><Badge level={c.congestion} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ traffic analytics ------------------------------ */

function TrafficAnalytics() {
  return (
    <div className="viewpad">
      <div className="panel">
        <div className="panel-head"><span>City-wide volume by hour</span><span className="panel-head-sub">morning &amp; evening peaks</span></div>
        <div className="chartwrap">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={RUSH_HOUR} margin={{ left: -12, right: 16, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3FB6A8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3FB6A8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3D" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#8A93A6", fontSize: 11 }} axisLine={{ stroke: "#27344A" }} tickLine={false} />
              <YAxis tick={{ fill: "#8A93A6", fontSize: 11 }} axisLine={{ stroke: "#27344A" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131B29", border: "1px solid #27344A", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "#E7EBF2" }} labelFormatter={(h) => h + ":00"} />
              <Area type="monotone" dataKey="vol" name="vehicles" stroke="#3FB6A8" strokeWidth={2} fill="url(#volFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="statgrid" style={{ marginTop: "0.5rem" }}>
          <div><div className="statgrid-label">Morning peak</div><div>8:30 – 10:30 AM</div></div>
          <div><div className="statgrid-label">Evening peak</div><div>5:30 – 8:00 PM</div></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span>Congestion prediction</span><span className="panel-head-sub">next 30–45 min</span></div>
          <div className="forecastlist">
            {CONGESTION_FORECAST.map((f, i) => (
              <div className="forecastrow" key={i}>
                <div>
                  <div className="timeline-title">{f.road}</div>
                  <div className="timeline-sub"><span>in {f.in}</span></div>
                </div>
                <div className="forecast-arrow">
                  <Badge level={f.current} /><ArrowRight size={14} className="mut" /><Badge level={f.predicted} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span>Origin – destination flow</span></div>
          <table className="table">
            <thead><tr><th>Origin</th><th></th><th>Destination</th><th>Veh/day</th><th>Avg travel</th></tr></thead>
            <tbody>
              {OD_FLOWS.map((f, i) => (
                <tr key={i}>
                  <td className="mono">{f.from}</td>
                  <td><ArrowRight size={12} className="mut" /></td>
                  <td className="mono">{f.to}</td>
                  <td>{f.vpd.toLocaleString()}</td>
                  <td>{f.avgTravel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- violations ---------------------------------- */

function Violations() {
  return (
    <div className="viewpad">
      <div className="panel">
        <div className="panel-head"><span>Detected violations</span><span className="panel-head-sub">{VIOLATIONS.length} events today</span></div>
        <table className="table">
          <thead>
            <tr><th>Event</th><th>Plate</th><th>Type</th><th>Camera</th><th>Time</th><th>Confidence</th><th>Status</th></tr>
          </thead>
          <tbody>
            {VIOLATIONS.map((v) => (
              <tr key={v.id}>
                <td className="mono mut">{v.id}</td>
                <td className="mono">{v.plate}</td>
                <td>{v.type}<div className="rowdetail">{v.detail}</div></td>
                <td className="mono">{v.cam}</td>
                <td className="mono">{v.time}</td>
                <td>{Math.round(v.confidence * 100)}%</td>
                <td>
                  <span className={"tag " + (v.status === "Confirmed" ? "ok" : "warn")}>
                    {v.status === "Confirmed" ? <CheckCircle2 size={11} /> : <Clock size={11} />} {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------ alerts ------------------------------------ */

function Alerts() {
  return (
    <div className="viewpad">
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span>Blacklisted vehicles</span></div>
          <div className="alertfeed">
            {BLACKLIST_ALERTS.map((a) => (
              <div className="alertrow" key={a.plate}>
                <Siren size={16} className="alertrow-icon danger" />
                <div>
                  <div className="alertrow-title mono">{a.plate}<span className="tag danger">blacklisted</span></div>
                  <div className="alertrow-sub">{a.reason}</div>
                  <div className="alertrow-sub mut">Last seen {a.lastSeen} · {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span>Suspicious route anomalies</span></div>
          <div className="alertfeed">
            {SUSPICIOUS_ALERTS.map((a) => (
              <div className="alertrow" key={a.plate}>
                <CircleAlert size={16} className="alertrow-icon warn" />
                <div>
                  <div className="alertrow-title mono">{a.plate}<span className="tag warn">anomaly</span></div>
                  <div className="alertrow-sub">{a.note}</div>
                  <div className="alertrow-sub mut">{a.camA} {a.timeA} → {a.camB} {a.timeB} · {a.distanceKm} km apart</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span>Emergency vehicle priority</span></div>
        <div className="emergency-row">
          <Siren size={18} className="alertrow-icon danger" />
          <div style={{ flex: 1 }}>
            <div className="timeline-title">Ambulance detected — Route: Somajiguda Hospital → Panjagutta accident site</div>
            <div className="timeline-sub"><span>Traffic density ahead: <b style={{ color: "#E15251" }}>High</b></span></div>
          </div>
          <span className="tag warn">Green corridor suggested</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- vehicle registry -------------------------------- */

function Registry() {
  const list = Object.values(VEHICLES);
  return (
    <div className="viewpad">
      <div className="panel">
        <div className="panel-head"><span>Vehicle identity records</span><span className="panel-head-sub">re-identification enabled when OCR fails</span></div>
        <table className="table">
          <thead>
            <tr><th>Vehicle ID</th><th>Plate</th><th>Type</th><th>Colour</th><th>Make / model</th><th>First seen</th><th>Last seen</th></tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.vehicleId}>
                <td className="mono">{v.vehicleId}</td>
                <td className="mono">{v.plate}</td>
                <td>{v.type}</td>
                <td>{v.color}</td>
                <td>{v.make}</td>
                <td className="mono">{v.journey[0].cam}</td>
                <td className="mono">{v.journey[v.journey.length - 1].cam}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <div className="panel-head"><span>Appearance re-identification</span></div>
        <div className="reid-note">
          Every detection also stores an appearance embedding vector (make, colour, body shape) alongside the plate read.
          When OCR confidence drops below threshold — dirty plate, motion blur, extreme angle — the platform matches the
          vehicle against nearby embeddings instead of dropping the detection, keeping the trajectory continuous.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- root app ---------------------------------- */

const TITLES = {
  overview: ["Operations overview", "City-wide ANPR network status"],
  trajectory: ["Trajectory search", "Reconstruct a vehicle's path across the city"],
  cameras: ["Camera network", "Per-node stats and camera-to-camera flow"],
  analytics: ["Traffic analytics", "Macro flow, congestion and route patterns"],
  violations: ["Violations", "Flagged driving regulation breaches"],
  alerts: ["Alerts", "Blacklisted vehicles and anomaly detection"],
  registry: ["Vehicle registry", "Identity and re-identification data"],
};

export default function TrinetraDashboard() {
  const [view, setView] = useState("overview");
  const [pendingPlate, setPendingPlate] = useState(null);

  function searchPlate(p) {
    if (!p) return;
    setPendingPlate(p);
    setView("trajectory");
  }

  const [title, subtitle] = TITLES[view];

  return (
    <div className="app">
      <style>{`
        .app { display:flex; min-height:640px; background:#0B111C; color:#E7EBF2;
          font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; border-radius:12px; overflow:hidden;
          border:1px solid #1B2536; }
        .mono { font-family:'IBM Plex Mono', ui-monospace, monospace; }
        .mut { color:#5C6B84; }

        .sidebar { width:222px; flex-shrink:0; background:#0E1522; border-right:1px solid #1B2536;
          display:flex; flex-direction:column; padding:18px 14px; }
        .brand { display:flex; align-items:center; gap:10px; padding:4px 6px 20px; }
        .brand-name { font-family:'Space Grotesk', sans-serif; font-weight:600; font-size:15px; letter-spacing:0.04em; }
        .brand-sub { font-size:10.5px; color:#5C6B84; margin-top:1px; }
        .navlist { display:flex; flex-direction:column; gap:2px; flex:1; }
        .navitem { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:6px;
          background:transparent; border:none; color:#93A0B4; font-size:13px; cursor:pointer; text-align:left; }
        .navitem:hover { background:#151F30; color:#E7EBF2; }
        .navitem.active { background:#16283196; color:#7FD9CB; }
        .navchevron { margin-left:auto; }
        .sidebar-foot { border-top:1px solid #1B2536; padding-top:12px; margin-top:8px; }
        .foot-row { display:flex; align-items:center; gap:6px; font-size:11px; color:#5C6B84; margin-bottom:4px; }

        .main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .topbar { display:flex; align-items:center; justify-content:space-between; padding:16px 24px;
          border-bottom:1px solid #1B2536; }
        .topbar-title { font-family:'Space Grotesk', sans-serif; font-size:18px; font-weight:600; }
        .topbar-sub { font-size:12px; color:#5C6B84; margin-top:2px; }
        .topbar-clock { display:flex; align-items:center; gap:6px; font-size:11.5px; color:#4CAF7D; }

        .viewpad { padding:20px 24px 28px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; }

        .kpi-row { display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:12px; }
        .kpi { background:#131B29; border:1px solid #1B2536; border-radius:10px; padding:13px 14px; }
        .kpi-icon { color:#3FB6A8; margin-bottom:8px; }
        .kpi-value { font-family:'Space Grotesk', sans-serif; font-size:20px; font-weight:600; }
        .kpi-label { font-size:11px; color:#8A93A6; margin-top:3px; }

        .grid-2 { display:grid; grid-template-columns:1.3fr 1fr; gap:16px; align-items:start; }
        .stack-col { display:flex; flex-direction:column; gap:16px; }

        .panel { background:#131B29; border:1px solid #1B2536; border-radius:10px; padding:16px; }
        .panel-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; font-size:13.5px; font-weight:500; }
        .panel-head-sub { font-size:11px; color:#5C6B84; font-weight:400; }
        .panel.empty { display:flex; align-items:center; gap:10px; color:#8A93A6; font-size:13px; }

        .citymap { width:100%; height:auto; display:block; }
        .maplabel { font-size:9px; fill:#5C6B84; font-family:'IBM Plex Mono', monospace; }
        .legend { display:flex; gap:16px; margin-top:10px; font-size:11.5px; color:#8A93A6; }
        .legend .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; }

        .quicksearch { display:flex; align-items:center; gap:8px; background:#0E1522; border:1px solid #26324a;
          border-radius:7px; padding:8px 10px; }
        .quicksearch-icon { color:#5C6B84; }
        .quicksearch-input { background:transparent; border:none; outline:none; color:#E7EBF2; font-size:13px; flex:1; font-family:'IBM Plex Mono',monospace; }
        .quicksearch-hint { font-size:10.5px; color:#5C6B84; margin-top:8px; }

        .searchbar { display:flex; align-items:center; gap:10px; background:#0E1522; border:1px solid #26324a;
          border-radius:8px; padding:8px 12px; }
        .searchbar-icon { color:#5C6B84; }
        .searchbar-input { background:transparent; border:none; outline:none; color:#E7EBF2; font-size:14px; flex:1; font-family:'IBM Plex Mono',monospace; }
        .btn-primary { background:#1E5B54; color:#9FE1CB; border:1px solid #2C7A70; border-radius:6px;
          padding:7px 14px; font-size:12.5px; font-weight:500; cursor:pointer; }
        .btn-primary:hover { background:#256e65; }

        .alertfeed { display:flex; flex-direction:column; gap:12px; }
        .alertrow { display:flex; gap:10px; align-items:flex-start; }
        .alertrow-icon.danger { color:#E15251; margin-top:2px; }
        .alertrow-icon.warn { color:#E7A93B; margin-top:2px; }
        .alertrow-title { font-size:13px; display:flex; align-items:center; gap:8px; }
        .alertrow-sub { font-size:11.5px; color:#8A93A6; margin-top:2px; }

        .tag { font-size:9.5px; padding:2px 7px; border-radius:20px; display:inline-flex; align-items:center; gap:4px; font-weight:500; }
        .tag.danger { background:#E1525220; color:#F29B9A; }
        .tag.warn { background:#E7A93B20; color:#F0C583; }
        .tag.ok { background:#4CAF7D20; color:#9BD9B7; }

        .badge { font-size:10px; padding:2px 8px; border-radius:20px; border:1px solid; font-weight:500; letter-spacing:0.02em; }

        .linkbtn { background:none; border:none; color:#5CC7B5; font-size:11.5px; cursor:pointer; }
        .linkbtn:hover { text-decoration:underline; }

        .chartwrap { margin: 0 -6px; }

        .vehicle-id-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .vehicle-id-icon { width:38px; height:38px; border-radius:8px; background:#0E1522; display:flex; align-items:center; justify-content:center; color:#3FB6A8; }
        .vehicle-plate { font-size:15px; font-weight:600; letter-spacing:0.03em; }

        .statgrid { display:grid; grid-template-columns:1fr 1fr; gap:12px 18px; }
        .statgrid-label { font-size:10.5px; color:#5C6B84; margin-bottom:2px; }

        .inline-alert { display:flex; align-items:center; gap:8px; font-size:12px; padding:8px 10px; border-radius:6px; margin-top:12px; }
        .inline-alert.danger { background:#E1525215; color:#F29B9A; border:1px solid #E1525230; }
        .inline-alert.warn { background:#E7A93B15; color:#F0C583; border:1px solid #E7A93B30; }

        .confbar { margin-bottom:12px; }
        .confbar-top { display:flex; justify-content:space-between; font-size:11.5px; color:#93A0B4; margin-bottom:5px; }
        .confbar-track { height:5px; background:#0E1522; border-radius:3px; overflow:hidden; }
        .confbar-fill { height:100%; border-radius:3px; }

        .timeline { display:flex; flex-direction:column; }
        .timeline-row { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #1B2536; }
        .timeline-row:last-child { border-bottom:none; }
        .timeline-dot { width:7px; height:7px; border-radius:50%; background:#3FB6A8; margin-top:6px; flex-shrink:0; }
        .timeline-body { flex:1; }
        .timeline-title { font-size:13px; }
        .timeline-sub { display:flex; gap:16px; font-size:11.5px; color:#8A93A6; margin-top:3px; }
        .timeline-sub span { display:flex; align-items:center; gap:4px; }
        .timeline-arrow { color:#3FB6A8; margin-top:5px; }

        .odlist { display:flex; flex-direction:column; gap:9px; }
        .odrow { display:flex; align-items:center; gap:6px; font-size:12px; color:#C6CDDB; }
        .odrow-meta { margin-left:auto; font-size:11px; color:#5C6B84; }

        .table { width:100%; border-collapse:collapse; font-size:12.5px; }
        .table th { text-align:left; font-weight:500; color:#5C6B84; font-size:11px; padding:8px 10px; border-bottom:1px solid #1B2536; }
        .table td { padding:9px 10px; border-bottom:1px solid #161F30; color:#C6CDDB; vertical-align:top; }
        .table tbody tr:hover { background:#161F30; cursor:default; }
        .table tbody tr.row-active { background:#16283196; }
        .rowdetail { font-size:10.5px; color:#5C6B84; margin-top:2px; }

        .forecastlist { display:flex; flex-direction:column; gap:12px; }
        .forecastrow { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #1B2536; }
        .forecastrow:last-child { border-bottom:none; }
        .forecast-arrow { display:flex; align-items:center; gap:8px; }

        .emergency-row { display:flex; align-items:center; gap:12px; }

        .reid-note { font-size:12.5px; color:#93A0B4; line-height:1.6; }

        @media (max-width: 880px) {
          .grid-2 { grid-template-columns:1fr; }
          .kpi-row { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <Sidebar view={view} setView={setView} />
      <div className="main">
        <TopBar title={title} subtitle={subtitle} />
        {view === "overview" && <Overview setView={setView} onSearchPlate={searchPlate} />}
        {view === "trajectory" && <TrajectorySearch initialPlate={pendingPlate} onConsumeInitial={() => setPendingPlate(null)} />}
        {view === "cameras" && <CameraNetwork />}
        {view === "analytics" && <TrafficAnalytics />}
        {view === "violations" && <Violations />}
        {view === "alerts" && <Alerts />}
        {view === "registry" && <Registry />}
      </div>
    </div>
  );
}
