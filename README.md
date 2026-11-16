# Pearson Edexcel A-Level Geography Case Study Hub (Specification 9GE0)

A clean, responsive, local-first web application designed specifically for organizing, mapping, and revising **Pearson Edexcel A-Level Geography** case studies.

Built with a modular frontend architecture featuring **Leaflet.js** (minimalist CartoDB Positron / Dark Matter map tiles), **Tailwind CSS**, dynamic **Active Recall ("Exam Blur")** for self-testing, and zero external database dependencies (persisted via `localStorage` with full JSON & Markdown backup/export).

---

## 🚀 Live Local Server & Quick Start

The app is currently running live at:
**[http://localhost:8089/](http://localhost:8089/)**

### To start or restart the server manually:
```bash
cd /Users/ferdivolkmann/.gemini/antigravity/scratch/edexcel-geography-hub
python3 -m http.server 8089
```
Then navigate to `http://localhost:8089/` in any modern web browser.

---

## 🧭 Core Architectural Highlights

1. **Interactive Pin-Drop Leaflet Map & Direct On-Map Editing:**
   - Powered by **Leaflet 1.9.4** using **Esri World Street Map** with **100% Latin Alphabet Labels** worldwide as the primary default layer (served globally via Amazon CloudFront, zero API keys required, completely immune to ad-blockers).
   - **Collapsible & Expandable Side Tab:**
     - ↔️ **Minimize to Full-Screen Map:** Click **"Minimize"** in the drawer header or **"Side Tab"** in the top navigation to collapse the side tab entirely, expanding the interactive map across 100% of the screen.
     - 📌 **Floating Launcher Tab:** When minimized, an interactive tab appears on the right edge of the screen (`[◀ Case Studies]`). Clicking it or clicking any map pin smoothly restores the side panel!
     - 📖 **Expand to Wide Reading View:** Click **"Expand"** to expand the side tab to 78% screen width for reading AO2 evaluation matrices and long case studies without horizontal scroll.
   - **Popups Always On Top:** Modal set to `z-[99999]` and Leaflet popup pane set to `z-3000` with automatic `autoPanPadding` (70px) so popups and forms are always unobstructed and float cleanly over the map canvas and toolbars.
   - **➕ Direct "Add on Map" Mode:** Click the **"➕ Add on Map"** button in the floating map toolbar to turn the cursor into a crosshair; clicking anywhere on the globe opens the new case study form with those coordinates and reverse-geocoded place names pre-filled!
   - **🖱️ Right-Click / Long-Press Anywhere:** Right-clicking anywhere on the map immediately opens a *"📍 Add Case Study Here"* popup.
   - **✏️ Direct In-Pin Editing:** Clicking any case study pin on the map presents both an **"Open Study &rarr;"** button and a direct **"✏️ Edit"** button to modify the study without switching views.
   - Instant tile switcher in the top toolbar supporting:
     - 🛣️ **Esri World Street Map** (Default — 100% Latin alphabet, guaranteed global delivery)
     - 🏔️ **Esri World Topographic** (Shaded relief terrain with Latin labels)
     - 🏛️ **National Geographic World Map** (Classic NatGeo typography in Latin script)
     - 🛰️ **Esri Satellite + Latin Labels** (Real satellite imagery overlaid with Latin place and border names)
     - 🔤 **CartoDB Voyager & Positron**
     - 🌐 **OpenStreetMap Standard**
   - **Automatic Failover:** If any external tile server experiences network drops, the map automatically recovers by switching to Esri World Street so the canvas never turns blank.
   - Dynamic, color-coded pin markers:
     - 🌲 **Physical Geography** (Emerald `#059669` badge with mountain glyph)
     - 🏙️ **Human Geography** (Indigo `#4f46e5` badge with globe glyph)
   - Synchronized navigation: clicking any pin automatically highlights its study card, animates the map (`flyTo`), and opens the detailed revision drawer. Clicking any card flies the camera straight to that location on earth.
   - Built-in map coordinate picker mode (`Pick on Map`) allows setting case study coordinates directly with a single click anywhere on the globe.

2. **Full-Tab Case Study Reader & Main Menu Navigation:**
   - **Distraction-Free Full-Tab Mode:** When you select any case study (from the directory list or map pin), it occupies the entire side tab. Search bars and filter options are hidden to maximize screen space for notes and AO2 matrices.
   - **Top-Left "Main Menu" Button:** A prominent **`[ ← Main Menu ]`** button in the top-left corner allows returning directly to the directory of all case studies with full search and filtering controls.
   - **Header Controls:** Directly accessible from the case study header: Map fly-to (`📍`), Edit (`✏️`), Delete (`🗑️`), Expand to 78vw reading view (`⤢`), and Minimize side tab (`›`).
   - **Bottom Navigation:** A secondary **"Main Menu"** button is located at the foot of every study card for convenience after scrolling through notes.

3. **Edexcel A-Level (9GE0) Specification Schema:**
   - Structured specifically around the Edexcel curriculum:
     - **Physical Geography:** Tectonic Processes & Hazards, Coastal Landscapes & Change, The Water Cycle & Water Insecurity, The Carbon Cycle & Energy Security.
     - **Human Geography:** Globalisation, Regenerating Places, Superpowers, Health, Human Rights & Intervention, Migration, Identity & Sovereignty.
   - Each case study entry includes:
     - **Title, Country/Region & Precise Coordinates**
     - **Category & Specification Topic Tag**
     - **Synoptic Links (Paper 3 cross-theme links)**
     - **Place-Specific Statistics (AO1)** with hard figures, dates, and measurements
     - **Causes, Processes, and Social/Economic/Environmental Impacts**
     - **Management, Mitigation & Governance**
     - **Evaluation Points (AO2)** explicitly split into *Successes / Strengths* and *Limitations / Failures* for 12- and 20-mark essays
     - **Examiner Advice & Guidance**

3. **Active Recall ("Exam Blur") Mode:**
   - Toggle button in the top navigation bar instantly blurs all **Place-Specific Statistics** and **AO2 Evaluation Points**.
   - Students can self-test their knowledge and click any individual blurred block to reveal it, or use the "Reveal All" / "Hide All" helper controls.

4. **Add / Edit Modal with Geocoding:**
   - Comprehensive modal form for adding notes from class or textbooks.
   - Includes auto-coordinate lookup (OpenStreetMap Nominatim + offline geocoding dictionary) plus the interactive "Pick on Map" tool.

5. **Multi-Location Case Study Deletion & Safe Confirmation:**
   - **Directory Card Delete:** Each card features a trash can icon button (`🗑️`) for quick deletion.
   - **Map Pin Popup Delete:** Clicking any pin reveals an in-popup trash icon button next to Edit and Open.
   - **Detail Drawer Delete:** Delete buttons are placed in both the sticky top header and at the bottom of the case study content.
   - **Edit Modal Delete:** A red *"Delete Case Study"* button appears in the modal footer when editing an existing study.
   - **Safety First:** All delete actions prompt a custom, non-blocking confirmation dialog displaying the case study title before removal.

6. **Local Persistence, JSON & Markdown Export:**
   - Saved automatically to browser `localStorage`.
   - **JSON Export / Import:** complete backup and sharing of study decks.
   - **Markdown Export:** generates a formatted, printable study booklet formatted for Obsidian, Notion, or paper revision.

---

## 📚 Pre-loaded Edexcel Case Studies

The application comes pre-populated with high-yield, academically verified case studies:
1. **2011 Tōhoku Megathrust Earthquake & Tsunami** *(Physical: Tectonic Processes & Hazards)*
2. **Holderness Coast: Hard vs. Soft Coastal Management** *(Physical: Coastal Landscapes & Change)*
3. **London Docklands (LDDC) & Stratford Olympic Legacy** *(Human: Regenerating Places)*
4. **China's Belt and Road Initiative (BRI)** *(Human: Superpowers & Globalisation)*
5. **California Water Insecurity & Mega-Drought** *(Physical: The Water Cycle & Water Insecurity)*
6. **Apple Inc. & Foxconn: Global Production Networks** *(Human: Globalisation)*

---

## 🧪 Verification & Testing Status

- Tested in Google Chrome via Chrome DevTools Protocol (CDP).
- Synchronized Leaflet map marker clicks and drawer updates verified.
- Active Recall ("Exam Blur") tested and confirmed across all blocks.
- Case study addition and localStorage persistence verified.
- Zero console errors or unhandled exceptions.
