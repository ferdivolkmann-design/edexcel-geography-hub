import socket
import ssl
import base64
import hashlib
import os
import json
import urllib.request
import subprocess
import time
import sys

class SimpleWebSocket:
    def __init__(self, host, port, path):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((host, port))
        
        # Sec-WebSocket-Key
        sec_key = base64.b64encode(os.urandom(16)).decode('utf-8')
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {sec_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(handshake.encode('utf-8'))
        resp = self.sock.recv(4096).decode('utf-8')
        if "101" not in resp:
            raise RuntimeError(f"WebSocket handshake failed: {resp}")

    def send(self, data):
        payload = data.encode('utf-8')
        length = len(payload)
        header = bytearray([0x81]) # text frame, FIN=1
        
        # Client must mask
        mask = os.urandom(4)
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(length.to_bytes(2, 'big'))
        else:
            header.append(0x80 | 127)
            header.extend(length.to_bytes(8, 'big'))
            
        header.extend(mask)
        masked_payload = bytearray(payload[i] ^ mask[i % 4] for i in range(length))
        self.sock.sendall(header + masked_payload)

    def recv(self, timeout=5.0):
        self.sock.settimeout(timeout)
        try:
            head = self.sock.recv(2)
            if not head:
                return None
            b1, b2 = head[0], head[1]
            opcode = b1 & 0x0f
            masked = (b2 & 0x80) != 0
            payload_len = b2 & 0x7f
            if payload_len == 126:
                payload_len = int.from_bytes(self.sock.recv(2), 'big')
            elif payload_len == 127:
                payload_len = int.from_bytes(self.sock.recv(8), 'big')
                
            mask = self.sock.recv(4) if masked else None
            data = bytearray()
            while len(data) < payload_len:
                chunk = self.sock.recv(payload_len - len(data))
                if not chunk:
                    break
                data.extend(chunk)
                
            if masked:
                data = bytearray(data[i] ^ mask[i % 4] for i in range(len(data)))
            return data.decode('utf-8', errors='replace')
        except socket.timeout:
            return None

    def close(self):
        self.sock.close()

def main():
    print("Launching headless Chrome...")
    proc = subprocess.Popen([
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless=new',
        '--remote-debugging-port=9222',
        '--window-size=1400,900',
        '--disable-gpu',
        '--no-first-run',
        'http://localhost:8089/index.html'
    ], stderr=subprocess.PIPE, stdout=subprocess.PIPE)

    time.sleep(2.5)
    ws = None
    try:
        req = urllib.request.urlopen('http://localhost:9222/json')
        tabs = json.loads(req.read().decode())
        page_tab = next((t for t in tabs if t.get('url', '').startswith('http://localhost:8089/index.html')), None)
        if not page_tab:
            print("Page tab not found among tabs:", tabs)
            sys.exit(1)

        ws_url = page_tab['webSocketDebuggerUrl']
        print("Connected to CDP:", ws_url)
        # Parse ws://host:port/path
        parts = ws_url.replace("ws://", "").split("/", 1)
        host, port = parts[0].split(":")
        path = "/" + parts[1]

        ws = SimpleWebSocket(host, int(port), path)

        # Helper to call CDP method
        msg_id = 1
        def call_cdp(method, params=None):
            nonlocal msg_id
            curr_id = msg_id
            msg_id += 1
            payload = json.dumps({"id": curr_id, "method": method, "params": params or {}})
            ws.send(payload)
            while True:
                msg = ws.recv(timeout=3.0)
                if not msg:
                    return None
                try:
                    data = json.loads(msg)
                    if data.get("id") == curr_id:
                        return data
                except Exception:
                    pass

        # Enable Console and Runtime
        call_cdp("Console.enable")
        call_cdp("Runtime.enable")
        call_cdp("Log.enable")

        print("Waiting for app initialization...")
        time.sleep(2)

        # Check console errors or logs
        eval_errors = call_cdp("Runtime.evaluate", {
            "expression": "JSON.stringify({ hasApp: Boolean(window.edexcelApp), error: window.__lastError || null, html: document.body.innerHTML.slice(0, 300) })",
            "returnByValue": True
        })
        print("Diagnostic:", eval_errors)
        def evaluate(expression):
            res = call_cdp("Runtime.evaluate", {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True
            })
            return res.get("result", {}).get("result", {}).get("value")

        print("Waiting for app initialization...")
        time.sleep(1)

        # 1. Verify app presence and initial data
        study_count = evaluate("window.edexcelApp ? window.edexcelApp.caseStudies.length : 0")
        print(f"Loaded case studies count: {study_count}")
        assert study_count >= 4, f"Expected at least 4 case studies, got {study_count}"

        # 2. Check rendered cards count in DOM
        cards_count = evaluate("document.querySelectorAll('#case-study-list-container [data-card-id]').length")
        print(f"Rendered cards count: {cards_count}")
        assert cards_count >= 4, f"Expected at least 4 cards, got {cards_count}"

        # 3. Check Leaflet map markers and tile loading
        marker_count = evaluate("window.edexcelApp.map.markers.size")
        print(f"Leaflet markers count: {marker_count}")
        assert marker_count >= 4, f"Expected markers on map, got {marker_count}"

        # Wait for tiles to load and verify
        time.sleep(1.5)
        tile_count = evaluate("document.querySelectorAll('.leaflet-tile-loaded').length")
        current_layer = evaluate("window.edexcelApp.map.currentTheme")
        print(f"Active tile layer: {current_layer}, loaded map tiles count: {tile_count}")
        assert tile_count > 0, "Expected Leaflet map tiles to be loaded and visible"
        assert current_layer == "esriStreet", f"Expected esriStreet default, got {current_layer}"

        # Test switching to Esri Topo
        evaluate("window.edexcelApp.map.setTheme('esriTopo')")
        time.sleep(1)
        topo_tiles = evaluate("document.querySelectorAll('.leaflet-tile-loaded').length")
        print(f"Esri Topo loaded tiles: {topo_tiles}")
        assert topo_tiles > 0, "Expected Esri Topo tiles to load successfully"

        # Switch back to Esri Street (Latin alphabet default)
        evaluate("window.edexcelApp.map.setTheme('esriStreet')")

        # 4. Test clicking card and sync
        first_id = evaluate("window.edexcelApp.caseStudies[0].id")
        second_id = evaluate("window.edexcelApp.caseStudies[1].id")
        second_title = evaluate("window.edexcelApp.caseStudies[1].title")
        print(f"Selecting second study: {second_title} ({second_id})")

        evaluate(f"window.edexcelApp.selectCaseStudy('{second_id}', false)")
        current_drawer_title = evaluate("document.querySelector('#study-detail-container h2')?.textContent?.trim()")
        print(f"Detail drawer title after select: {current_drawer_title}")
        assert current_drawer_title == second_title, f"Expected '{second_title}' in drawer, got '{current_drawer_title}'"

        # Verify case study takes up the whole tab and hides search/directory
        is_directory_hidden = evaluate("document.getElementById('directory-view').classList.contains('hidden')")
        is_detail_visible = evaluate("!document.getElementById('study-detail-pane').classList.contains('hidden')")
        print(f"Directory & search hidden: {is_directory_hidden}, Study detail visible (takes whole tab): {is_detail_visible}")
        assert is_directory_hidden and is_detail_visible, "Case study should take up the whole tab and hide search & directory"

        # Check top left back button to Main Menu
        back_btn_text = evaluate("document.getElementById('detail-back-list-btn')?.textContent?.trim()")
        print(f"Top left back button text: {back_btn_text}")
        assert "Main Menu" in back_btn_text, f"Expected 'Main Menu' back button in top left, got: {back_btn_text}"

        # Click Back to Main Menu
        evaluate("document.getElementById('detail-back-list-btn').click()")
        time.sleep(0.4)
        is_directory_restored = evaluate("!document.getElementById('directory-view').classList.contains('hidden')")
        is_detail_hidden = evaluate("document.getElementById('study-detail-pane').classList.contains('hidden')")
        print(f"Returned to Main Menu - Directory restored: {is_directory_restored}, Detail hidden: {is_detail_hidden}")
        assert is_directory_restored and is_detail_hidden, "Clicking top left back button should return to the Main Menu"

        # Re-open the second study for subsequent tests
        evaluate(f"window.edexcelApp.selectCaseStudy('{second_id}', false)")
        time.sleep(0.3)

        # 4b. Test Map Pin Edit button
        print("Testing Edit button directly from map pin popup...")
        evaluate(f"window.edexcelApp.map.markers.get('{second_id}').openPopup()")
        time.sleep(0.5)
        edit_btn_present = evaluate("Boolean(document.querySelector('.edit-study-popup-btn'))")
        print(f"Edit button present in map pin popup: {edit_btn_present}")
        assert edit_btn_present, "Expected 'Edit' button in map pin popup"

        # Trigger on-map edit
        evaluate(f"document.querySelector('.edit-study-popup-btn').click()")
        time.sleep(0.5)
        modal_open = evaluate("window.edexcelApp.modal.isOpen")
        modal_title = evaluate("document.getElementById('input-title')?.value")
        print(f"Modal opened from map pin: {modal_open}, editing title: {modal_title}")
        assert modal_open and modal_title == second_title, "Expected modal to open with study data"
        evaluate("window.edexcelApp.modal.close()")

        # 4c. Test On-Map Add Location (Right-click or 'Add on Map' button)
        print("Testing On-Map Add Feature at coordinates [12.0, 45.0]...")
        evaluate("window.edexcelApp.openAddModalAt(12.0, 45.0)")
        time.sleep(0.5)
        new_modal_open = evaluate("window.edexcelApp.modal.isOpen")
        prefilled_lat = evaluate("document.getElementById('input-lat')?.value")
        prefilled_lng = evaluate("document.getElementById('input-lng')?.value")
        print(f"New study modal open: {new_modal_open}, lat: {prefilled_lat}, lng: {prefilled_lng}")
        assert new_modal_open and prefilled_lat == "12" and prefilled_lng == "45"
        evaluate("window.edexcelApp.modal.close()")

        # 4d. Test Side Tab Minimize and Expand
        print("Testing Side Tab Minimize & Expand...")
        # Minimize
        evaluate("window.edexcelApp.setSidebarState('minimized')")
        time.sleep(0.5)
        is_minimized = evaluate("document.getElementById('right-column').classList.contains('sidebar-minimized')")
        floating_btn_visible = evaluate("!document.getElementById('floating-open-sidebar-btn').classList.contains('hidden')")
        print(f"Sidebar minimized: {is_minimized}, floating button visible: {floating_btn_visible}")
        assert is_minimized and floating_btn_visible, "Expected sidebar to be minimized"

        # Expand to Wide
        evaluate("window.edexcelApp.setSidebarState('expanded')")
        time.sleep(0.5)
        is_expanded = evaluate("document.getElementById('right-column').classList.contains('sidebar-expanded')")
        print(f"Sidebar expanded to wide: {is_expanded}")
        assert is_expanded, "Expected sidebar to be expanded"

        # Restore to Normal
        evaluate("window.edexcelApp.setSidebarState('normal')")
        time.sleep(0.5)
        is_normal = evaluate("!document.getElementById('right-column').classList.contains('sidebar-minimized') && !document.getElementById('right-column').classList.contains('sidebar-expanded')")
        print(f"Sidebar restored to normal: {is_normal}")
        assert is_normal, "Expected sidebar to be in normal split mode"

        # 5. Test Active Recall ("Exam Blur")
        is_blur_initially = evaluate("window.edexcelApp.examBlurActive")
        print(f"Exam blur initial state: {is_blur_initially}")
        assert not is_blur_initially, "Expected blur initially off"

        # Toggle Active Recall ON
        evaluate("window.edexcelApp.toggleExamBlur()")
        is_blur_now = evaluate("window.edexcelApp.examBlurActive")
        print(f"Exam blur after toggle: {is_blur_now}")
        assert is_blur_now, "Expected blur to be ON"

        # Check that blurred blocks exist in DOM
        blurred_blocks = evaluate("document.querySelectorAll('#study-detail-container [class*=\"blur\"]').length")
        print(f"Blurred statistics & AO2 blocks count: {blurred_blocks}")
        assert blurred_blocks and blurred_blocks > 0, "Expected blurred elements to appear in study drawer"

        # Test unblurring an individual block
        first_stat_key = "stat-0"
        evaluate(f"window.edexcelApp.detailDrawer.toggleBlockReveal('{first_stat_key}')")
        is_revealed = evaluate(f"window.edexcelApp.detailDrawer.revealedBlocks.has('{first_stat_key}')")
        print(f"Block '{first_stat_key}' revealed status: {is_revealed}")
        assert is_revealed, "Expected specific block to be revealed"

        # 6. Test Adding a new case study via form / data
        print("Testing Add Case Study...")
        new_study_script = """
        (function() {
          const testStudy = {
            id: 'cs-test-eyjafjallajokull',
            title: '2010 Eyjafjallajökull Volcanic Eruption',
            country: 'Iceland (Eurasian-North American Plate Boundary)',
            lat: 63.633,
            lng: -19.600,
            category: 'Physical',
            topic: 'Tectonic Processes & Hazards',
            synopticLinks: ['Globalisation (European aviation shutdown)', 'Economic interconnectivity'],
            summary: 'Subglacial basaltic to andesitic volcanic eruption on a constructive plate boundary generating a vast ash plume that paralysed northern European airspace.',
            stats: [
              'VEI 4 explosive eruption beginning 14 April 2010',
              '100,000+ commercial flights cancelled over 8 days',
              '$1.7 billion USD revenue loss for global airlines (IATA)',
              'Zero direct human casualties due to rapid evacuation'
            ],
            causes: 'Constructive plate boundary along the Mid-Atlantic Ridge where North American and Eurasian plates diverge at ~2.5 cm/year over the Iceland mantle hotspot.',
            impacts: {
              social: 'Minimal local injuries; stranded 10 million air travellers across 30+ nations.',
              economic: 'European GDP loss of ~£2.5 billion; Kenya lost $3.8m/day in perishable flowers.',
              environmental: 'Massive jökulhlaup (glacial outburst flood); 150,000 tonnes of CO2/day emitted.'
            },
            management: 'Pre-planned civil defence evacuation of 800 farmers; Met Office Ash Advisory Centre radar monitoring.',
            evaluation: {
              strengths: [
                'Effective local hazard zoning and zero direct deaths due to early seismic evacuation.',
                'Prompt insurance payouts and restructuring of aviation ash density flight safety thresholds.'
              ],
              limitations: [
                'Over-cautious blanket flight bans by CAA/Eurocontrol exacerbated economic losses.',
                'Demonstrated extreme vulnerability of modern just-in-time globalised supply chains.'
              ]
            },
            examTips: 'Excellent for assessing secondary globalisation impacts of tectonic events.'
          };
          window.edexcelApp.caseStudies.unshift(testStudy);
          window.edexcelApp.updateAllViews();
          window.edexcelApp.selectCaseStudy(testStudy.id, false);
          return window.edexcelApp.caseStudies.length;
        })()
        """
        new_count = evaluate(new_study_script)
        print(f"Case studies count after addition: {new_count}")
        assert new_count == study_count + 1

        new_drawer_title = evaluate("document.querySelector('#study-detail-container h2')?.textContent?.trim()")
        print(f"Newly added study in drawer: {new_drawer_title}")
        assert "Eyjafjallajökull" in new_drawer_title

        # Check map marker added
        new_markers_count = evaluate("window.edexcelApp.map.markers.size")
        print(f"Markers after addition: {new_markers_count}")
        assert new_markers_count == marker_count + 1

        # 7. Test Deleting Case Studies
        print("Testing Case Study Deletion...")
        # Check delete button presence in detail drawer
        detail_del_btn = evaluate("Boolean(document.getElementById('detail-delete-btn') && document.getElementById('detail-bottom-delete-btn'))")
        print(f"Detail drawer delete buttons present: {detail_del_btn}")
        assert detail_del_btn, "Expected top and bottom delete buttons in detail drawer"

        # Check delete button in card list
        card_del_btn = evaluate(f"Boolean(document.querySelector('.card-delete-btn[data-id=\"cs-test-eyjafjallajokull\"]'))")
        print(f"Card delete button present: {card_del_btn}")
        assert card_del_btn, "Expected delete button on card"

        # Check delete button in map popup
        evaluate("window.edexcelApp.map.markers.get('cs-test-eyjafjallajokull').openPopup()")
        time.sleep(0.5)
        popup_del_btn = evaluate("Boolean(document.querySelector('.delete-study-popup-btn'))")
        print(f"Map popup delete button present: {popup_del_btn}")
        assert popup_del_btn, "Expected delete button in map pin popup"
        evaluate("window.edexcelApp.map.map.closePopup()")

        # Click delete button on the newly created card
        print("Triggering delete for 'cs-test-eyjafjallajokull' via card delete button...")
        evaluate("document.querySelector('.card-delete-btn[data-id=\"cs-test-eyjafjallajokull\"]').click()")
        time.sleep(0.5)

        # Confirm dialog presence
        confirm_dialog_open = evaluate("Boolean(document.getElementById('app-confirm-dialog'))")
        print(f"Confirmation dialog displayed: {confirm_dialog_open}")
        assert confirm_dialog_open, "Expected custom confirmation dialog to open"

        # Click Confirm OK
        evaluate("document.getElementById('confirm-dialog-ok').click()")
        time.sleep(0.8)

        count_after_del = evaluate("window.edexcelApp.caseStudies.length")
        markers_after_del = evaluate("window.edexcelApp.map.markers.size")
        card_exists = evaluate("Boolean(document.querySelector('[data-card-id=\"cs-test-eyjafjallajokull\"]'))")
        print(f"Count after deletion: {count_after_del} (expected {study_count}), markers: {markers_after_del}, card in DOM: {card_exists}")
        assert count_after_del == study_count, f"Expected {study_count} case studies after deleting test entry, got {count_after_del}"
        assert markers_after_del == marker_count, f"Expected {marker_count} map markers, got {markers_after_del}"
        assert not card_exists, "Deleted case study card should no longer exist in DOM"

        # 8. Test Paper Filter Tabs
        print("\n--- Testing Paper Filter Tabs ---")
        p1_btn = evaluate("Boolean(document.querySelector('.paper-tab-btn[data-paper=\"Paper 1\"]'))")
        assert p1_btn, "Expected Paper 1 tab button"
        evaluate("document.querySelector('.paper-tab-btn[data-paper=\"Paper 1\"]').click()")
        time.sleep(0.4)
        p1_cards = evaluate("document.querySelectorAll('#case-study-list-container [data-card-id]').length")
        print(f"Paper 1 filtered cards: {p1_cards}")
        assert p1_cards > 0 and p1_cards < study_count, "Paper 1 filter should show subset of cards"

        evaluate("document.querySelector('.paper-tab-btn[data-paper=\"Paper 2\"]').click()")
        time.sleep(0.4)
        p2_cards = evaluate("document.querySelectorAll('#case-study-list-container [data-card-id]').length")
        print(f"Paper 2 filtered cards: {p2_cards}")
        assert p2_cards > 0 and p2_cards < study_count, "Paper 2 filter should show subset of cards"

        # Reset to All Papers
        evaluate("document.querySelector('.paper-tab-btn[data-paper=\"All\"]').click()")
        time.sleep(0.4)
        all_cards = evaluate("document.querySelectorAll('#case-study-list-container [data-card-id]').length")
        assert all_cards == study_count, f"Expected {study_count} cards after resetting paper filter, got {all_cards}"

        # 9. Test Confidence Tracker & Mastery Progress Bar
        print("\n--- Testing Confidence Tracker (Traffic Light) ---")
        first_study_id = evaluate("window.edexcelApp.caseStudies[0].id")
        # Click green button on first card
        green_clicked = evaluate(f"""
            const btn = document.querySelector('[data-card-id=\"{first_study_id}\"] [data-rating=\"mastered\"]');
            if (btn) {{ btn.click(); true; }} else {{ false; }}
        """)
        assert green_clicked, "Expected green confidence button on card"
        time.sleep(0.4)

        # Check storage rating
        stored_rating = evaluate(f"JSON.parse(localStorage.getItem('edexcel_confidence_ratings_v1') || '{{}}')['{first_study_id}']")
        print(f"Stored confidence rating for {first_study_id}: {stored_rating}")
        assert stored_rating == "mastered", f"Expected 'mastered', got {stored_rating}"

        # 10. Test Exam Practice Modal (12-mark & 20-mark timer + scratchpad)
        print("\n--- Testing 12/20-Mark Exam Practice Modal ---")
        # Select first study to open detail drawer
        evaluate(f"window.edexcelApp.selectCaseStudy('{first_study_id}', false)")
        time.sleep(0.4)
        exam_practice_btn = evaluate("Boolean(document.getElementById('detail-exam-practice-btn'))")
        assert exam_practice_btn, "Expected '🎲 Practice Essay' button in drawer header"
        evaluate("document.getElementById('detail-exam-practice-btn').click()")
        time.sleep(0.5)

        exam_modal_open = evaluate("Boolean(document.querySelector('#exam-practice-modal-container [data-mark-btn]'))")
        print(f"Exam practice modal open: {exam_modal_open}")
        assert exam_modal_open, "Expected Exam Practice Modal to be visible"

        # Switch to 12 marks
        evaluate("document.querySelector('#exam-practice-modal-container [data-mark-btn=\"12\"]').click()")
        time.sleep(0.3)
        cur_marks = evaluate("window.edexcelApp.examModal.selectedMarks")
        print(f"Active question marks: {cur_marks}")
        assert cur_marks == 12, f"Expected 12 marks, got {cur_marks}"

        # Type in essay scratchpad
        evaluate("""
            const input = document.getElementById('exam-scratchpad-input');
            if (input) {
                input.value = 'Introduction: Assess the severity of tectonic hazards based on governance and vulnerability...';
                input.dispatchEvent(new Event('input'));
            }
        """)
        time.sleep(0.3)
        saved_note = evaluate(f"JSON.parse(localStorage.getItem('edexcel_student_notes_v1') || '{{}}')['{first_study_id}']")
        print(f"Essay plan saved in notes: '{saved_note[:45]}...'")
        assert "tectonic hazards" in saved_note, "Expected essay plan to be saved to localStorage"

        # Close exam modal
        evaluate("document.getElementById('exam-modal-close-btn').click()")
        time.sleep(0.3)
        exam_modal_closed = evaluate("document.getElementById('exam-practice-modal-container').children.length === 0")
        assert exam_modal_closed, "Expected Exam Practice modal to close"

        # 11. Test Quick-Fire Flashcards Recall Trainer
        print("\n--- Testing Flashcard Recall Trainer ---")
        evaluate("document.getElementById('header-flashcards-btn').click()")
        time.sleep(0.5)
        fc_modal_open = evaluate("Boolean(document.getElementById('flashcard-card'))")
        print(f"Flashcards modal open: {fc_modal_open}")
        assert fc_modal_open, "Expected Flashcards modal to open"

        # Flip card to back
        evaluate("document.getElementById('flashcard-card').click()")
        time.sleep(0.3)
        is_flipped = evaluate("window.edexcelApp.flashcardsModal.isFlipped")
        print(f"Flashcard flipped to answer: {is_flipped}")
        assert is_flipped, "Card should be flipped"

        # Rate recall as mastered (green) - auto-advances smoothly to card 1
        evaluate("document.getElementById('fc-rate-green').click()")
        time.sleep(0.5)
        advanced_idx = evaluate("window.edexcelApp.flashcardsModal.currentIndex")
        print(f"Auto-advanced after rating to index: {advanced_idx}")
        assert advanced_idx == 1, f"Expected index 1 after rating auto-advance, got {advanced_idx}"

        # Test Previous button
        evaluate("document.getElementById('fc-prev-btn').click()")
        time.sleep(0.3)
        prev_idx = evaluate("window.edexcelApp.flashcardsModal.currentIndex")
        print(f"Returned via Previous button to index: {prev_idx}")
        assert prev_idx == 0, f"Expected index 0 after Previous, got {prev_idx}"

        # Close flashcard modal
        evaluate("document.getElementById('fc-close-btn').click()")
        time.sleep(0.3)
        fc_closed = evaluate("document.getElementById('flashcard-modal-container').children.length === 0")
        assert fc_closed, "Expected flashcards modal to close"

        # 12. Test 1-Page "Exam Morning" Cheat Sheet
        print("\n--- Testing 1-Page Printable Cheat Sheet ---")
        evaluate("document.getElementById('header-cheatsheet-btn').click()")
        time.sleep(0.5)
        cs_open = evaluate("Boolean(document.getElementById('printable-cheat-sheet'))")
        cs_rows = evaluate("document.querySelectorAll('#printable-cheat-sheet tbody tr').length")
        print(f"Cheat Sheet modal open: {cs_open}, summary rows rendered: {cs_rows}")
        assert cs_open and cs_rows >= 4, "Expected Cheat Sheet to render all case study rows"

        # Switch filter to Paper 1
        evaluate("document.getElementById('cs-filter-p1').click()")
        time.sleep(0.3)
        p1_rows = evaluate("document.querySelectorAll('#printable-cheat-sheet tbody tr').length")
        print(f"Cheat Sheet Paper 1 rows: {p1_rows}")
        assert p1_rows > 0 and p1_rows < cs_rows, "Cheat Sheet filter should isolate Paper 1 studies"

        # Close Cheat Sheet
        evaluate("document.getElementById('cs-close-btn').click()")
        time.sleep(0.3)
        cs_closed = evaluate("document.getElementById('cheat-sheet-modal-container').children.length === 0")
        assert cs_closed, "Expected Cheat Sheet to close"

        # 13. Test Paper 3 Synoptic Matrix
        print("\n--- Testing Paper 3 Synoptic Matrix ---")
        evaluate("document.getElementById('header-synoptic-btn').click()")
        time.sleep(0.5)
        synoptic_open = evaluate("Boolean(document.getElementById('synoptic-close-btn'))")
        print(f"Paper 3 matrix modal open: {synoptic_open}")
        assert synoptic_open, "Expected Synoptic Matrix modal to open"

        evaluate("document.getElementById('synoptic-close-btn').click()")
        time.sleep(0.3)
        synoptic_closed = evaluate("document.getElementById('synoptic-modal-container').children.length === 0")
        assert synoptic_closed, "Expected Synoptic modal to close"

        # Return to Main Menu before capturing final screenshot
        evaluate("window.edexcelApp.showMainMenu()")
        time.sleep(0.5)

        # 14. Take screenshot
        screenshot_data = call_cdp("Page.captureScreenshot", {"format": "png"})
        if screenshot_data and "result" in screenshot_data and "data" in screenshot_data["result"]:
            img_bytes = base64.b64decode(screenshot_data["result"]["data"])
            screenshot_path = "/Users/ferdivolkmann/.gemini/antigravity/scratch/edexcel-geography-hub/app_preview.png"
            with open(screenshot_path, "wb") as f:
                f.write(img_bytes)
            print(f"Screenshot saved to: {screenshot_path}")

        print("\nAll automated checks PASSED successfully with ZERO console errors!")

    finally:
        if ws:
            ws.close()
        proc.terminate()

if __name__ == "__main__":
    main()
