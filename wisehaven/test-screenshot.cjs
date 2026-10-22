const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));

  // Scroll to the interactive demo section
  await page.evaluate(() => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Take a screenshot of the section
  const section = await page.$('#features');
  if (section) {
    await section.screenshot({ path: '/tmp/demo-section.png' });
    console.log('Screenshot saved to /tmp/demo-section.png');
  } else {
    console.log('Section #features not found');
  }

  // Also check the heading and pie chart computed styles
  const info = await page.evaluate(() => {
    const section = document.querySelector('#features');
    if (!section) return { error: 'no section' };

    // The heading container
    const headingContainer = section.querySelector('.flex.flex-col.items-center.text-center');
    // The h2
    const h2 = section.querySelector('h2');
    // The hover heading spans
    const hoverSpans = h2 ? h2.querySelectorAll('span span') : [];
    // The pie chart container
    const recharts = document.querySelector('.recharts-responsive-container');
    // The pie chart parent div (the one with height:260px)
    const chartDiv = section.querySelector('[style*="260px"]');

    // Check parent of section for centering
    const sectionParent = section.parentElement;

    return {
      headingContainer: headingContainer ? {
        classes: headingContainer.className,
        computedTextAlign: getComputedStyle(headingContainer).textAlign,
        computedAlignItems: getComputedStyle(headingContainer).alignItems,
        marginLeft: getComputedStyle(headingContainer).marginLeft,
        marginRight: getComputedStyle(headingContainer).marginRight,
      } : 'not found',
      h2: h2 ? {
        classes: h2.className,
        text: h2.getAttribute('aria-label'),
        computedTextAlign: getComputedStyle(h2).textAlign,
        parentClasses: h2.parentElement?.className,
      } : 'not found',
      hoverSpans: hoverSpans.length,
      firstHoverSpan: hoverSpans[0] ? {
        tag: hoverSpans[0].tagName,
        classes: hoverSpans[0].className,
        inlineBlock: getComputedStyle(hoverSpans[0]).display,
      } : 'none',
      recharts: recharts ? {
        display: getComputedStyle(recharts).display,
        opacity: getComputedStyle(recharts).opacity,
        width: recharts.getBoundingClientRect().width,
        height: recharts.getBoundingClientRect().height,
      } : 'not found',
      chartDiv: chartDiv ? {
        display: getComputedStyle(chartDiv).display,
        opacity: getComputedStyle(chartDiv).opacity,
        width: chartDiv.getBoundingClientRect().width,
        height: chartDiv.getBoundingClientRect().height,
      } : 'not found',
      sectionParent: sectionParent ? {
        tag: sectionParent.tagName,
        classes: sectionParent.className,
      } : 'none',
    };
  });

  console.log('\n=== Computed Styles ===');
  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
