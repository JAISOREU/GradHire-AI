from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    # Check for any console errors
    console_errors = []
    page.on('console', lambda msg: console_errors.append(f"{msg.type}: {msg.text}") if msg.type == 'error' else None)
    
    # Navigate to the landing page
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    
    # Wait a bit for animations
    page.wait_for_timeout(2000)
    
    # Take screenshot of the initial view
    page.screenshot(path='/tmp/landing_initial.png', full_page=False)
    
    # Try to find and interact with feature sections
    # The landing page uses a slide presentation, so we need to scroll or navigate
    
    # Look for feature sections by their class names
    feature_sections = page.locator('.feature-section').all()
    print(f"Found {len(feature_sections)} feature sections")
    
    # Take screenshot of first feature section
    if len(feature_sections) > 0:
        feature_sections[0].scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path='/tmp/feature_01.png', full_page=False)
    
    # Scroll to next feature
    if len(feature_sections) > 1:
        feature_sections[1].scroll_into_view_if_needed()
        page.wait_for_timeout(1000)
        page.screenshot(path='/tmp/feature_02.png', full_page=False)
    
    # Check for any console errors
    console_errors = []
    page.on('console', lambda msg: console_errors.append(f"{msg.type}: {msg.text}") if msg.type == 'error' else None)
    
    # Take a few more screenshots as we scroll
    for i in range(2, min(6, len(feature_sections))):
        feature_sections[i].scroll_into_view_if_needed()
        page.wait_for_timeout(800)
        page.screenshot(path=f'/tmp/feature_{i+1:02d}.png', full_page=False)
    
    print(f"Console errors: {len(console_errors)}")
    for err in console_errors[:10]:
        print(f"  - {err}")
    
    browser.close()
    print("Screenshots captured successfully")
