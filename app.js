const THROTTLE = 700;
const MOCK_RESPONSE_DELAY = 450;

const knownResources = new Map([
  ["https://example.com/", { type: "folder" }],
  ["https://example.com/docs/", { type: "folder" }],
  ["https://example.com/docs/guide.pdf", { type: "file" }],
  ["https://example.com/assets/logo.svg", { type: "file" }],
]);

const input = document.querySelector("#url-input");
const result = document.querySelector("#result");
const exampleButtons = document.querySelectorAll("[data-url]");

let lastRequestAt = 0;
let pendingTimer;
let currentCheck = 0;

function parseUrl(value) {
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function showResult(state, icon, message) {
  result.hidden = false;
  result.dataset.state = state;
  result.replaceChildren();

  const iconElement = document.createElement("span");
  iconElement.className = "result-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;

  const messageElement = document.createElement("span");
  messageElement.textContent = message;

  result.append(iconElement, messageElement);
}

function mockServerCheck(url) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const resource = knownResources.get(`${url.origin}${url.pathname}`);
      resolve(resource ? { exists: true, type: resource.type } : { exists: false });
    }, MOCK_RESPONSE_DELAY);
  });
}

function scheduleCheck(url, checkId) {
  const wait = Math.max(0, THROTTLE - (Date.now() - lastRequestAt));
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
  }

  const run = async () => {
    pendingTimer = undefined;
    lastRequestAt = Date.now();
    showResult("checking", "", "Checking with the mock server…");

    const response = await mockServerCheck(url);
    if (checkId !== currentCheck) {
      return;
    }

    if (!response.exists) {
      showResult("error", "×", "This URL was not found on the mock server.");
      return;
    }

    const label = response.type === "folder" ? "folder" : "file";
    showResult("success", "✓", `This URL exists. It points to a ${label}.`);
  };

  if (wait === 0) {
    void run();
  } else {
    pendingTimer = window.setTimeout(run, wait);
  }
}

function handleInput() {
  const checkId = ++currentCheck;
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
    pendingTimer = undefined;
  }

  const value = input.value.trim();
  if (!value) {
    result.hidden = true;
    return;
  }

  const url = parseUrl(value);
  if (!url) {
    showResult("error", "!", "Enter a valid HTTP or HTTPS URL.");
    return;
  }

  showResult("checking", "", "Valid URL. Waiting to check with the mock server…");
  scheduleCheck(url, checkId);
}

input.addEventListener("input", handleInput);

for (const button of exampleButtons) {
  button.addEventListener("click", () => {
    input.value = button.dataset.url;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });
}
