import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const screens = [
  ["01-request", "Request"],
  ["02-budget", "Budget"],
  ["03-approval", "Approval"],
  ["04-project", "Project"],
  ["05-tasks", "Tasks"],
  ["06-resources", "Resources"],
  ["07-execution", "Execution"],
  ["08-proofing", "Proofing"],
  ["09-profitability", "Profitability"],
];

const encodedScreens = screens.map(([file, title]) => {
  const imagePath = join("screens", `${file}.png`);
  const base64 = readFileSync(join(process.cwd(), imagePath)).toString("base64");
  return { file, title, base64 };
});

const pluginCode = `const screens = ${JSON.stringify(encodedScreens)};

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function ensurePage(name) {
  const existing = figma.root.children.find((page) => page.name === name);
  if (existing) {
    await figma.setCurrentPageAsync(existing);
    return existing;
  }

  const page = figma.createPage();
  page.name = name;
  await figma.setCurrentPageAsync(page);
  return page;
}

async function main() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  const page = await ensurePage("tests");
  const runFrame = figma.createFrame();
  runFrame.name = "Skills Workflow Demo Screens";
  runFrame.x = 0;
  runFrame.y = 0;
  runFrame.resize(6200, 3650);
  runFrame.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.96, b: 0.98 } }];
  runFrame.clipsContent = false;
  page.appendChild(runFrame);

  const heading = figma.createText();
  heading.name = "Page title";
  heading.fontName = { family: "Inter", style: "Bold" };
  heading.characters = "Skills Workflow Demo Flow";
  heading.fontSize = 52;
  heading.fills = [{ type: "SOLID", color: { r: 0.11, g: 0.13, b: 0.22 } }];
  heading.x = 72;
  heading.y = 58;
  runFrame.appendChild(heading);

  const subheading = figma.createText();
  subheading.name = "Page subtitle";
  subheading.fontName = { family: "Inter", style: "Regular" };
  subheading.characters = "Request -> Budget -> Approval -> Project -> Tasks -> Resources -> Execution -> Proofing -> Profitability";
  subheading.fontSize = 24;
  subheading.fills = [{ type: "SOLID", color: { r: 0.38, g: 0.42, b: 0.5 } }];
  subheading.x = 72;
  subheading.y = 128;
  runFrame.appendChild(subheading);

  const frameWidth = 1920;
  const frameHeight = 1148;
  const imageHeight = 1080;
  const gapX = 90;
  const gapY = 110;
  const startX = 72;
  const startY = 220;

  for (let index = 0; index < screens.length; index += 1) {
    const screen = screens[index];
    const column = index % 3;
    const row = Math.floor(index / 3);
    const wrapper = figma.createFrame();
    wrapper.name = screen.file + " - " + screen.title;
    wrapper.x = startX + column * (frameWidth + gapX);
    wrapper.y = startY + row * (frameHeight + gapY);
    wrapper.resize(frameWidth, frameHeight);
    wrapper.cornerRadius = 16;
    wrapper.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    wrapper.strokes = [{ type: "SOLID", color: { r: 0.84, g: 0.87, b: 0.91 } }];
    wrapper.strokeWeight = 1;
    wrapper.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0.1, g: 0.12, b: 0.18, a: 0.12 },
      offset: { x: 0, y: 18 },
      radius: 42,
      spread: -18,
      visible: true,
      blendMode: "NORMAL"
    }];
    runFrame.appendChild(wrapper);

    const title = figma.createText();
    title.name = "Screen label";
    title.fontName = { family: "Inter", style: "Bold" };
    title.characters = screen.file.replace("-", ". ") + " / " + screen.title;
    title.fontSize = 26;
    title.fills = [{ type: "SOLID", color: { r: 0.13, g: 0.15, b: 0.22 } }];
    title.x = 28;
    title.y = 20;
    wrapper.appendChild(title);

    const image = figma.createImage(base64ToBytes(screen.base64));
    const rectangle = figma.createRectangle();
    rectangle.name = screen.title + " screenshot";
    rectangle.x = 0;
    rectangle.y = 68;
    rectangle.resize(frameWidth, imageHeight);
    rectangle.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
    wrapper.appendChild(rectangle);
  }

  figma.viewport.scrollAndZoomIntoView([runFrame]);
  figma.closePlugin("Imported " + screens.length + " demo screens into page tests.");
}

main();
`;

writeFileSync(join(process.cwd(), "code.js"), pluginCode);
